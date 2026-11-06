import {readFileSync,writeFileSync,readdirSync,utimesSync} from 'node:fs';
import {join} from 'node:path';
const version='v'+JSON.parse(readFileSync('package.json')).version;
if(process.env.VERSION!==version)throw Error('Docker VERSION must match web/package.json');
const commit=process.env.REVISION||'unknown';
if(commit!=='unknown'&&!/^[0-9a-f]{40}$/.test(commit))throw Error('REVISION must be a full Git commit');
const epoch=Number(process.env.SOURCE_DATE_EPOCH||0);
if(!Number.isSafeInteger(epoch)||epoch<0)throw Error('Invalid SOURCE_DATE_EPOCH');
writeFileSync('dist/BUILD-INFO.json',JSON.stringify({version,commit,profile:'Wii-RCD-persistent-v1',hardwareCertified:false},null,2)+'\n');
function normalize(path){for(const e of readdirSync(path,{withFileTypes:true})){const p=join(path,e.name);if(e.isDirectory())normalize(p);else if(!e.isFile())throw Error('Non-regular production file '+p);utimesSync(p,epoch,epoch);}utimesSync(path,epoch,epoch);}
normalize('dist');
