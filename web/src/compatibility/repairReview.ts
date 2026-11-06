import {renderHeadSvg} from '../render/svgRenderer';
import {MiiCharacterData} from '../model/MiiCharacterData';
import {proposeRepair,requireWii,validateWii,wiiIds,type RepairProposal} from './wiiProfile';
import {xmlChangesFor,xmlOriginalFor} from '../files/characterFiles';
import {canPreview,repairLabel,repairValues,repairPreviewScenes} from './repairPresentation';
function element<K extends keyof HTMLElementTagNameMap>(tag:K,text='',className=''):HTMLElementTagNameMap[K] {const e=document.createElement(tag);e.textContent=text;e.className=className;return e;}
/** Modern review UI only. Validation and explicit transaction boundaries remain shared. */
export class RepairReview {
 private readonly dialog=document.createElement('dialog');
 private backup:{hex:string;label:string}|null=null;
 private backupSaved=false;
 private retainedInput:Blob|null=null;
 private opener:HTMLElement|SVGElement|null=null;
 constructor(private readonly model:()=>MiiCharacterData,private readonly commit:(model:MiiCharacterData)=>void){
  this.dialog.id='wii-repair-dialog';this.dialog.setAttribute('aria-modal','true');this.dialog.setAttribute('aria-labelledby','repair-title');this.dialog.setAttribute('aria-describedby','repair-intro');document.body.append(this.dialog);
  try{const b=JSON.parse(localStorage.getItem('mii-editor.original.v1')??'null');if(b&&typeof b.hex==='string'&&/^[0-9a-f]{148}$/.test(b.hex)&&typeof b.label==='string'){this.backup=b;this.backupSaved=true;}}catch{/* Exact pending input stays in memory. */}
  this.dialog.addEventListener('close',()=>requestAnimationFrame(()=>{if(this.dialog.open)return;if(!['applied','unchanged'].includes(this.dialog.returnValue)&&document.querySelector('[data-file-page]')){const status=document.getElementById('file-status')!;status.textContent='No changes applied.';status.dataset.error='false';status.setAttribute('role','status');}const target=this.opener?.isConnected?this.opener:document.querySelector<SVGElement>('[data-file-page]')??document.getElementById('review-compatibility');target?.focus({preventScroll:true});}));
  this.dialog.addEventListener('keydown',event=>{
   if(event.key!=='Tab')return;
   const items=Array.from(this.dialog.querySelectorAll<HTMLElement>('button:not(:disabled),summary,[tabindex="0"]')).filter(e=>e.getClientRects().length>0);
   const first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  });
 }
 captureOriginal(candidate:MiiCharacterData,label:string):void {this.backup={hex:candidate.toHex(),label:label.slice(0,255)};try{localStorage.setItem('mii-editor.original.v1',JSON.stringify(this.backup));this.backupSaved=true;}catch{this.backupSaved=false;}}
 current():void{this.open(this.model(),'Current character');}
 open(candidate:MiiCharacterData,label:string,originalFile?:File,accepted?:()=>void):void {
  if(this.dialog.open)this.dialog.close();this.dialog.returnValue='';this.opener=document.activeElement as HTMLElement|SVGElement|null;
  const base=this.model().toHex(),original=candidate.toBytes(),validation=validateWii(original),xmlChanges=xmlChangesFor(candidate);
  // Preserve actual selected-file/edited-XML input as well as exact decoded bytes.
  this.retainedInput=originalFile??xmlOriginalFor(candidate)??new Blob([Uint8Array.from(original).buffer]);
  let proposal:RepairProposal|null=null,error='';
  if((!validation.valid||xmlChanges.length)&&(label!=='Current character'||!this.backup))this.captureOriginal(candidate,label);
  try{proposal=proposeRepair(original);}catch(e){error=e instanceof Error?e.message:String(e);}
  const changes=[...xmlChanges,...(proposal?.changes??[])],count=validation.errors.length+xmlChanges.length,needsFixes=count>0;
  this.dialog.replaceChildren();
  const header=element('header','','repair-header'),title=element('h2',needsFixes?'Fix this Mii?':'Mii details');title.id='repair-title';
  const intro=element('p',needsFixes?'Some settings in this Mii need to be adjusted before it can be saved in a Wii-compatible format.':'This Mii is ready to save.');intro.id='repair-intro';header.append(title,intro);this.dialog.append(header);
  const body=element('div','','repair-body');body.tabIndex=0;body.setAttribute('role','region');body.setAttribute('aria-label','Mii comparison and fixes');this.dialog.append(body);
  const source=element('p',originalFile?.name??label.replace(/^Imported /,''),'repair-source');source.title=source.textContent!;body.append(source);
  const previews=element('div','','repair-previews');const scenes=repairPreviewScenes([candidate,proposal?.validation.valid?MiiCharacterData.fromHex(proposal.proposedHex):null]);
  for(const [i,caption]of ['Original','After fixes'].entries()){
   const figure=element('figure'),name=element('figcaption',caption);figure.dataset.repairPreview=i?'proposed':'original';figure.append(name);
   const scene=scenes[i];if(scene){const svg=renderHeadSvg(scene);svg.setAttribute('aria-label',caption+' Mii');svg.setAttribute('width','240');svg.setAttribute('height','280');figure.append(svg);}else figure.append(element('p','Preview unavailable','repair-preview-unavailable'));
   previews.append(figure);
  }
  body.append(previews);
  body.append(element('p',count===1?'1 issue found':`${count} issues found`,'repair-count'));
  if(changes.length){
   const table=element('table');table.setAttribute('aria-label','Proposed changes');const head=element('thead'),row=element('tr');for(const text of ['Setting','Original','After fixes']){const cell=element('th',text);cell.scope='col';row.append(cell);}head.append(row);table.append(head);const rows=element('tbody');
   for(const change of changes){const tr=element('tr'),name=element('th',repairLabel(change.field));name.scope='row';const [before,after]=repairValues(change);tr.append(name,element('td',before),element('td',after));rows.append(tr);}table.append(rows);body.append(table);
  }
  if(error)body.append(element('p','Fixes could not be prepared. Your current Mii has not changed.','repair-error'));
  const advanced=element('details','','repair-advanced');advanced.append(element('summary','Advanced details'));
  if(!validation.valid||xmlChanges.length)advanced.append(element('p','The original input is retained until you accept changes. Cancelling leaves your current Mii unchanged.'));
  if(!this.backupSaved&&needsFixes)advanced.append(element('p','Browser backup is unavailable. The original input is kept in memory while this review is open; keep your source file.'));
  advanced.append(element('p',`${this.retainedInput.size} input bytes retained. Console ownership and destination ID uniqueness are not verified.`));
  const diagnostic=element('ul');for(const text of [...validation.errors.map(e=>e.message),...validation.warnings.filter(w=>!w.startsWith('Software validation')),error].filter(Boolean)){diagnostic.append(element('li',text));}advanced.append(diagnostic);
  for(const change of changes)advanced.append(element('p',`${change.field}: ${change.before} → ${change.after}. ${change.reason}`));
  const data=element('pre','Original: '+candidate.toHex()+'\nAfter fixes: '+(proposal?.proposedHex??'Unavailable'));advanced.append(data);
  const status=element('p','','repair-error');status.setAttribute('role','alert');status.setAttribute('aria-live','assertive');body.append(advanced,status);
  const action=(label:string,callback:()=>void,className='')=>{const button=element('button',label,className);button.type='button';button.addEventListener('click',callback);return button;};
  const unchanged=()=>{if(this.model().toHex()!==base){status.textContent='Your Mii changed while this dialog was open. Cancel and try again.';return;}wiiIds.reserve(original);this.dialog.close('unchanged');accepted?.();this.commit(MiiCharacterData.fromBytes(original));};
  if(label!=='Current character'&&!xmlChanges.length&&needsFixes){advanced.append(element('p','Load without fixing is for read-only viewing. Editing and Mii saving remain blocked.'));const keep=action('Load without fixing',unchanged,'repair-optional');keep.disabled=!canPreview(candidate);advanced.append(keep);if(keep.disabled)advanced.append(element('p','This original cannot be displayed safely. Apply the fixes to load it.'));}
  const footer=element('footer','','repair-footer'),actions=element('div','','repair-actions');
  const cancel=action('Cancel',()=>this.dialog.close('cancel'),'repair-secondary');cancel.autofocus=true;
  const apply=action('Apply fixes & load',()=>{try{if(this.model().toHex()!==base)throw Error('Your Mii changed while this dialog was open. Cancel and try again.');if(!proposal)throw Error('Fixes are unavailable. Your current Mii has not changed.');const repaired=MiiCharacterData.fromHex(proposal.proposedHex);requireWii(repaired.toBytes());wiiIds.reserve(repaired.toBytes());this.dialog.close('applied');accepted?.();this.commit(repaired);}catch(e){status.textContent=e instanceof Error?e.message:String(e);}},'repair-primary');apply.disabled=!proposal?.validation.valid||!changes.length;
  actions.append(cancel);if(needsFixes)actions.append(apply);footer.append(element('p','This does not guarantee compatibility with every Wii console or game.','repair-disclaimer'),actions);this.dialog.append(footer);
  this.dialog.showModal();cancel.focus({preventScroll:true});
 }
}
