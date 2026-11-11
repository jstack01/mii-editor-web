#!/usr/bin/env python3
"""Explicit manual publication, only after the owner approves the reviewed snapshot."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess

ROOT=Path(__file__).resolve().parents[1]

def run(*args, capture=False):
    result=subprocess.run(args,cwd=ROOT,text=True,stdout=subprocess.PIPE if capture else None,check=True)
    return result.stdout.strip() if capture else None

def repository_patch(settings):
    # Public repositories are inherently forkable; GitHub rejects PATCHing this field.
    return {key:value for key,value in settings.items() if key != "allow_forking"}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--repo',required=True,help='owner/mii-editor-web')
    p.add_argument('--version',required=True)
    p.add_argument('--expected-commit',required=True)
    p.add_argument('--approve-public-upload',action='store_true',help='Use only after the owner explicitly approves this exact source/release.')
    a=p.parse_args()
    if not a.approve_public_upload:
        raise SystemExit('No upload. Explicit owner approval and --approve-public-upload are required.')
    if not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+',a.repo) or not re.fullmatch(r'v[0-9]+\.[0-9]+\.[0-9]+(?:-[A-Za-z0-9.-]+)?',a.version):
        raise SystemExit('Invalid repository/version.')
    head=run('git','rev-parse','HEAD',capture=True)
    if head!=a.expected_commit or run('git','status','--porcelain',capture=True):
        raise SystemExit('Source is dirty or differs from the reviewed commit. Review before publishing.')
    run('git','check-ref-format','refs/tags/'+a.version)
    existing_tag=subprocess.run(['git','rev-parse','--verify','refs/tags/'+a.version],cwd=ROOT,capture_output=True,text=True)
    if existing_tag.returncode==0:
        raise SystemExit('Version tag already exists; do not overwrite it.')
    if 'v'+json.loads((ROOT/'web/package.json').read_text())['version']!=a.version:
        raise SystemExit('Version differs from the reviewed application package.json.')
    files=run('git','ls-files',capture=True).splitlines()
    for name in files:
        if name.startswith(('SOURCE/','EXTRACTED-SWF/','EXTRACTED/','evidence/','node_modules/','web/node_modules/','web/dist/','release/','.local-reference/')) or name.lower().endswith(('.swf','.as','.fla','.air')):
            raise SystemExit('Private/original/generated artifact still tracked: '+name)
    release_set=ROOT/'release'/('release-set-'+a.version+'.json')
    if release_set.exists():
        release=json.loads(release_set.read_text())
        if {x['edition'] for x in release['artifacts']}!={'macos','linux','windows','static'}:
            raise SystemExit('Expected four reviewed distribution editions.')
        packages=[]
        for artifact in release['artifacts']:
            name=artifact['filename']
            if Path(name).name!=name:raise SystemExit('Invalid artifact name.')
            package=ROOT/'release'/name;digest=hashlib.sha256(package.read_bytes()).hexdigest()
            manifest=json.loads(package.with_suffix('.manifest.json').read_text())
            verification=json.loads(package.with_suffix('.verification.json').read_text())
            if manifest['build']['commit']!=head or manifest['build']['uncommittedSource'] or manifest['sha256']!=digest or artifact['sha256']!=digest:
                raise SystemExit('Package differs from reviewed clean commit.')
            if verification.get('archiveSHA256')!=digest or verification.get('passed') is not True:
                raise SystemExit('Verify every exact extracted archive before publication.')
            packages.append(str(package))
        supplements=release.get('supplements',[])
        if supplements:
            if len(supplements)!=1 or supplements[0].get('edition')!='docker':raise SystemExit('Unexpected supplementary archive.')
            artifact=supplements[0]
            if artifact['filename']!='mii-editor-web-docker-'+a.version+'.zip':raise SystemExit('Invalid Docker starter filename.')
            package=ROOT/'release'/artifact['filename'];digest=hashlib.sha256(package.read_bytes()).hexdigest()
            manifest=json.loads(package.with_suffix('.manifest.json').read_text());verified=json.loads(package.with_suffix('.verification.json').read_text())
            if digest!=artifact['sha256'] or digest!=manifest['sha256'] or manifest['build']['commit']!=head or manifest['build']['uncommittedSource'] or verified.get('archiveSHA256')!=digest or verified.get('passed') is not True:
                raise SystemExit('Docker starter does not match the reviewed commit/verification.')
            public_path=ROOT/'release'/('container-publication-'+a.version+'.json')
            if not public_path.exists():raise SystemExit('Verify public GHCR publication and anonymous pulls before publishing this GitHub release.')
            public=json.loads(public_path.read_text())
            if public.get('packagePublic') is not True or public.get('repository')!=a.repo or public.get('anonymousPull') is not True or public.get('anonymousManifest') is not True or public.get('revision')!=head or public.get('image')!='ghcr.io/'+a.repo+':'+a.version or set(public.get('platforms',[]))!={'linux/amd64','linux/arm64'}:
                raise SystemExit('Public container verification does not match the reviewed release.')
            packages.append(str(package))
        source=release.get('sourceArchive')
        if source:
            if source['filename']!='mii-editor-web-container-sources-'+a.version+'.tar.gz':raise SystemExit('Invalid source archive filename.')
            package=ROOT/'release'/source['filename'];digest=hashlib.sha256(package.read_bytes()).hexdigest()
            verification=json.loads(package.with_suffix('.verification.json').read_text())
            if digest!=source['sha256'] or verification.get('archiveSHA256')!=digest or verification.get('passed') is not True:raise SystemExit('Verify the exact source-information archive before publication.')
            packages.append(str(package))
        checksum=ROOT/'release'/release['checksumFile']
        expected=''.join(x['sha256']+'  '+x['filename']+'\n' for x in [*release['artifacts'],*supplements,*([source] if source else [])])
        if checksum.read_text()!=expected:raise SystemExit('Checksum inventory mismatch.')
        packages.append(str(checksum))
    else:
        raise SystemExit('Prepare and verify the new release-set packages first. Existing releases are never overwritten.')
    owner,name=a.repo.split('/')
    account=run('gh','api','user','--jq','.login',capture=True)
    if account.lower()!=owner.lower():
        raise SystemExit('Signed-in account differs from requested owner; no repository changes made.')
    url='https://github.com/'+a.repo+'.git'
    origin=subprocess.run(['git','remote','get-url','origin'],cwd=ROOT,text=True,capture_output=True)
    if origin.returncode==0 and origin.stdout.strip()!=url:
        raise SystemExit('Origin points elsewhere; do not overwrite it automatically.')
    exists=subprocess.run(['gh','api','repos/'+a.repo],cwd=ROOT,text=True,capture_output=True)
    settings=json.loads((ROOT/'scripts/repository-settings.json').read_text())
    if exists.returncode:
        if '404' not in exists.stderr:
            raise SystemExit('Cannot establish repository availability; no repository created.')
        body={**repository_patch(settings),'name':name,'private':False,'auto_init':False,'description':'Unofficial AI-generated, unmaintained browser Mii Editor. Forks encouraged subject to code/asset rights.'}
        subprocess.run(['gh','api','--method','POST','user/repos','--input','-'],cwd=ROOT,input=json.dumps(body),text=True,stdout=subprocess.DEVNULL,check=True)
    elif origin.returncode:
        raise SystemExit('Repository exists but is not this checkout origin; review before using it.')
    subprocess.run(['gh','api','--method','PATCH','repos/'+a.repo,'--input','-'],cwd=ROOT,input=json.dumps(repository_patch(settings)),text=True,stdout=subprocess.DEVNULL,check=True)
    actual=json.loads(run('gh','api','repos/'+a.repo,capture=True))
    if actual.get('private') is not False or any(actual.get(k)!=v for k,v in settings.items()):
        raise SystemExit('Repository feature verification failed. No source push or release was performed.')
    if origin.returncode:
        run('git','remote','add','origin',url)
    run('git','push','-u','origin','HEAD:main')
    # No force, history rewrite or automatic publication on ordinary commits.
    run('git','tag','-a',a.version,'-m',('Preview ' if '-' in a.version else 'Release ')+a.version,head)
    run('git','push','origin','refs/tags/'+a.version)
    run('gh','release','create',a.version,*packages,'--repo',a.repo,'--verify-tag',*(['--prerelease'] if '-' in a.version else ['--latest']),'--title','Mii Editor Web '+a.version,'--notes-file','docs/RELEASE_NOTES.md')
    print('Repository: https://github.com/'+a.repo)
    print('Releases: https://github.com/'+a.repo+'/releases')
    print('Choose the platform or static-hosting ZIP on the Releases page.')

if __name__=='__main__':
    main()
