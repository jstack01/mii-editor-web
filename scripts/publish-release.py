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
    package=ROOT/'release'/('mii-editor-web-'+a.version+'.zip')
    manifest=json.loads((ROOT/'release'/('mii-editor-web-'+a.version+'.manifest.json')).read_text())
    digest=hashlib.sha256(package.read_bytes()).hexdigest()
    if manifest['build']['commit']!=head or manifest['build']['uncommittedSource'] or manifest['sha256']!=digest:
        raise SystemExit('Release package does not match the reviewed clean commit.')
    verification=json.loads((ROOT/'release'/'verification.json').read_text())
    if verification.get('archiveSHA256')!=digest or verification.get('passed') is not True:
        raise SystemExit('Run extracted-ZIP deployment verification for this exact archive first.')
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
    run('git','tag','-a',a.version,'-m','Preview '+a.version,head)
    run('git','push','origin','refs/tags/'+a.version)
    run('gh','release','create',a.version,str(package),str(package.with_suffix('.zip.sha256')),'--repo',a.repo,'--verify-tag','--prerelease','--title','Mii Editor Web '+a.version,'--notes-file','docs/RELEASE_NOTES.md')
    print('Repository: https://github.com/'+a.repo)
    print('Releases: https://github.com/'+a.repo+'/releases')
    print('ZIP: https://github.com/'+a.repo+'/releases/download/'+a.version+'/'+package.name)

if __name__=='__main__':
    main()
