import {newWiiDefaultBytes} from '../compatibility/wiiProfile';
import {MiiCharacterData,MII_FIELDS} from '../model/MiiCharacterData';
export const STORAGE_KEY='mii-editor.character.v1';
export interface CharacterStorage {getItem(key:string):string|null;setItem(key:string,value:string):void}
/** Strict transport validation; unknown/reserved bits are retained verbatim. */
export function validatedHex(value:unknown):string|null {
 if(typeof value!=='string')return null;
 try{const model=MiiCharacterData.fromHex(value);for(const [field,range]of Object.entries(MII_FIELDS)){const n=Number(model.getValue(field));if(n<range.min||n>range.max)return null;}return model.toHex();}catch{return null;}
}
export function startupCharacter(url:string,storage:()=>CharacterStorage,defaultFactory:()=>Uint8Array=()=>newWiiDefaultBytes()):{hex:string;source:'default'|'storage'|'url';invalidSaved:boolean;invalidURL:boolean;storageUnavailable:boolean;pending?:{hex:string;label:string}}{
 let pending:{hex:string;label:string}|undefined;let hex:string|null=null;let source:'default'|'storage'|'url'='default',invalidSaved=false,storageUnavailable=false;
 try{const raw=storage().getItem(STORAGE_KEY);const valid=validatedHex(raw);if(valid){hex=valid;source='storage';}else if(raw!==null){invalidSaved=true;if(/^[0-9a-fA-F]{148}$/.test(raw))pending={hex:raw.toLowerCase(),label:'Saved browser record'};}}catch{storageUnavailable=true;}
 const values=new URL(url).searchParams.getAll('mii');const imported=values.length===1?validatedHex(values[0]):null;
 if(imported){hex=imported;source='url';pending=undefined;}else if(values.length===1&&/^[0-9a-fA-F]{148}$/.test(values[0]!))pending={hex:values[0]!.toLowerCase(),label:'Shared URL record'};
 if(hex===null)hex=MiiCharacterData.fromBytes(defaultFactory()).toHex();
 return {hex,source,invalidSaved,invalidURL:values.length>0&&!imported,storageUnavailable,...(pending?{pending}:{})};
}
export function saveCharacter(hex:string,storage:()=>CharacterStorage):boolean {
 const valid=validatedHex(hex);if(!valid)return false;try{storage().setItem(STORAGE_KEY,valid);return true;}catch{return false;}
}
export function shareURL(url:string,hex:string):string {const valid=validatedHex(hex);if(!valid)throw Error('Cannot share invalid Mii data');const result=new URL(url);result.searchParams.set('mii',valid);return result.href;}
