import {expect,it} from 'vitest';
import dataSource from '../../../EXTRACTED-SWF/classicGUI.swf/scripts/mii/MiiCharacterData.as?raw';
import sliderSource from '../../../EXTRACTED-SWF/classicGUI.swf/scripts/mii/authoring/controls/SliderHandle.as?raw';
import {MiiCharacterData,MII_FIELDS} from '../model/MiiCharacterData';
import {DEFAULT_MII_HEX} from '../generated/default-character';
import {SCREENS,colorField} from './screens';
import {LegacyEditorSession as EditorSession,OPTIONS} from '../../test-support/LegacyEditorSession';
import {buildGuiScene} from './guiScene';
import {flattenScene} from '../render/headScene';
import {sliderKey,sliderX,sliderValue} from './slider';
const tables=JSON.parse(dataSource.match(/valueToFrameLookup:Object = (\{[\s\S]*?\});/)![1]!);
const model=()=>{const b=MiiCharacterData.fromHex(DEFAULT_MII_HEX).toBytes();b[0]!|=128;return MiiCharacterData.fromBytes(b);};
function isolated(before:string,field:string,value:number):string {const f=MII_FIELDS[field as keyof typeof MII_FIELDS],b=Uint8Array.from(before.match(/../g)!.map((v)=>parseInt(v,16))),view=new DataView(b.buffer);const mask=((1<<f.width)-1)<<f.shift;view.setUint16(f.word*2,(view.getUint16(f.word*2)&~mask)|(value<<f.shift));return Array.from(b,(v)=>v.toString(16).padStart(2,'0')).join('');}
for(const screen of SCREENS.filter((s)=>s.prop))it(`${screen.name}: every tile, page, palette and source mapping preserves unrelated bits`,()=>{
 const m=model(),editor=new EditorSession(m);editor.navigate(screen.id);
 for(let page=0;page<screen.pages;page++){
  const beforePage=m.toHex();editor.page=0;editor.turnPage(page);expect(m.toHex()).toBe(beforePage);
  for(let i=0;i<screen.count;i++){const before=m.toHex(),frame=page*screen.count+i+1,field=screen.prop+'Type',expected=tables[field]?tables[field].indexOf(frame-1):frame-1;editor.selectItem(i);expect(m.toHex()).toBe(isolated(before,field,expected));const selected=flattenScene(buildGuiScene(m,screen,editor.page)).filter((n)=>/^item\d+\.hilite$/.test(n.path));expect(selected).toHaveLength(1);expect(selected[0]!.path).toBe(`item${i}.hilite`);}
 }
 editor.turnPage(100);expect(editor.page).toBe(screen.pages-1);editor.turnPage(-100);expect(editor.page).toBe(0);
 if(screen.pages>1){editor.turnPage(-100);const nodes=flattenScene(buildGuiScene(m,screen,editor.page));expect(nodes.filter((n)=>/^item\d+\.hilite$/.test(n.path))).toHaveLength(0);}
 if(screen.palette){const f=colorField(screen),definition=MII_FIELDS[f as keyof typeof MII_FIELDS];for(let value=definition.min;value<=definition.max;value++){const before=m.toHex();editor.selectColor(value);expect(m.toHex()).toBe(isolated(before,f,value));const ns=flattenScene(buildGuiScene(m,screen,editor.page));expect(ns.filter((n)=>/^color\d+\.hilite$/.test(n.path)).map((n)=>n.path)).toEqual([`color${value}.hilite`]);}}
});
it('uses every original option declaration and clamps both directions without collateral edits',()=>{
 const sources=import.meta.glob('../../../EXTRACTED-SWF/classicGUI.swf/scripts/mii/authoring/Characteristics*.as',{query:'?raw',import:'default',eager:true}) as Record<string,string>;
 for(const [prop,options]of Object.entries(OPTIONS)){
  const screen=SCREENS.find((s)=>s.prop===prop)!,source=Object.values(sources).find((s)=>s.includes(`currProp = "${prop}"`))!;expect(JSON.parse(source.match(/assignOptionListeners\((\[[^\]]+\])/ )![1]!)).toEqual(options);
  const m=model(),editor=new EditorSession(m);editor.navigate(screen.id);
  for(const option of options){const field=prop+option,f=MII_FIELDS[field as keyof typeof MII_FIELDS];for(const initial of [f.min,f.max,Math.floor((f.min+f.max)/2)])for(const direction of [0,1]){m.setValue(field,initial);const before=m.toHex(),next=Math.max(f.min,Math.min(f.max,initial+(direction?1:-1)));editor.adjust(`option_${option}_${direction}`);expect(m.toHex()).toBe(isolated(before,field,next));}}
 }
});
it('shares facial-hair colors, isolates hair mirroring and restores the selected page on category entry',()=>{
 const m=model(),editor=new EditorSession(m);editor.navigate('accessories2');editor.selectColor(6);editor.navigate('accessories4');expect(m.getValue('facialHairColor')).toBe(6);expect(colorField(editor.screen)).toBe('facialHairColor');editor.navigate('hair');const before=m.toHex();editor.toggle('hairPart');expect(m.toHex()).toBe(isolated(before,'hairPart',1));editor.page=5;editor.selectItem(11);editor.navigate('basic');const saved=m.toHex();editor.navigate('hair');expect(editor.page).toBe(5);expect(m.toHex()).toBe(saved);
});
it('uses source slider coordinates/truncation and explicit accessible keyboard increments',()=>{
 expect(sliderSource).toContain('min:Number = 301');expect(sliderSource).toContain('max:Number = 528');
 for(let i=0;i<=127;i++){expect(sliderX(i)).toBe(301+227*i/127);expect(sliderValue(sliderX(i))).toBe(Math.trunc(127*((301+227*i/127-301)/227)));}
 expect(sliderValue(-100)).toBe(0);expect(sliderValue(1000)).toBe(127);expect(sliderValue(414.5)).toBe(63);
 expect(sliderKey(0,'ArrowLeft')).toBe(0);expect(sliderKey(127,'ArrowRight')).toBe(127);expect(sliderKey(50,'PageUp')).toBe(60);expect(sliderKey(50,'Home')).toBe(0);expect(sliderKey(50,'End')).toBe(127);expect(sliderKey(50,'x')).toBeNull();
 const m=model(),editor=new EditorSession(m);for(let value=0;value<=127;value++){m.setValue('height',value);m.setValue('weight',127-value);const before=m.toHex();editor.navigate('size');buildGuiScene(m,editor.screen);expect(m.toHex()).toBe(before);}
});
