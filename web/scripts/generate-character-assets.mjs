import './generate-source-data.mjs';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const project = new URL('../../', import.meta.url);
const manifestPath = 'evidence/manifests/assets.json';
const manifestBytes = readFileSync(new URL(manifestPath, project));
const manifest = JSON.parse(manifestBytes);
const sourcePath = 'EXTRACTED-SWF/assets.swf/scripts/mii/display/MiiCharacterGraphics.as';
const sourceBytes = readFileSync(new URL(sourcePath, project));
const source = sourceBytes.toString('utf8');
const projectRead = (path) => readFileSync(new URL(path, project));
if (hash(projectRead(manifest.source.path)) !== manifest.source.sha256) throw new Error('Executable SWF does not match the recovered manifest.');
const sourceHashes = { [manifestPath]: hash(manifestBytes), [sourcePath]: hash(sourceBytes), [manifest.source.path]: manifest.source.sha256 };
const placement = (p) => {
  const filters = p.filters.map((f) => {
    const a=f.attributes;
    if(a.type!=='BLURFILTER')throw new Error(`Unsupported original filter ${a.type}`);
    return {kind:'blur',blurX:Number(a.blurX),blurY:Number(a.blurY),passes:Number(a.passes)};
  });
  return { depth: p.depth, matrix: p.matrixPx, color: p.colorTransform, name: p.name, symbolId: p.characterId, clipDepth: p.clipDepth, blendMode: p.blendMode, visible: p.visible, ...(filters.length ? {filters} : {}) };
};
const roots = manifest.rootTimeline.frames[0].displayList.filter((p) => ['headback', 'body', 'head'].includes(p.name)).map(placement);
if (roots.length !== 3 || roots[0].symbolId !== 37 || roots[1].symbolId !== 56 || roots[2].symbolId !== 385) throw new Error('Unexpected original head root placements.');
const symbols = {};
function visit(id) {
  if (symbols[id]) return;
  const original = manifest.symbols[id];
  if (!original) throw new Error(`Missing symbol ${id}`);
  if (original.timeline) {
    const entry = { kind: 'sprite', id, className: original.className, frames: original.timeline.frames.map((frame) => frame.displayList.map(placement)) };
    symbols[id] = entry;
    entry.frames.filter((frame) => frame !== null).flat().forEach((p) => visit(p.symbolId));
  } else if (original.svgExport) {
    const path = original.svgExport.path;
    const bytes = projectRead(path);
    if (hash(bytes) !== original.svgExport.sha256) throw new Error(`SVG provenance mismatch: ${path}`);
    const svg = bytes.toString('utf8');
    const groups = original.svgExport.topLevelGroupTransforms;
    if (groups.length !== 1) throw new Error(`Unverified SVG origin wrapper: ${path}`);
    const [a,b,c,d,tx,ty] = groups[0].match(/[-+]?\d+(?:\.\d+)?(?:e[-+]?\d+)?/gi).map(Number);
    if (a !== 1 || b !== 0 || c !== 0 || d !== 1) throw new Error(`Non-translation export wrapper: ${path}`);
    const { x, y, width, height } = original.bounds.shapeBounds;
    if (Math.abs(tx + x) > 1e-6 || Math.abs(ty + y) > 1e-6) throw new Error(`SVG/SWF bounds-origin disagreement: ${path}`);
    let inner = svg.match(/<svg\b[^>]*>([\s\S]*)<\/svg>\s*$/)[1];
    const allowed = new Set(['g','defs','path','linearGradient','radialGradient','stop']);
    for (const match of inner.matchAll(/<\/?([A-Za-z][\w:.-]*)\b/g)) if (!allowed.has(match[1])) throw new Error(`Unsupported SVG element ${match[1]} in ${path}`);
    if (/\bon\w+\s*=|\bhref\s*=|url\((?!#)/i.test(inner)) throw new Error(`Unsupported active/external SVG content: ${path}`);
    // FFDec promotes subpixel strokes for its preview. Restore the recorded
    // SWF width (twips / 20), retaining the actual original path and color.
    inner=inner.replace(/<path\b[^>]*\bffdec:has-small-stroke="true"[^>]*>/g,(tag)=>{
      const width=Number(tag.match(/ffdec:original-stroke-width="([^"]+)"/)[1]);
      const widths=[];const scan=(item)=>{if(['LINESTYLE','LINESTYLE2'].includes(item.attributes?.type))widths.push(Number(item.attributes.width)/20);for(const c of item.children??[])scan(c);};scan(original.rawDefinition);
      if(!widths.includes(width))throw new Error(`Small-stroke SWF width mismatch: ${path}`);
      return tag.replace(/\sstroke-width="[^"]+"/,` stroke-width="${width}"`).replace(/\sffdec:[\w-]+="[^"]*"/g,'');
    });
    // Namespace all source paint-server IDs. Do not alter path/gradient data.
    inner = inner.replace(/\bid="([^"]+)"/g, (_, name) => `id="__MII__s${id}-${name}"`)
      .replace(/url\(#([^\)]+)\)/g, (_, name) => `url(#__MII__s${id}-${name})`);
    // FFDec translates the symbol's local origin into its exported image box.
    // Invert that export translation exactly; keep the original wrapper intact.
    symbols[id] = { kind: 'shape', id, bounds: {x,y,width,height}, markup: `<g transform="translate(${-tx} ${-ty})">${inner}</g>`, sourcePath: path, sourceSha256: hash(bytes) };
    sourceHashes[path] = hash(bytes);
  } else throw new Error(`Unsupported non-vector head dependency ${id}: ${original.kind}`);
}
roots.forEach((p) => visit(p.symbolId));
const ranges = Object.fromEntries([...source.matchAll(/"(\w+)":new Range\(([-\d.]+),([-\d.]+)\)/g)].map((m) => [m[1], [Number(m[2]), Number(m[3])]]));
const palettes = {};
for (const match of source.matchAll(/public static const (\w+Colors):Array = (\[[\s\S]*?\]);/g)) {
  palettes[match[1]] = [...match[2].matchAll(/new ColorTransform\(([^)]+)\)/g)].map((m) => {
    const args = m[1].split(',').map(Number);
    if (args.length !== 8) throw new Error(`Unexpected ColorTransform in ${match[1]}`);
    return { multipliers: args.slice(0, 4), offsets: args.slice(4) };
  });
}
const rules = { ranges, palettes, faceShapeOffsets: JSON.parse(source.match(/faceShapeOffsets:Array = (\[[^;]+\]);/)[1]), baseHeadY: Number(source.match(/baseHeadY:Number = ([\d.]+)/)[1]), nativeWidth: Number(source.match(/nativeWidth:int = (\d+)/)[1]), nativeHeight: Number(source.match(/nativeHeight:int = (\d+)/)[1]) };
if (Object.keys(ranges).length !== 19 || Object.keys(palettes).length !== 6) throw new Error('Rendering rule extraction changed; inspect the original source.');
const bodySourcePath='EXTRACTED-SWF/assets.swf/scripts/mii/display/controllers/MiiBody.as';
const bodyBytes=projectRead(bodySourcePath);sourceHashes[bodySourcePath]=hash(bodyBytes);
const bodySource=bodyBytes.toString('utf8');
const bodyRules={ranges:{},points:{},colors:{},baseNeckY:Number(source.match(/baseNeckY:Number = ([\d.]+)/)[1])};
for(const m of bodySource.matchAll(/var (\w+):Range = new Range\(([-\d.]+),([-\d.]+)\)/g)) bodyRules.ranges[m[1]]=[Number(m[2]),Number(m[3])];
for(const m of bodySource.matchAll(/var (\w+):Point = new Point\(([-\d.]+),([-\d.]+)\)/g)) bodyRules.points[m[1]]=[Number(m[2]),Number(m[3])];
for(const m of bodySource.matchAll(/var (\w+):ColorTransform = new ColorTransform\(([^)]+)\)/g)) {const a=m[2].split(',').map(Number);bodyRules.colors[m[1]]={multipliers:a.slice(0,4),offsets:a.slice(4)};}
if(Object.keys(bodyRules.ranges).length!==3||Object.keys(bodyRules.points).length!==6||Object.keys(bodyRules.colors).length!==4)throw new Error('Unexpected original body controller schema');
rules.body=bodyRules;
const text = `// Generated from original SWF evidence and extracted vectors. Do not hand-edit.\nimport type { AssetCatalog, RenderRules } from '../render/types';\nexport const CHARACTER_ASSETS: AssetCatalog = ${JSON.stringify({ sourceHashes, roots, symbols })};\nexport const CHARACTER_RULES: RenderRules = ${JSON.stringify(rules)};\n`;
const target = new URL('../src/generated/character-assets.ts', import.meta.url);
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8') !== text) throw new Error('Character assets are stale; regenerate before proceeding.');
} else {
  mkdirSync(fileURLToPath(new URL('../src/generated/', import.meta.url)), { recursive: true });
  writeFileSync(target, text);
}
console.log(`Complete character vector catalog: ${Object.keys(symbols).length} symbols; ${Object.values(symbols).filter((s) => s.kind === 'shape').length} original shapes.`);
