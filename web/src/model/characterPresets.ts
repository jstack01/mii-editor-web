/** Historical named link records, retrieved from https://mii-editor.nekoweb.org/.
 * Only identity bytes are replaced for explicit new-character loads.
 * See docs/PRESETS.md for provenance and appearance verification. */
import {MiiCharacterData} from './MiiCharacterData';
import {requireWii,writePacked,wiiIds,type WiiIdAllocator} from '../compatibility/wiiProfile';
export const HISTORICAL_PRESETS = {
  "boy": "000000640065006600610075006c00740042006f0079404080807f5fc242899800044240318028a2088c08401448b88d008a008a25040000000000000000000000000000000000000000",
  "girl": "400000640065006600610075006c007400470072006c404080807f73c242899800041840018028a2106c08401448b88d008a008a25040000000000000000000000000000000000000000"
} as const;
export type CharacterPreset=keyof typeof HISTORICAL_PRESETS;
export function characterPreset(kind:CharacterPreset,ids:WiiIdAllocator=wiiIds):MiiCharacterData {
 const model=MiiCharacterData.fromHex(HISTORICAL_PRESETS[kind]);const bytes=model.toBytes();
 bytes.fill(0,28,32);writePacked(bytes,192,32,ids.next());requireWii(bytes);
 return MiiCharacterData.fromBytes(bytes);
}
