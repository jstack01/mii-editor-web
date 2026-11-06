import {describe,it,expect} from 'vitest';
import {characterPreset,HISTORICAL_PRESETS} from './characterPresets';
import {DEFAULT_MII_HEX} from '../generated/default-character';
import {WiiIdAllocator,validateWii} from '../compatibility/wiiProfile';
import {buildCharacterScene,flattenScene} from '../render/headScene';
import {MiiCharacterData} from './MiiCharacterData';
describe('verified historical preset loads',()=>{
 it('pins boy to the recovered original default',()=>expect(HISTORICAL_PRESETS.boy).toBe(DEFAULT_MII_HEX));
 for(const kind of ['boy','girl'] as const)it(kind+' keeps all appearance/nonidentity bytes with valid unique normal IDs',()=>{
  const ids=new WiiIdAllocator(()=>Date.UTC(2026,10,5),()=>({getItem:()=>null,setItem:()=>{}}));
  const original=MiiCharacterData.fromHex(HISTORICAL_PRESETS[kind]);expect(validateWii(original.toBytes()).valid).toBe(true);
  const first=characterPreset(kind,ids),second=characterPreset(kind,ids);expect(first.toHex()).not.toBe(second.toHex());expect(validateWii(first.toBytes()).valid).toBe(true);
  for(let n=0;n<74;n++)if(n<24||n>=32)expect(first.toBytes()[n]).toBe(original.toBytes()[n]);
  expect(first.toBytes().slice(28,32)).toEqual(new Uint8Array(4));expect(first.toBytes()[24]!>>>5).toBe(4);
  expect(first.getValue('name')).toBe(kind==='boy'?'defaultBoy':'defaultGrl');expect(first.getValue('gender')).toBe(kind==='boy'?0:1);
  const geometry=(m:MiiCharacterData)=>flattenScene(buildCharacterScene(m)).map(n=>({path:n.path,symbol:n.symbolId,frame:n.frame,matrix:n.matrix,color:n.color,filters:n.filters,clipDepth:n.clipDepth,blendMode:n.blendMode}));
  expect(geometry(first)).toEqual(geometry(original));
 });
});
