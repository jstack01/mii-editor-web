#!/usr/bin/env python3
"""Validate the extracted Docker starter archive; no pull/push/start required."""
import argparse,hashlib,json,subprocess,tempfile,zipfile
from pathlib import Path

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--archive',required=True);a=p.parse_args();archive=Path(a.archive)
 with zipfile.ZipFile(archive) as z,tempfile.TemporaryDirectory() as tmp:
  for n in z.namelist():
   path=Path(n);assert not path.is_absolute() and '..' not in path.parts
  z.extractall(tmp);folder=next(Path(tmp).iterdir())
  names={p.relative_to(folder).as_posix() for p in folder.rglob('*') if p.is_file()};required={'compose.yaml','.env.example','START-HERE.md','LICENSE.md','NOTICES.md','LICENSES/Vite-LICENSE.md','BUILD-INFO.json','FILES.sha256'};modern=set(json.loads((Path(__file__).resolve().parents[1]/'release-notices.json').read_text())) if json.loads((folder/'BUILD-INFO.json').read_text())['version']=='v1.0.0' else set();required|=modern;runtime={p.relative_to(Path(__file__).resolve().parents[1]).as_posix() for p in (Path(__file__).resolve().parents[1]/'LICENSES/container').rglob('*') if p.is_file()}|{'LICENSES/Nginx-Unprivileged-LICENSE.txt'} if modern else set();required|=runtime;guides={'HOSTING.md','BROWSER_COMPATIBILITY.md','SECURITY_PRIVACY.md'};assert required<=names and names<=required|guides
  if json.loads((folder/'BUILD-INFO.json').read_text())['version']=='v0.1.0-preview.5':assert guides<=names
  for line in (folder/'FILES.sha256').read_text().splitlines():
   h,n=line.split('  ',1);assert hashlib.sha256((folder/n).read_bytes()).hexdigest()==h
  data=json.loads(subprocess.check_output(['docker','compose','-f',str(folder/'compose.yaml'),'config','--format','json'],text=True))
  service=data['services']['mii-editor'];version=json.loads((folder/'BUILD-INFO.json').read_text())['version'];assert service['image']=='ghcr.io/jstack01/mii-editor-web:'+version;assert service['restart']=='unless-stopped' and service['read_only'];assert service['ports'][0]['host_ip']=='127.0.0.1';assert not service.get('volumes') and not service.get('privileged');assert service['cap_drop']==['ALL']
 result={'passed':True,'archiveSHA256':hashlib.sha256(archive.read_bytes()).hexdigest(),'composeValidated':True,'noRuntimeOrOriginalFiles':True}
 archive.with_suffix('.verification.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
if __name__=='__main__':main()
