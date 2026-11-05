import type { MiiCharacterData } from '../model/MiiCharacterData';
import { MiiDataValue } from '../model/MiiDataValue';
import { CHARACTER_ASSETS, CHARACTER_RULES } from '../generated/character-assets';
import { IDENTITY_COLOR, reduceMouthColor } from './color';
import { patchMatrix, transformBounds, unionBounds } from './geometry';
import type { AssetCatalog, ColorTransform, HeadScene, Placement, RenderRules, SceneNode } from './types';

export class CharacterAssetError extends Error {}
export function getFrame(assetId: number, frame: number, catalog: AssetCatalog = CHARACTER_ASSETS): readonly Placement[] {
  const asset=catalog.symbols[assetId];
  if (!asset) throw new CharacterAssetError(`Missing original symbol ${assetId}.`);
  if (asset.kind!=='sprite') throw new CharacterAssetError(`Symbol ${assetId} is not a timeline.`);
  const selected=asset.frames[frame-1];
  if (!Number.isInteger(frame)||selected===undefined) throw new CharacterAssetError(`Missing frame ${frame} of original symbol ${assetId}.`);
  if(selected===null) throw new CharacterAssetError(`Original frame ${frame} of symbol ${assetId} is outside the Phase 3A proof.`);
  return selected; // An empty list is a valid intentionally blank frame.
}
export function rangeValue(model: MiiCharacterData, name: string, rules: RenderRules = CHARACTER_RULES): number {
  const value=model.getMiiValue(name); const range=rules.ranges[name];
  if (!(value instanceof MiiDataValue)||!range) return 0;
  const mapped=range[0]+(range[1]-range[0])*value.getValuePercent();
  return Math.min(range[1],Math.max(range[0],mapped));
}
function palette(model: MiiCharacterData, field: string, name: string, rules: RenderRules): ColorTransform {
  const value=model.getValue(field);
  return typeof value==='number' ? rules.palettes[name]?.[value]??IDENTITY_COLOR : IDENTITY_COLOR;
}
function selectedFrame(model: MiiCharacterData, path: string): number {
  const head=model.getFrame('headType');
  const frames: Record<string,number>={
    'head.face':head,'head.features':Number(model.getValue('facialFeaturesType'))*8+head,
    'head.beard':Number(model.getValue('beardType'))*8+head,
    'head.nose':model.getFrame('noseType'),'head.nose.skin':model.getFrame('noseType'),
    'head.mouth':model.getFrame('mouthType'),'head.mouth.lips':model.getFrame('mouthType'),
    'head.eyesLeft':model.getFrame('eyeType'),'head.eyesRight':model.getFrame('eyeType'),
    'head.eyesLeft.eyeball':model.getFrame('eyeType'),'head.eyesRight.eyeball':model.getFrame('eyeType'),
    'head.eyebrowsLeft':model.getFrame('eyebrowType'),'head.eyebrowsRight':model.getFrame('eyebrowType'),
    'head.hairFront':model.getFrame('hairType'),'head.hats':model.getFrame('hairType'),'headback.hair':model.getFrame('hairType'),
    'head.mustache':model.getFrame('mustacheType'),'head.mole':model.getFrame('moleType'),
    'head.glasses':model.getFrame('glassesType'),'head.glasses.lenses':model.getFrame('glassesType'),
  };
  return frames[path]??1;
}
function placeForModel(model: MiiCharacterData, source: Placement, path: string, rules: RenderRules): Placement {
  const placed={...source};
  const skin=()=>palette(model,'skinColor','skinColors',rules);
  const hair=()=>palette(model,'hairColor','hairColors',rules);
  if (path==='head'||path==='headback') {
    const offset=rules.faceShapeOffsets[model.getFrame('headType')-1];
    if (offset===undefined) throw new CharacterAssetError('Unknown original head shape.');
    placed.matrix=patchMatrix(source.matrix,{y:rules.baseHeadY-offset});
  }
  if (path==='head.face'||path==='head.nose.skin') placed.color=skin();
  if (path==='head.features') placed.blendMode=Number(model.getValue('facialFeaturesType'))<3?1:3;
  if (path==='head.hairFront'||path==='headback.hair'||path==='head.hats') {
    placed.matrix=patchMatrix(source.matrix,{scaleX:model.getValue('hairPart')?-1:1});
    placed.color=path==='head.hats'?palette(model,'favoriteColor','favoriteColors',rules):hair();
  }
  for (const [family,part,paletteName,colorField] of [['eye','eyes','eyeColors','eyeColor'],['eyebrow','eyebrows','hairColors','eyebrowColor']] as const) {
    if (path===`head.${part}Left`||path===`head.${part}Right`) {
      const left=path.endsWith('Left'); const size=rangeValue(model,`${family}Size`,rules); const rotation=rangeValue(model,`${family}Rotation`,rules);
      placed.matrix=patchMatrix(source.matrix,{x:(left?-1:1)*rangeValue(model,`${family}X`,rules),y:rangeValue(model,`${family}Y`,rules),scaleX:size,scaleY:size,rotation:left?180+rotation:-rotation});
      if (family==='eyebrow') placed.color=palette(model,colorField,paletteName,rules);
    }
  }
  if (path==='head.eyesLeft.eyeball'||path==='head.eyesRight.eyeball') placed.color=palette(model,'eyeColor','eyeColors',rules);
  for (const feature of ['nose','mouth','glasses','mustache','mole']) if (path===`head.${feature}`) {
    const size=rangeValue(model,`${feature}Size`,rules);
    placed.matrix=patchMatrix(source.matrix,{y:rangeValue(model,`${feature}Y`,rules),scaleX:size,scaleY:size,...(feature==='mole'?{x:rangeValue(model,'moleX',rules)}:{})});
  }
  if (path==='head.mouth.lips') placed.color=reduceMouthColor(palette(model,'mouthColor','mouthColors',rules));
  if (path==='head.beard'||path==='head.mustache') placed.color=palette(model,'facialHairColor','hairColors',rules);
  if (path==='head.glasses.lenses') placed.color=palette(model,'glassesColor','glassesColors',rules);
  if (path==='head.glasses') placed.color=model.getFrame('glassesType')<7?palette(model,'glassesColor','glassesColors',rules):IDENTITY_COLOR;
  return placed;
}
/** Apply setChildIndex sequentially, retaining all original slots, including blanks. */
function reorderHead(children: SceneNode[], model: MiiCharacterData, rules: RenderRules): void {
  const move=(name:string)=>{
    const index=children.findIndex((node)=>node.name===name);
    if(index<0||children.length<=10) throw new CharacterAssetError(`Missing original head layer ${name}.`);
    children.splice(10,0,children.splice(index,1)[0]!);
  };
  for(const name of ['eyesLeft','eyesRight','eyebrowsLeft','eyebrowsRight','hairFront','hats']) move(name);
  const eyeY=rangeValue(model,'eyeY',rules);
  if(rangeValue(model,'eyeX',rules)>37||eyeY< -67) {move('eyesLeft');move('eyesRight');}
  // The source condition deliberately references eyeY, including for brows.
  if(rangeValue(model,'eyebrowX',rules)>37||eyeY< -67) {move('eyebrowsLeft');move('eyebrowsRight');}
}
export function buildHeadScene(model: MiiCharacterData, catalog: AssetCatalog=CHARACTER_ASSETS, rules: RenderRules=CHARACTER_RULES): HeadScene {
  const build=(source:Placement,path:string,ancestors:readonly number[]):SceneNode=>{
    const asset=catalog.symbols[source.symbolId];
    if(!asset) throw new CharacterAssetError(`Missing original symbol ${source.symbolId} at ${path}.`);
    if(ancestors.includes(asset.id)) throw new CharacterAssetError(`Cyclic source symbol ${asset.id}.`);
    const placed=placeForModel(model,source,path,rules);
    const frame=asset.kind==='sprite'?selectedFrame(model,path):1;
    const children=asset.kind==='sprite'?getFrame(asset.id,frame,catalog).map((child)=>build(child,`${path}.${child.name??`#${child.depth}`}`,[...ancestors,asset.id])):[];
    if(path==='head') reorderHead(children,model,rules);
    const bounds=asset.kind==='shape'?asset.bounds:unionBounds(children.filter((c)=>c.visible&&c.bounds).map((c)=>transformBounds(c.matrix,c.bounds!)));
    return {...placed,path,frame,kind:asset.kind,children,bounds};
  };
  return {roots:catalog.roots.map((root)=>build(root,root.name??`root${root.depth}`,[])),sourceStage:{x:0,y:0,width:rules.nativeWidth,height:rules.nativeHeight},viewBox:{x:0,y:0,width:300,height:280}};
}
export function flattenScene(scene: HeadScene): SceneNode[] {
  const output:SceneNode[]=[];const visit=(node:SceneNode)=>{output.push(node);node.children.forEach(visit);};scene.roots.forEach(visit);return output;
}
