/** Execute the unmodified originals in an isolated, local Ruffle harness.
 * Ruffle is NOT an application dependency and is not Adobe Flash certification.
 * Usage: node tools/capture-original-reference.mjs --runtime-dir /tmp/ruffle/package
 */
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { resolve, join } from 'node:path';
const argument=(name,fallback)=>{const index=process.argv.indexOf(name);return index<0?fallback:process.argv[index+1];};
const project=resolve(argument('--project-root',fileURLToPath(new URL('../',import.meta.url))));
const runtimeArg=argument('--runtime-dir');
if(!runtimeArg)throw new Error('Supply --runtime-dir with an unpacked @ruffle-rs/ruffle package.');
const casesArg=argument('--cases');const cases=casesArg?JSON.parse(await readFile(resolve(casesArg),'utf8')):[{id:'original',hex:null}];
const runtime=resolve(runtimeArg);const output=resolve(argument('--output',join(project,'evidence/phase3a/reference')));
if(['SOURCE','EXTRACTED-SWF'].some((name)=>output===join(project,name)||output.startsWith(join(project,name)+'/')))throw new Error('Output must not be inside protected input folders.');
const require=createRequire(join(project,'web/package.json'));const {chromium}=require('playwright');
const renderer=argument('--renderer','canvas');
const metadata=JSON.parse(await readFile(join(runtime,'package.json'),'utf8'));
const html=`<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"></head><body style="margin:0;background:white"><div id="player" style="width:640px;height:500px"></div><script src="/ruffle/ruffle.js"></script><script>
window.RufflePlayer=window.RufflePlayer||{};window.RufflePlayer.config={autoplay:'on',unmuteOverlay:'hidden',splashScreen:false,warnOnUnsupportedContent:false,logLevel:'warn',allowNetworking:'internal',preferredRenderer:${JSON.stringify(renderer)}};
window.addEventListener('load',async()=>{try{const p=window.RufflePlayer.newest().createPlayer();p.style.width='640px';p.style.height='500px';document.getElementById('player').appendChild(p);await p.ruffle().load({url:'/original/classicGUI.swf',autoplay:'on',unmuteOverlay:'hidden',parameters:new URLSearchParams(location.search).has('mii')?{mii:new URLSearchParams(location.search).get('mii')}: {}});window.referenceLoaded=true;}catch(e){window.referenceError=String(e);}});
</script></body></html>`;
const sourceFiles=new Set(['assets.swf','classicGUI.swf','MiiEditor_defaults.xml']);const logs=[];
const server=createServer(async(request,response)=>{try{
  const path=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
  if(path.includes('..')||path.includes('\\'))throw new Error('Bad path');
  const sourceName=path.startsWith('/original/')?path.slice(10):path.slice(1);
  let bytes,extension;
  if(sourceFiles.has(sourceName)){bytes=await readFile(join(project,'SOURCE',sourceName));extension=sourceName.split('.').at(-1);}
  else if(path.startsWith('/ruffle/')){const file=path.slice(8);bytes=await readFile(join(runtime,file));extension=file.split('.').at(-1);}
  else if(path==='/'){bytes=html;extension='html';}else throw new Error('Not found');
  response.setHeader('Content-Type',({js:'application/javascript',wasm:'application/wasm',swf:'application/x-shockwave-flash',xml:'application/xml',html:'text/html'})[extension]??'application/octet-stream');response.end(bytes);
}catch(error){response.writeHead(404);response.end(String(error));}});
await new Promise((done)=>server.listen(0,'127.0.0.1',done));const origin=`http://127.0.0.1:${server.address().port}`;
let browser;
try{
  await mkdir(output,{recursive:true});
  browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:640,height:500},deviceScaleFactor:Number(argument('--device-scale','1'))});
  await page.route('**/*',(route)=>route.request().url().startsWith(origin+'/')?route.continue():route.abort());
  page.on('response',(r)=>logs.push({type:'response',url:r.url(),status:r.status()}));
  page.on('console',(m)=>logs.push({type:m.type(),text:m.text()}));page.on('pageerror',(e)=>logs.push({type:'pageerror',text:e.message}));
  for(const fixture of cases){
  await page.goto(origin+(fixture.hex?'/?mii='+fixture.hex:''));await page.waitForFunction(()=>window.referenceLoaded||window.referenceError,{},{timeout:30000});await page.waitForTimeout(2500);
  const error=await page.evaluate(()=>window.referenceError??null);if(error)throw new Error(error);
  if(logs.some((x)=>x.type==='pageerror'||/Error dispatching event/.test(x.text??'')))throw new Error('Original runtime execution reported an error; inspect the log.');
  if(renderer!=='canvas'){await page.mouse.click(600,22);await page.waitForTimeout(300);}
  if(process.argv.includes('--file-pages')){await page.mouse.click(114,417);await page.waitForTimeout(1200);await page.mouse.click(318,315);await page.waitForTimeout(400);await page.mouse.move(5,490);await page.screenshot({path:join(output,'files.png')});await page.mouse.click(114,242);await page.waitForTimeout(700);await page.mouse.move(5,490);await page.screenshot({path:join(output,'xml.png')});}
  else if(process.argv.includes('--gui')){
    const screens=[['basic',[[67,43]]],['size',[[130,43]]],['face',[[193,43]]],['face2',[[193,43],[405,124]]],['hair',[[256,43]]],['eyebrows',[[319,43]]],['eyes',[[382,43]]],['nose',[[445,43]]],['lips',[[508,43]]],['accessories',[[571,43]]],['accessories2',[[571,43],[405,124]]],['accessories3',[[571,43],[292,172]]],['accessories4',[[571,43],[405,172]]]];
    for(const [name,clicks]of screens){if(process.argv.includes('--case-screen')&&fixture.id!==name)continue;for(const[x,y]of clicks){await page.mouse.click(x,y);await page.waitForTimeout(700);}await page.mouse.move(5,490);await page.waitForTimeout(300);await page.screenshot({path:join(output,`${name}-gui.png`)});}
  }else{
  await page.screenshot({path:join(output,`${fixture.id}-ruffle.png`)});
  // Original head tab, observed in the first screenshot and original GUI timeline.
  if(!process.argv.includes('--skip-head')){await page.mouse.click(192,43);await page.waitForTimeout(700);
  await page.screenshot({path:join(output,`${fixture.id}-ruffle-head.png`)});}
  }
  }
  if(logs.some((x)=>x.type==='pageerror'||/Error dispatching event/.test(x.text??'')))throw new Error('Original GUI transition reported an error; inspect the log.');
  const hashes={};for(const file of sourceFiles)hashes[`SOURCE/${file}`]=createHash('sha256').update(await readFile(join(project,'SOURCE',file))).digest('hex');
  const report={runtime:{name:metadata.name,version:metadata.version,renderer,deviceScaleFactor:Number(argument('--device-scale','1'))},originalInputsUnmodified:true,sourceHashes:hashes,adobeFlashParityCertified:false,loaded:true,cases,logs};
  await writeFile(join(output,'reference-log.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({runtime:report.runtime,loaded:true,output,adobeFlashParityCertified:false}));
}catch(error){await mkdir(output,{recursive:true});await writeFile(join(output,'reference-error.json'),JSON.stringify({error:String(error),logs},null,2));throw error;}
finally{if(browser)await browser.close();await new Promise((done)=>server.close(done));}
