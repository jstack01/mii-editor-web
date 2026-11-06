#!/usr/bin/env python3
"""Workflow version guard; never uploads or changes GitHub settings."""
import json,os,re,sys
from pathlib import Path
version=os.environ.get('VERSION','')
if not re.fullmatch(r'v\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?',version):raise SystemExit('Invalid version input')
if version!='v'+json.loads(Path('web/package.json').read_text())['version']:raise SystemExit('Version must match web/package.json')
# Publishing is explicit. Check package tags first; do not overwrite an existing image.
if '--remote' in sys.argv:
 from urllib.request import Request,urlopen
 from urllib.error import HTTPError
 base='https://api.github.com/users/jstack01/packages/container/mii-editor-web'
 def read(url):
  request=Request(url,headers={'Authorization':'Bearer '+os.environ['GH_TOKEN'],'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'})
  with urlopen(request,timeout=30) as response:return json.load(response)
 try:read(base)
 except HTTPError as error:
  if error.code!=404:raise SystemExit('Cannot check package access; refusing to publish (HTTP '+str(error.code)+').')
 else:
  page=1
  while True:
   entries=read(base+'/versions?per_page=100&page='+str(page))
   if any(version in v.get('metadata',{}).get('container',{}).get('tags',[]) for v in entries):raise SystemExit('Container version already exists; refusing to overwrite it.')
   if len(entries)<100:break
   page+=1
print('Version checked: '+version)
