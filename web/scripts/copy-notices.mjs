import{copyFileSync,mkdirSync,readFileSync}from'node:fs';
const root=new URL('../../',import.meta.url),dist=new URL('../dist/',import.meta.url);
for(const name of JSON.parse(readFileSync(new URL('release-notices.json',root)))){if(name.includes('..')||name.startsWith('/'))throw Error('Unsafe notice path');const target=new URL(name,dist);mkdirSync(new URL('.',target),{recursive:true});copyFileSync(new URL(name,root),target);}
