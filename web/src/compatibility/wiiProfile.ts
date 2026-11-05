/** Software profile Wii-RCD-persistent-v1. Evidence/rule classifications are in
 * web/WII_PROFILE.md. This module never claims physical console ownership. */
import {WII_RCD_FIELDS,readPacked} from './wiiCompatibility';
import {MII_FIELDS,MII_VALUE_NAMES} from '../generated/mii-schema';
import {DEFAULT_MII_HEX} from '../generated/default-character';
import type {MiiCharacterData} from '../model/MiiCharacterData';
export interface WiiIssue {field:string;message:string;offset?:number;width?:number;min?:number;max?:number}
export interface WiiValidation {valid:boolean;errors:WiiIssue[];warnings:string[]}
export const PROFILE='Wii-RCD-persistent-v1';
export const MONTH_DAYS=[0,31,29,31,30,31,30,31,31,30,31,30,31] as const;
export function validBirthday(month:number,day:number):boolean{return Number.isInteger(month)&&Number.isInteger(day)&&month>=0&&month<=12&&day>=0&&day<=(MONTH_DAYS[month]??0)&&(month===0?day===0:day>0);}
export function writePacked(bytes:Uint8Array,offset:number,width:number,value:number):void {for(let n=0;n<width;n++){const bit=offset+n,index=bit>>>3,mask=1<<(7-(bit&7));bytes[index]=(bytes[index]!&~mask)|((Math.floor(value/2**(width-1-n))%2)*mask);}}
export function numericRange(field:string):{min:number;max:number}{const f=WII_RCD_FIELDS.find(f=>f.field===field);if(!f)throw Error('Unknown Wii attribute '+field);return {min:f.min,max:f.max};}
export function visibleName(bytes:Uint8Array,offset:number):string{let text='';for(let n=offset;n<offset+20;n+=2){const unit=bytes[n]!*256+bytes[n+1]!;if(!unit)break;text+=String.fromCharCode(unit);}return text;}
function validUTF16(text:string):boolean {for(let i=0;i<text.length;i++){const c=text.charCodeAt(i);if(c>=0xd800&&c<=0xdbff){const next=text.charCodeAt(++i);if(!(next>=0xdc00&&next<=0xdfff))return false;}else if(c>=0xdc00&&c<=0xdfff)return false;}return true;}
export function validateWii(bytes:Uint8Array):WiiValidation {
 const errors:WiiIssue[]=[],warnings:string[]=[];if(bytes.length!==74)return {valid:false,errors:[{field:'record',message:'A Wii RCD record must be exactly 74 bytes.'}],warnings};
 for(const f of WII_RCD_FIELDS){const value=readPacked(bytes,f.offset,f.width);if(value<f.min||value>f.max)errors.push({field:f.field,offset:f.offset,width:f.width,min:f.min,max:f.max,message:`${f.field} = ${value}; expected ${f.min}–${f.max}.`});}
 for(const [field,offset,width,max]of [['eyebrowRotation',293,5,11],['eyeRotation',326,5,7],['eyeSize',339,4,7],['glassesSize',391,4,7]] as const){const value=readPacked(bytes,offset,width);if(value>max&&!errors.some(e=>e.offset===offset&&e.width===width))errors.push({field,offset,width,min:0,max,message:`Full RFL ${field} = ${value}; expected 0–${max}.`});}
 const month=readPacked(bytes,2,4),day=readPacked(bytes,6,5);if(!validBirthday(month,day))errors.push({field:'birthday',message:`Birthday ${month}/${day} is invalid. Use both zero for unset; February 29 is supported (no year is stored).`});
 const id=readPacked(bytes,192,32),idValid=bytes.slice(24,32).some(b=>b!==0),temporary=(id&0x20000000)!==0;
 if(!idValid)errors.push({field:'createId',message:'The complete eight-byte CreateID is zero.'});
 if(temporary)errors.push({field:'temporaryId',message:'Temporary CreateID flag is set; this profile targets persistent records, not RAM-only Miis.'});
 if(idValid&&!temporary&&(id&0x80000000)===0&&readPacked(bytes,269,1)===0)errors.push({field:'specialMingle',message:'Special Mii must be local-only: turn Mingle off.'});
 for(const [field,offset]of [['name',2],['creator',54]] as const){const text=visibleName(bytes,offset);if(field==='name'&&!text)errors.push({field,message:'A Mii name must start with a nonzero UTF-16 code unit.'});if(!validUTF16(text))errors.push({field,message:`${field} contains malformed UTF-16 (application text-safety rule).`});if(/[\u0001-\u001f\u007f-\u009f]|[\ud800-\udfff]/.test(text))warnings.push(`${field}: console glyph/control-character support is unverified.`);}
 if([[0,1],[266,3],[283,5],[298,6],[347,5],[365,3],[431,1]].some(([o,w])=>readPacked(bytes,o!,w!)!==0))warnings.push('Uninterpreted padding is nonzero and preserved. This profile does not invent a zero-padding requirement.');
 if(readPacked(bytes,270,2)!==0)warnings.push('Nonzero source type flags are preserved; destination semantics require verification.');
 warnings.push(bytes.slice(28,32).every(b=>b===0)?'System/owner identifier is unknown (zero), not a fabricated console identity.':'System/owner identifier is preserved input data; ownership is not verified.');
 warnings.push('Software validation does not certify Wii hardware, games, ownership, uniqueness in a destination database, containers or checksums.');
 return {valid:errors.length===0,errors,warnings};
}
export function requireWii(bytes:Uint8Array):void {const result=validateWii(bytes);if(!result.valid)throw new TypeError('Save Mii blocked: '+result.errors.map(e=>e.message).join(' ')+' Review and explicitly approve repairs, or download an unresolved archival original.');}
const EPOCH=Date.UTC(2006,0,1),SLOTS=2**29;
export const ID_SEQUENCE_KEY='mii-editor.id-sequence.v1';
/** Timestamp-compatible 4-second logical sequence, prefix 100. No system ID
 * is invented. Session + best-effort origin high-water dedup is not a global
 * console ID service; concurrent-tab/global collision limits are documented. */
export class WiiIdAllocator {
 private used=new Set<number>();private last=-1;
 constructor(private readonly clock:()=>number=Date.now,private readonly store:()=>Pick<Storage,'getItem'|'setItem'>=()=>localStorage){}
 reserve(bytes:Uint8Array):void {if(bytes.length!==74)return;const id=readPacked(bytes,192,32);if(bytes.slice(28,32).every(b=>b===0)&&(id>>>29)===4)this.used.add(id&0x1fffffff);}
 next():number {
  const now=Math.floor((this.clock()-EPOCH)/4000);if(!Number.isSafeInteger(now)||now<0||now>=SLOTS)throw Error('Clock is outside the verified Wii ID timestamp window; no wrapped identifier was generated.');
  let persisted=-1;try{const raw=this.store().getItem(ID_SEQUENCE_KEY);if(raw!==null&&/^\d+$/.test(raw)){const n=Number(raw);if(Number.isSafeInteger(n)&&n>=0&&n<SLOTS)persisted=n;}}catch{/* Session sequence remains available. */}
  let slot=Math.max(now,this.last+1,persisted+1);while(this.used.has(slot))slot++;if(slot>=SLOTS)throw Error('Wii ID sequence exhausted; no duplicate/wrapped ID generated.');
  this.last=slot;this.used.add(slot);try{this.store().setItem(ID_SEQUENCE_KEY,String(slot));}catch{/* Documented persistence/cross-tab limit. */}return (0x80000000+slot)>>>0;
 }
}
export const wiiIds=new WiiIdAllocator();
export function newWiiDefaultBytes(ids:WiiIdAllocator=wiiIds):Uint8Array {
 const bytes=Uint8Array.from(DEFAULT_MII_HEX.match(/../g)!,v=>parseInt(v,16));bytes.fill(0,28,32);writePacked(bytes,192,32,ids.next());requireWii(bytes);return bytes;
}
export function randomizeWii(model:MiiCharacterData,rng:()=>number=Math.random,ids:WiiIdAllocator=wiiIds):void {
 // Random means a NEW character; do not inherit old padding/ownership/flags.
 const bytes=newWiiDefaultBytes(ids);let dayPercent=0;
 for(const name of MII_VALUE_NAMES){const percent=rng();if(!(percent>=0&&percent<1))throw Error('Random source must return a finite value in [0,1).');const f=numericRange(name),raw=MII_FIELDS[name];writePacked(bytes,16*raw.word+16-raw.shift-raw.width,raw.width,f.min+Math.floor((f.max-f.min+1)*percent));if(name==='birthDate')dayPercent=percent;}
 const month=readPacked(bytes,2,4);writePacked(bytes,6,5,month?1+Math.floor(MONTH_DAYS[month]!*dayPercent):0);
 for(const [offset,text]of [[2,'Random'],[54,'Mii Editor']] as const){bytes.fill(0,offset,offset+20);for(let i=0;i<text.length;i++){bytes[offset+2*i]=text.charCodeAt(i)>>>8;bytes[offset+2*i+1]=text.charCodeAt(i)&255;}}
 requireWii(bytes);model.parseByteData(bytes);
}
/** Birthday fields commit as a pair; invalid drafts never enter model/storage. */
export function editBirthday(model:MiiCharacterData,month:number,day:number):void {
 if(!validateWii(model.toBytes()).valid)throw Error('Unresolved original is read-only; review and approve repairs first.');if(!validBirthday(month,day))throw Error('Enter a valid birthday pair, or clear both fields.');const next=model.toBytes();writePacked(next,2,4,month);writePacked(next,6,5,day);model.parseByteData(next);
}
/** Single explicit edit: clamp confirmed limits, reject contradictory relations.
 * Existing imported problems are not silently repaired by unrelated edits. */
export function editWiiValue(model:MiiCharacterData,field:string,value:unknown):boolean {
 const before=model.toBytes(),candidate=before.slice();if(!validateWii(before).valid)throw Error('Unresolved original is read-only; review and approve repairs first.');const f=MII_FIELDS[field as keyof typeof MII_FIELDS];if(!f)throw Error('Unknown editable field '+field);const bounds=numericRange(field),n=Math.max(bounds.min,Math.min(bounds.max,Number(value)|0));const rcd=WII_RCD_FIELDS.find(r=>r.field===field)!,wide:Record<string,readonly[number,number]>={eyebrowRotation:[293,5],eyeRotation:[326,5],eyeSize:[339,4],glassesSize:[391,4]};const bits=wide[field]??[rcd.offset,rcd.width];writePacked(candidate,bits[0]!,bits[1]!,n);
 const old=validateWii(before).errors,newErrors=validateWii(candidate).errors;const added=newErrors.filter(e=>!old.some(o=>o.field===e.field));if(added.length)throw Error(added.map(e=>e.message).join(' '));model.parseByteData(candidate);return true;
}
export interface RepairChange {field:string;before:string;after:string;reason:string}
export interface RepairProposal {originalHex:string;proposedHex:string;changes:RepairChange[];validation:WiiValidation}
export function proposeRepair(input:Uint8Array,ids:WiiIdAllocator=wiiIds):RepairProposal {
 if(input.length!==74)throw Error('Only complete 74-byte records can be reviewed.');const bytes=input.slice(),changes:RepairChange[]=[];
 const change=(field:string,offset:number,width:number,next:number,reason:string)=>{const old=readPacked(bytes,offset,width);if(old!==next){writePacked(bytes,offset,width,next);changes.push({field,before:String(old),after:String(next),reason});}};
 const initial=validateWii(input);for(const issue of initial.errors){if(issue.offset!==undefined&&issue.width!==undefined&&issue.min!==undefined&&issue.max!==undefined){const n=readPacked(bytes,issue.offset,issue.width);change(issue.field,issue.offset,issue.width,Math.max(issue.min,Math.min(issue.max,n)),issue.message);}}
 const month=readPacked(input,2,4),day=readPacked(input,6,5);if(!validBirthday(month,day)){if(month===0||month>12||day===0){change('birthMonth',2,4,0,'Clear incomplete/unknown birthday rather than invent a date.');change('birthDate',6,5,0,'Clear incomplete/unknown birthday.');}else change('birthDate',6,5,Math.min(day,MONTH_DAYS[month]!),initial.errors.find(e=>e.field==='birthday')!.message);}
 if(initial.errors.some(e=>e.field==='createId'))change('id',192,32,ids.next(),'Assign a reviewed normal non-temporary browser ID; owner/system bytes remain unchanged.');
 if(initial.errors.some(e=>e.field==='temporaryId'))change('id',192,32,((readPacked(bytes,192,32)|0x80000000)&~0x20000000)>>>0,'Explicitly convert temporary ID to normal persistent flags; preserve payload and system identifier.');
 const id=readPacked(bytes,192,32);if((id&0x80000000)===0&&(id&0x20000000)===0)change('mingles',269,1,1,'Special Mii must remain local-only (Mingle off).');
 for(const [field,offset]of [['name',2],['creator',54]] as const){const text=visibleName(input,offset);if((field==='name'&&!text)||!validUTF16(text)){let next='';for(let i=0;i<text.length;i++){const u=text.charCodeAt(i);if(u>=0xd800&&u<=0xdbff){const v=text.charCodeAt(i+1);if(v>=0xdc00&&v<=0xdfff){next+=text[i]!+text[++i]!;}else next+='_';}else next+=u>=0xdc00&&u<=0xdfff?'_':text[i]!;}if(field==='name'&&!next)next='Mii';bytes.fill(0,offset,offset+20);for(let i=0;i<next.length;i++){bytes[offset+i*2]=next.charCodeAt(i)>>>8;bytes[offset+i*2+1]=next.charCodeAt(i)&255;}changes.push({field,before:JSON.stringify(text),after:JSON.stringify(next),reason:'Review nonempty/well-formed UTF-16 text; no claim about console glyph support.'});}}
 const hex=(b:Uint8Array)=>Array.from(b,n=>n.toString(16).padStart(2,'0')).join('');return {originalHex:hex(input),proposedHex:hex(bytes),changes,validation:validateWii(bytes)};
}
