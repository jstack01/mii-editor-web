/** Test-only Flash reference. Production has no legacy randomization mode. */
import {MII_VALUE_NAMES} from '../src/generated/mii-schema';
import type {MiiCharacterData} from '../src/model/MiiCharacterData';
import {MiiDataValue} from '../src/model/MiiDataValue';
export function legacyRandomize(model:MiiCharacterData,rng:()=>number=Math.random):void {
 for(const name of MII_VALUE_NAMES)(model.getMiiValue(name) as MiiDataValue).randomize(rng);
 for(const value of model.getMiiValue('id') as MiiDataValue[])value.randomize(rng);
 model.name='Random';model.creator='Mii Editor';
}
