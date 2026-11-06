/** Independent browser primitive probe: no editor code, codecs or artwork. */
import {createServer} from 'node:http';
import {mkdtempSync,writeFileSync,mkdirSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join,resolve} from 'node:path';
import {chromium,engineName} from './browser-engine.mjs';
const output=resolve(process.env.MII_OFFLINE_PROBE_OUTPUT||`test-results/phase8a/offline-${engineName}.json`);
const tmp=mkdtempSync(join(tmpdir(),'mii-offline-primitives-'));writeFileSync(join(tmp,'sample.mii'),Buffer.alloc(74,0x5a));
const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Local File/Blob primitive probe</title><input type="file" id="file"><canvas width="2" height="2"></canvas>');});
await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{
 browser=await chromium.launch({channel:'chrome',headless:true});const context=await browser.newContext({acceptDownloads:true});const page=await context.newPage();await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.locator('#file').setInputFiles(join(tmp,'sample.mii'));
 const results=[];
 for(const [name,offline]of[['online-before',false],['forced-offline',true],['online-restored',false]]){
  await context.setOffline(offline);
  const primitives=await page.evaluate(async()=>{
   const result={navigatorOnline:navigator.onLine};
   const attempt=async(name,fn)=>{try{result[name]={passed:true,value:await fn()};}catch(e){result[name]={passed:false,name:e.name,message:e.message};}};
   const file=document.querySelector('input').files[0],synthetic=new File([new Uint8Array(74)],'synthetic.mii');
   await attempt('nativeFileArrayBuffer',async()=>(await file.arrayBuffer()).byteLength);
   await attempt('syntheticFileArrayBuffer',async()=>(await synthetic.arrayBuffer()).byteLength);
   await attempt('nativeFileReader',()=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onerror=()=>reject(reader.error);reader.onload=()=>resolve(reader.result.byteLength);reader.readAsArrayBuffer(file);}));
   await attempt('blobArrayBuffer',async()=>(await new Blob(['local']).arrayBuffer()).byteLength);
   await attempt('blobFetch',async()=>{const url=URL.createObjectURL(new Blob(['local']));try{return await(await fetch(url)).text();}finally{URL.revokeObjectURL(url);}});
   await attempt('blobImageDecode',async()=>{const url=URL.createObjectURL(new Blob(['<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><rect width="2" height="2" fill="teal"/></svg>'],{type:'image/svg+xml'}));try{const image=new Image();image.src=url;await image.decode();return image.naturalWidth;}finally{URL.revokeObjectURL(url);}});
   return result;
  });
  let download;const event=page.waitForEvent('download',{timeout:3000});
  await page.evaluate(()=>{const canvas=document.querySelector('canvas');canvas.toBlob(blob=>{const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='local.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);},'image/png');});
  try{const d=await event;const failure=await d.failure();download={passed:!failure,failure};}catch(e){download={passed:false,error:e.message.split('\n')[0]};}
  results.push({name,offline,primitives,canvasBlobDownload:download});
 }
 const report={engine:engineName,version:browser.version(),host:process.platform,architecture:process.arch,editorCodeLoaded:false,results,scope:'Primitive diagnostics; failures remain failures. Forced-offline emulation is distinct from blocked HTTP or physical-device network state.'};mkdirSync(resolve(output,'..'),{recursive:true});writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));if(results.some(r=>!r.canvasBlobDownload.passed||Object.values(r.primitives).some(v=>typeof v==='object'&&!v.passed)))process.exitCode=1;await context.close();
}finally{await browser?.close();await new Promise(r=>server.close(r));}
