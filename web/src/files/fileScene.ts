import {FILE_FRAMES,GUI_ASSETS} from '../generated/gui-assets';
import {transformBounds,unionBounds,multiply} from '../render/geometry';
import {buildCharacterScene} from '../render/headScene';
import type {MiiCharacterData} from '../model/MiiCharacterData';
import type {HeadScene,Placement,SceneNode,Matrix} from '../render/types';
export type FilePage='files'|'xml';
export function buildFileScene(page:FilePage):HeadScene {
 const make=(p:Placement,path:string,parents:number[]):SceneNode=>{
  const a=GUI_ASSETS.symbols[p.symbolId];if(!a)throw Error(`Missing File symbol ${p.symbolId}`);if(parents.includes(a.id))throw Error('Cyclic File symbol');
  const children=a.kind==='sprite'?a.frames[0]!.map((c)=>make(c,`${path}.${c.name??'#'+c.depth}`,[...parents,a.id])):[];
  return {...p,path,frame:1,kind:a.kind,children,bounds:a.kind==='shape'?a.bounds:unionBounds(children.filter((c)=>c.bounds).map((c)=>transformBounds(c.matrix,c.bounds!)))};
 };
 const frame=FILE_FRAMES.find((f)=>f.frame===(page==='files'?2:3))!;
 return {roots:frame.placements.map((p)=>make(p,p.name??'#'+p.depth,[])),sourceStage:{x:0,y:0,width:640,height:500},viewBox:{x:0,y:0,width:640,height:500}};
}
/** Original BitmapUtils.drawCenteredIn bounds centering, in the 120 x 260
 * preview surface at scale .3. Geometry stays SVG; no image-export API. */
export function filePreviewScene(model:MiiCharacterData):HeadScene {
 const scene=buildCharacterScene(model);const bounds=unionBounds(scene.roots.filter((n)=>n.bounds).map((n)=>transformBounds(n.matrix,n.bounds!)))!;
 const camera:Matrix=[.3,0,0,.3,60-.3*(bounds.x+bounds.width/2),130-.3*(bounds.y+bounds.height/2)];
 return {...scene,viewBox:{x:0,y:0,width:120,height:260},roots:scene.roots.map((n)=>({...n,matrix:multiply(camera,n.matrix)}))};
}
