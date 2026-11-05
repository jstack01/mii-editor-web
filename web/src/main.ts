import './editor.css';
import {MiiCharacterData} from './model/MiiCharacterData';
import {DEFAULT_MII_HEX} from './generated/default-character';
import {GUI_ASSETS,GUI_GRIDS,GUI_TEXTS} from './generated/gui-assets';
import {buildCharacterScene,flattenScene} from './render/headScene';
import {renderHeadSvg} from './render/svgRenderer';
import {multiply,matrixAttribute} from './render/geometry';
import {buildGuiScene,characterCamera,pageFor} from './gui/guiScene';
import {SCREENS,screenFor} from './gui/screens';
import {applyNineSlice} from './gui/nineSlice';
import type {SceneNode} from './render/types';
const SVG='http://www.w3.org/2000/svg';
const model=MiiCharacterData.fromHex(DEFAULT_MII_HEX);
let screen=screenFor('basic');
let interactions=new AbortController();
const host=document.getElementById('editor')!,stage=document.getElementById('stage')!,viewport=document.getElementById('viewport')!;
const controls:Record<string,string>={tab_basic:'General',tab_size:'Body size',tab_face:'Head',tab_hair:'Hair',tab_eyebrows:'Eyebrows',tab_eyes:'Eyes',tab_nose:'Nose',tab_lips:'Mouth',tab_accessories:'Glasses',nav_face:'Head shapes',nav_face2:'Facial features',nav_accessories:'Glasses',nav_accessories2:'Mustache',nav_accessories3:'Mole',nav_accessories4:'Beard',toggle_gender:'Change gender',toggle_mingles:'Change mingle setting',actionRandom:'Randomize character',screenFile:'File — deferred',page_next:'Next feature page — deferred',page_prev:'Previous feature page — deferred'};
const fieldNames:Record<string,string>={nameText:'Name',creatorText:'Creator',idText:'Mii ID',wiiText:'Wii ID',birthDateText:'Birthday day',birthMonthText:'Birthday month',URLText:'Serialized Mii data'};
function make<K extends keyof SVGElementTagNameMap>(name:K,attrs:Record<string,string|number>={}):SVGElementTagNameMap[K]{const e=document.createElementNS(SVG,name);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,String(v));return e;}
function updateReadout():void {const field=host.querySelector<HTMLInputElement>('[data-field="URLText"]');if(field)field.value=model.toHex();stage.dataset.hex=model.toHex();}
function renderCharacter():void {
 const group=host.querySelector<SVGGElement>('[data-instance-path="graphicsContainer"]')!;
 const scene=buildCharacterScene(model);group.setAttribute('transform',matrixAttribute(characterCamera(screen,scene.footing!)));
 const loaded={...scene,viewBox:{x:0,y:0,width:640,height:500},roots:scene.roots.map((n)=>({...n,matrix:multiply([1,0,0,1,-150,0],n.matrix)}))};
 const svg=renderHeadSvg(loaded);svg.setAttribute('width','640');svg.setAttribute('height','500');svg.style.overflow='visible';svg.dataset.characterRoot='original';group.replaceChildren(svg);
}
function fieldValue(name:string):string {
 if(name==='URLText')return model.toHex();if(name==='pageText')return `${pageFor(model,screen)+1}/${screen.pages}`;
 const field=name.slice(0,-4);if(field==='id'||field==='wii')return model.getHex(field);
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
 const foreign=make('foreignObject',{x:b.x,y:b.y,width:b.width,height:b.height});const input=document.createElement('input');input.className='gui-field';input.dataset.field=name;input.setAttribute('aria-label',fieldNames[name]);input.type='text';input.autocomplete='off';input.spellcheck=false;input.value=fieldValue(name);input.style.fontSize=`${Number(a.fontHeight)/20}px`;input.style.color=`rgb(${c?.red??88},${c?.green??107},${c?.blue??105})`;
 if(a.hasMaxLength==='true')input.maxLength=Number(a.maxLength);
 if(name==='URLText'){input.readOnly=true;input.title='Current 74-byte character data. Legacy URL sharing is deferred.';}
 else input.addEventListener('input',(event)=>{
  if(event instanceof InputEvent&&event.isComposing)return;applyText(input,name);
 });
 input.addEventListener('compositionend',()=>applyText(input,name));foreign.append(input);group.append(foreign);
}
function applyText(input:HTMLInputElement,name:string):void {
 const field=name.slice(0,-4);
 if(field==='birthDate'||field==='birthMonth'){input.value=input.value.replace(/[^0-9]/g,'');model.setValue(field,input.value?Number(input.value):0);}
 else if(field==='id'||field==='wii')model.setHex(field,input.value);
 else {input.value=input.value.slice(0,10);model.setValue(field,input.value);}
 updateReadout();if(field==='id')renderCharacter();
}
function addHover(svg:SVGSVGElement,group:SVGGElement):void {
 const defs=svg.querySelector('defs')!;
 const filters=[20,-20].map((offset)=>{const id=`gui-hover-${offset<0?'down':'over'}-${group.dataset.control}`;const filter=make('filter',{id,x:'-20%',y:'-30%',width:'140%',height:'160%','color-interpolation-filters':'sRGB'});filter.append(make('feColorMatrix',{type:'matrix',values:`1 0 0 0 ${offset/255} 0 1 0 0 ${offset/255} 0 0 1 0 ${offset/255} 0 0 0 1 0`}));defs.append(filter);return `url(#${id})`;});
 let down=false;group.addEventListener('pointerenter',()=>{if(!down)group.style.filter=filters[0]!;});group.addEventListener('pointerleave',()=>{if(!down)group.style.filter='';});group.addEventListener('pointerdown',()=>{down=true;group.style.filter=filters[1]!;window.addEventListener('pointerup',()=>{down=false;group.style.filter='';},{once:true,signal:interactions.signal});});
 group.addEventListener('pointerup',()=>{down=false;group.style.filter=filters[0]!;});
}
function bindControl(svg:SVGSVGElement,group:SVGGElement,node:SceneNode):void {
 const name=node.name??'';let label=controls[name],action:(()=>void)|undefined;
 if(name.startsWith('tab_')||name.startsWith('nav_')){const target=name.slice(name.indexOf('_')+1);action=()=>{screen=screenFor(target);render();};}
 if(screen.id==='basic'){
  if(name==='toggle_gender'||name==='toggle_mingles'){const field=name.slice(7);action=()=>{model.setValue(field,model.getValue(field)?0:1);render();};group.setAttribute('aria-pressed',String(!!model.getValue(field)));}
  if(name==='actionRandom')action=()=>{model.randomize();render();};
 }
 if(/^color\d+$/.test(name)){
  const index=Number(name.slice(5));label=`${screen.palette==='favorite'?'Favorite':screen.palette==='skin'?'Skin':screen.palette} color ${index+1}`;
  if(screen.editable)action=()=>{model.setValue(`${screen.palette}Color`,index);render();};
  group.setAttribute('aria-pressed',String(model.getValue(`${screen.palette}Color`)===index));
 }
 if(/^item\d+$/.test(name)){
  const index=Number(name.slice(4)),frame=index+screen.count*pageFor(model,screen)+1;label=`${screen.name} ${frame}`;
  if(screen.editable)action=()=>{model.setValue(`${screen.prop}Type`,model.frameToValue(`${screen.prop}Type`,frame));render();};
  group.setAttribute('aria-pressed',String(model.getValue(`${screen.prop}Type`)===model.frameToValue(`${screen.prop}Type`,frame)));
 }
 if(name.startsWith('option_')||name.startsWith('slider_'))label=`${name.replaceAll('_',' ')} — editing deferred`;
 if(!label)return;
 group.dataset.control=name;group.setAttribute('role','button');group.setAttribute('aria-label',label);group.setAttribute('aria-disabled',String(!action));
 if(action){group.classList.add('gui-action');group.setAttribute('tabindex','0');group.addEventListener('click',action);group.addEventListener('keydown',(e)=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();action!();}});if([272,294,318].includes(node.symbolId))addHover(svg,group);}
 else{group.classList.add('gui-disabled');const title=make('title');title.textContent=`${label}: unavailable in Phase 4A`;group.append(title);}
}
function render():void {
 interactions.abort();interactions=new AbortController();
 const focused=(document.activeElement as SVGElement|null)?.dataset?.control;
 const scene=buildGuiScene(model,screen),svg=renderHeadSvg(scene,{catalog:GUI_ASSETS});svg.setAttribute('role','group');svg.setAttribute('aria-label',`${screen.name} — original Mii Editor`);svg.dataset.guiScreen=screen.id;svg.querySelector('title')!.textContent='Original Mii Editor';
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
 host.replaceChildren(svg);renderCharacter();updateReadout();
 document.getElementById('screen-status')!.textContent=`${screen.name}${screen.editable?' — editing available.':' — appearance preview; editing controls are disabled until Phase 4B.'}`;
 if(focused)host.querySelector<SVGGElement>(`[data-control="${focused}"]`)?.focus({preventScroll:true});
}
if(import.meta.env.DEV)document.getElementById('development-tools')!.hidden=false;
new ResizeObserver(()=>{stage.style.setProperty('--stage-scale',String(viewport.clientWidth/640));}).observe(viewport);
render();
// Keep all original screens discoverable to accessibility tooling and tests.
stage.dataset.screenCount=String(SCREENS.length);
