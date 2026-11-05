import { MII_PERMUTATIONS } from '../generated/mii-schema';
import { asInt } from './MiiDataValue';
export { MII_PERMUTATIONS };
export function permutation(name: string): readonly number[] | undefined {
  return Object.hasOwn(MII_PERMUTATIONS, name) ? MII_PERMUTATIONS[name as keyof typeof MII_PERMUTATIONS] : undefined;
}
/** Source renderer getFrame: packed value -> one-based MovieClip frame. */
export function valueToFrame(name: string, value: number): number {
  const map = permutation(name);
  return map && value < map.length ? asInt((map[value] as number) + 1) : asInt(value + 1);
}
/** Source renderer frameToValue: one-based frame -> packed value (or -1 if absent). */
export function frameToValue(name: string, frame: number): number {
  const map = permutation(name);
  return map ? map.indexOf(asInt(frame) - 1) : asInt(asInt(frame) - 1);
}
