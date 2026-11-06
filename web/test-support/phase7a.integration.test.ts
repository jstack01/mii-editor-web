/** Destination integration fixtures, deliberately separate from Flash fidelity. */
import {it,expect} from 'vitest';
import {readFileSync,writeFileSync} from 'node:fs';
import {MiiCharacterData} from '../src/model/MiiCharacterData';
import {newWiiDefaultBytes,WiiIdAllocator,proposeRepair,validateWii,writePacked} from '../src/compatibility/wiiProfile';
import {characterPreset} from '../src/model/characterPresets';
const corpus=JSON.parse(readFileSync(new URL('./fixtures/mii-corpus.json',import.meta.url),'utf8')) as {file:string;hex:string}[];
it('produces labelled destination fixtures without changing historical input bytes',()=>{
 const ids=new WiiIdAllocator(()=>Date.UTC(2026,10,6),()=>null),records:{name:string;kind:string;hex:string;valid:boolean}[]=[];
 const add=(name:string,kind:string,b:Uint8Array)=>records.push({name,kind,hex:Buffer.from(b).toString('hex'),valid:validateWii(b).valid});
 const boy=newWiiDefaultBytes(ids);add('default-boy','normal',boy);
 add('default-girl','normal',characterPreset('girl',ids).toBytes());
 for(const s of corpus){const b=Uint8Array.from(Buffer.from(s.hex,'hex'));add(s.file,'historical',b);const p=proposeRepair(b,ids);add('repaired-'+s.file,'repaired',Uint8Array.from(Buffer.from(p.proposedHex,'hex')));expect(Buffer.from(b).toString('hex')).toBe(s.hex);expect(p.validation.valid).toBe(true);}
 let seed=0x7a;const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/2**32;};
 const m=MiiCharacterData.fromBytes(boy);for(let i=0;i<8;i++){m.randomize(rng,ids);m.name='P7A'+i;add('random-'+i,'randomized',m.toBytes());}
 const special=boy.slice();writePacked(special,192,32,0x40007a01);writePacked(special,269,1,1);add('special-local','special',special);
 const temporary=boy.slice();writePacked(temporary,192,32,0x20000000);temporary.fill(0,28,32);add('temporary-negative','temporary',temporary);
 const zero=boy.slice();zero.fill(0,24,32);add('zero-id-negative','invalid-id',zero);
 add('duplicate-boy','duplicate',boy);
 expect(records.filter(r=>r.kind==='randomized').every(r=>r.valid)).toBe(true);expect(records.find(r=>r.kind==='special')!.valid).toBe(true);expect(records.filter(r=>['temporary','invalid-id'].includes(r.kind)).every(r=>!r.valid)).toBe(true);
 expect(records).toEqual(JSON.parse(readFileSync(new URL('../../optional-tools/phase7a/fixtures/records.json',import.meta.url),'utf8')));
 if(process.env.MII_PHASE7_RECORDS)writeFileSync(process.env.MII_PHASE7_RECORDS,JSON.stringify(records,null,2)+'\n');
});
