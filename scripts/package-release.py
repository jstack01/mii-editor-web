#!/usr/bin/env python3
"""Create a reviewed prebuilt static ZIP; never publishes or downloads anything."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]

def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT, text=True).strip()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--version')
    parser.add_argument('--allow-dirty', action='store_true', help='Local review/testing only; publisher rejects dirty packages.')
    args = parser.parse_args()
    version = args.version or 'v'+json.loads((ROOT/'web/package.json').read_text())['version']
    if not re.fullmatch(r'v[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?', version):
        raise SystemExit('Use a version such as v0.1.0-preview.1.')
    dirty = bool(git('status', '--porcelain'))
    if dirty and not args.allow_dirty:
        raise SystemExit('Commit/review current source changes first, or use --allow-dirty only for local testing.')
    commit = git('rev-parse', 'HEAD')
    site = ROOT/'web/dist'
    allowed = {'index.html','LICENSE.md','NOTICES.md','LICENSES/Vite-LICENSE.md'}
    entries = {}
    for path in sorted(site.rglob('*')):
        if not path.is_file():
            continue
        relative = path.relative_to(site).as_posix()
        if path.is_symlink() or not (relative in allowed or (relative.startswith('assets/') and path.suffix in {'.js','.css','.svg','.png','.jpg','.woff','.woff2'})):
            raise SystemExit('Unexpected production file: '+relative)
        entries['website/'+relative] = path.read_bytes()
    if not allowed.issubset({p[8:] for p in entries}):
        raise SystemExit('Build is missing index or legal notices. Run pnpm build first.')
    for source,target in [('distribution/START-HERE.md','START-HERE.md'),('docs/HOSTING.md','HOSTING.md'),('LICENSE.md','LICENSE.md'),('NOTICES.md','NOTICES.md'),('LICENSES/Vite-LICENSE.md','LICENSES/Vite-LICENSE.md'),('distribution/serve.py','serve.py'),('distribution/start-windows.bat','start-windows.bat'),('distribution/start-macos.command','start-macos.command'),('distribution/start-linux.sh','start-linux.sh')]:
        data=(ROOT/source).read_bytes()
        if target.endswith('.bat'):
            data=data.replace(b'\r\n',b'\n').replace(b'\n',b'\r\n')
        entries[target]=data
    build={'version':version,'commit':commit,'uncommittedSource':dirty,'profile':'Wii-RCD-persistent-v1','hardwareCertified':False}
    entries['website/BUILD-INFO.json']=(json.dumps(build,indent=2)+'\n').encode()
    inventory={name:hashlib.sha256(data).hexdigest() for name,data in sorted(entries.items())}
    entries['FILES.sha256']=''.join(digest+'  '+name+'\n' for name,digest in inventory.items()).encode()
    folder='mii-editor-web-'+version
    output=ROOT/'release';output.mkdir(exist_ok=True)
    archive=output/(folder+'.zip')
    # Stable timestamps and explicit modes make the package reproducible for a commit.
    with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
        for name,data in sorted(entries.items()):
            info=zipfile.ZipInfo(folder+'/'+name,date_time=(2026,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.create_system=3
            info.external_attr=(0o100755 if name.endswith(('.sh','.command')) or name=='serve.py' else 0o100644)<<16
            z.writestr(info,data)
    digest=hashlib.sha256(archive.read_bytes()).hexdigest()
    checksum=archive.with_suffix('.zip.sha256');checksum.write_text(digest+'  '+archive.name+'\n')
    (output/(folder+'.manifest.json')).write_text(json.dumps({'build':build,'zip':archive.name,'sha256':digest,'files':inventory},indent=2)+'\n')
    print(str(archive));print('SHA-256: '+digest);print('No upload was performed.')

if __name__=='__main__':
    main()
