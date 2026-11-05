import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
export async function fullRenderingBrowserChecks(page,{preview,reportDir}){
 const cases=await page.locator('#character-preset option').evaluateAll((items)=>items.map((item)=>item.value));
 const results=[];
 for(const id of cases){
  await page.selectOption('#character-preset',id);await page.selectOption('#render-view','full');
  assert.equal(await page.locator('#render-error').isVisible(),false,id);
  const area=page.locator('#character-preview');
  assert.equal(await area.locator('[data-instance-path="body"]').count(),1);
  assert.deepEqual(await area.locator('[data-original-blur] feConvolveMatrix').evaluateAll((items)=>items.map((i)=>i.getAttribute('order'))),['25 1','1 15']);
  const count=await area.locator('use').count();assert.ok(count>=20,id);
  results.push({id,shapes:count,hex:await page.locator('#hex').inputValue()});
  await area.screenshot({path:`${reportDir}/${preview?'production-':''}${id}-character.png`});
  if(!preview)await page.screenshot({path:`${reportDir}/${id}-preview.png`,fullPage:true});
 }
 await page.selectOption('#character-preset','default');
 await page.selectOption('#render-field','height');await page.locator('#render-value').fill('127');await page.click('#apply-attribute');
 assert.equal(await page.locator('#render-value').inputValue(),'127');
 const before=await page.locator('#character-preview').screenshot();const bytes=await page.locator('#hex').inputValue();
 await page.locator('#name').fill('Alice');assert.ok(before.equals(await page.locator('#character-preview').screenshot()),'Full-body appearance unchanged by name edit');
 const after=await page.locator('#hex').inputValue();assert.equal(bytes.slice(44),after.slice(44));assert.equal(bytes.slice(0,4),after.slice(0,4));
 await page.getByRole('button',{name:'Reset to original default'}).click();
 let sweep=null;
 if(!preview)sweep=await page.evaluate(async()=>{
  const {MiiCharacterData}=await import('/src/model/MiiCharacterData.ts');const {DEFAULT_MII_HEX}=await import('/src/generated/default-character.ts');
  const {MII_FIELDS}=await import('/src/generated/mii-schema.ts');const {RENDER_CASES}=await import('/src/generated/render-cases.ts');
  const {buildCharacterScene,flattenScene}=await import('/src/render/headScene.ts');const {renderHeadSvg}=await import('/src/render/svgRenderer.ts');
  const {multiply}=await import('/src/render/geometry.ts');
  let count=0;const shapes=new Set();
  const render=(m)=>{const s=buildCharacterScene(m),svg=renderHeadSvg(s);if(svg.querySelector('parsererror'))throw new Error('SVG parse failure');for(const n of flattenScene(s))if(n.kind==='shape')shapes.add(n.symbolId);count++;return {s,svg};};
  for(const [field,def]of Object.entries(MII_FIELDS))for(let value=def.min;value<=def.max;value++){const m=MiiCharacterData.fromHex(DEFAULT_MII_HEX);m.setValue(field,value);render(m);}
  for(let h=0;h<8;h++)for(let f=0;f<12;f++){const m=MiiCharacterData.fromHex(DEFAULT_MII_HEX);m.setValue('headType',h);m.setValue('facialFeaturesType',f);render(m);}
  for(let h=0;h<8;h++)for(let b=0;b<4;b++){const m=MiiCharacterData.fromHex(DEFAULT_MII_HEX);m.setValue('headType',h);m.setValue('beardType',b);render(m);}
  const aligned=[];
  for(const fixture of RENDER_CASES){
   const {s}=render(MiiCharacterData.fromHex(fixture.hex));
   // Original General-page controller camera: scale .53; loader x=-150;
   // graphicsContainer x=116; feet aligned to General y=405.
   const camera=[.53,0,0,.53,116-150*.53,405-.53*s.footing[1]];
   const projected={...s,roots:s.roots.map((n)=>({...n,matrix:multiply(camera,n.matrix)})),viewBox:{x:0,y:0,width:640,height:500}};
   const svg=renderHeadSvg(projected);svg.setAttribute('width','640');svg.setAttribute('height','500');
   aligned.push({id:fixture.id,svg:new XMLSerializer().serializeToString(svg),camera,footing:s.footing});
  }
  return {count,originalShapes:shapes.size,aligned};
 });
 if(sweep){
  for(const item of sweep.aligned){
   for(const scale of [1,2]){const png=await page.evaluate(async({svg,scale})=>{const image=new Image();const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));try{image.src=url;await image.decode();const canvas=document.createElement('canvas');canvas.width=640*scale;canvas.height=500*scale;canvas.getContext('2d').scale(scale,scale);canvas.getContext('2d').drawImage(image,0,0);return canvas.toDataURL('image/png').split(',')[1];}finally{URL.revokeObjectURL(url);}},{svg:item.svg,scale});
   writeFileSync(`${reportDir}/${item.id}-aligned${scale===2?'@2x':''}.png`,Buffer.from(png,'base64'));}
  }
  sweep.aligned=sweep.aligned.map(({svg,...metadata})=>metadata);
 }
 if(!preview){await page.getByRole('checkbox',{name:'Alignment diagnostics (development)'}).check();await page.locator('#character-preview').screenshot({path:`${reportDir}/diagnostic-character.png`});assert.ok(await page.locator('[data-diagnostic-part="body.shirt.torso"]').count());await page.getByRole('checkbox',{name:'Alignment diagnostics (development)'}).uncheck();}
 const report={cases:results,fullBodyNamePixelInvariant:true,attributeControls:true,sweep};writeFileSync(`${reportDir}/${preview?'production':'dev'}-full-rendering.json`,JSON.stringify(report,null,2)+'\n');return report;
}
