import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const cwd=fileURLToPath(new URL('..',import.meta.url)),preview=process.argv.includes('--preview'),port=preview?5182:5181,origin=`http://127.0.0.1:${port}`;
const out=process.env.MII_GUI_REPORT_DIR||`${cwd}/test-results/gui`;mkdirSync(out,{recursive:true});
const server=spawn(process.execPath,['node_modules/vite/bin/vite.js',...(preview?['preview']:[]),'--host','127.0.0.1','--port',String(port),'--strictPort'],{cwd,stdio:'pipe'});let output='';server.stdout.on('data',(c)=>output+=c);server.stderr.on('data',(c)=>output+=c);
let browser;
const navigation=[['basic',['tab_basic']],['size',['tab_size']],['face',['tab_face']],['face2',['tab_face','nav_face2']],['hair',['tab_hair']],['eyebrows',['tab_eyebrows']],['eyes',['tab_eyes']],['nose',['tab_nose']],['lips',['tab_lips']],['accessories',['tab_accessories']],['accessories2',['tab_accessories','nav_accessories2']],['accessories3',['tab_accessories','nav_accessories3']],['accessories4',['tab_accessories','nav_accessories4']]];
try{
 let ready=false;for(let i=0;i<100;i++){try{ready=(await fetch(origin)).ok;}catch{}if(ready)break;await new Promise((r)=>setTimeout(r,100));}assert.ok(ready,output);
 browser=await chromium.launch({channel:'chrome',headless:true});const errors=[],external=[];let defaultHex;
 for(const scale of [1,2]){
  const page=await browser.newPage({viewport:{width:900,height:760},deviceScaleFactor:scale});page.on('pageerror',(e)=>errors.push(e.message));page.on('console',(e)=>{if(e.type()==='error')errors.push(e.text());});page.on('request',(r)=>{if(!r.url().startsWith(origin)&&!r.url().startsWith('data:'))external.push(r.url());});await page.goto(origin);
  const control=(name)=>page.locator(`[data-control="${name}"]`),hex=()=>page.locator('#stage').getAttribute('data-hex');
  defaultHex=await hex();assert.equal(await page.getByRole('textbox',{name:'Name',exact:true}).inputValue(),'defaultBoy');
  for(const [id,clicks]of navigation){for(const name of clicks)await control(name).click();await page.mouse.move(5,730);assert.equal(await page.locator('[data-gui-screen]').getAttribute('data-gui-screen'),id);assert.equal(await hex(),defaultHex,'Navigation must preserve all character bytes');await page.locator('#stage').screenshot({path:`${out}/${preview?'production-':''}${id}${scale===2?'@2x':''}.png`});assert.equal(await page.locator('[aria-disabled="true"]').count(),0);assert.ok((await page.locator('#screen-status').textContent()).includes('editing available'));}
  if(scale===2){await page.close();continue;}
  await control('tab_basic').click();
  const expected=async(field,value)=>page.evaluate(async({field,value,before})=>{const {MiiCharacterData}=await import('/src/model/MiiCharacterData.ts');const m=MiiCharacterData.fromHex(before);if(field==='id'||field==='wii')m.setHex(field,value);else m.setValue(field,value);return m.toHex();},{field,value,before:await hex()});
  // Exact isolated bytes are independently computed here for string fields in
  // both dev and production, without importing production model code.
  const stringHex=(before,start,name)=>{const bytes=Buffer.from(before,'hex');bytes.fill(0,start,start+20);for(let i=0;i<Math.min(10,name.length);i++)bytes.writeUInt16BE(name.charCodeAt(i),start+i*2);return bytes.toString('hex');};
  for(const [label,field,start,text]of [['Name','name',2,'Alice水'],['Creator','creator',54,'Creator']]){const before=await hex();await page.getByRole('textbox',{name:label,exact:true}).fill(text);assert.equal(await hex(),stringHex(before,start,text));if(!preview)assert.equal(await hex(),await expected(field,text));}
  const beforeGender=await hex();await control('toggle_gender').click();let bytes=Buffer.from(beforeGender,'hex');bytes[0]^=64;assert.equal(await hex(),bytes.toString('hex'));assert.equal(await page.locator('[data-character-root] [data-instance-path="body.shirt.torso"]').getAttribute('data-frame'),'2');
  const beforeMingle=await hex();await control('toggle_mingles').click();bytes=Buffer.from(beforeMingle,'hex');bytes[33]^=4;assert.equal(await hex(),bytes.toString('hex'));
  for(const [label,value,shift,width]of [['Birthday day',31,5,5],['Birthday month',12,10,4]]){const before=await hex();await page.getByRole('textbox',{name:label,exact:true}).fill(String(value));const b=Buffer.from(before,'hex');b.writeUInt16BE((b.readUInt16BE(0)&~(((1<<width)-1)<<shift))|(value<<shift),0);assert.equal(await hex(),b.toString('hex'));}
  const beforeID=await hex();await page.getByRole('textbox',{name:'Mii ID',exact:true}).fill('00-80-7f-5f');assert.equal(await hex(),beforeID.slice(0,48)+'00807f5f'+beforeID.slice(56));
  const beforeWii=await hex();await page.getByRole('textbox',{name:'Wii ID',exact:true}).fill('01-02-03-04');assert.equal(await hex(),beforeWii.slice(0,56)+'01020304'+beforeWii.slice(64));
  for(let color=0;color<12;color++){const before=await hex();await control(`color${color}`).click();const b=Buffer.from(before,'hex');b.writeUInt16BE((b.readUInt16BE(0)&~30)|(color<<1),0);assert.equal(await hex(),b.toString('hex'));assert.equal(await control(`color${color}`).getAttribute('aria-pressed'),'true');}
  const generalHex=await hex();await control('tab_face').click();
  for(let value=0;value<8;value++){const before=await hex();await control(`item${value}`).click();const b=Buffer.from(before,'hex');const word=b.readUInt16BE(32);b.writeUInt16BE((word&~(7<<13))|(value<<13),32);assert.equal(await hex(),b.toString('hex'));assert.equal(await control(`item${value}`).getAttribute('aria-pressed'),'true');assert.equal(await page.locator('[data-character-root] [data-instance-path="head.face"]').getAttribute('data-frame'),String(value+1));}
  for(let color=0;color<6;color++){const before=await hex();await control(`color${color}`).click();const b=Buffer.from(before,'hex');const word=b.readUInt16BE(32);b.writeUInt16BE((word&~(7<<10))|(color<<10),32);assert.equal(await hex(),b.toString('hex'));assert.equal(await control(`color${color}`).getAttribute('aria-pressed'),'true');const offsets=await page.locator('[data-character-root] [data-instance-path="head.face"] [filter]').first().evaluate((group)=>{const id=group.getAttribute('filter').slice(5,-1);return document.getElementById(id).querySelector('feColorMatrix').getAttribute('values').split(' ').map(Number);});assert.ok(Math.abs(offsets[4]-[235,248,214,246,142,72][color]/255)<1e-10);}
  assert.notEqual(await hex(),generalHex);const edited=await hex();await control('nav_face2').click();assert.equal(await control('item0').getAttribute('aria-disabled'),'false');await control('tab_basic').click();assert.equal(await hex(),edited);assert.equal(await page.getByRole('textbox',{name:'Name',exact:true}).inputValue(),'Alice水');assert.equal(await page.getByRole('textbox',{name:'Creator',exact:true}).inputValue(),'Creator');
  await control('toggle_gender').focus();await page.keyboard.press('Enter');assert.notEqual(await hex(),edited);
  // Hover/press use the original +/-20 RGB offset filter, only on source hover classes.
  await control('toggle_gender').hover();assert.match(await control('toggle_gender').getAttribute('style'),/gui-hover-over/);await page.mouse.down();assert.match(await control('toggle_gender').getAttribute('style'),/gui-hover-down/);await page.mouse.move(5,730);await page.mouse.up();
  await control('actionRandom').click();assert.equal((await hex()).length,148);assert.notEqual(await hex(),edited);
  const random=await hex();for(const width of [360,900]){await page.setViewportSize({width,height:760});await page.waitForFunction(()=>Math.abs(document.querySelector('#stage').getBoundingClientRect().width-document.querySelector('#viewport').clientWidth)<1);const b=await page.locator('#stage').boundingBox();assert.ok(Math.abs(b.width/b.height-640/500)<.001);assert.equal(await hex(),random);}
  assert.equal(await page.locator('#development-tools').isVisible(),!preview);
  if(preview){await page.goto(origin+'/diagnostics.html');assert.equal(await page.locator('#character-preset').count(),0,'Development test bench must not be shipped');}
  await page.close();
 }
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);const report={mode:preview?'production':'development',screens:navigation.map(([id])=>id),pixelDensities:[1,2],nameCreatorByteIsolation:true,headSkinBitIsolation:true,stateAcrossScreens:true,generalControls:true,sourceHoverPress:true,immediateCharacterFramesAndTint:true,keyboard:true,uniformScaling:true,diagnosticsDevelopmentOnly:true,errors,externalRequests:external};writeFileSync(`${out}/${preview?'production':'development'}-gui.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{if(browser)await browser.close();server.kill('SIGTERM');await once(server,'exit');}
