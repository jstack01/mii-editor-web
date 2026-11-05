import {GUI_ASSETS,GUI_FRAMES,GUI_CLASSES} from '../generated/gui-assets';
import {CHARACTER_RULES} from '../generated/character-assets';
import {IDENTITY,transformBounds,unionBounds} from '../render/geometry';
import {IDENTITY_COLOR} from '../render/color';
import type {MiiCharacterData} from '../model/MiiCharacterData';
import type {HeadScene,Placement,SceneNode,Matrix} from '../render/types';
import type {Screen} from './screens';
export function pageFor(model:MiiCharacterData,screen:Screen):number {return screen.count?Math.floor((model.getFrame(`${screen.prop}Type`)-1)/screen.count):0;}
export function characterCamera(screen:Screen,footing:readonly[number,number]):Matrix {
 return screen.id==='basic'||screen.id==='size'?[.53,0,0,.53,116,405-.53*footing[1]]:[1,0,0,1,116,130];
}
export function buildGuiScene(model:MiiCharacterData,screen:Screen):HeadScene {
 const page=pageFor(model,screen);
 const make=(p:Placement,path:string,ancestors:number[]):SceneNode=>{
  const a=GUI_ASSETS.symbols[p.symbolId];if(!a)throw Error(`Missing GUI symbol ${p.symbolId}`);if(ancestors.includes(a.id))throw Error('Cyclic GUI dependency');
  const frame=path==='status_gender'?model.getFrame('gender'):path==='status_mingles'?model.getFrame('mingles'):1;
  const children=a.kind==='sprite'?a.frames[frame-1]!.map((c)=>make(c,`${path}.${c.name??'#'+c.depth}`,[...ancestors,a.id])):[];
  const extra=(id:number,name:string,depth:number,frameNumber=1)=>{
   const result=make({depth,matrix:IDENTITY,color:IDENTITY_COLOR,name,symbolId:id,clipDepth:null,blendMode:1,visible:true},`${path}.${name}`,[]);
   if(frameNumber!==1){const sprite=GUI_ASSETS.symbols[id];if(sprite?.kind!=='sprite')throw Error('Missing GUI icon timeline');result.frame=frameNumber;result.children=sprite.frames[frameNumber-1]!.map((c)=>make(c,`${result.path}.${c.name??'#'+c.depth}`,[id]));result.bounds=unionBounds(result.children.filter((c)=>c.bounds).map((c)=>transformBounds(c.matrix,c.bounds!)));}
   return result;
  };
  let color=p.color,matrix=p.matrix;
  if(path.endsWith('.well')&&/^color\d+\.well$/.test(path)){const i=Number(path.split('.')[0]!.slice(5));color=CHARACTER_RULES.palettes[`${screen.palette}Colors`]![i]!;}
  if(/^color\d+$/.test(path)&&model.getValue(`${screen.palette==='hair'&&(screen.prop==='mustache'||screen.prop==='beard')?'facialHair':screen.prop==='eyebrow'?'eyebrow':screen.palette}Color`)===Number(path.slice(5)))children.push(extra(GUI_CLASSES.ColorSelected,'hilite',100));
  if(/^item\d+$/.test(path)&&screen.prop){
   const index=Number(path.slice(4)),iconFrame=1+index+screen.count*page,id=GUI_CLASSES[`Icons_${screen.prop}` as keyof typeof GUI_CLASSES];
   if(!id)throw Error(`Missing original icon set ${screen.prop}`);
   if(model.getValue(`${screen.prop}Type`)===model.frameToValue(`${screen.prop}Type`,iconFrame))children.push(extra(screen.prop==='eye'||screen.prop==='eyebrow'?GUI_CLASSES.ItemFaceSelected:GUI_CLASSES.ItemSelected,'hilite',2));
   children.push(extra(id,'icon',3,iconFrame));
  }
  if(path==='slider_height'||path==='slider_weight')matrix=[...p.matrix.slice(0,4),301+227*model.getValue(path.slice(7) as 'height'|'weight')/127,p.matrix[5]] as unknown as Matrix;
  return {...p,color,matrix,path,frame,kind:a.kind,children,bounds:a.kind==='shape'?a.bounds:unionBounds(children.filter((c)=>c.bounds).map((c)=>transformBounds(c.matrix,c.bounds!)))};
 };
 const frame=GUI_FRAMES.find((f)=>f.frame===screen.frame)!;
 return {sourceStage:{x:0,y:0,width:640,height:500},viewBox:{x:0,y:0,width:640,height:500},roots:frame.placements.map((p)=>make(p,p.name??`#${p.depth}`,[]))};
}
