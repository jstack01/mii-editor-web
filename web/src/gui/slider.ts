export const SLIDER_MIN_X=301,SLIDER_MAX_X=528,SLIDER_SPAN=227;
export const clampSliderX=(x:number):number=>Math.max(SLIDER_MIN_X,Math.min(SLIDER_MAX_X,x));
export const sliderX=(value:number):number=>SLIDER_MIN_X+SLIDER_SPAN*value/127;
export const sliderValue=(x:number):number=>Math.trunc(127*((clampSliderX(x)-SLIDER_MIN_X)/SLIDER_SPAN));
export function sliderKey(value:number,key:string):number|null {const deltas:Record<string,number>={ArrowRight:1,ArrowUp:1,ArrowLeft:-1,ArrowDown:-1,PageUp:10,PageDown:-10};return key==='Home'?0:key==='End'?127:key in deltas?Math.max(0,Math.min(127,value+deltas[key]!)):null;}
/** Keep the captured thumb in the DOM during drag; only its transform and the
 * existing avatar/readout change. A full scene rebuild would lose capture. */
export function bindSlider(group:SVGGElement,svg:SVGSVGElement,field:'height'|'weight',value:()=>number,onChange:(value:number)=>void,signal:AbortSignal):void {
 let pointer:number|null=null,offset=0,currentX=sliderX(value());
 const stageX=(event:PointerEvent)=>{const matrix=svg.getScreenCTM();if(!matrix)throw Error('Missing editor screen transform');const point=svg.createSVGPoint();point.x=event.clientX;point.y=event.clientY;return point.matrixTransform(matrix.inverse()).x;};
 const update=(x:number,n:number)=>{currentX=x;const m=group.transform.baseVal.consolidate()!.matrix;group.setAttribute('transform',`matrix(${m.a} ${m.b} ${m.c} ${m.d} ${x} ${m.f})`);group.setAttribute('aria-valuenow',String(n));onChange(n);};
 group.dataset.control=`slider_${field}`;group.classList.add('gui-action');group.style.touchAction='none';group.setAttribute('role','slider');group.setAttribute('tabindex','0');group.setAttribute('aria-label',field==='height'?'Height':'Weight');group.setAttribute('aria-valuemin','0');group.setAttribute('aria-valuemax','127');group.setAttribute('aria-valuenow',String(value()));group.setAttribute('aria-disabled','false');group.setAttribute('aria-orientation','horizontal');
 group.addEventListener('pointerdown',(event)=>{if(!event.isPrimary||event.button!==0||pointer!==null)return;event.preventDefault();group.focus({preventScroll:true});pointer=event.pointerId;offset=currentX-stageX(event);group.setPointerCapture(pointer);},{signal});
 group.addEventListener('pointermove',(event)=>{if(event.pointerId!==pointer)return;const x=clampSliderX(stageX(event)+offset);update(x,sliderValue(x));},{signal});
 const end=(event:PointerEvent)=>{if(event.pointerId!==pointer)return;const id=pointer;pointer=null;if(group.hasPointerCapture(id))group.releasePointerCapture(id);};
 group.addEventListener('pointerup',end,{signal});group.addEventListener('pointercancel',end,{signal});group.addEventListener('lostpointercapture',()=>{pointer=null;},{signal});
 group.addEventListener('keydown',(event)=>{const next=sliderKey(value(),event.key);if(next===null)return;event.preventDefault();update(sliderX(next),next);},{signal});
 signal.addEventListener('abort',()=>{if(pointer!==null&&group.hasPointerCapture(pointer))group.releasePointerCapture(pointer);pointer=null;},{once:true});
}
