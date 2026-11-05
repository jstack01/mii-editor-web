import { expect, it } from 'vitest';
import originalSource from '../../../EXTRACTED-SWF/assets.swf/scripts/mii/display/MiiCharacterGraphics.as?raw';
import originalManifest from '../../../evidence/manifests/assets.json?raw';
import { CHARACTER_ASSETS as assets, CHARACTER_RULES as rules } from '../generated/character-assets';
import { MiiCharacterData } from '../model/MiiCharacterData';
import { DEFAULT_MII_HEX } from '../generated/default-character';
import { buildHeadScene, flattenScene, getFrame, rangeValue } from './headScene';
import { patchMatrix, multiply, transformBounds, transformPoint, unionBounds } from './geometry';
import { colorMatrix, concatenateColors, IDENTITY_COLOR, reduceMouthColor } from './color';
import type { AssetCatalog, SceneNode } from './types';

const model=()=>MiiCharacterData.fromHex(DEFAULT_MII_HEX);
const scene=()=>buildHeadScene(model());
const named=(nodes:SceneNode[],path:string)=>nodes.find((node)=>node.path===path)!;
const close=(actual:readonly number[],expected:readonly number[])=>{expect(actual).toHaveLength(expected.length);actual.forEach((v,i)=>expect(v).toBeCloseTo(expected[i]!,10));};

it('extracts every geometric range, palette entry and head offset exactly from ActionScript',()=>{
  const ranges=Object.fromEntries([...originalSource.matchAll(/"(\w+)":new Range\(([-\d.]+),([-\d.]+)\)/g)].map((m)=>[m[1],[Number(m[2]),Number(m[3])]]));
  expect(rules.ranges).toEqual(ranges);expect(Object.keys(ranges)).toHaveLength(19);
  for(const name of Object.keys(rules.palettes)){
    const text=originalSource.match(new RegExp(`public static const ${name}:Array = (\\[[^;]+\\]);`))![1]!;
    const numbers=[...text.matchAll(/ColorTransform\(([^)]+)\)/g)].map((m)=>m[1]!.split(',').map(Number));
    expect(rules.palettes[name]!.map((c)=>[...c.multipliers,...c.offsets])).toEqual(numbers);
  }
  expect(rules.faceShapeOffsets).toEqual([0,-3,14,6,3,-3,13,16]);
  expect([rules.nativeWidth,rules.nativeHeight,rules.baseHeadY]).toEqual([300,600,140]);
});

it('copies original source placements and shape origins, and keeps unsupported frames distinct from blanks',()=>{
  const manifest=JSON.parse(originalManifest);
  expect(Object.keys(assets.symbols)).toHaveLength(28);
  expect(Object.values(assets.symbols).filter((s)=>s.kind==='shape')).toHaveLength(9);
  for(const asset of Object.values(assets.symbols)){
    const source=manifest.symbols[asset.id];
    if(asset.kind==='sprite'){
      expect(asset.frames.length).toBe(source.timeline.frames.length);
      asset.frames.forEach((frame,index)=>{
        const original=source.timeline.frames[index].displayList;
        if(frame===null){expect(original.length).toBeGreaterThan(0);expect(index).toBeGreaterThan(0);return;}
        expect(frame).toEqual(original.map((p:Record<string,unknown>)=>({depth:p.depth,matrix:p.matrixPx,color:p.colorTransform,name:p.name,symbolId:p.characterId,clipDepth:p.clipDepth,blendMode:p.blendMode,visible:p.visible})));
        frame.forEach((p)=>expect(assets.symbols[p.symbolId]).toBeDefined());
      });
    }else{
      const {x,y,width,height}=source.bounds.shapeBounds;
      expect(asset.bounds).toEqual({x,y,width,height});
      expect(asset.sourceSha256).toBe(source.svgExport.sha256);
      expect(asset.markup).toContain(`translate(${x} ${y})`);
      expect(asset.markup).toContain(source.svgExport.topLevelGroupTransforms[0]);
      expect(asset.markup).not.toMatch(/<image|<script|href=|onload=/i);
      for(const id of [...asset.markup.matchAll(/\bid="([^"]+)"/g)].map((m)=>m[1]))expect(id).toMatch(new RegExp(`^__MII__s${asset.id}-`));
    }
  }
});

it('selects the original default symbols and frame permutations, not packed value + 1',()=>{
  const nodes=flattenScene(scene());
  const expected:{[path:string]:number}={head:385,headback:37,'head.face':65,'head.features':106,'head.nose':372,'head.nose.skin':359,'head.mouth':157,'head.mouth.lips':138,'head.eyesLeft':243,'head.eyesRight':243,'head.eyesLeft.eyeball':169,'head.eyesRight.eyeball':169,'head.eyebrowsLeft':267,'head.eyebrowsRight':267,'head.hairFront':339,'headback.hair':36};
  for(const [path,id]of Object.entries(expected)){expect(named(nodes,path).symbolId).toBe(id);expect(named(nodes,path).frame).toBe(1);}
  expect(model().getValue('hairType')).toBe(33);expect(model().getValue('eyeType')).toBe(2);expect(model().getValue('mouthType')).toBe(23);
  expect(nodes.filter((n)=>n.kind==='shape').map((n)=>n.symbolId)).toEqual([1,57,139,158,170,158,170,244,244,268,349,360]);
  expect(nodes.some((n)=>n.symbolId===56)).toBe(false);
});

it('retains root registration, small original scale differences and nested nose/face transforms',()=>{
  const nodes=flattenScene(scene());
  expect(named(nodes,'head').matrix).toEqual([0.890869140625,0,0,0.890228271484375,150.05,140]);
  expect(named(nodes,'headback').matrix).toEqual([0.8899993896484375,0,0,0.8899993896484375,150,140]);
  expect(named(nodes,'head.face').matrix).toEqual([1,0,0,1.000732421875,0,0]);
  expect(named(nodes,'head.nose.skin').matrix).toEqual([1.0016021728515625,0,0,1,0,0]);
  expect(named(nodes,'head.face').bounds).toEqual({x:-79.25,y:-106.5,width:158.5,height:207.35});
  close(named(nodes,'head.hairFront').matrix,[1,0,0,0.9996185302734375,-0.05,0]);
  close(named(nodes,'head.nose').matrix,[0.6,0,0,0.6,0.05,30]);
  close(named(nodes,'head.mouth').matrix,[0.609,0,0,0.609,-0.15,-11+100*13/18]);
});

it('applies the original eye/brow equations while retaining mirrored skew on the left',()=>{
  const nodes=flattenScene(scene());const size=.26+.74*4/7;const angle=(81.5-81.5*4/7)*Math.PI/180;
  const right=named(nodes,'head.eyesRight').matrix;const left=named(nodes,'head.eyesLeft').matrix;
  close(right,[size*Math.cos(angle),size*Math.sin(angle),-size*Math.sin(angle),size*Math.cos(angle),9,-69+104*12/18]);
  close(left,[-right[0],right[1],-right[2],right[3],-9,right[5]]);
  expect(left[0]*left[3]-left[1]*left[2]).toBeLessThan(0);
  const brow=named(nodes,'head.eyebrowsRight').matrix;
  expect(brow[4]).toBe(8.75);expect(brow[5]).toBeCloseTo(-19.8,10);
  const m=patchMatrix([-1,0,0,1,5,6],{scaleX:.5,scaleY:.5,rotation:150});
  close(m,[-Math.sqrt(3)/4,.25,.25,Math.sqrt(3)/4,5,6]);
});

it('maps min/max numeric positions and scales using Phase 2 range percentages',()=>{
  const m=model();
  for(const [field,min,max]of [['eyeX',0,54],['eyeY',-69,35],['eyeSize',.26,1],['eyebrowY',-59,25],['noseY',-10,70],['mouthSize',.218,1]] as const){
    const value=m.getMiiValue(field)!;if(Array.isArray(value))throw Error('not numeric');
    m.setValue(field,value.min);expect(rangeValue(m,field)).toBeCloseTo(min,10);
    m.setValue(field,value.max);expect(rangeValue(m,field)).toBeCloseTo(max,10);
  }
  expect(rangeValue(m,'unknown')).toBe(0);
  m.setValue('hairPart',1);expect(named(flattenScene(buildHeadScene(m)),'head.hairFront').matrix[0]).toBe(-1);
});

it('reproduces sequential setChildIndex operations, including the source eyebrow/eyeY condition',()=>{
  const m=model();const defaultOrder=['face','features','beard','mole','mouth','eyesLeft','eyesRight','eyebrowsLeft','eyebrowsRight','hairFront','hats','mustache','nose','glasses'];
  const order=()=>buildHeadScene(m).roots.find((n)=>n.name==='head')!.children.map((n)=>n.name);
  expect(order()).toEqual(defaultOrder);
  m.setValue('eyeX',12);expect(order().indexOf('eyesLeft')).toBeGreaterThan(order().indexOf('hats'));
  m.setValue('eyeX',2);m.setValue('eyebrowX',12);expect(order().indexOf('eyebrowsLeft')).toBeGreaterThan(order().indexOf('hats'));
  m.setValue('eyebrowX',2);m.setValue('eyeY',0);expect(order().indexOf('eyebrowsLeft')).toBeGreaterThan(order().indexOf('hats'));
  expect(order()).toHaveLength(14);
});

it('preserves intentional blank frames and reports missing, out-of-proof or cyclic assets explicitly',()=>{
  expect(getFrame(138,1)).toEqual([]);expect(getFrame(106,1)).toEqual([]);expect(getFrame(36,2)).toEqual([]);
  expect(()=>getFrame(9999,1)).toThrow(/Missing original symbol/);
  expect(()=>getFrame(243,0)).toThrow(/Missing frame/);
  expect(()=>getFrame(243,49)).toThrow(/Missing frame/);
  expect(()=>getFrame(243,2)).toThrow(/outside the Phase 3A proof/);
  const nodes=flattenScene(scene());for(const path of ['head.features','head.beard','head.mole','head.hats','head.mustache','head.mouth.lips','head.glasses'])expect(named(nodes,path).bounds).toBeNull();
  const symbols={...assets.symbols};delete symbols['349'];expect(()=>buildHeadScene(model(),{...assets,symbols})).toThrow(/Missing original symbol 349/);
  const cyclic:AssetCatalog={...assets,symbols:{...assets.symbols,'37':{kind:'sprite',id:37,className:null,frames:[[assets.roots[0]!]]}}};
  expect(()=>buildHeadScene(model(),cyclic)).toThrow(/Cyclic/);
});

it('applies source color multipliers/offsets only to the correct tint regions',()=>{
  const nodes=flattenScene(scene());
  expect(named(nodes,'head.face').color).toEqual({multipliers:[.88,.85,.8,1],offsets:[235,205,187,0]});
  expect(named(nodes,'head.nose.skin').color).toEqual(named(nodes,'head.face').color);
  expect(named(nodes,'head.nose.#3').color).toEqual(IDENTITY_COLOR);
  expect(named(nodes,'head.eyesLeft.eyeball').color).toEqual({multipliers:[0,0,0,1],offsets:[0,0,0,0]});
  expect(named(nodes,'head.eyesLeft.#4').color).toEqual(IDENTITY_COLOR);
  expect(named(nodes,'head.eyebrowsLeft').color).toEqual(rules.palettes.hairColors![1]);
  const mouth=reduceMouthColor(rules.palettes.mouthColors![0]!);
  close(mouth.multipliers,[.88,.84,.82,1]);close(mouth.offsets,[108,41.4,21,0]);
  const transform={multipliers:[-.02,.23,.39,1] as const,offsets:[248,187,124,0] as const};
  expect(colorMatrix(transform)).toEqual([-.02,0,0,0,248/255,0,.23,0,0,187/255,0,0,.39,0,124/255,0,0,0,1,0]);
  const combined=concatenateColors(transform,{multipliers:[.5,.5,.5,.5],offsets:[2,4,6,8]});
  close(combined.multipliers,[-.01,.115,.195,.5]);close(combined.offsets,[247.96,187.92,126.34,8]);
});

it('computes affine world coordinates and source bounds without approximate centering',()=>{
  expect(transformPoint([2,0,0,3,10,20],4,5)).toEqual([18,35]);
  expect(multiply([2,0,0,3,10,20],[1,0,0,1,4,5])).toEqual([2,0,0,3,18,35]);
  expect(transformBounds([-1,0,0,1,10,20],{x:0,y:0,width:4,height:5})).toEqual({x:6,y:20,width:4,height:5});
  expect(unionBounds([])).toBeNull();
  expect(unionBounds([{x:-2,y:3,width:4,height:5},{x:0,y:0,width:1,height:1}])).toEqual({x:-2,y:0,width:4,height:8});
  expect(scene().sourceStage).toEqual({x:0,y:0,width:300,height:600});
  expect(scene().viewBox).toEqual({x:0,y:0,width:300,height:280});
});
