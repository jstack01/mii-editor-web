import {ImagePage} from './imagePage';
import {wiiExportNotice} from '../compatibility/wiiCompatibility';
import {GUI_ASSETS,GUI_TEXTS,GUI_GRIDS} from '../generated/gui-assets';
import type {MiiCharacterData} from '../model/MiiCharacterData';
import {flattenScene} from '../render/headScene';
import {renderHeadSvg} from '../render/svgRenderer';
import {applyNineSlice} from '../gui/nineSlice';
import {make,addHover} from '../gui/svgDom';
import {buildFileScene,filePreviewScene,type FilePage} from './fileScene';
import {downloadCharacter,exportXML,importCharacterFile,importXML} from './characterFiles';
import {bindXMLScroll} from './xmlScroll';
const INFO:Record<string,string>={actionLoadMii:'Load Mii characters from your computer into the Mii Editor. Valid Mii files include .mii binary files or Mii\'s saved as XML.',actionSaveMii:'Save your current Mii character to your computer as a .mii binary file. If you ever want to reload your Mii into the editor, you can use the Load option to load this file to get your character back.',screenXML:'View the XML for your current Mii character. You can edit the XML to have its changes affect your Mii or save the XML to your computer as an .xml file.',screenImage:'Export your Mii character to your computer as a bitmap image.  You can choose between JPEG or PNG formats.'};
export class FileDialog {
 private page:FilePage|null=null;private draft='';private baselineDraft='';private abort=new AbortController();private generation=0;private busy=false;
 private readonly picker=document.createElement('input');private readonly image=new ImagePage(()=>this.options.getModel(),(text,error)=>this.message(text,error));
 constructor(private readonly options:{getModel:()=>MiiCharacterData;commit:(candidate:MiiCharacterData)=>void;renderEditor:()=>void}){
  this.picker.type='file';this.picker.accept='.mii,.xml';this.picker.hidden=true;this.picker.id='mii-file-picker';this.picker.setAttribute('aria-label','Open Mii or XML file');document.body.append(this.picker);
  this.picker.addEventListener('change',()=>{const file=this.picker.files?.[0];this.picker.value='';if(file)void this.load(file);});
  this.picker.addEventListener('cancel',()=>this.message('File selection cancelled; the character is unchanged.'));
 }
 private message(text:string,error=false):void {const status=document.getElementById('file-status')!;status.textContent=text;status.setAttribute('role',error?'alert':'status');status.dataset.error=String(error);}
 open():void {this.page='files';this.generation++;this.message('');this.options.renderEditor();}
 private close():void {this.page=null;this.generation++;this.abort.abort();this.message('');this.options.renderEditor();document.querySelector<SVGGElement>('[data-control="screenFile"]')?.focus();}
 private xml():void {try{this.draft=exportXML(this.options.getModel(),true);this.baselineDraft=this.draft;this.generation++;this.page='xml';this.message('Back applies XML edits and may clear unused binary bits. Escape discards edits. Save downloads the current character.');this.options.renderEditor();}catch(e){this.error(e);}}
 private imagePage():void {this.page='image';this.generation++;this.message('Drag the preview to pan. Image settings do not alter Mii data.');this.options.renderEditor();}
 private files():void {if(this.page==='image'){this.page='files';this.generation++;this.options.renderEditor();this.message('');return;}if(this.draft===this.baselineDraft){this.page='files';this.generation++;this.options.renderEditor();this.message('XML unchanged; the original binary is preserved.');return;}try{const candidate=importXML(this.draft);this.page='files';this.generation++;this.options.commit(candidate);this.message('XML applied. XML import follows the original field mappings and resets unused binary bits.');}catch(e){this.error(e);}}
 private error(error:unknown):void {this.message(error instanceof Error?error.message:String(error),true);}
 private async load(file:File):Promise<void> {
  if(this.busy)return;this.busy=true;const generation=this.generation;
  try{const candidate=await importCharacterFile(file);if(generation!==this.generation)return;this.options.commit(candidate);this.message(`Loaded ${file.name}.`);}catch(e){if(generation===this.generation)this.error(e);}finally{this.busy=false;}
 }
 private save(type:'mii'|'xml'):void {try{downloadCharacter(this.options.getModel(),type);this.message(`Download requested (${type==='mii'?'74-byte .mii':'XML'}).${type==='mii'?' '+wiiExportNotice(this.options.getModel().toBytes()):''}`);}catch(e){this.error(e);}}
 mount(editor:SVGSVGElement):void {
  this.abort.abort();this.abort=new AbortController();if(!this.page)return;
  const signal=this.abort.signal,scene=buildFileScene(this.page,this.page==='image'?this.image.frames:{}),svg=renderHeadSvg(scene,{catalog:GUI_ASSETS});svg.dataset.filePage=this.page;svg.setAttribute('role','dialog');svg.setAttribute('aria-modal','true');svg.setAttribute('tabindex','-1');svg.setAttribute('aria-label',this.page==='files'?'Mii Files':this.page==='xml'?'Mii XML':'Export Mii image');svg.setAttribute('width','640');svg.setAttribute('height','500');svg.querySelector('title')!.textContent=this.page==='files'?'Mii Files':this.page==='xml'?'Mii XML':'Export Mii image';
  // Match the original screens depth 156: the existing footer remains above it.
  const art=editor.querySelector('[data-artwork]')!;for(const child of Array.from(art.children)){(child as SVGElement).style.pointerEvents='none';child.setAttribute('aria-hidden','true');for(const focus of child.querySelectorAll('[tabindex],input'))focus.setAttribute('tabindex','-1');}
  const next=Array.from(art.children).find((n)=>Number(n.getAttribute('data-depth'))>156);art.insertBefore(svg,next??null);
  for(const node of flattenScene(scene)){
   const group=svg.querySelector<SVGGElement>(`[data-instance-path="${node.path}"]`)!;const grid=GUI_GRIDS[String(node.symbolId) as keyof typeof GUI_GRIDS];if(grid&&node.bounds)applyNineSlice(svg,group,node.bounds,grid,node.matrix);
   if(node.path.includes('.'))continue;
   const name=node.name??'';if(this.page==='image'&&!['screenFile','actionImage'].includes(name)){if(!name)group.classList.add('gui-label');continue;}
   if(name==='previewHolder'){const preview=renderHeadSvg(filePreviewScene(this.options.getModel()));preview.setAttribute('width','120');preview.setAttribute('height','260');preview.style.overflow='hidden';preview.dataset.filePreview='original';group.append(preview);}
   const metadata=GUI_TEXTS[String(node.symbolId) as keyof typeof GUI_TEXTS];
   if(metadata){const b=metadata.bounds,a=metadata.attributes,c=metadata.color;const foreign=make('foreignObject',{x:b.x,y:b.y,width:b.width,height:b.height});
    if(name==='xmlText'){const text=document.createElement('textarea');text.id='file-xml';text.className='file-xml';text.setAttribute('aria-label','Mii XML');text.wrap='off';text.spellcheck=false;text.value=this.draft;text.addEventListener('input',()=>{this.draft=text.value;},{signal});foreign.append(text);group.append(foreign);}
    else if(name==='informationText'||name==='versions'){const text=document.createElement('div');text.className='file-text';text.dataset.fileText=name;text.style.fontSize=`${Number(a.fontHeight)/20}px`;text.style.lineHeight=`${Number(a.fontHeight)/20+2}px`;text.style.color=`rgb(${c?.red??0},${c?.green??0},${c?.blue??0})`;text.style.textAlign=name==='versions'?'right':'left';text.textContent=name==='versions'?'Editor: Web\nCharacter: original vectors':'';foreign.append(text);group.append(foreign);}
   }
   const labels:Record<string,string>={actionLoadMii:'Load Mii or XML',actionSaveMii:'Save Mii',screenXML:'View and edit XML',screenImage:'Export image',screenOK:'Return to editor',screenFile:this.page==='image'?'Return to Files':'Return to Files and apply XML',actionImage:'Save image',actionSaveXML:'Save current Mii as XML'};
   const label=labels[name];if(!label){if(!metadata&&name!=='scrollBar')group.classList.add('gui-label');continue;}
   const actions:Record<string,()=>void>={actionLoadMii:()=>{if(!this.busy){this.picker.value='';this.picker.click();}},actionSaveMii:()=>this.save('mii'),screenXML:()=>this.xml(),screenImage:()=>this.imagePage(),actionImage:()=>void this.image.save(signal),screenOK:()=>this.close(),screenFile:()=>this.files(),actionSaveXML:()=>this.save('xml')};
   const action=actions[name];group.dataset.fileControl=name;group.dataset.control=`file-${name}`;group.setAttribute('role','button');group.setAttribute('aria-label',label);group.setAttribute('aria-disabled',String(!action));group.classList.add(action?'gui-action':'gui-disabled');
   if(action){group.setAttribute('tabindex','0');group.addEventListener('click',action,{signal});group.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();action();}},{signal});addHover(svg,group,signal);}else{const title=make('title');title.textContent=INFO.screenImage!;group.append(title);}
   if(INFO[name]){const info=(text:string)=>{const target=svg.querySelector<HTMLElement>('[data-file-text="informationText"]');if(target)target.textContent=text;};group.addEventListener('pointerenter',()=>info(INFO[name]!),{signal});group.addEventListener('pointerleave',()=>info(''),{signal});group.addEventListener('focus',()=>info(INFO[name]!),{signal});group.addEventListener('blur',()=>info(''),{signal});}
  }
  if(this.page==='image')this.image.mount(svg,scene,signal);
  const textarea=svg.querySelector<HTMLTextAreaElement>('#file-xml');if(textarea)bindXMLScroll(svg,textarea,signal);
  // Keep focus in the modal. Escape is the explicit browser cancellation path;
  // Back retains the original apply-on-return interaction, now transactional.
  svg.addEventListener('keydown',(e)=>{if(e.isComposing)return;if(e.key==='Escape'){e.preventDefault();if(this.page==='xml'){this.page='files';this.draft=this.baselineDraft;this.generation++;this.options.renderEditor();this.message('XML edits discarded; the character is unchanged.');}else if(this.page==='image'){this.files();}else this.close();}else if(e.key==='Tab'){const items=Array.from(svg.querySelectorAll<HTMLElement|SVGElement>('[tabindex="0"],textarea,input'));const first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}},{signal});
  (this.page==='xml'?svg.querySelector<HTMLTextAreaElement>('textarea'):svg)?.focus({preventScroll:true});
 }
}
