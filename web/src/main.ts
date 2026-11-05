import {editBirthday,editWiiValue,validateWii,validBirthday,wiiIds} from './compatibility/wiiProfile';
import {RepairReview} from './compatibility/repairReview';
import './editor.css';
import {MiiCharacterData} from './model/MiiCharacterData';
import {startupCharacter,saveCharacter,shareURL} from './storage/browserPersistence';
import {EditorSession} from './gui/editorSession';
import {bindSlider} from './gui/slider';
import {GUI_ASSETS,GUI_GRIDS,GUI_TEXTS} from './generated/gui-assets';
import {buildCharacterScene,flattenScene} from './render/headScene';
import {renderHeadSvg} from './render/svgRenderer';
import {multiply,matrixAttribute} from './render/geometry';
import {buildGuiScene,characterCamera} from './gui/guiScene';
import {SCREENS,colorField} from './gui/screens';
import {applyNineSlice} from './gui/nineSlice';
import type {SceneNode} from './render/types';
import {make,addHover} from './gui/svgDom';
import {FileDialog} from './files/fileDialog';
const storage=()=>window.localStorage;
const startup=(()=>{try{return startupCharacter(location.href,storage);}catch(error){document.getElementById('edit-status')!.textContent='Cannot allocate a verified Wii identifier: '+(error instanceof Error?error.message:String(error))+' Correct the clock/ID sequence issue or open an existing shared Mii URL.';throw error;}})();
const model=MiiCharacterData.fromHex(startup.hex);
wiiIds.reserve(model.toBytes());
const session=new EditorSession(model);
let screen=session.screen;
let storageAvailable=!startup.storageUnavailable;
if(startup.source==='url')storageAvailable=saveCharacter(model.toHex(),storage)&&!startup.storageUnavailable;
let interactions=new AbortController();
const host=document.getElementById('editor')!,stage=document.getElementById('stage')!,viewport=document.getElementById('viewport')!;
const controls:Record<string,string>={tab_basic:'General',tab_size:'Body size',tab_face:'Head',tab_hair:'Hair',tab_eyebrows:'Eyebrows',tab_eyes:'Eyes',tab_nose:'Nose',tab_lips:'Mouth',tab_accessories:'Glasses',nav_face:'Head shapes',nav_face2:'Facial features',nav_accessories:'Glasses',nav_accessories2:'Mustache',nav_accessories3:'Mole',nav_accessories4:'Beard',toggle_gender:'Change gender',toggle_mingles:'Change mingle setting',actionRandom:'Randomize character',screenFile:'File',page_next:'Next feature page',page_prev:'Previous feature page',toggle_hairPart:'Mirror hairstyle'};
const fieldNames:Record<string,string>={nameText:'Name',creatorText:'Creator',idText:'Mii ID',wiiText:'Wii ID',birthDateText:'Birthday day',birthMonthText:'Birthday month',URLText:'Mii share URL'};

function updateReadout():void {const field=host.querySelector<HTMLInputElement>('[data-field="URLText"]');if(field)field.value=shareURL(location.href,model.toHex());stage.dataset.hex=model.toHex();compatibilityStatus();}
function renderCharacter():void {
 const group=host.querySelector<SVGGElement>('[data-instance-path="graphicsContainer"]')!;
 const scene=buildCharacterScene(model);group.setAttribute('transform',matrixAttribute(characterCamera(screen,scene.footing!)));
 const loaded={...scene,viewBox:{x:0,y:0,width:640,height:500},roots:scene.roots.map((n)=>({...n,matrix:multiply([1,0,0,1,-150,0],n.matrix)}))};
 const svg=renderHeadSvg(loaded);svg.setAttribute('width','640');svg.setAttribute('height','500');svg.style.overflow='visible';svg.dataset.characterRoot='original';group.replaceChildren(svg);
}
function fieldValue(name:string):string {
 if(name==='URLText')return shareURL(location.href,model.toHex());if(name==='pageText')return `${session.page+1}/${screen.pages}`;
 const field=name.slice(0,-4);if(field==='id'||field==='wii')return model.getValue(field).map(n=>n.toString(16).padStart(2,'0')).join('-');
 const value=model.getValue(field);return (field==='birthDate'||field==='birthMonth')&&!value?'':String(value??'');
}
function addText(group:SVGGElement,node:SceneNode):void {
 const text=GUI_TEXTS[String(node.symbolId) as keyof typeof GUI_TEXTS];if(!text)return;
 const name=node.name??'';const b=text.bounds,a=text.attributes;const c=text.color;
 // Original dynamic device fonts have no embedded glyphs. Use the platform's
 // Arial/sans-serif; static labels are original glyph outlines, not substitutions.
 if(name==='pageText'){
  const t=make('text',{x:b.x+b.width/2,y:b.y+Number(a.fontHeight)/20,'text-anchor':'middle','font-size':Number(a.fontHeight)/20,fill:`rgb(${c?.red??88},${c?.green??107},${c?.blue??105})`});t.textContent=fieldValue(name);group.append(t);return;
 }
 if(!fieldNames[name])return;
 const foreign=make('foreignObject',{x:b.x,y:b.y,width:b.width,height:b.height});const input=document.createElement('input');input.className='gui-field';input.dataset.field=name;input.setAttribute('aria-label',fieldNames[name]);input.type='text';input.autocomplete='off';input.spellcheck=false;input.value=fieldValue(name);if(name!=='URLText'&&!validateWii(model.toBytes()).valid)input.readOnly=true;input.style.fontSize=`${Number(a.fontHeight)/20}px`;input.style.color=`rgb(${c?.red??88},${c?.green??107},${c?.blue??105})`;
 if(name==='wiiText')input.title='System identifier from input data, not verified ownership. Leave unknown values zero or import a record from your console; do not invent console identity.';
 if(a.hasMaxLength==='true')input.maxLength=Number(a.maxLength);
 if(name==='URLText'){input.readOnly=true;input.title='Copy this URL to share the current Mii.';input.addEventListener('focus',()=>input.select());}
 else input.addEventListener('input',(event)=>{
  if(event instanceof InputEvent&&event.isComposing)return;applyText(input,name);
 });
 input.addEventListener('compositionend',()=>applyText(input,name));input.addEventListener('blur',event=>{const related=event.relatedTarget as HTMLInputElement|null;if(name.startsWith('birth')&&related?.dataset.field?.startsWith('birth'))return;if(input.getAttribute('aria-invalid')==='true'){input.value=fieldValue(name);input.removeAttribute('aria-invalid');if(name.startsWith('birth'))for(const n of ['birthDateText','birthMonthText']){const f=host.querySelector<HTMLInputElement>(`[data-field="${n}"]`);if(f){f.value=fieldValue(n);f.removeAttribute('aria-invalid');}}}});foreign.append(input);group.append(foreign);
}
function applyText(input:HTMLInputElement,name:string):void {
 const before=model.toHex(),field=name.slice(0,-4),candidate=MiiCharacterData.fromBytes(model.toBytes());
 try{
  if(!validateWii(model.toBytes()).valid)throw Error('Unresolved original is read-only; review and approve repairs first.');
  if(field==='birthDate'||field==='birthMonth'){
   input.value=input.value.replace(/[^0-9]/g,'');const month=host.querySelector<HTMLInputElement>('[data-field="birthMonthText"]')!,day=host.querySelector<HTMLInputElement>('[data-field="birthDateText"]')!;
   const m=Math.max(0,Math.min(12,Number(month.value)||0)),d=Math.max(0,Math.min(31,Number(day.value)||0));month.value=m?String(m):'';day.value=d?String(d):'';
   if(!validBirthday(m,d))throw Error('Birthday draft is unapplied: enter a valid month/day pair, or clear both fields. February 29 is allowed.');editBirthday(candidate,m,d);month.removeAttribute('aria-invalid');day.removeAttribute('aria-invalid');
  }else if(field==='id'||field==='wii'){
   const compact=input.value.replace(/[- :]/g,'');if(!/^[0-9a-fA-F]{8}$/.test(compact))throw Error('Enter exactly four hexadecimal bytes (eight hex digits).');candidate.setHex(field,compact);
  }else{input.value=input.value.slice(0,10);candidate.setValue(field,input.value);}
  const issues=validateWii(candidate.toBytes()).errors,old=validateWii(model.toBytes()).errors;
  const related=field==='id'?['createId','temporaryId','specialMingle']:[field];const bad=issues.filter(e=>related.includes(e.field)||!old.some(o=>o.field===e.field));if(bad.length)throw Error(bad.map(e=>e.message).join(' '));
  model.parseByteData(candidate.toBytes());if(field==='id'||field==='wii')wiiIds.reserve(model.toBytes());input.removeAttribute('aria-invalid');persistEdit(before);updateReadout();if(field==='id')renderCharacter();
 }catch(error){input.setAttribute('aria-invalid','true');document.getElementById('edit-status')!.textContent=error instanceof Error?error.message:String(error);return;}
 document.getElementById('edit-status')!.textContent='';
}
function compatibilityStatus():void {
 const result=validateWii(model.toBytes()),status=document.getElementById('compatibility-status')!;status.textContent=result.valid?'Software profile validated. Ownership and destination ID uniqueness need verification; hardware and games are not certified.':'Read-only unresolved original. Review and approve repairs to edit or export a validated Mii. '+result.errors.map(e=>e.message).join(' ');stage.dataset.wiiValid=String(result.valid);status.dataset.error=String(!result.valid);document.getElementById('review-compatibility')!.textContent=result.valid?'Review compatibility details':'Review and repair Mii';
}

function bindControl(svg:SVGSVGElement,group:SVGGElement,node:SceneNode):void {
 const name=node.name??'';let label=controls[name],action:(()=>void)|undefined;
 if(name==='screenFile')action=()=>fileDialog.open();
 if(name.startsWith('tab_')||name.startsWith('nav_')){const target=name.slice(name.indexOf('_')+1);action=()=>{session.navigate(target);screen=session.screen;render();};}
 if(screen.id==='basic'){
  if(name==='toggle_gender'||name==='toggle_mingles'){const field=name.slice(7);action=()=>edit(()=>editWiiValue(model,field,model.getValue(field)?0:1));group.setAttribute('aria-pressed',String(!!model.getValue(field)));}
  if(name==='actionRandom')action=()=>edit(()=>model.randomize());
 }
 if(/^color\d+$/.test(name)){
  const index=Number(name.slice(5));label=`${screen.palette==='favorite'?'Favorite':screen.palette==='skin'?'Skin':screen.palette} color ${index+1}`;
  action=()=>edit(()=>session.selectColor(index));
  group.setAttribute('aria-pressed',String(model.getValue(colorField(screen))===index));
 }
 if(/^item\d+$/.test(name)){
  const index=Number(name.slice(4)),frame=index+screen.count*session.page+1;label=`${screen.name} ${frame}`;
  action=()=>edit(()=>session.selectItem(index));
  group.setAttribute('aria-pressed',String(model.getValue(`${screen.prop}Type`)===model.frameToValue(`${screen.prop}Type`,frame)));
 }
 if(name.startsWith('option_')){label=`${screen.name} ${name.slice(7,-2)} ${name.endsWith('_1')?'increase':'decrease'}`;action=()=>edit(()=>session.adjust(name));}
 if(name==='toggle_hairPart'){action=()=>edit(()=>session.toggle('hairPart'));group.setAttribute('aria-pressed',String(!!model.getValue('hairPart')));}
 if(name==='page_next'||name==='page_prev')action=()=>{session.turnPage(name==='page_next'?1:-1);render();};
 if(name==='slider_height'||name==='slider_weight'){if(!validateWii(model.toBytes()).valid){group.dataset.control=name;group.setAttribute('role','slider');group.setAttribute('aria-label',name==='slider_height'?'Height':'Weight');group.setAttribute('aria-disabled','true');group.classList.add('gui-disabled');return;}const field=name.slice(7) as 'height'|'weight';bindSlider(group,svg,field,()=>model.getValue(field),(value)=>{const before=model.toHex();editWiiValue(model,field,value);persistEdit(before);updateReadout();renderCharacter();},interactions.signal);addHover(svg,group,interactions.signal);return;}
 if(!label)return;
 if(!validateWii(model.toBytes()).valid&&!name.startsWith('tab_')&&!name.startsWith('nav_')&&!['page_next','page_prev','screenFile','actionRandom'].includes(name))action=undefined;
 group.dataset.control=name;group.setAttribute('role','button');group.setAttribute('aria-label',label);group.setAttribute('aria-disabled',String(!action));
 if(action){group.classList.add('gui-action');group.setAttribute('tabindex','0');group.addEventListener('click',action);group.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();action!();}});if([272,294,318].includes(node.symbolId))addHover(svg,group,interactions.signal);}
 else{group.classList.add('gui-disabled');const title=make('title');title.textContent=`${label}: unresolved originals are read-only; review and approve repairs first.`;group.append(title);}
}
function render():void {
 interactions.abort();interactions=new AbortController();
 const focused=(document.activeElement as SVGElement|null)?.dataset?.control;
 const scene=buildGuiScene(model,screen,session.page),svg=renderHeadSvg(scene,{catalog:GUI_ASSETS});svg.setAttribute('role','group');svg.setAttribute('aria-label',`${screen.name} — original Mii Editor`);svg.dataset.guiScreen=screen.id;svg.querySelector('title')!.textContent='Original Mii Editor';
 const nodes=flattenScene(scene);
 // Process children first so any copied grid content is already reconstructed.
 for(const node of [...nodes].reverse()){
  const group=svg.querySelector<SVGGElement>(`[data-instance-path="${node.path}"]`)!;
  const grid=GUI_GRIDS[String(node.symbolId) as keyof typeof GUI_GRIDS];if(grid&&node.bounds)applyNineSlice(svg,group,node.bounds,grid,node.matrix);
 }
 for(const node of nodes){
  const group=svg.querySelector<SVGGElement>(`[data-instance-path="${node.path}"]`)!;if(!group)continue;
  if(node.path.includes('.'))continue;addText(group,node);bindControl(svg,group,node);
  if(!group.hasAttribute('role')&&!GUI_TEXTS[String(node.symbolId) as keyof typeof GUI_TEXTS])group.classList.add('gui-label');
 }
 host.replaceChildren(svg);renderCharacter();updateReadout();fileDialog.mount(svg);
 document.getElementById('screen-status')!.textContent=`${screen.name} — editing available.`;
 if(focused&&!svg.querySelector('[data-file-page]'))host.querySelector<SVGGElement>(`[data-control="${focused}"]`)?.focus({preventScroll:true});
}
function storageStatus():void {
 const notices=[startup.invalidURL?'Ignored invalid Mii URL.':'',startup.invalidSaved?'Ignored invalid saved Mii.':'',storageAvailable?'Edits save automatically in this browser.':'Browser storage is unavailable. Keep a share URL to retain your Mii.'];document.getElementById('storage-status')!.textContent=notices.filter(Boolean).join(' ');
}
function persistEdit(before:string,force=false):void {
 if(!force&&model.toHex()===before)return;storageAvailable=saveCharacter(model.toHex(),storage)&&!startup.storageUnavailable;
 // Refreshing an opened share must restore the latest edit, not its old URL.
 if(new URL(location.href).searchParams.has('mii')){try{history.replaceState(null,'',shareURL(location.href,model.toHex()));}catch{/* Share field still has the current URL/data. */}}
 storageStatus();
}
function edit(action:()=>unknown):void {const before=model.toHex();try{action();persistEdit(before);render();document.getElementById('edit-status')!.textContent='';}catch(error){document.getElementById('edit-status')!.textContent=error instanceof Error?error.message:String(error);}}
const commit=(candidate:MiiCharacterData)=>{model.parseByteData(candidate.toBytes());wiiIds.reserve(candidate.toBytes());persistEdit('',true);session.navigate(screen.id);screen=session.screen;render();};
const review=new RepairReview(()=>model,commit);
if(!validateWii(model.toBytes()).valid)review.captureOriginal(model,'Restored '+startup.source+' original');
document.getElementById('review-compatibility')!.addEventListener('click',()=>review.current());
const fileDialog=new FileDialog({review:(candidate,label,file,accepted)=>review.open(candidate,label,file,accepted),reviewCurrent:()=>review.current(),getModel:()=>model,commit,renderEditor:render});
stage.dataset.startupSource=startup.source;storageStatus();
if(import.meta.env.DEV)document.getElementById('development-tools')!.hidden=false;
new ResizeObserver(()=>{stage.style.setProperty('--stage-scale',String(viewport.clientWidth/640));}).observe(viewport);
render();
if(startup.pending)review.open(MiiCharacterData.fromHex(startup.pending.hex),startup.pending.label);
// Keep all original screens discoverable to accessibility tooling and tests.
stage.dataset.screenCount=String(SCREENS.length);
