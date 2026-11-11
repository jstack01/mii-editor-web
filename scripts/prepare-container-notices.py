#!/usr/bin/env python3
"""Prepare exact runtime notices and checksummed source inputs. Never builds/publishes an image."""
import argparse,concurrent.futures,gzip,hashlib,io,json,re,subprocess,tarfile,time,urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
BASE='ghcr.io/nginx/nginx-unprivileged:1.30.6-alpine-slim@sha256:e333a5b95605942b5e495645ee54fab02b112081de6dbe45d2ead3ef38e03e31'
UPSTREAM='679834d1aa245a42e680d380c6b57785cfaa2115'

def fetch(url):
 with urllib.request.urlopen(url,timeout=35) as r:return r.read()
def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--rootfs',type=Path,required=True);p.add_argument('--fetch',action='store_true',required=True);a=p.parse_args()
 output=ROOT/'LICENSES/container';output.mkdir(parents=True,exist_ok=True)
 work=ROOT/'release/container-sources-v1.0.0';work.mkdir(parents=True,exist_ok=True)
 with tarfile.open(a.rootfs)as tar:
  installed=tar.extractfile('lib/apk/db/installed').read().decode();(work/'apk-installed.txt').write_text(installed)
  nginx=tar.extractfile('usr/share/licenses/nginx/COPYRIGHT').read();(output/'Nginx-COPYRIGHT.txt').write_bytes(nginx)
 packages=[]
 for block in installed.strip().split('\n\n'):
  d=dict(x.split(':',1)for x in block.splitlines()if ':'in x)
  packages.append({k:d.get(v)for k,v in {'name':'P','version':'V','license':'L','origin':'o','sourceCommit':'c','url':'U'}.items()})
 (output/'COMPONENTS.json').write_text(json.dumps({'baseImage':BASE,'packages':packages},indent=2)+'\n')
 origins={x['origin']:x for x in packages};results=[]
 def origin(pair):
  name,record=pair
  if not record['sourceCommit']:return {'origin':name,'status':'upstream nginx package, separate source entry','inputs':[]}
  commit=record['sourceCommit'];section='main';recipeurl=f'https://raw.githubusercontent.com/alpinelinux/aports/{commit}/{section}/{name}/APKBUILD'
  try:recipe=fetch(recipeurl)
  except Exception:
   section='community';recipeurl=f'https://raw.githubusercontent.com/alpinelinux/aports/{commit}/{section}/{name}/APKBUILD';recipe=fetch(recipeurl)
  folder=work/name;folder.mkdir(exist_ok=True);(folder/'APKBUILD').write_bytes(recipe)
  # Retain installation hooks/configuration/build scripts, not only source= inputs.
  listing=json.loads(subprocess.check_output(['gh','api',f'repos/alpinelinux/aports/contents/{section}/{name}?ref={commit}'],text=True))
  recipe_files=[]
  for entry in listing:
   if entry['type']!='file':continue
   filename=entry['name']
   if Path(filename).name!=filename:raise ValueError('Unsafe recipe file')
   b=recipe if filename=='APKBUILD' else fetch(entry['download_url'])
   (folder/filename).write_bytes(b)
   recipe_files.append({'name':filename,'sha256':hashlib.sha256(b).hexdigest(),'source':entry['download_url']})
  matches=re.findall(r'^([a-f0-9]{128})\s+([^\s]+)\s*$',recipe.decode(),re.M);inputs=[]
  for sha,filename in matches:
   if Path(filename).name!=filename:raise ValueError('Unsafe source filename')
   target=folder/filename;urls=[f'https://raw.githubusercontent.com/alpinelinux/aports/{commit}/{section}/{name}/{filename}',f'https://distfiles.alpinelinux.org/distfiles/v3.24/{filename}',f'https://distfiles.alpinelinux.org/distfiles/edge/{filename}']
   item={'name':filename,'sha512':sha,'downloaded':False,'attemptedURLs':urls}
   if target.exists()and hashlib.sha512(target.read_bytes()).hexdigest()==sha:item.update(downloaded=True,source='verified existing source cache')
   else:
    for url in urls:
     try:
      b=fetch(url)
      if hashlib.sha512(b).hexdigest()!=sha:continue
      target.write_bytes(b);item.update(downloaded=True,source=url);break
     except Exception:continue
   inputs.append(item)
  return {'origin':name,'sourceCommit':commit,'recipeURL':recipeurl,'recipeSHA256':hashlib.sha256(recipe).hexdigest(),'recipeFiles':recipe_files,'inputs':inputs,'status':('recipe-only generated package; no external source inputs' if not matches and not re.search(r'^source=',recipe.decode(),re.M) else 'complete checksummed recipe inputs' if matches and all(x['downloaded']for x in inputs) else 'unresolved source inputs')}
 with concurrent.futures.ThreadPoolExecutor(max_workers=6)as ex:
  for r in ex.map(origin,origins.items()):results.append(r);print(r['origin'],r['status'],flush=True)
 # Upstream image recipe and Nginx source/package build scripts are independently retained.
 nginxdir=work/'nginx';nginxdir.mkdir(exist_ok=True)
 for name,url,expected in [
  ('Dockerfile-upstream',f'https://raw.githubusercontent.com/nginx/docker-nginx-unprivileged/{UPSTREAM}/stable/alpine-slim/Dockerfile',None),
  ('nginx-1.30.6.tar.gz','https://nginx.org/download/nginx-1.30.6.tar.gz',None),
  ('pkg-oss-1.30.6-1.tar.gz','https://github.com/nginx/pkg-oss/archive/1.30.6-1.tar.gz','c16280934a44f7358992d39bb1d876a58e978c58371b96fd212de3f58c7ba40c31a683c54ee46c85d0844ca18fd7addeafbb29a8e06a9d1e164a8628a4739eee')]:
  try:
   b=fetch(url)
   if expected and hashlib.sha512(b).hexdigest()!=expected:raise ValueError('Upstream pkg-oss checksum mismatch')
   (nginxdir/name).write_bytes(b);results.append({'origin':'nginx','file':name,'url':url,'sha256':hashlib.sha256(b).hexdigest(),'status':'downloaded'if expected is None else 'upstream checksum verified'})
  except Exception as error:results.append({'origin':'nginx','file':name,'url':url,'status':'unresolved','error':str(error)})
 # Canonical texts preserve third-party terms rather than replacing them with project MIT.
 licenses=['MIT','Apache-2.0','GPL-2.0-only','GPL-3.0-or-later','LGPL-2.1-or-later','MPL-2.0','BSD-2-Clause','BSD-3-Clause','Zlib']
 for license in licenses:
  url=f'https://raw.githubusercontent.com/spdx/license-list-data/v3.27.0/json/details/{license}.json'
  d=json.loads(fetch(url));(output/(license+'.txt')).write_text(d['licenseText']+'\n')
 # Preserve copyright/license files from the matching source archives as well.
 for archive in work.rglob('*'):
  if not archive.is_file()or not tarfile.is_tarfile(archive):continue
  try:
   with tarfile.open(archive)as tar:
    for m in tar.getmembers():
     if m.isfile()and m.size<200000 and re.match(r'(?i)^(copying|copyright|licen[cs]e|notice)(?:[.\-_].*)?$',Path(m.name).name):
      safe=re.sub(r'[^a-zA-Z0-9_.-]','_',m.name)
      if len(safe)>180:safe=hashlib.sha256(safe.encode()).hexdigest()+'-'+Path(m.name).name
      dest=output/'upstream'/archive.parent.name/safe;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(tar.extractfile(m).read())
  except tarfile.TarError:pass
 pending=[x for x in results if x['status'].startswith('unresolved')or any(not i['downloaded']for i in x.get('inputs',[]))]
 summary={'baseImage':BASE,'imageSourceRevision':UPSTREAM,'packages':len(packages),'origins':len(origins),'inputs':results,'unresolvedEntries':len(pending),'assessment':'Concrete source inputs and notices; not a legal certification or reproducible rebuild claim. See CONTAINER_SOURCES.md.'}
 (output/'SOURCE-INDEX.json').write_text(json.dumps(summary,indent=2)+'\n');(work/'SOURCE-INDEX.json').write_text(json.dumps(summary,indent=2)+'\n')
 (work/'README.md').write_text('Matching upstream source archives, Alpine APKBUILD recipes and checksummed patches/data for the selected runtime. See SOURCE-INDEX.json for exact versions, origins and any missing inputs. Not a project license grant, source offer or certified reproducible rebuild. Preserve each upstream license. No Mii/Flash source is included.\n')
 archive=ROOT/'release/mii-editor-web-container-sources-v1.0.0.tar.gz'
 with archive.open('wb')as raw,gzip.GzipFile(filename='',mode='wb',fileobj=raw,mtime=0)as compressed,tarfile.open(fileobj=compressed,mode='w')as tar:
  for path in sorted(work.rglob('*')):
   if not path.is_file():continue
   info=tar.gettarinfo(str(path),arcname=work.name+'/'+path.relative_to(work).as_posix());info.uid=info.gid=0;info.uname=info.gname='';info.mtime=0
   with path.open('rb')as source:tar.addfile(info,source)
 checksum=hashlib.sha256(archive.read_bytes()).hexdigest();archive.with_suffix('.gz.sha256').write_text(checksum+'  '+archive.name+'\n')
 print(json.dumps({'archive':str(archive),'sha256':checksum,'unresolvedEntries':len(pending)}))
if __name__=='__main__':main()
