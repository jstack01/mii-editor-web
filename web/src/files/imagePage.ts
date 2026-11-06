import {GUI_TEXTS,GUI_TEXT_FILTERS} from '../generated/gui-assets';
import {flattenScene} from '../render/headScene';
import {renderHeadSvg} from '../render/svgRenderer';
import type {HeadScene} from '../render/types';
import {MiiCharacterData} from '../model/MiiCharacterData';
import {make,addHover} from '../gui/svgDom';
import {downloadBlob,downloadFilename} from './characterFiles';
import {IMAGE_DEFAULTS,PREVIEW_DISPLAY_WIDTH,channelValue,channelX,clamp,encodeImage,imageScene,rasterizeImage,verticalValue,verticalY,type ImageSettings} from './imageExport';
let sequence=0;
export class ImagePage {
 readonly settings:ImageSettings={...IMAGE_DEFAULTS};private exporting=false;
 constructor(private readonly model:()=>MiiCharacterData,private readonly notify:(text:string,error?:boolean)=>void){}
 get frames():Record<string,number>{return {bodyCheck:2,jpegCheck:2,pngCheck:2,transparentCheck:2};}
 async save(signal:AbortSignal):Promise<void>{
  if(this.exporting)return;this.exporting=true;const snapshot=MiiCharacterData.fromBytes(this.model().toBytes()),settings={...this.settings};let canvas:HTMLCanvasElement|undefined;this.notify('Preparing image…');
  try{canvas=await rasterizeImage(snapshot,settings,signal);const blob=await encodeImage(canvas,settings.format);signal.throwIfAborted();downloadBlob(blob,downloadFilename(snapshot.name,settings.format));this.notify(`Download requested (${canvas.width} × ${canvas.height} ${settings.format==='jpg'?'JPEG':'PNG'}).`);}catch(error){if(!signal.aborted)this.notify(error instanceof Error?error.message:String(error),true);}finally{if(canvas){canvas.width=0;canvas.height=0;}this.exporting=false;}
 }
 mount(svg:SVGSVGElement,scene:HeadScene,signal:AbortSignal):void {
  const state=this.settings,initialColor=parseInt(state.background,16)||0,channels=[initialColor>>>16&255,initialColor>>>8&255,initialColor&255],byPath=(path:string)=>svg.querySelector<SVGGElement>(`[data-instance-path="${path}"]`)!;
  const outputs:Record<string,HTMLInputElement|HTMLDivElement>={},labels:Record<string,string>={bodyCheck:'Body',jpegCheck:'JPEG',pngCheck:'PNG',transparentCheck:'Background'};
  for(const node of flattenScene(scene)){
   const metadata=GUI_TEXTS[String(node.symbolId) as keyof typeof GUI_TEXTS];if(!metadata)continue;
   const parent=node.path.split('.')[0]!,isLabel=node.name==='label'&&labels[parent],name=node.name??'';
   if(!isLabel&&!['sizeOutput','zoomOutput','bgColor','oversizeTimes'].includes(name))continue;
   const b=metadata.bounds,a=metadata.attributes,c=metadata.color,foreign=make('foreignObject',{x:b.x,y:b.y,width:b.width,height:b.height});
   const text=isLabel||name==='oversizeTimes'?document.createElement('div'):document.createElement('input');text.className=isLabel||name==='oversizeTimes'?'image-label':'image-field';text.style.fontSize=`${Number(a.fontHeight)/20}px`;text.style.lineHeight=`${Number(a.fontHeight)/20+2}px`;text.style.color=isLabel||name==='oversizeTimes'?`rgb(${c?.red??255},${c?.green??255},${c?.blue??255})`:'black';text.style.textAlign=a.align==='1'?'right':'left';
   if(text instanceof HTMLInputElement){text.type='text';text.autocapitalize='off';text.spellcheck=false;if(name!=='bgColor')text.inputMode='decimal';text.setAttribute('aria-label',name==='sizeOutput'?'Image size in pixels':name==='zoomOutput'?'Image zoom percent':'Image background hex');text.dataset.imageField=name;if(name==='bgColor')text.maxLength=6;outputs[name]=text;}else{text.textContent=isLabel?labels[parent]!:'x0.2';if(name==='oversizeTimes')outputs[name]=text;}
   if(name==='oversizeTimes'){const shadow=GUI_TEXT_FILTERS['344'][0].attributes;text.style.textShadow=`${Math.cos(Number(shadow.angle))*Number(shadow.distance)}px ${Math.sin(Number(shadow.angle))*Number(shadow.distance)}px ${shadow.blurX}px black`;}
   foreign.append(text);byPath(node.path).append(foreign);
  }
  const size=outputs.sizeOutput as HTMLInputElement,zoom=outputs.zoomOutput as HTMLInputElement,color=outputs.bgColor as HTMLInputElement;color.value=state.background;
  const thumbMove=(path:string,axis:'x'|'y',value:number)=>{const group=byPath(path),m=group.transform.baseVal.consolidate()!.matrix;group.setAttribute('transform',`matrix(${m.a} ${m.b} ${m.c} ${m.d} ${axis==='x'?value:m.e} ${axis==='y'?value:m.f})`);};
  const previewHolder=byPath('exportPreview');previewHolder.style.touchAction='none';previewHolder.classList.remove('gui-label');previewHolder.classList.add('gui-action');previewHolder.setAttribute('tabindex','0');previewHolder.setAttribute('role','group');previewHolder.setAttribute('aria-label','Image preview; drag to pan');previewHolder.dataset.imagePreview='original';
  const defs=svg.querySelector('defs')!,filter=make('filter',{id:`image-bg-${++sequence}`,x:'-1%',y:'-1%',width:'102%',height:'102%','color-interpolation-filters':'sRGB'}),matrix=make('feColorMatrix',{type:'matrix'});filter.append(matrix);defs.append(filter);byPath('exportPreview.background').setAttribute('filter',`url(#${filter.id})`);
  let preview:SVGSVGElement|null=null;
  const redraw=()=>{const next=renderHeadSvg(imageScene(this.model(),state,true));next.setAttribute('width','250');next.setAttribute('height','250');next.style.pointerEvents='none';next.style.overflow='hidden';next.dataset.imageCharacter='original';if(preview)preview.replaceWith(next);else previewHolder.append(next);preview=next;};
  const update=()=>{
   size.value=String(Math.round(state.size));zoom.value=String(Math.round(state.zoom));outputs.oversizeTimes!.textContent='x'+String(Math.round(100*state.size/PREVIEW_DISPLAY_WIDTH)/100);
   thumbMove('sizeScale.dragger','y',verticalY(state.size,10,800));thumbMove('zoomScale.dragger','y',verticalY(state.zoom,0,100));
   const value=parseInt(state.background,16)||0;for(const [channel,shift]of [['red',16],['green',8],['blue',0]] as const)thumbMove(`colorSlider.${channel}Dragger`,'x',channelX(channels[(16-shift)/8]!));
   const background=state.transparent&&state.format==='png'?0xffffff:value;matrix.setAttribute('values',`0 0 0 0 ${(background>>>16&255)/255} 0 0 0 0 ${(background>>>8&255)/255} 0 0 0 0 ${(background&255)/255} 0 0 0 1 0`);
   const checked={bodyCheck:state.showBody,jpegCheck:state.format==='jpg',pngCheck:state.format==='png',transparentCheck:!state.transparent};
   for(const [name,on]of Object.entries(checked)){const group=byPath(name),tick=group.querySelector('[data-symbol-id="308"]');if(tick)(tick.closest('[data-instance-path]') as SVGElement).style.display=on?'':'none';group.setAttribute('aria-checked',String(on));group.dataset.frame=on?'2':'1';}
   const disabled=state.format==='jpg',backgroundCheck=byPath('transparentCheck');backgroundCheck.setAttribute('aria-disabled',String(disabled));backgroundCheck.style.filter=disabled?'brightness(.5)':'';
   for(const [name,value]of [['sizeScale',state.size],['zoomScale',state.zoom]] as const)byPath(`${name}.dragger`).setAttribute('aria-valuenow',String(value));
   for(const [channel,shift]of [['red',16],['green',8],['blue',0]] as const)byPath(`colorSlider.${channel}Dragger`).setAttribute('aria-valuenow',String(value>>>shift&255));
   redraw();
  };
  const commit=()=>{for(const [input,key,min,max]of [[size,'size',10,800],[zoom,'zoom',0,100]] as const){const n=Number(input.value);if(!Number.isNaN(n))state[key]=clamp(n,min,max);}update();};
  for(const input of [size,zoom]){input.addEventListener('blur',commit,{signal});input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();commit();}},{signal});}
  color.addEventListener('paste',e=>{e.preventDefault();const filtered=(e.clipboardData?.getData('text/plain')??'').replace(/[^a-fA-F0-9]/g,'');const start=color.selectionStart??color.value.length,end=color.selectionEnd??start;color.value=(color.value.slice(0,start)+filtered+color.value.slice(end)).slice(0,6);color.dispatchEvent(new Event('input',{bubbles:true}));},{signal});
  color.addEventListener('input',()=>{color.value=color.value.replace(/[^a-fA-F0-9]/g,'').slice(0,6);if(color.value){const n=parseInt(color.value,16);if(n!==(parseInt(state.background,16)||0)){channels[0]=n>>>16&255;channels[1]=n>>>8&255;channels[2]=n&255;}state.background=color.value;update();}},{signal});
  for(const [name,label]of Object.entries(labels)){
   const group=byPath(name);group.classList.remove('gui-label');group.classList.add('gui-action');group.setAttribute('role','checkbox');group.setAttribute('aria-label',label==='Background'?'Image background enabled':label==='Body'?'Image body visible':label+' image format');group.setAttribute('tabindex','0');group.dataset.imageControl=name;
   const action=()=>{if(name!=='bodyCheck'&&!(name==='transparentCheck'&&state.format==='jpg'))state.background=color.value;if(name==='transparentCheck'){if(state.format==='jpg')return;state.transparent=!state.transparent;}else if(name==='bodyCheck')state.showBody=!state.showBody;else state.format=name==='jpegCheck'?'jpg':'png';update();};group.addEventListener('click',action,{signal});group.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();action();}},{signal});
  }
  const bind=(path:string,parent:string,axis:'x'|'y',min:number,max:number,get:()=>number,set:(value:number)=>void)=>{
   const group=byPath(path);group.classList.remove('gui-label');group.classList.add('gui-action');group.style.touchAction='none';group.setAttribute('tabindex','0');group.setAttribute('role','slider');group.setAttribute('aria-label',path==='sizeScale.dragger'?'Image size slider':path==='zoomScale.dragger'?'Image zoom slider':path.split('.')[1]!.replace('Dragger','')+' background slider');group.setAttribute('aria-valuemin',String(min));group.setAttribute('aria-valuemax',String(max));group.setAttribute('aria-orientation',axis==='x'?'horizontal':'vertical');if(axis==='y')addHover(svg,group,signal);let pointer:number|null=null;
   group.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0||pointer!==null)return;e.preventDefault();pointer=e.pointerId;group.focus();group.setPointerCapture(pointer);},{signal});
   group.addEventListener('pointermove',e=>{if(e.pointerId!==pointer)return;if(e.pointerType==='mouse'&&(e.buttons&1)===0){end(e);return;}const point=svg.createSVGPoint();point.x=e.clientX;point.y=e.clientY;const local=point.matrixTransform(byPath(parent).getScreenCTM()!.inverse());set(axis==='y'?verticalValue(local.y,min,max):channelValue(local.x));update();if(axis==='y')thumbMove(path,'y',clamp(local.y,-171,0));else thumbMove(path,'x',clamp(local.x,-115.5,115.5));},{signal});
   const end=(e:PointerEvent)=>{if(e.pointerId!==pointer)return;const id=pointer;pointer=null;if(group.hasPointerCapture(id))group.releasePointerCapture(id);};group.addEventListener('pointerup',end,{signal});group.addEventListener('pointercancel',end,{signal});group.addEventListener('lostpointercapture',()=>{pointer=null;},{signal});signal.addEventListener('abort',()=>{if(pointer!==null&&group.hasPointerCapture(pointer))group.releasePointerCapture(pointer);},{once:true});
   group.addEventListener('keydown',e=>{const delta:Record<string,number>={ArrowUp:1,ArrowRight:1,ArrowDown:-1,ArrowLeft:-1,PageUp:10,PageDown:-10};let value:number;if(e.key==='Home')value=min;else if(e.key==='End')value=max;else if(e.key in delta)value=clamp(get()+delta[e.key]!,min,max);else return;e.preventDefault();set(value);update();},{signal});
  };
  bind('sizeScale.dragger','sizeScale','y',10,800,()=>state.size,n=>state.size=n);bind('zoomScale.dragger','zoomScale','y',0,100,()=>state.zoom,n=>state.zoom=n);
  for(const [channel,shift]of [['red',16],['green',8],['blue',0]] as const)bind(`colorSlider.${channel}Dragger`,'colorSlider','x',0,255,()=>((parseInt(state.background,16)||0)>>>shift)&255,n=>{channels[(16-shift)/8]=n;state.background=(((channels[0]!|0)<<16)|((channels[1]!|0)<<8)|(channels[2]!|0)).toString(16).padStart(6,'0');color.value=state.background;});
  let pointer:number|null=null,last:{x:number;y:number}|null=null;
  const position=(e:PointerEvent)=>{const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM()!.inverse());};
  previewHolder.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.button!==0)return;e.preventDefault();pointer=e.pointerId;last=position(e);previewHolder.setPointerCapture(pointer);},{signal});
  previewHolder.addEventListener('pointermove',e=>{if(e.pointerId!==pointer||!last)return;if(e.pointerType==='mouse'&&(e.buttons&1)===0){stop(e);return;}const next=position(e);state.panX+=next.x-last.x;state.panY+=next.y-last.y;last=next;redraw();},{signal});
  const stop=(e:PointerEvent)=>{if(e.pointerId!==pointer)return;const id=pointer;pointer=null;last=null;if(previewHolder.hasPointerCapture(id))previewHolder.releasePointerCapture(id);};previewHolder.addEventListener('pointerup',stop,{signal});previewHolder.addEventListener('pointercancel',stop,{signal});previewHolder.addEventListener('lostpointercapture',()=>{pointer=null;last=null;},{signal});signal.addEventListener('abort',()=>{if(pointer!==null&&previewHolder.hasPointerCapture(pointer))previewHolder.releasePointerCapture(pointer);},{once:true});
  previewHolder.addEventListener('keydown',e=>{const deltas:Record<string,readonly[number,number]>={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};const d=deltas[e.key];if(!d)return;e.preventDefault();state.panX+=d[0]*(e.shiftKey?10:1);state.panY+=d[1]*(e.shiftKey?10:1);redraw();},{signal});
  update();
 }
}
