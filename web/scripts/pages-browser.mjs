/** Test the exact Pages staging directory beneath the repository URL prefix. No deployment. */
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {createServer} from 'node:net';
import {mkdtempSync,mkdirSync,cpSync,readFileSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium,engineName} from './browser-engine.mjs';
import {deploymentChecks} from './deployment-checks.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const temp=mkdtempSync(join(tmpdir(),'mii-pages-'));
const output=join(root,'release/pages-checks',engineName);mkdirSync(output,{recursive:true});
cpSync(join(root,'release/pages-site'),join(temp,'mii-editor-web'),{recursive:true});
const listener=createServer();await new Promise(r=>listener.listen(0,'127.0.0.1',r));const port=listener.address().port;await new Promise(r=>listener.close(r));
const url=`http://127.0.0.1:${port}/mii-editor-web/`;let server,browser;
async function start(){
 server=spawn('python3',['-u','-m','http.server',String(port),'--bind','127.0.0.1','--directory',temp],{stdio:'ignore'});
 for(let i=0;i<100;i++){
  if(server.exitCode!==null)throw Error('Test static server exited');
  try{if((await fetch(url)).ok)return;}catch{}
  await new Promise(r=>setTimeout(r,50));
 }
 throw Error('Static test server readiness timeout');
}
async function stop(){if(server&&server.exitCode===null){const closed=once(server,'exit');server.kill('SIGTERM');await closed;}}
const errors=[],external=[];
try{
 await start();browser=await chromium.launch({channel:'chrome',headless:true});
 const result=await deploymentChecks({browser,url,name:'github-pages-subdirectory',output,errors,external,restart:async()=>{await stop();await start();}});
 const page=await browser.newPage();await page.goto(url);await page.locator('#stage[data-hex]').waitFor();
 assert.match(await page.locator('footer').innerText(),/AI-generated \/ vibe-coded project — unmaintained/);
 assert.match(await page.locator('footer').innerText(),/senocular/);
 assert.equal(await page.locator('meta[name=referrer]').getAttribute('content'),'no-referrer');
 for(const path of ['LICENSE.md','NOTICES.md','LICENSES/Vite-LICENSE.md'])assert.equal((await fetch(url+path)).status,200);
 for(const path of ['diagnostics.html','src/main.ts','SOURCE/a.swf','.git/config'])assert.equal((await fetch(url+path)).status,404);
 const manifest=JSON.parse(readFileSync(join(root,'release/pages-preparation.json')));assert.equal(manifest.releaseRevision,'27da544cb9b8e1feac14001e4de65529d440b549');
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 writeFileSync(join(output,'verification.json'),JSON.stringify({passed:true,engine:engineName,version:browser.version(),checks:result,visibleNotices:true,unexpectedExternalRequests:external,errors,preparation:manifest},null,2)+'\n');
 console.log(JSON.stringify({passed:true,engine:engineName,version:browser.version(),checks:result,visibleNotices:true}));
}finally{if(browser)await browser.close();await stop();rmSync(temp,{recursive:true,force:true});}
