import type { ColorTransform } from './types';
export const IDENTITY_COLOR: ColorTransform = { multipliers:[1,1,1,1],offsets:[0,0,0,0] };
export function isIdentityColor(color: ColorTransform): boolean { return color.multipliers.every((v) => v===1)&&color.offsets.every((v) => v===0); }
/** Concatenate before raster clamping: parent(child(channel)). */
export function concatenateColors(parent: ColorTransform, child: ColorTransform): ColorTransform {
  return { multipliers: parent.multipliers.map((v,i) => v*child.multipliers[i]!) as unknown as ColorTransform['multipliers'], offsets: parent.offsets.map((v,i) => v+parent.multipliers[i]!*child.offsets[i]!) as unknown as ColorTransform['offsets'] };
}
export function colorMatrix(color: ColorTransform): number[] {
  const [r,g,b,a]=color.multipliers; const [ro,go,bo,ao]=color.offsets;
  return [r,0,0,0,ro/255,0,g,0,0,go/255,0,0,b,0,bo/255,0,0,0,a,ao/255];
}
/** Exact reduceColor(color,0.4) arithmetic from MiiCharacterGraphics.as. */
export function reduceMouthColor(color: ColorTransform): ColorTransform {
  const factor=1-0.4;
  return { multipliers:color.multipliers.map((v) => v-(v-1)*factor) as unknown as ColorTransform['multipliers'],offsets:color.offsets.map((v) => v*factor) as unknown as ColorTransform['offsets'] };
}
