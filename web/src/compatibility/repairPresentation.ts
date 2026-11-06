import {buildCharacterScene} from '../render/headScene';
import {multiply,transformBounds,unionBounds} from '../render/geometry';
import type {HeadScene,Matrix} from '../render/types';
import {MII_FIELDS,type MiiCharacterData} from '../model/MiiCharacterData';
import type {RepairChange} from './wiiProfile';
const LABELS:Record<string,string>={birthMonth:'Birthday month',birthDate:'Birthday day',favoriteColor:'Favorite color',headType:'Head shape',skinColor:'Skin color',facialFeaturesType:'Facial features',mingles:'Mingle sharing',hairType:'Hairstyle',hairPart:'Hair direction',eyebrowY:'Eyebrow height',eyebrowX:'Eyebrow spacing',eyeY:'Eye height',eyeX:'Eye spacing',noseY:'Nose height',mouthY:'Mouth height',glassesY:'Glasses height',mustacheY:'Mustache height',moleY:'Mole vertical position',moleX:'Mole horizontal position',id:'Mii ID',createId:'Mii ID',temporaryId:'Mii ID',specialMingle:'Mingle sharing',birthday:'Birthday',disablesMii:'Glasses setting',name:'Name',creator:'Creator name'};
export function repairLabel(field:string):string {const key=field.replace(/^XML /,'');return LABELS[key]??key.replace(/([a-z])([A-Z])/g,(_,a:string,b:string)=>a+' '+b.toLowerCase()).replace(/^./,c=>c.toUpperCase());}
export function repairValues(change:RepairChange):readonly[string,string] {
 if(change.field==='mingles')return [change.before==='1'?'Off':'On',change.after==='1'?'Off':'On'];
 if(change.field==='id'){const before=Number(change.before);return [before===0?'Not set':(before&0x20000000)?'Temporary':'Previous ID',(before&0x20000000)?'Normal':'New ID'];}
 return [change.before,change.after].map(s=>s==='""'?'Blank':s) as [string,string];
}
export function canPreview(model:MiiCharacterData):boolean {return Object.entries(MII_FIELDS).every(([name,r])=>{const n=Number(model.getValue(name));return n>=r.min&&n<=r.max;});}
/** Fit the actual original scene geometry into equal comparison surfaces.
 * A shared camera preserves relative size and registration; no artwork changes. */
export function repairPreviewScenes(models:readonly(MiiCharacterData|null)[]):(HeadScene|null)[] {
 const scenes=models.map(m=>{try{return m&&canPreview(m)?buildCharacterScene(m):null;}catch{return null;}});
 const bounds=unionBounds(scenes.flatMap(s=>s?s.roots.filter(n=>n.bounds).map(n=>transformBounds(n.matrix,n.bounds!)):[]));
 if(!bounds)return scenes.map(()=>null);
 const width=240,height=280,pad=12,scale=Math.min((width-2*pad)/bounds.width,(height-2*pad)/bounds.height);
 const camera:Matrix=[scale,0,0,scale,width/2-scale*(bounds.x+bounds.width/2),height/2-scale*(bounds.y+bounds.height/2)];
 return scenes.map(s=>s?{...s,viewBox:{x:0,y:0,width,height},roots:s.roots.map(n=>({...n,matrix:multiply(camera,n.matrix)}))}:null);
}
