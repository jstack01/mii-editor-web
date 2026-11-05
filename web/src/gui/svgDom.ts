const SVG='http://www.w3.org/2000/svg';let sequence=0;
export function make<K extends keyof SVGElementTagNameMap>(name:K,attrs:Record<string,string|number>={}):SVGElementTagNameMap[K]{const e=document.createElementNS(SVG,name);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v));return e;}
export function addHover(svg:SVGSVGElement,group:SVGGElement,signal:AbortSignal):void {
 const unique=++sequence;
 const defs=svg.querySelector('defs')!;
 const filters=[20,-20].map((offset)=>{const id=`gui-hover-${offset<0?'down':'over'}-${group.dataset.control}-${unique}`;const filter=make('filter',{id,x:'-20%',y:'-30%',width:'140%',height:'160%','color-interpolation-filters':'sRGB'});filter.append(make('feColorMatrix',{type:'matrix',values:`1 0 0 0 ${offset/255} 0 1 0 0 ${offset/255} 0 0 1 0 ${offset/255} 0 0 0 1 0`}));defs.append(filter);return `url(#${id})`;});
 let down=false;group.addEventListener('pointerenter',()=>{if(!down)group.style.filter=filters[0]!;});group.addEventListener('pointerleave',()=>{if(!down)group.style.filter='';});group.addEventListener('pointerdown',()=>{down=true;group.style.filter=filters[1]!;window.addEventListener('pointerup',()=>{down=false;group.style.filter='';},{once:true,signal});});
 group.addEventListener('pointerup',()=>{down=false;group.style.filter=filters[0]!;});
 group.addEventListener('pointercancel',()=>{down=false;group.style.filter='';},{signal});
}
