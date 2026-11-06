#!/usr/bin/env python3
"""Prepare script-based local editions and a separate static website. Never publishes."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import time
import zipfile
ROOT=Path(__file__).resolve().parents[1]
EDITIONS=('macos','linux','windows','static')
LAUNCHERS={'macos':'Start Mii Editor.command','linux':'start-mii-editor.sh','windows':'Start Mii Editor.cmd'}

def git(*args):
    return subprocess.check_output(['git',*args],cwd=ROOT,text=True).strip()

def website_files():
    site=ROOT/'web/dist';allowed={'index.html','LICENSE.md','NOTICES.md','LICENSES/Vite-LICENSE.md'};entries={}
    for path in sorted(site.rglob('*')):
        if not path.is_file():continue
        name=path.relative_to(site).as_posix()
        if path.is_symlink() or not(name in allowed or (name.startswith('assets/') and path.suffix in {'.js','.css','.svg','.png','.jpg','.woff','.woff2'})):
            raise SystemExit('Unexpected production file: '+name)
        entries[name]=path.read_bytes()
    if not allowed.issubset(entries):raise SystemExit('Build is missing index or notices. Run pnpm build first.')
    return entries

def create_archive(edition,version,build,timestamp,site):
    entries={('' if edition=='static' else 'website/')+name:data for name,data in site.items()}
    for name in ['LICENSE.md','NOTICES.md','LICENSES/Vite-LICENSE.md']:
        entries[name]=(ROOT/name).read_bytes()
    entries['HOSTING.md']=(ROOT/'docs/HOSTING.md').read_bytes()
    if edition=='static':
        entries['START-HERE.md']=(ROOT/'distribution/STATIC-START-HERE.md').read_bytes()
    else:
        launcher=LAUNCHERS[edition]
        note={'macos':'Uses an already-installed Python 3.9+. Apple developer-tools installation stubs are skipped.', 'linux':'Requires an already-installed Python 3.9+. Real Linux desktop testing is still pending.', 'windows':'Requires a real Python 3.9+ installation on PATH. The owner manually tested Windows startup successfully; detailed OS/version coverage was not supplied. PowerShell HTTP.sys was not selected because URL permissions/global bindings do not meet the default no-admin, strict-loopback requirements.'}[edition]
        guide=(ROOT/'distribution/START-HERE.md').read_text().replace('{{START_SCRIPT}}',launcher).replace('{{PLATFORM_NOTE}}',note)
        entries['START-HERE.md']=guide.encode()
        names=['serve.py','config.json',launcher]+(['launcher.sh'] if edition in ['macos','linux'] else [])
        for name in names:
            data=(ROOT/'distribution'/name).read_bytes()
            if name.endswith('.cmd'):data=data.replace(b'\r\n',b'\n').replace(b'\n',b'\r\n')
            entries[name]=data
    return write_archive('mii-editor-web-'+edition+'-'+version,entries,build,timestamp,edition)

def write_archive(folder,entries,build,timestamp,edition):
    inventory={name:hashlib.sha256(data).hexdigest() for name,data in sorted(entries.items())}
    entries['FILES.sha256']=''.join(h+'  '+n+'\n' for n,h in inventory.items()).encode()
    output=ROOT/'release';output.mkdir(exist_ok=True);archive=output/(folder+'.zip')
    with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for name,data in sorted(entries.items()):
            info=zipfile.ZipInfo(folder+'/'+name,date_time=timestamp);info.compress_type=zipfile.ZIP_DEFLATED;info.create_system=3
            info.external_attr=(0o100755 if name.endswith(('.sh','.command')) or name=='serve.py' else 0o100644)<<16
            z.writestr(info,data)
    digest=hashlib.sha256(archive.read_bytes()).hexdigest();archive.with_suffix('.zip.sha256').write_text(digest+'  '+archive.name+'\n')
    manifest={'build':build,'edition':edition,'zip':archive.name,'sha256':digest,'files':inventory}
    (output/(folder+'.manifest.json')).write_text(json.dumps(manifest,indent=2)+'\n')
    return {'edition':edition,'filename':archive.name,'sha256':digest}

def create_docker_starter(version,build,timestamp):
    entries={'compose.yaml':(ROOT/'compose.yaml').read_bytes(),'.env.example':(ROOT/'.env.example').read_bytes(),
             'START-HERE.md':(ROOT/'docs/DOCKER.md').read_bytes(),'BUILD-INFO.json':(json.dumps(build,indent=2)+'\n').encode()}
    for name in ['LICENSE.md','NOTICES.md','LICENSES/Vite-LICENSE.md']:
        entries[name]=(ROOT/name).read_bytes()
    return write_archive('mii-editor-web-docker-'+version,entries,build,timestamp,'docker')

def main():
    parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--version');parser.add_argument('--edition',choices=['all',*EDITIONS],default='all');parser.add_argument('--allow-dirty',action='store_true',help='Local testing only; cannot publish dirty packages.');args=parser.parse_args()
    expected='v'+json.loads((ROOT/'web/package.json').read_text())['version'];version=args.version or expected
    if not re.fullmatch(r'v[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?',version):raise SystemExit('Use a version such as v0.1.0-preview.2.')
    if version!=expected:raise SystemExit('Version differs from package.json; older preview packages will not be overwritten.')
    dirty=bool(git('status','--porcelain'))
    if dirty and not args.allow_dirty:raise SystemExit('Commit/review current source changes first, or use --allow-dirty only for testing.')
    build={'version':version,'commit':git('rev-parse','HEAD'),'uncommittedSource':dirty,'profile':'Wii-RCD-persistent-v1','hardwareCertified':False}
    timestamp=time.gmtime(max(315532800,int(git('show','-s','--format=%ct','HEAD'))))[:6]
    site=website_files();site['BUILD-INFO.json']=(json.dumps(build,indent=2)+'\n').encode()
    artifacts=[create_archive(e,version,build,timestamp,site) for e in EDITIONS if args.edition in ['all',e]]
    supplements=[create_docker_starter(version,build,timestamp)] if (ROOT/'compose.yaml').exists() else []
    output=ROOT/'release';checksum='SHA256SUMS-'+version+'.txt';(output/checksum).write_text(''.join(a['sha256']+'  '+a['filename']+'\n' for a in [*artifacts,*supplements]))
    result={'format':2,'version':version,'build':build,'artifacts':artifacts,'supplements':supplements,'checksumFile':checksum}
    (output/('release-set-'+version+'.json')).write_text(json.dumps(result,indent=2)+'\n')
    for a in [*artifacts,*supplements]:print(str(output/a['filename'])+'\nSHA-256: '+a['sha256'])
    print('No upload was performed.')

if __name__=='__main__':main()
