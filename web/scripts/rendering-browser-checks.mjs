import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';

export async function renderingBrowserChecks(page, { preview, reportDir }) {
  mkdirSync(reportDir, { recursive: true });
  const area=page.locator('#character-preview');
  await page.selectOption('#render-view','head');
  await page.waitForSelector('#character-preview svg [data-artwork] use');
  assert.equal(await page.locator('#render-error').isVisible(),false);
  assert.equal(await area.locator('img,image,canvas').count(),0);
  assert.equal(await area.locator('svg').getAttribute('data-renderer'),'original-vectors');
  assert.equal(await area.locator('[data-artwork] use').count(),12);
  const parts=await area.locator('[data-artwork] [data-instance-path]').evaluateAll((nodes)=>nodes.map((n)=>({path:n.getAttribute('data-instance-path'),symbol:n.getAttribute('data-symbol-id'),frame:n.getAttribute('data-frame'),matrix:n.getAttribute('transform'),blank:n.getAttribute('data-blank')})));
  const find=(path)=>parts.find((p)=>p.path===path);
  for(const path of ['head','head.face','head.nose','head.mouth','head.eyesLeft','head.eyesRight','head.eyebrowsLeft','head.eyebrowsRight','head.hairFront','headback.hair'])assert.ok(find(path),path);
  assert.equal(find('head.face').symbol,'65');assert.equal(find('head.face').frame,'1');
  for(const path of ['head.features','head.beard','head.mole','head.hats','head.mustache','head.glasses','head.glasses.lenses','head.mouth.lips'])assert.equal(find(path).blank,'true',path);
  assert.ok(parts.every((p)=>Number(p.symbol)!==56),'Body is not represented as implemented');
  await page.screenshot({path:`${reportDir}/${preview?'production':'default'}-head-preview.png`});
  const headSvg=area.locator('svg');
  await headSvg.evaluate((svg)=>{svg.style.width='300px';svg.style.height='280px';svg.style.background='white';svg.style.position='relative';svg.style.zIndex='1';});
  await headSvg.screenshot({path:`${reportDir}/${preview?'production':'default'}-head-native.png`});
  await headSvg.evaluate((svg)=>{svg.style.removeProperty('width');svg.style.removeProperty('height');svg.style.removeProperty('background');svg.style.removeProperty('position');svg.style.removeProperty('z-index');});
  const before=await area.screenshot({path:`${reportDir}/${preview?'production':'default'}-head.png`});
  await page.getByLabel('Name',{exact:true}).fill('Alice');
  const after=await area.screenshot();assert.ok(before.equals(after),'Name edits must not change a head pixel');
  await page.getByRole('button',{name:'Reset to original default'}).click();
  const diagnostics=page.getByRole('checkbox',{name:'Alignment diagnostics (development)'});
  if(preview){
    assert.equal(await diagnostics.count(),0);assert.equal(await area.locator('[data-diagnostics]').count(),0);
  } else {
    await diagnostics.check();assert.equal(await area.locator('[data-diagnostics]').count(),1);
    assert.ok(await area.locator('[data-diagnostic-part="head.face"] rect').count());
    await area.screenshot({path:`${reportDir}/diagnostic-head.png`});
    await page.screenshot({path:`${reportDir}/diagnostic-head-preview.png`});
    await diagnostics.uncheck();assert.equal(await area.locator('[data-diagnostics]').count(),0);
  }
  let nativeChecks=null;
  if(!preview) nativeChecks=await page.evaluate(async()=>{
    const {MiiCharacterData}=await import('/src/model/MiiCharacterData.ts');
    const {DEFAULT_MII_HEX}=await import('/src/generated/default-character.ts');
    const {buildHeadScene,flattenScene}=await import('/src/render/headScene.ts');
    const {renderHeadSvg}=await import('/src/render/svgRenderer.ts');
    const source=buildHeadScene(MiiCharacterData.fromHex(DEFAULT_MII_HEX));
    const circle={...flattenScene(source).find((n)=>n.symbolId===1),matrix:[1,0,0,1,0,0],color:{multipliers:[1,1,1,1],offsets:[0,0,0,0]},path:'fixture-circle',depth:1,clipDepth:null};
    const color={multipliers:[.88,.85,.8,1],offsets:[235,205,187,0]};
    const testScene=(roots)=>({roots,sourceStage:{x:0,y:-50,width:60,height:60},viewBox:{x:0,y:-50,width:60,height:60}});
    const pixel=async(svg,x,y)=>{
      svg.setAttribute('width','60');svg.setAttribute('height','60');
      const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)],{type:'image/svg+xml'}));
      try{const image=new Image();image.src=url;await image.decode();const canvas=document.createElement('canvas');canvas.width=canvas.height=60;const context=canvas.getContext('2d');context.drawImage(image,0,0);return Array.from(context.getImageData(x,y,1,1).data);}finally{URL.revokeObjectURL(url);}
    };
    const tinted=renderHeadSvg(testScene([{...circle,color}]));
    if(tinted.querySelector('[data-artwork]').hasAttribute('clip-path'))throw new Error('An unsupported source-stage mask was invented');
    const tintPixel=await pixel(tinted,25,25);
    if(tintPixel.some((v,i)=>Math.abs(v-[235,205,187,255][i])>1))throw new Error('sRGB multiplier/offset pixel mismatch: '+tintPixel);
    if(tinted.querySelector('filter').getAttribute('color-interpolation-filters')!=='sRGB')throw new Error('Tint color space missing');
    const face={...flattenScene(source).find((n)=>n.symbolId===57),matrix:[1,0,0,1,0,0],color,depth:2,path:'fixture-content',clipDepth:null};
    const parent={...source.roots[0],path:'fixture-parent',matrix:[1,0,0,1,0,0],color:{multipliers:[1,1,1,1],offsets:[0,0,0,0]},children:[{...circle,clipDepth:2},face]};
    const clipped=renderHeadSvg(testScene([parent]));
    const inside=await pixel(clipped,25,25);const outside=await pixel(clipped,55,25);
    if(inside[3]!==255||outside[3]!==0)throw new Error('Original filled-path clipping failed: '+JSON.stringify({inside,outside}));
    if(!clipped.querySelector('clipPath > path')||clipped.querySelector('clipPath > g'))throw new Error('Mask paths were not flattened correctly');
    const ended=renderHeadSvg(testScene([{...parent,children:[...parent.children,{...face,depth:3,path:'outside-depth-range'}]}]));
    const outsideNode=ended.querySelector('[data-instance-path="outside-depth-range"]');
    if(outsideNode.parentElement.hasAttribute('clip-path'))throw new Error('Mask leaked beyond clipDepth');
    const other=renderHeadSvg(source);const first=renderHeadSvg(source);
    const ids=new Set(Array.from(first.querySelectorAll('[id]')).map((n)=>n.id));
    if(Array.from(other.querySelectorAll('[id]')).some((n)=>ids.has(n.id)))throw new Error('SVG instance IDs collide');
    const box={...circle,symbolId:9999,matrix:[1,0,0,1,0,0],bounds:{x:25,y:-25,width:5,height:5},filters:[{kind:'blur',blurX:25,blurY:15,passes:1}]};
    const catalog={sourceHashes:{},roots:[],symbols:{9999:{kind:'shape',id:9999,bounds:box.bounds,markup:'<path d="M25 -25h5v5h-5z" fill="black"/>',sourcePath:'test-only',sourceSha256:''}}};
    const blurred=renderHeadSvg(testScene([box]),{catalog});
    const boxCenter=await pixel(blurred,27,27),boxPlateau=await pixel(blurred,20,27),boxOutside=await pixel(blurred,10,27);
    if(Math.abs(boxCenter[3]-17)>1||Math.abs(boxPlateau[3]-17)>1||boxOutside[3]!==0)throw new Error('Centered box-blur pixel mismatch '+JSON.stringify({boxCenter,boxPlateau,boxOutside}));
    return {sRGBPixel:tintPixel,boxBlurPixels:{boxCenter,boxPlateau,boxOutside},clipInside:inside,clipOutside:outside,clipDepthRespected:true,svgInstanceIdsUnique:true};
  });
  const report={nativeChecks,selectedOriginalParts:parts,visibleShapeInstances:12,blankFramesPreserved:true,nameEditPixelInvariant:true,developmentDiagnostics:!preview};
  writeFileSync(`${reportDir}/${preview?'production':'dev'}-rendering.json`,JSON.stringify(report,null,2)+'\n');
  await page.selectOption('#render-view','full');
  return report;
}
