#!/usr/bin/env python3
"""Run a locally available image and verify its static HTTP/security boundary. No push."""
import argparse,hashlib,http.client,json,os,re,subprocess,tarfile,tempfile,time,uuid
from pathlib import Path

def docker(*args):return subprocess.check_output(['docker',*args],text=True).strip()
def inspect_selected_image(container_data,expected_platform):
 # New containerd stores can report the multi-platform index in Image. Prefer
 # the actual selected manifest descriptor; retain classic-engine/old-CLI support.
 descriptor=container_data.get('ImageManifestDescriptor') or {}
 platform=descriptor.get('platform') or {}
 if platform and platform.get('os','')+'/'+platform.get('architecture','')!=expected_platform:raise AssertionError('Selected container manifest differs from requested platform')
 selected=descriptor.get('digest') or container_data['Image']
 image=json.loads(docker('image','inspect',selected))[0]
 if image['Os']+'/'+image['Architecture']!=expected_platform:raise AssertionError('Container image architecture differs from requested platform')
 return image

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--image',required=True);p.add_argument('--platform',required=True,choices=['linux/amd64','linux/arm64']);p.add_argument('--port',type=int,default=18784);p.add_argument('--output');a=p.parse_args();name='mii-d3-check-'+uuid.uuid4().hex[:10]
 def request(path,method='GET'):
  c=http.client.HTTPConnection('127.0.0.1',a.port,timeout=3);c.request(method,path);r=c.getresponse();value=(r.status,r.getheader('Content-Type'),r.read());c.close();return value
 try:
  docker('run','-d','--pull','never','--name',name,'--platform',a.platform,'-p',f'127.0.0.1:{a.port}:8080','--read-only','--tmpfs','/tmp:rw,noexec,nosuid,nodev,size=16m,uid=101,gid=101,mode=1770','--cap-drop','ALL','--security-opt','no-new-privileges:true','--pids-limit','64',a.image)
  for _ in range(100):
   try:
    if request('/')[0]==200:break
   except OSError:pass
   time.sleep(.1)
  else:raise AssertionError('Container did not start')
  data=json.loads(docker('inspect',name))[0];assert data['Config']['User']=='101:101';assert data['HostConfig']['ReadonlyRootfs'];assert data['HostConfig']['CapDrop']==['ALL'];assert all(v['HostIp']=='127.0.0.1' for v in data['HostConfig']['PortBindings']['8080/tcp']);assert not data['HostConfig']['Binds'];assert docker('exec',name,'id','-u')=='101'
  docker('exec',name,'nginx','-t');docker('exec',name,'wget','-q','--spider','http://127.0.0.1:8080/')
  assert request('/', 'HEAD')[2]==b'';html=request('/')[2].decode();assert 'data-preset="boy"' in html and 'data-preset="girl"' in html;assert 'development-tools' not in html
  for asset in re.findall(r'(?:src|href)="(\./assets/[^"]+)"',html):
   code,mime,body=request('/'+asset[2:]);assert code==200 and len(body)>0
   assert mime.startswith('application/javascript' if asset.endswith('.js') else 'text/css')
  for path in ['/assets/','/.git/config','/%2e%2e/etc/passwd','/etc/passwd','/SOURCE/classicGUI.swf','/diagnostics.html','/config.json','/node_modules/','/Dockerfile']:
   assert request(path)[0] in [400,403,404],path
  assert request('/','POST')[0]==405
  assert request('/?mii='+'00'*74)[2]==request('/')[2]
  assert request('/NOTICES.md')[0]==200
  with tempfile.TemporaryDirectory() as tmp:
   archive=Path(tmp)/'rootfs.tar';docker('export','-o',str(archive),name)
   with tarfile.open(archive) as tar:
    names=tar.getnames();assert not any(any(x in n.split('/') for x in ['SOURCE','EXTRACTED-SWF','.git','node_modules','test-results']) for n in names)
    assert not any(n in names for n in ['usr/bin/node','usr/local/bin/node','usr/bin/python3','usr/local/bin/python3'])
    site={m.name.removeprefix('usr/share/nginx/html/'):hashlib.sha256(tar.extractfile(m).read()).hexdigest() for m in tar.getmembers() if m.isfile() and m.name.startswith('usr/share/nginx/html/')}
    allowed={'index.html','LICENSE.md','NOTICES.md','LICENSES/Vite-LICENSE.md','BUILD-INFO.json'};assert all(n in allowed or n.startswith('assets/') and n.endswith(('.js','.css','.svg','.png','.jpg','.woff','.woff2')) for n in site)
  docker('restart',name)
  for _ in range(100):
   try:
    if request('/')[0]==200:break
   except OSError:pass
   time.sleep(.1)
  else:raise AssertionError('Container restart failed')
  docker('stop','--time','10',name);state=json.loads(docker('inspect',name))[0]['State'];assert state['ExitCode']==0 and not state['OOMKilled']
  image=inspect_selected_image(data,a.platform)
  daemon_arch=docker('info','--format','{{.Architecture}}');native={'aarch64':'arm64','arm64':'arm64','x86_64':'amd64','amd64':'amd64'}.get(daemon_arch,daemon_arch)
  result={'passed':True,'platform':a.platform,'image':a.image,'imageId':image['Id'],'sizeBytes':image['Size'],'runtimeUser':data['Config']['User'],'siteHashes':site,'securityBoundary':True,'gracefulStopExit':state['ExitCode'],'daemonArchitecture':daemon_arch,'architectureExecution':'native relative to Docker engine' if a.platform.split('/')[1]==native else 'emulated relative to Docker engine'}
  if a.output:Path(a.output).write_text(json.dumps(result,indent=2)+'\n')
  print(json.dumps(result,indent=2))
 finally:subprocess.run(['docker','rm','-f',name],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
if __name__=='__main__':main()
