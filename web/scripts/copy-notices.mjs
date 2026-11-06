import{copyFileSync,mkdirSync}from'node:fs';
const root=new URL('../../',import.meta.url),dist=new URL('../dist/',import.meta.url);mkdirSync(new URL('LICENSES/',dist),{recursive:true});for(const name of ['LICENSE.md','NOTICES.md','LICENSES/Vite-LICENSE.md'])copyFileSync(new URL(name,root),new URL(name,dist));
