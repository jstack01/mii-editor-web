import {expect,it} from 'vitest';
import manifestText from '../../../evidence/manifests/classicGUI.json?raw';
import classicSource from '../../../EXTRACTED-SWF/classicGUI.swf/scripts/mii/authoring/ClassicGUI.as?raw';
import hoverSource from '../../../EXTRACTED-SWF/classicGUI.swf/scripts/mii/authoring/controls/AbstractHoverHilite.as?raw';
import {GUI_ASSETS,GUI_FRAMES,GUI_GRIDS} from '../generated/gui-assets';
import {MiiCharacterData} from '../model/MiiCharacterData';
import {DEFAULT_MII_HEX} from '../generated/default-character';
import {SCREENS} from './screens';
import {buildGuiScene,characterCamera,pageFor} from './guiScene';
import {flattenScene,buildCharacterScene} from '../render/headScene';
import {nineSlicePatches} from './nineSlice';
import {transformPoint} from '../render/geometry';
const manifest=JSON.parse(manifestText),model=()=>MiiCharacterData.fromHex(DEFAULT_MII_HEX);
it('reconstructs all 13 original editing frame labels and placements with no warning/dialog overlay',()=>{
 expect(SCREENS).toHaveLength(13);
 for(const screen of SCREENS){const frame=GUI_FRAMES.find((f)=>f.frame===screen.frame)!;expect(frame.label).toBe('frame_'+screen.id);const original=manifest.rootTimeline.frames[screen.frame-1];
  expect(frame.placements.map((p)=>[p.depth,p.symbolId,p.matrix])).toEqual(original.displayList.filter((p:{name:string;characterId:number})=>!['screens','updateFPMessage','versionText','homepage'].includes(p.name)&&p.characterId!==360).map((p:{depth:number;characterId:number;matrixPx:number[]})=>[p.depth,p.characterId,p.matrixPx]));
  const scene=buildGuiScene(model(),screen);expect(scene.roots.map((n)=>n.depth)).toEqual(frame.placements.map((p)=>p.depth));expect(scene.viewBox).toEqual({x:0,y:0,width:640,height:500});
  expect(flattenScene(scene).every((n)=>GUI_ASSETS.symbols[n.symbolId]&&n.matrix.every(Number.isFinite))).toBe(true);
 }
 expect(classicSource).toContain('pages[14] = new CharacteristicsBeard(this)');
});
it('retains every original GUI sprite frame, vector origin and static glyph outlines',()=>{
 for(const asset of Object.values(GUI_ASSETS.symbols)){
  const source=manifest.symbols[asset.id];
  if(source.timeline&&asset.kind==='sprite')expect(asset.frames.map((f)=>f?.map((p)=>[p.depth,p.symbolId,p.matrix]))).toEqual(source.timeline.frames.map((f:{displayList:{depth:number;characterId:number;matrixPx:number[]}[]})=>f.displayList.map((p)=>[p.depth,p.characterId,p.matrixPx])));
  if(asset.kind==='shape'){expect(asset.markup.includes('<image')).toBe(false);expect(asset.markup.includes('<text')).toBe(false);if(source.svgExport)expect(asset.sourceSha256).toBe(source.svgExport.sha256);}
 }
 const nickname=GUI_ASSETS.symbols[384];if(nickname?.kind!=='shape')throw Error('Missing static label');expect(nickname.markup).toContain('M1520 0L1520 -14660');expect(nickname.markup).toContain('scale(0.0009765625)');
});
it('places original head icons and selection artwork in the original child order',()=>{
 const m=model(),screen=SCREENS[2]!;
 for(let value=0;value<8;value++){m.setValue('headType',value);const ns=flattenScene(buildGuiScene(m,screen));const selected=ns.find((n)=>n.path===`item${value}`)!;expect(selected.children.map((c)=>c.name)).toEqual([null,'hilite','icon']);expect(selected.children[1]!.symbolId).toBe(126);expect(selected.children[2]!.symbolId).toBe(138);expect(selected.children[2]!.frame).toBe(value+1);expect(ns.filter((n)=>/^item\d+\.hilite$/.test(n.path))).toHaveLength(1);}
});
it('uses original skin/favorite palettes, selected wells and gender/mingle status frames',()=>{
 const m=model();for(const screen of [SCREENS[0]!,SCREENS[2]!])for(let color=0;color<(screen.id==='basic'?12:6);color++){
  m.setValue(`${screen.palette}Color`,color);const ns=flattenScene(buildGuiScene(m,screen));expect(ns.find((n)=>n.path===`color${color}.hilite`)!.symbolId).toBe(128);expect(ns.filter((n)=>/^color\d+\.hilite$/.test(n.path))).toHaveLength(1);
 }
 for(const field of ['gender','mingles']){m.setValue(field,1);expect(flattenScene(buildGuiScene(m,SCREENS[0]!)).find((n)=>n.path===`status_${field}`)!.frame).toBe(2);}
});
it('preserves camera registration, General footing and restored head zoom across screens',()=>{
 const m=model(),footing=buildCharacterScene(m).footing!;
 const camera=characterCamera(SCREENS[0]!,footing);expect(transformPoint(camera,footing[0]-150,footing[1])[1]).toBeCloseTo(405,10);
 expect(camera[4]).toBe(116);expect(characterCamera(SCREENS[2]!,footing)).toEqual([1,0,0,1,116,130]);expect(characterCamera(SCREENS[1]!,footing)).toEqual(camera);
 for(const screen of SCREENS)expect(pageFor(m,screen)).toBeGreaterThanOrEqual(0);
});
it('retains scale grids and nine-slice fixed corners including narrow-field center collapse',()=>{
 for(const grid of manifest.scalingGrids){const a=grid.children[0].attributes;expect(GUI_GRIDS[grid.attributes.characterId as keyof typeof GUI_GRIDS]).toEqual({x:Number(a.Xmin)/20,y:Number(a.Ymin)/20,width:(Number(a.Xmax)-Number(a.Xmin))/20,height:(Number(a.Ymax)-Number(a.Ymin))/20});}
 const patches=nineSlicePatches({x:-70,y:-45,width:140,height:90},GUI_GRIDS['374'],[2,0,0,2,0,0]);expect(patches).toHaveLength(9);expect(patches[0]!.matrix.slice(0,4)).toEqual([1,0,0,1]);expect(patches[4]!.matrix[0]).toBeGreaterThan(2);
 const small=nineSlicePatches({x:-61.5,y:-27.5,width:123,height:55},GUI_GRIDS['377'],[.4791412353515625,0,0,.6859893798828125,0,0]);expect(small.every((p)=>p.matrix[0]>=0&&p.matrix[3]>=0)).toBe(true);expect(small[4]!.matrix[0]).toBeCloseTo(0,10);
 expect(hoverSource).toContain('alpha,20,20,20,0');expect(hoverSource).toContain('alpha,-20,-20,-20,0');
});

it('matches screen item/page counts and feature families to their original controller declarations',()=>{
 const sources=import.meta.glob('../../../EXTRACTED-SWF/classicGUI.swf/scripts/mii/authoring/Characteristics*.as',{query:'?raw',import:'default',eager:true}) as Record<string,string>;
 const classes=['General','Size','Head','FacialFeatures','Hair','Eyebrow','Eye','Nose','Mouth','Glasses','Mustache','Mole','Beard'];
 for(const [i,name]of classes.entries()){const source=Object.entries(sources).find(([path])=>path.endsWith(`Characteristics${name}.as`))![1];const screen=SCREENS[i]!;if(screen.prop){expect(source).toContain(`currProp = "${screen.prop}"`);expect(source).toContain(`itemCount = ${screen.count}`);expect(source).toContain(`pageCount = ${screen.pages}`);}}
});
