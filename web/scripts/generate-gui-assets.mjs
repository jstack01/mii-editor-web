/** Read-only recovery of the original GUI vectors, static glyph outlines and timelines. */
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const root=new URL('../../',import.meta.url),read=(p)=>readFileSync(new URL(p,root));
const hash=(b)=>createHash('sha256').update(b).digest('hex');
const path='evidence/manifests/classicGUI.json',manifestBytes=read(path),m=JSON.parse(manifestBytes);
if(hash(read(m.source.path))!==m.source.sha256)throw Error('GUI SWF provenance mismatch');
const hashes={[path]:hash(manifestBytes),[m.source.path]:m.source.sha256};
for(const name of ['ClassicGUI','AbstractGUIPage','CharacteristicsGeneral','CharacteristicsHead']){const path=`EXTRACTED-SWF/classicGUI.swf/scripts/mii/authoring/${name}.as`;hashes[path]=hash(read(path));}
for(const name of ['Tab','NavigationButton','AbstractHoverHilite','SliderHandle']){const path=`EXTRACTED-SWF/classicGUI.swf/scripts/mii/authoring/controls/${name}.as`;hashes[path]=hash(read(path));}
const placement=(p)=>{if(p.filters.length)throw Error('Unexpected GUI placement filter');return {depth:p.depth,matrix:p.matrixPx,color:p.colorTransform,name:p.name,symbolId:p.characterId,clipDepth:p.clipDepth,blendMode:p.blendMode,visible:p.visible};};
const children=(node,name)=>node.children.find((c)=>c.element===name)?.children??[];
const child=(node,name)=>node.children.find((c)=>c.element===name);
const matrix=(a)=>[a.hasScale==='true'?Number(a.scaleX)/65536:1,a.hasRotate==='true'?Number(a.rotateSkew0)/65536:0,a.hasRotate==='true'?Number(a.rotateSkew1)/65536:0,a.hasScale==='true'?Number(a.scaleY)/65536:1,Number(a.translateX??0)/20,Number(a.translateY??0)/20];
const color=(a)=>`rgb(${a.red},${a.green},${a.blue})`;
function glyphPath(glyph){
 let x=0,y=0,path='',open=false;
 for(const r of children(glyph,'shapeRecords')){const a=r.attributes;
  if(a.type==='StyleChangeRecord'&&a.stateMoveTo==='true'){if(open)path+='Z';x=Number(a.moveDeltaX);y=Number(a.moveDeltaY);path+=`M${x} ${y}`;open=true;}
  else if(a.type==='StraightEdgeRecord'){x+=Number(a.deltaX??0);y+=Number(a.deltaY??0);path+=`L${x} ${y}`;}
  else if(a.type==='CurvedEdgeRecord'){const cx=x+Number(a.controlDeltaX),cy=y+Number(a.controlDeltaY);x=cx+Number(a.anchorDeltaX);y=cy+Number(a.anchorDeltaY);path+=`Q${cx} ${cy} ${x} ${y}`;}
  else if(!['EndShapeRecord','StyleChangeRecord'].includes(a.type))throw Error(`Unsupported font edge ${a.type}`);
 }
 return path+(open?'Z':'');
}
function staticText(s){
 const raw=s.rawDefinition,tm=matrix(child(raw,'textMatrix').attributes);let font,x=0,y=0,height,fill='black',markup='';
 for(const record of children(raw,'textRecords')){const a=record.attributes;
  if(a.styleFlagsHasFont==='true'){font=m.symbols[a.fontId];height=Number(a.textHeight)/20;}
  if(a.styleFlagsHasColor==='true')fill=color(child(record,'textColor').attributes);
  if(a.styleFlagsHasXOffset==='true')x=Number(a.xOffset)/20;
  if(a.styleFlagsHasYOffset==='true')y=Number(a.yOffset)/20;
  if(!font||font.kind!=='DefineFont3Tag')throw Error(`Unrecovered static font at ${s.id}`);
  const scale=height/20480,glyphs=children(font.rawDefinition,'glyphShapeTable');
  for(const entry of children(record,'glyphEntries')){const glyph=glyphs[Number(entry.attributes.glyphIndex)];if(!glyph)throw Error('Missing original glyph');const d=glyphPath(glyph);if(d)markup+=`<path d="${d}" fill="${fill}" fill-rule="evenodd" transform="translate(${x} ${y}) scale(${scale})"/>`;x+=Number(entry.attributes.glyphAdvance)/20;}
 }
 return `<g transform="matrix(${tm.join(' ')})">${markup}</g>`;
}
const symbols={},texts={};
function visit(id){if(symbols[id])return;const s=m.symbols[id];if(!s)throw Error(`Missing GUI symbol ${id}`);
 if(s.timeline){symbols[id]={kind:'sprite',id,className:s.className,frames:s.timeline.frames.map((f)=>f.displayList.map(placement))};symbols[id].frames.flat().forEach((p)=>visit(p.symbolId));}
 else if(s.svgExport){const bytes=read(s.svgExport.path);if(hash(bytes)!==s.svgExport.sha256)throw Error('SVG hash mismatch');hashes[s.svgExport.path]=hash(bytes);const svg=bytes.toString();let inner=svg.match(/<svg\b[^>]*>([\s\S]*)<\/svg>\s*$/)[1];const b=s.bounds.shapeBounds;
  inner=inner.replace(/<path\b[^>]*\bffdec:has-small-stroke="true"[^>]*>/g,(tag)=>{const width=Number(tag.match(/ffdec:original-stroke-width="([^"]+)"/)[1]);return tag.replace(/\sstroke-width="[^"]+"/,` stroke-width="${width}"`).replace(/\sffdec:[\w-]+="[^"]*"/g,'');});
  if(/<image|<script|\bhref=|\bon\w+=|ffdec:/i.test(inner))throw Error(`Unsupported SVG ${id}`);
  inner=inner.replace(/\bid="([^"]+)"/g,(_,name)=>`id="__MII__g${id}-${name}"`).replace(/url\(#([^\)]+)\)/g,(_,name)=>`url(#__MII__g${id}-${name})`);
  const [a,c,d,e,x,y]=s.svgExport.topLevelGroupTransforms[0].match(/[-+]?\d+(?:\.\d+)?(?:e[-+]?\d+)?/gi).map(Number);if(a!==1||c!==0||d!==0||e!==1||Math.abs(x+b.x)>1e-6||Math.abs(y+b.y)>1e-6)throw Error(`Unknown export origin ${id}`);
  symbols[id]={kind:'shape',id,bounds:{x:b.x,y:b.y,width:b.width,height:b.height},markup:`<g transform="translate(${-x} ${-y})">${inner}</g>`,sourcePath:s.svgExport.path,sourceSha256:hash(bytes)};
 }else if(s.kind==='DefineTextTag'){symbols[id]={kind:'shape',id,bounds:Object.fromEntries(Object.entries(s.bounds.textBounds).filter(([k])=>k!=='twips')),markup:staticText(s),sourcePath:path,sourceSha256:hash(manifestBytes)};}
 else if(s.kind==='DefineEditTextTag'){texts[id]={attributes:s.rawDefinition.attributes,bounds:s.bounds.bounds,color:child(s.rawDefinition,'textColor')?.attributes};symbols[id]={kind:'sprite',id,className:null,frames:[[]]};}
 else throw Error(`Unsupported GUI dependency ${id}: ${s.kind}`);
}
// File dialogs, startup warning, loader/version and invisible homepage hit target
// are intentionally excluded. No whole-screen PNG is used.
const excluded=new Set(['screens','updateFPMessage','versionText','homepage']);
const frames=m.rootTimeline.frames.slice(1).map((f)=>({frame:f.frame,label:f.labels[0],placements:f.displayList.filter((p)=>!excluded.has(p.name)).map(placement)}));
frames.flatMap((f)=>f.placements).forEach((p)=>visit(p.symbolId));
for(const s of Object.values(m.symbols))if(s.className?.startsWith('Icons_')||['ItemSelected','ItemFaceSelected','ColorSelected'].includes(s.className))visit(s.id);
const grids=Object.fromEntries(m.scalingGrids.map((g)=>{const a=child(g,'splitter').attributes;return [g.attributes.characterId,{x:Number(a.Xmin)/20,y:Number(a.Ymin)/20,width:(Number(a.Xmax)-Number(a.Xmin))/20,height:(Number(a.Ymax)-Number(a.Ymin))/20}];}));
const classes=Object.fromEntries(Object.values(m.symbols).filter((s)=>s.className).map((s)=>[s.className,s.id]));
const output=`// Generated from original GUI SWF placements, vectors and embedded glyph outlines.\nimport type {AssetCatalog} from '../render/types';\nexport const GUI_ASSETS:AssetCatalog=${JSON.stringify({sourceHashes:hashes,roots:[],symbols})};\nexport const GUI_FRAMES=${JSON.stringify(frames)} as const;\nexport const GUI_TEXTS=${JSON.stringify(texts)} as const;\nexport const GUI_GRIDS=${JSON.stringify(grids)} as const;\nexport const GUI_CLASSES=${JSON.stringify(classes)} as const;\n`;
const target=new URL('../src/generated/gui-assets.ts',import.meta.url);
if(process.argv.includes('--check')){if(readFileSync(target,'utf8')!==output)throw Error('Stale GUI catalog');}else writeFileSync(target,output);
console.log(`Original GUI catalog: ${Object.keys(symbols).length} symbols, ${frames.length} screens; static text uses recovered glyph paths.`);
