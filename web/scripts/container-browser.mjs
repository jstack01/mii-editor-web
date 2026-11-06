import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {chromium} from './browser-engine.mjs';
import {deploymentChecks} from './deployment-checks.mjs';
const arg=(key,fallback)=>{const n=process.argv.indexOf(key);return n<0?fallback:process.argv[n+1];};
const url=arg('--url','http://127.0.0.1:18780/'),container=arg('--container'),name=arg('--name','docker');
if(!container||!/^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(container)||!/^[a-zA-Z0-9_-]+$/.test(name))throw Error('Supply --container TEST_CONTAINER and a simple --name.');
const output=fileURLToPath(new URL('../test-results/'+name+'/',import.meta.url));mkdirSync(output,{recursive:true});
const errors=[],external=[];let browser;
try{
 browser=await chromium.launch({channel:'chrome',headless:true});
 const restart=async()=>{const r=spawnSync('docker',['restart',container],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);for(let n=0;n<100;n++){try{if((await fetch(url)).ok)return;}catch{}await new Promise(r=>setTimeout(r,100));}throw Error('Container did not restart.');};
 const check=await deploymentChecks({browser,url,name,output,errors,external,restart});
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 const report={passed:true,url,container,browser:browser.version(),checks:[check],errors,externalRequests:external};writeFileSync(output+'report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await browser?.close();}
