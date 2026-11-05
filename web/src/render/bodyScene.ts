import { multiply, patchMatrix, transformBounds, transformPoint, unionBounds } from './geometry';
import type { BodyRules, Matrix, SceneNode } from './types';

export function refreshBounds(node:SceneNode):void {
  if(node.kind==='shape')return;
  node.children.forEach(refreshBounds);
  node.bounds=unionBounds(node.children.filter((n)=>n.visible&&n.bounds).map((n)=>transformBounds(n.matrix,n.bounds!)));
}
function child(parent:SceneNode,name:string):SceneNode {
  const result=parent.children.find((n)=>n.name===name);if(!result)throw new Error(`Missing original body part ${parent.path}.${name}`);return result;
}
function scale(node:SceneNode,x:number,y:number):void {node.matrix=patchMatrix(node.matrix,{scaleX:x,scaleY:y});}
function attachPair(parent:SceneNode,left:string,right:string,point:readonly[number,number]):void {
  child(parent,left).matrix=patchMatrix(child(parent,left).matrix,{x:-point[0],y:point[1]});
  child(parent,right).matrix=patchMatrix(child(parent,right).matrix,{x:point[0],y:point[1]});
}
export function sizeRatios(height:number,weight:number,rules:BodyRules):readonly[number,number] {
  const interpolate=(range:readonly[number,number],percent:number)=>Math.min(range[1],Math.max(range[0],range[0]+(range[1]-range[0])*percent));
  return [interpolate(rules.ranges.heightRange!,height/127),interpolate(rules.ranges.weightRange!,weight/127)*interpolate(rules.ranges.heightToWeightRange!,height/127)];
}
/** Direct MiiBody.scaleParts/positionParts port. Attachments are converted into
 * the owning shirt/pants coordinates, never guessed from a rendered image. */
export function updateBody(body:SceneNode,height:number,weight:number,rules:BodyRules):readonly[number,number] {
  const shirt=child(body,'shirt'),pants=child(body,'pants');const [h,w]=sizeRatios(height,weight,rules);
  scale(child(shirt,'torso'),w,h);
  for(const name of ['lowerarm_left','lowerarm_right','upperarm_left','upperarm_right'])scale(child(shirt,name),h,w);
  for(const name of ['hand_left','hand_right'])scale(child(shirt,name),w,w);
  for(const name of ['torso','leg_left','leg_right'])scale(child(pants,name),w,h);
  for(const name of ['foot_left','foot_right'])scale(child(pants,name),w,w);
  const point=(node:SceneNode,name:string)=>transformPoint(node.matrix,...rules.points[name]!);
  attachPair(shirt,'upperarm_left','upperarm_right',point(child(shirt,'torso'),'upperArmToTorsoPt'));
  attachPair(shirt,'lowerarm_left','lowerarm_right',point(child(shirt,'upperarm_right'),'lowerArmToUpperArmPt'));
  attachPair(shirt,'hand_left','hand_right',point(child(shirt,'lowerarm_right'),'handToLowerArmPt'));
  attachPair(pants,'leg_left','leg_right',point(child(pants,'torso'),'legToTorsoPt'));
  attachPair(pants,'foot_left','foot_right',point(child(pants,'leg_right'),'footToLegPt'));
  refreshBounds(pants);
  if(!pants.bounds)throw new Error('Original pants geometry has no bounds');
  const bounds=transformBounds(pants.matrix,pants.bounds);const shadow=child(body,'shadow');
  shadow.matrix=patchMatrix(shadow.matrix,{y:bounds.y+bounds.height});
  const torsoToOwner:Matrix=multiply(multiply(body.matrix,shirt.matrix),child(shirt,'torso').matrix);
  const neck=transformPoint(torsoToOwner,...rules.points.bodyToNeckPt!);
  body.matrix=patchMatrix(body.matrix,{y:body.matrix[5]-(neck[1]-rules.baseNeckY)});
  refreshBounds(body);
  return transformPoint(body.matrix,shadow.matrix[4],shadow.matrix[5]);
}
