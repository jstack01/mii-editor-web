#!/usr/bin/env python3
"""Verify public GHCR access without using the owner's GitHub/Docker credentials."""
import argparse,json,os,re,subprocess,tempfile
from urllib.parse import urlencode
from urllib.request import Request,urlopen

def validate_index(index):
 platforms=[(m.get('platform',{}).get('os'),m.get('platform',{}).get('architecture')) for m in index.get('manifests',[]) if m.get('platform',{}).get('os')!='unknown']
 if len(platforms)!=2 or set(platforms)!={('linux','amd64'),('linux','arm64')}:raise ValueError('Expected exactly linux/amd64 and linux/arm64 in the image index.')
 return sorted('/'.join(p) for p in platforms)

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--version',required=True);p.add_argument('--digest');p.add_argument('--expected-commit');p.add_argument('--pull',action='store_true');p.add_argument('--output');a=p.parse_args()
 if not re.fullmatch(r'v\d+\.\d+\.\d+(?:-[A-Za-z0-9.-]+)?',a.version):raise SystemExit('Invalid version')
 repository='jstack01/mii-editor-web';image='ghcr.io/'+repository
 # This is an anonymous registry token, not an account token; never print it.
 with urlopen('https://ghcr.io/token?'+urlencode({'service':'ghcr.io','scope':'repository:'+repository+':pull'}),timeout=30) as r:token=json.load(r)['token']
 headers={'Authorization':'Bearer '+token,'Accept':'application/vnd.oci.image.index.v1+json, application/vnd.docker.distribution.manifest.list.v2+json'}
 with urlopen(Request('https://ghcr.io/v2/'+repository+'/manifests/'+a.version,headers=headers),timeout=30) as r:index=json.load(r);digest=r.headers['Docker-Content-Digest']
 if a.digest and digest!=a.digest:raise SystemExit('Anonymous manifest digest differs from published build.')
 with urlopen(Request('https://api.github.com/users/jstack01/packages/container/mii-editor-web',headers={'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}),timeout=30) as response:package=json.load(response)
 if package.get('visibility')!='public' or package.get('repository',{}).get('full_name')!=repository:raise SystemExit('GHCR package is not Public and linked to the expected source repository.')
 platforms=validate_index(index);result={'anonymousManifest':True,'packagePublic':True,'repository':repository,'image':image+':'+a.version,'digest':digest,'platforms':platforms,'anonymousPull':False}
 if a.pull:
  endpoint=subprocess.check_output(['docker','context','inspect','--format','{{(index .Endpoints "docker").Host}}'],text=True).strip()
  with tempfile.TemporaryDirectory(prefix='mii-anonymous-docker-') as tmp:
   env={**os.environ,'DOCKER_CONFIG':tmp,'DOCKER_HOST':endpoint};env.pop('DOCKER_CONTEXT',None);env.pop('DOCKER_AUTH_CONFIG',None)
   for platform in platforms:subprocess.run(['docker','pull','--platform',platform,image+'@'+digest],env=env,check=True)
   result['anonymousPull']=True
   revisions=set()
   for platform in platforms:
    info=json.loads(subprocess.check_output(['docker','image','inspect','--platform',platform,image+'@'+digest],env=env,text=True))[0]
    labels=info['Config']['Labels'];assert labels['org.opencontainers.image.source']=='https://github.com/'+repository
    assert labels['org.opencontainers.image.version']==a.version;revisions.add(labels['org.opencontainers.image.revision'])
   if len(revisions)!=1:raise SystemExit('Platform source revisions differ.')
   result['revision']=revisions.pop()
   if a.expected_commit and result['revision']!=a.expected_commit:raise SystemExit('Image revision differs from approved source.')
 if a.output:
  from pathlib import Path
  Path(a.output).write_text(json.dumps(result,indent=2)+'\n')
 print(json.dumps(result,indent=2))
if __name__=='__main__':main()
