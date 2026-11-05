import {MiiCharacterData} from '../model/MiiCharacterData';
import {parseXMLDocument,serializeMiiXML} from '../model/miiXml';
import {validatedHex} from '../storage/browserPersistence';
export const MAX_XML_BYTES=1024*1024;
export function validateCharacter(candidate:MiiCharacterData):MiiCharacterData {
 if(!validatedHex(candidate.toHex()))throw new TypeError('The file contains Mii attributes outside the original editor ranges.');return candidate;
}
export function importBinary(bytes:Uint8Array):MiiCharacterData {
 if(bytes.byteLength!==74)throw new TypeError(`A .mii file must contain exactly 74 bytes (received ${bytes.byteLength}).`);
 return validateCharacter(MiiCharacterData.fromBytes(bytes));
}
/** Transaction boundary, not a second XML codec. Legacy reset/partial mutation
 * happens only on a new candidate; the active model is committed after success. */
function xmlCharacters(text:string):void {
 for(const c of text){const n=c.codePointAt(0)!;if(!([9,10,13].includes(n)||(n>=0x20&&n<=0xd7ff)||(n>=0xe000&&n<=0xfffd)||(n>=0x10000&&n<=0x10ffff)))throw new SyntaxError('The text contains a character XML cannot represent. Save .mii to preserve the binary data.');}
}
/** Security-only prolog filter, not a Mii decoder. Remote declarations never
 * reach DOMParser; comments/CDATA remain literal content for the original codec. */
function localXML(text:string):string {
 xmlCharacters(text);
 const mask=text.replace(/<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>/g,(s)=>' '.repeat(s.length));
 const declarations=mask.replace(/<\?[\s\S]*?\?>/g,(s)=>' '.repeat(s.length));
 if(/<!ENTITY\b/i.test(declarations))throw new SyntaxError('XML entity declarations are not supported.');
 const remove:[number,number][]=[];
 for(const match of declarations.matchAll(/<!DOCTYPE\b/gi)){
  let quote='',end=-1;
  for(let i=match.index!+9;i<text.length;i++){const c=text[i]!;if(quote){if(c===quote)quote='';}else if(c==='"'||c==="'")quote=c;else if(c==='[')throw new SyntaxError('Internal DTD subsets are outside the verified Mii XML format.');else if(c==='>'){end=i+1;break;}}
  if(end<0)throw new SyntaxError('Malformed XML document declaration.');remove.push([match.index!,end]);
 }
 for(const match of mask.matchAll(/<\?xml-stylesheet\b[\s\S]*?\?>/gi))remove.push([match.index!,match.index!+match[0].length]);
 for(const [start,end]of remove.sort((a,b)=>b[0]-a[0]))text=text.slice(0,start)+text.slice(end);
 return text;
}
export function importXML(text:string):MiiCharacterData {
 const root=parseXMLDocument(localXML(text));
 if(root.namespaceURI||!['mii','mii-collection'].includes(root.localName))throw new TypeError('Expected an original mii or mii-collection XML document.');
 const candidate=new MiiCharacterData();candidate.parseXMLData(root);return validateCharacter(candidate);
}
export async function importCharacterFile(file:File):Promise<MiiCharacterData> {
 const extension=file.name.split('.').at(-1)?.toLowerCase();
 if(extension!=='mii'&&extension!=='xml')throw new TypeError('Choose a .mii binary file or a compatible .xml file.');
 if(extension==='mii'&&file.size!==74)throw new TypeError(`A .mii file must contain exactly 74 bytes (received ${file.size}).`);
 if(extension==='xml'&&file.size>MAX_XML_BYTES)throw new TypeError('The XML file exceeds the 1 MiB import limit.');
 const bytes=new Uint8Array(await file.arrayBuffer());
 return extension==='mii'?importBinary(bytes):importXML(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
}
export function exportXML(model:MiiCharacterData,legacyView=false):string {
 // Keep the original document body/codec. Downloads omit remote stylesheet/DTD
 // metadata so opening a saved XML elsewhere cannot call historical services.
 const text=legacyView?model.toXMLString():'<?xml version="1.0" encoding="UTF-8"?>\n'+serializeMiiXML(model,false);parseXMLDocument(localXML(text));return text;
}
export function downloadFilename(name:string,extension:'mii'|'xml'|'png'|'jpg'):string {
 let base=Array.from(name,(c)=>c.length===1&&c.charCodeAt(0)>=0xd800&&c.charCodeAt(0)<=0xdfff?'_':c).join('').replace(/[\u0000-\u001f\u007f<>:"/\\|?*]/g,'_').replace(/[. ]+$/g,'').trim();
 if(base.toLowerCase().endsWith('.'+extension))base=base.slice(0,-extension.length-1);
 if(!base||/^\.+$/.test(base))base='Mii';if(/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(base))base='_'+base;
 return `${Array.from(base).slice(0,80).join('')}.${extension}`;
}
export function downloadCharacter(model:MiiCharacterData,extension:'mii'|'xml'):void {
 const content=extension==='mii'?Uint8Array.from(model.toBytes()).buffer:exportXML(model);
 const blob=new Blob([content],{type:extension==='mii'?'application/octet-stream':'application/xml;charset=utf-8'});
 downloadBlob(blob,downloadFilename(model.name,extension));
}
export function downloadBlob(blob:Blob,filename:string):void {
 const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=filename;link.hidden=true;document.body.append(link);
 try{link.click();}finally{link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
}
