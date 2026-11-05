import {expect,it} from 'vitest';
import {DEFAULT_MII_HEX} from '../generated/default-character';
import {MiiCharacterData} from '../model/MiiCharacterData';
import {validatedHex,startupCharacter,saveCharacter,shareURL,STORAGE_KEY,type CharacterStorage} from './browserPersistence';
function memory(raw:string|null=null){const writes:string[]=[];const store:CharacterStorage={getItem:(key)=>{expect(key).toBe(STORAGE_KEY);return raw;},setItem:(key,value)=>{expect(key).toBe(STORAGE_KEY);raw=value;writes.push(value);}};return {store:()=>store,writes};}
const other=MiiCharacterData.fromHex(DEFAULT_MII_HEX);other.name='Stored';const saved=other.toHex();other.name='URL';const imported=other.toHex();
it('applies default < validated saved < validated URL precedence without intermediate writes',()=>{
 for(const local of [null,'bad',saved])for(const url of ['', '?mii=bad','?mii='+imported]){const storage=memory(local),result=startupCharacter('https://example.test/editor/'+url,storage.store);expect(result.hex).toBe(url.endsWith(imported)?imported:local===saved?saved:DEFAULT_MII_HEX);expect(storage.writes).toEqual([]);}
});
it('rejects malformed transport and out-of-range attributes while retaining unknown binary bits',()=>{
 for(const raw of ['',DEFAULT_MII_HEX+'00',DEFAULT_MII_HEX.slice(2),'g'.repeat(148),' '+DEFAULT_MII_HEX,'ff'.repeat(74),null,{}])expect(validatedHex(raw)).toBeNull();
 expect(validatedHex(DEFAULT_MII_HEX.toUpperCase())).toBe(DEFAULT_MII_HEX);
 const bytes=MiiCharacterData.fromHex(DEFAULT_MII_HEX).toBytes();bytes[0]!|=128;const m=MiiCharacterData.fromBytes(bytes);expect(validatedHex(m.toHex())).toBe(m.toHex());
});
it('handles storage getters, reads and writes failing without losing valid URL/default data',()=>{
 const blocked=()=>{throw Error('SecurityError');};expect(startupCharacter('https://x/?mii='+imported,blocked).hex).toBe(imported);expect(startupCharacter('https://x/',blocked).storageUnavailable).toBe(true);expect(saveCharacter(imported,blocked)).toBe(false);
 const fail=()=>({getItem:()=>{throw Error('read');},setItem:()=>{throw Error('quota');}});expect(startupCharacter('https://x/',fail).hex).toBe(DEFAULT_MII_HEX);expect(saveCharacter(imported,fail)).toBe(false);
});
it('saves canonical 74-byte data and generates deploy-path-correct round-trip share URLs',()=>{
 const storage=memory(saved);expect(saveCharacter(imported.toUpperCase(),storage.store)).toBe(true);expect(storage.writes).toEqual([imported]);expect(saveCharacter('bad',storage.store)).toBe(false);expect(storage.writes).toHaveLength(1);
 const url=shareURL('https://example.test/sub/editor.html?theme=a&mii=bad&mii=old#view',imported);const parsed=new URL(url);expect(parsed.pathname).toBe('/sub/editor.html');expect(parsed.searchParams.getAll('mii')).toEqual([imported]);expect(parsed.searchParams.get('theme')).toBe('a');expect(parsed.hash).toBe('#view');expect(startupCharacter(url,memory(saved).store).hex).toBe(imported);expect(()=>shareURL(url,'bad')).toThrow();
});
it('rejects ambiguous/empty/malformed URL parameters and falls back to saved data',()=>{
 for(const query of ['?mii=','?mii=%ZZ','?mii='+imported+'&mii='+imported,'?mii=%20'+imported]){const state=startupCharacter('https://x/'+query,memory(saved).store);expect(state.invalidURL).toBe(true);expect(state.hex).toBe(saved);}
});
