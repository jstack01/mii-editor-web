import {buildCharacterScene} from '../render/headScene';
import {multiply,transformBounds,unionBounds} from '../render/geometry';
import {renderHeadSvg} from '../render/svgRenderer';
import type {MiiCharacterData} from '../model/MiiCharacterData';
import type {HeadScene,Matrix} from '../render/types';
import {FILE_FRAMES} from '../generated/gui-assets';
export interface ImageSettings {size:number;zoom:number;showBody:boolean;format:'jpg'|'png';transparent:boolean;background:string;panX:number;panY:number}
export const IMAGE_DEFAULTS:Readonly<ImageSettings>={size:50,zoom:25,showBody:true,format:'jpg',transparent:false,background:'E3F3EF',panX:0,panY:0};
export const PREVIEW_SIZE=250;
// FileOptions uses DisplayObject.width in parent coordinates, not BitmapData.width.
export const PREVIEW_DISPLAY_WIDTH=PREVIEW_SIZE*FILE_FRAMES.find(f=>f.frame===4)!.placements.find(p=>p.name==='exportPreview')!.matrix[0];
export const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
export function verticalValue(y:number,min:number,max:number):number{return min+(max-min)*(-clamp(y,-171,0))/171;}
export function verticalY(value:number,min:number,max:number):number{return -171*(value-min)/(max-min);}
export function channelValue(x:number):number{return 255*(clamp(x,-115.5,115.5)+115.5)/231;}
export function channelX(value:number):number{return -115.5+231*value/255;}
export function imageScene(model:MiiCharacterData,settings:ImageSettings,preview=false):HeadScene {
 const scene=buildCharacterScene(model),bounds=unionBounds(scene.roots.filter(n=>n.bounds).map(n=>transformBounds(n.matrix,n.bounds!)))!;
 const dimension=preview?PREVIEW_SIZE:Math.trunc(settings.size),ratio=preview?1:settings.size/PREVIEW_DISPLAY_WIDTH,scale=(.15+settings.zoom/100)*ratio;
 const camera:Matrix=[scale,0,0,scale,settings.panX*ratio+dimension/2-scale*(bounds.x+bounds.width/2),settings.panY*ratio+dimension/2-scale*(bounds.y+bounds.height/2)];
 // Flash getBounds still includes the invisible body. Hiding it does NOT recenter the head.
 return {...scene,viewBox:{x:0,y:0,width:dimension,height:dimension},roots:scene.roots.map(n=>({...n,visible:n.name==='body'?settings.showBody:n.visible,matrix:multiply(camera,n.matrix)}))};
}
export async function rasterizeImage(model:MiiCharacterData,settings:ImageSettings,signal?:AbortSignal):Promise<HTMLCanvasElement> {
 signal?.throwIfAborted();const scene=imageScene(model,settings),svg=renderHeadSvg(scene),n=scene.viewBox.width;
 svg.setAttribute('width',String(n));svg.setAttribute('height',String(n));
 const canvas=document.createElement('canvas');canvas.width=n;canvas.height=n;const context=canvas.getContext('2d');if(!context)throw Error('Your browser could not create an image canvas.');
 if(!(settings.format==='png'&&settings.transparent)){context.fillStyle='#'+(parseInt(settings.background,16)>>>0).toString(16).padStart(6,'0');context.fillRect(0,0,n,n);}
 const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));
 try{const image=new Image();image.src=url;await image.decode();signal?.throwIfAborted();context.drawImage(image,0,0);}catch(error){canvas.width=canvas.height=0;throw error;}finally{URL.revokeObjectURL(url);}
 return canvas;
}
export async function encodeImage(canvas:HTMLCanvasElement,format:'jpg'|'png'):Promise<Blob> {
 const mime=format==='jpg'?'image/jpeg':'image/png';const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,mime,format==='jpg'?.9:undefined));
 if(!blob||blob.type!==mime)throw Error('Your browser could not encode the requested image format.');return blob;
}
