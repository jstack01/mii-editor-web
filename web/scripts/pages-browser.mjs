/** Test the exact Pages staging directory beneath the repository URL prefix. Supports --url for actual hosted production checks; never deploys. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
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
const argIndex=process.argv.indexOf('--url'),live=argIndex>=0;
const temp=mkdtempSync(join(tmpdir(),'mii-pages-'));
const output=join(root,'release/pages-checks',live?'live':'local',engineName);mkdirSync(output,{recursive:true});
cpSync(join(root,'release/pages-site'),join(temp,'mii-editor-web'),{recursive:true});
const listener=createServer();await new Promise(r=>listener.listen(0,'127.0.0.1',r));const port=listener.address().port;await new Promise(r=>listener.close(r));
const url=live?new URL(process.argv[argIndex+1]).href:`http://127.0.0.1:${port}/mii-editor-web/`;
assert.equal(new URL(url).pathname,'/mii-editor-web/');let server,browser;
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
 if(!live)await start();browser=await chromium.launch({channel:'chrome',headless:true});
 const result=await deploymentChecks({browser,url,name:'github-pages-subdirectory',output,errors,external,restart:live?undefined:async()=>{await stop();await start();}});
 const page=await browser.newPage();await page.goto(url);await page.locator('#stage[data-hex]').waitFor();
 assert.match(await page.locator('footer').innerText(),/AI-generated \/ vibe-coded project — unmaintained/);
 assert.match(await page.locator('footer').innerText(),/senocular/);
 assert.equal(await page.locator('meta[name=referrer]').getAttribute('content'),'no-referrer');
 for(const path of ['LICENSE','LICENSE.md','LICENSE-SCOPE.json','NOTICES.md','ASSET_RIGHTS.md','THIRD_PARTY_NOTICES.md','CONTAINER_SOURCES.md','LICENSES/Vite-LICENSE.md'])assert.equal((await fetch(url+path)).status,200);
 for(const path of ['diagnostics.html','src/main.ts','SOURCE/a.swf','.git/config'])assert.equal((await fetch(url+path)).status,404);
 const manifest=JSON.parse(readFileSync(join(root,'release/pages-preparation.json')));assert.equal(manifest.releaseRevision,'842f2558ac3a5a61c6c479cf7b3a6a075d4a4f87');
 const build=await(await fetch(url+'BUILD-INFO.json')).json();assert.equal(build.version,'v1.0.0');assert.equal(build.commit,manifest.releaseRevision);
 const html=await(await fetch(url)).text();assert.equal(html,readFileSync(join(root,'release/pages-site/index.html'),'utf8'));
 for(const[path,sha]of Object.entries(manifest.files)){if(live&&path==='.nojekyll')continue;const response=await fetch(new URL(path,url));assert.equal(response.status,200,path);const data=Buffer.from(await response.arrayBuffer());assert.equal(createHash('sha256').update(data).digest('hex'),sha,path);}
 assert.equal(JSON.parse(await(await fetch(url+'LICENSE-SCOPE.json')).text()).files.length,65);
 const paths=[];const extra=await browser.newContext();const tab=await extra.newPage();extra.on('request',r=>{if(/^https?:/.test(r.url()))paths.push(new URL(r.url()).pathname);});await tab.goto(url);await tab.locator('#stage[data-wii-valid="true"]').waitFor();await tab.evaluate(()=>localStorage.setItem('qa.unrelated.record','retain'));await tab.getByRole('textbox',{name:'Name',exact:true}).fill('KeyCheck');await tab.reload();assert.equal(await tab.getByRole('textbox',{name:'Name',exact:true}).inputValue(),'KeyCheck');assert.equal(await tab.evaluate(()=>localStorage.getItem('qa.unrelated.record')),'retain');assert.ok(paths.every(p=>p.startsWith('/mii-editor-web/')),JSON.stringify(paths));await extra.close();
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 writeFileSync(join(output,'verification.json'),JSON.stringify({passed:true,engine:engineName,version:browser.version(),checks:result,allHostedFilesHashVerified:true,hostingControlFilesExcluded:live?['.nojekyll']:[],stableVersion:'v1.0.0',noDomainRootRequests:true,unrelatedStorageKeyPreserved:true,visibleNotices:true,unexpectedExternalRequests:external,errors,preparation:manifest},null,2)+'\n');
 console.log(JSON.stringify({passed:true,engine:engineName,version:browser.version(),checks:result,allHostedFilesHashVerified:true,hostingControlFilesExcluded:live?['.nojekyll']:[],stableVersion:'v1.0.0',noDomainRootRequests:true,unrelatedStorageKeyPreserved:true,visibleNotices:true}));
}finally{if(browser)await browser.close();await stop();rmSync(temp,{recursive:true,force:true});}
