import {deploymentChecks} from './deployment-checks.mjs';
import assert from 'node:assert/strict';import{spawn,spawnSync}from'node:child_process';import{once}from'node:events';import{createHash}from'node:crypto';import{readFileSync,writeFileSync,mkdirSync,mkdtempSync,existsSync}from'node:fs';import{tmpdir,userInfo}from'node:os';import{join,resolve}from'node:path';import{fileURLToPath}from'node:url';import{createServer}from'node:net';import{chromium}from'./browser-engine.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url)),i=process.argv.indexOf('--archive');if(i<0)throw Error('Supply --archive release/mii-editor-web-VERSION.zip');const archive=resolve(process.argv[i+1]),hash=createHash('sha256').update(readFileSync(archive)).digest('hex'),tmp=mkdtempSync(join(tmpdir(),'mii-release-check-')),output=join(root,'release');mkdirSync(output,{recursive:true});
const extracted=spawnSync('python3',['-c',`import sys,zipfile,pathlib,hashlib,json,os
z=zipfile.ZipFile(sys.argv[1]);dest=pathlib.Path(sys.argv[2]);roots=set()
for info in z.infolist():
 p=pathlib.PurePosixPath(info.filename);assert not p.is_absolute() and '..' not in p.parts;roots.add(p.parts[0]);assert info.file_size<20000000
 assert not any(x in p.parts for x in ['SOURCE','EXTRACTED-SWF','evidence','node_modules','src','tests','test-results','.git'])
 assert p.suffix.lower() not in ['.swf','.as','.fla','.air','.map','.ts','.tsx']
assert len(roots)==1
z.extractall(dest);folder=dest/roots.pop()
for line in (folder/'FILES.sha256').read_text().splitlines():
 h,name=line.split('  ',1);assert hashlib.sha256((folder/name).read_bytes()).hexdigest()==h,name
for n in ['start-mii-editor.sh','Start Mii Editor.command']:
 if (folder/n).exists():
  mode=z.getinfo(folder.name+'/'+n).external_attr>>16;assert mode&0o111;os.chmod(folder/n,mode&0o777)
if not (folder/'website').exists():
 import shutil
 testroot=dest/'static-test-server';testroot.mkdir();shutil.copytree(folder,testroot/'website');shutil.copy2(sys.argv[3],testroot/'serve.py');folder=testroot
print(str(folder))`,archive,tmp,join(root,'distribution/serve.py')],{encoding:'utf8'});assert.equal(extracted.status,0,extracted.stderr);const folder=extracted.stdout.trim(),checks=[],errors=[],external=[],processes=[];let browser;
async function port(){const s=createServer();await new Promise(r=>s.listen(0,'127.0.0.1',r));const n=s.address().port;await new Promise(r=>s.close(r));return n;}
async function start(cmd,args,url){const p=spawn(cmd,args,{cwd:folder,stdio:'pipe'});processes.push(p);let log='';p.stdout.on('data',x=>log+=x);p.stderr.on('data',x=>log+=x);for(let n=0;n<100;n++){if(p.exitCode!==null)throw Error(log);try{if((cmd.endsWith('/httpd')||log.includes('Mii Editor is running!'))&&(await fetch(url)).ok)return p;}catch{}await new Promise(r=>setTimeout(r,100));}throw Error('Server did not start: '+log);}
try{
 browser=await chromium.launch({channel:'chrome',headless:true});
 const n=archive.includes('-macos-')?8090:await port(),origin=`http://127.0.0.1:${n}`;const configPath=join(folder,'config.json'),hasConfig=existsSync(configPath);if(hasConfig){assert.deepEqual(JSON.parse(readFileSync(configPath)),{port:8080});writeFileSync(configPath,JSON.stringify({port:n,host:'0.0.0.0'}));}const localArgs=[join(folder,'serve.py'),...(hasConfig?[]:['--port',String(n)]),'--no-browser'];let localServer=await start('python3',localArgs,origin+'/');
 const nested=spawnSync('python3',['-c',`import pathlib,shutil,sys
p=pathlib.Path(sys.argv[1]);shutil.copytree(p,p/'mii-editor',ignore=shutil.ignore_patterns('mii-editor'))`,join(folder,'website')],{encoding:'utf8'});assert.equal(nested.status,0,nested.stderr);
 const targets=[['python-root',origin+'/'],['python-nested',origin+'/mii-editor/']];
 const apache='/usr/sbin/httpd',moduleDir='/usr/libexec/apache2';let apacheStatus='unavailable';
 if(existsSync(apache)&&existsSync(moduleDir+'/mod_mpm_event.so')){
  const ap=await port(),u=userInfo(),conf=join(tmp,'apache.conf');
  writeFileSync(conf,`ServerRoot "${tmp}"\nListen 127.0.0.1:${ap}\nServerName 127.0.0.1\nPidFile "${tmp}/httpd.pid"\nErrorLog "${tmp}/apache-error.log"\n`+['mpm_event','unixd','authz_core','mime','dir','alias','headers'].map(m=>`LoadModule ${m}_module ${moduleDir}/mod_${m}.so\n`).join('')+`User #${u.uid}\nGroup #${u.gid}\nTypesConfig /dev/null\nDocumentRoot "${folder}/website"\nAlias /mii-editor/ "${folder}/website/"\n<Directory "${folder}/website">\nRequire all granted\nOptions -Indexes\nAllowOverride None\nDirectoryIndex index.html\nAddType text/html .html\nAddType application/javascript .js\nAddType text/css .css\nHeader always set X-Content-Type-Options nosniff\nHeader always set Referrer-Policy no-referrer\n</Directory>\n`);
  const ao=`http://127.0.0.1:${ap}`;await start(apache,['-f',conf,'-DFOREGROUND'],ao+'/');targets.push(['apache-root',ao+'/'],['apache-nested',ao+'/mii-editor/']);apacheStatus=spawnSync(apache,['-v'],{encoding:'utf8'}).stdout.trim();
 }
 for(const [name,url]of targets){console.log('Verifying',name,url);
  if(archive.includes('v0.1.0-preview.5')){const response=await fetch(url);assert.equal(response.headers.get('x-content-type-options'),'nosniff');assert.equal(response.headers.get('referrer-policy'),'no-referrer');}
  checks.push(await deploymentChecks({browser,url,name,output,errors,external,hasConfig,restart:name==='python-root'?async()=>{localServer.kill('SIGTERM');await once(localServer,'exit');localServer=await start('python3',localArgs,origin+'/');}:undefined}));
 }
 // Execute supplied POSIX launchers with the actual extracted paths, not Vite.
 for(const script of ['Start Mii Editor.command','start-mii-editor.sh']){if(!existsSync(join(folder,script)))continue;const n=await port();writeFileSync(join(folder,'config.json'),JSON.stringify({port:n}));await start('/bin/sh',[join(folder,script),'--no-browser'],`http://127.0.0.1:${n}/`);}
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);const report={passed:true,archive:archive.split('/').at(-1),archiveSHA256:hash,extractedTo:folder,browser:await browser.version(),checks,apache:apacheStatus,launchers:{macos:'when present, wrapper executed on macOS; Finder interaction requires manual check',linux:'POSIX shell only on macOS, not verified on Linux',windows:'CMD not executed: Windows unavailable; server tested with macOS Python'},physicalDevices:'not tested',hardware:'not certified',errors,externalRequests:external};writeFileSync(join(output,archive.split('/').at(-1).replace('.zip','.verification.json')),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await browser?.close();for(const p of processes.reverse())if(p.exitCode===null){p.kill('SIGTERM');await Promise.race([once(p,'exit'),new Promise(r=>setTimeout(r,3000))]);if(p.exitCode===null)p.kill('SIGKILL');}}
