import type { Matrix, Rect } from './types';
export const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];
export function multiply(a: Matrix, b: Matrix): Matrix {
  return [a[0]*b[0]+a[2]*b[1], a[1]*b[0]+a[3]*b[1], a[0]*b[2]+a[2]*b[3], a[1]*b[2]+a[3]*b[3], a[0]*b[4]+a[2]*b[5]+a[4], a[1]*b[4]+a[3]*b[5]+a[5]];
}
export function transformPoint(matrix: Matrix, x: number, y: number): readonly [number, number] {
  return [matrix[0]*x+matrix[2]*y+matrix[4], matrix[1]*x+matrix[3]*y+matrix[5]];
}
export function transformBounds(matrix: Matrix, bounds: Rect): Rect {
  const points = [[bounds.x,bounds.y],[bounds.x+bounds.width,bounds.y],[bounds.x,bounds.y+bounds.height],[bounds.x+bounds.width,bounds.y+bounds.height]].map(([x,y]) => transformPoint(matrix,x!,y!));
  const x = Math.min(...points.map((p) => p[0])); const y = Math.min(...points.map((p) => p[1]));
  return {x,y,width:Math.max(...points.map((p) => p[0]))-x,height:Math.max(...points.map((p) => p[1]))-y};
}
export function unionBounds(bounds: readonly Rect[]): Rect | null {
  if (!bounds.length) return null;
  const x = Math.min(...bounds.map((b) => b.x)); const y = Math.min(...bounds.map((b) => b.y));
  return {x,y,width:Math.max(...bounds.map((b) => b.x+b.width))-x,height:Math.max(...bounds.map((b) => b.y+b.height))-y};
}
/** DisplayObject scale/rotation preserve the original skew, including reflections.
 * A mirrored clip has positive scale magnitudes, rotation 180° and skew -180°.
 * Replacing it with a simple rotate()/scale() loses the left eye's reflection.
 */
export function patchMatrix(matrix: Matrix, patch: {x?:number;y?:number;scaleX?:number;scaleY?:number;rotation?:number}): Matrix {
  const [a,b,c,d,tx,ty] = matrix;
  const originalRotation = Math.atan2(b,a);
  const skew = Math.atan2(-c,d)-originalRotation;
  const angle = patch.rotation === undefined ? originalRotation : patch.rotation*Math.PI/180;
  const sx = patch.scaleX ?? Math.hypot(a,b); const sy = patch.scaleY ?? Math.hypot(c,d);
  if (patch.scaleX === undefined && patch.scaleY === undefined && patch.rotation === undefined) return [a,b,c,d,patch.x??tx,patch.y??ty];
  return [sx*Math.cos(angle),sx*Math.sin(angle),-sy*Math.sin(angle+skew),sy*Math.cos(angle+skew),patch.x??tx,patch.y??ty];
}
export function matrixAttribute(matrix: Matrix): string { return `matrix(${matrix.join(' ')})`; }
