"""Local packaging guard tests. No GitHub writes, authentication or network."""
import contextlib
import hashlib
import importlib.util
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
import zipfile

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location('packager',HERE/'package-release.py')
packager=importlib.util.module_from_spec(spec);spec.loader.exec_module(packager)

class DistributionTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.root=Path(self.temp.name)
        self.addCleanup(self.temp.cleanup)
        for n in ['web/dist/assets/app.js','web/dist/assets/app.css','web/dist/index.html','web/dist/LICENSE.md','web/dist/NOTICES.md','web/dist/LICENSES/Vite-LICENSE.md','web/package.json','distribution/START-HERE.md','docs/HOSTING.md','LICENSE.md','NOTICES.md','LICENSES/Vite-LICENSE.md','distribution/serve.py','distribution/Start Mii Editor.cmd','distribution/Start Mii Editor.command','distribution/start-mii-editor.sh','distribution/launcher.sh','distribution/STATIC-START-HERE.md','SOURCE/private.swf','EXTRACTED-SWF/private.as','evidence/private.xml']:
            p=self.root/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text('fixture\n')
        (self.root/'web/package.json').write_text('{"version":"0.1.0-preview.2"}')
    def invoke(self,*args,dirty=False):
        def git(*parts):return 'dirty' if parts[0]=='status' and dirty else '' if parts[0]=='status' else '1804453200' if parts[0]=='show' else 'a'*40
        with patch.object(packager,'ROOT',self.root),patch.object(packager,'git',git),patch.object(sys,'argv',['package-release.py',*args]),contextlib.redirect_stdout(io.StringIO()):packager.main()
    def test_whitelist_and_checksums(self):
        self.invoke();archives=list((self.root/'release').glob('*.zip'));self.assertEqual(len(archives),4)
        sites=[]
        for a in archives:
            digest=hashlib.sha256(a.read_bytes()).hexdigest();self.assertTrue(a.with_suffix('.zip.sha256').read_text().startswith(digest))
            with zipfile.ZipFile(a) as z:
                names=z.namelist();self.assertFalse(any('/SOURCE/' in n or '/EXTRACTED-SWF/' in n or '/evidence/' in n for n in names));prefix=names[0].split('/')[0]+'/'
                for line in z.read(prefix+'FILES.sha256').decode().splitlines():
                    h,n=line.split('  ',1);self.assertEqual(hashlib.sha256(z.read(prefix+n)).hexdigest(),h)
                static='-static-' in a.name;site='' if static else 'website/'
                sites.append(z.read(prefix+site+'assets/app.js'))
                info=json.loads(z.read(prefix+site+'BUILD-INFO.json'));self.assertFalse(info['uncommittedSource']);self.assertEqual(info['commit'],'a'*40)
                if static:self.assertFalse(any(n.endswith(('.py','.cmd','.sh','.command')) for n in names))
                elif '-windows-' in a.name:self.assertIn(b'\r\n',z.read(prefix+'Start Mii Editor.cmd'))
                else:
                    launcher='Start Mii Editor.command' if '-macos-' in a.name else 'start-mii-editor.sh'
                    self.assertTrue((z.getinfo(prefix+launcher).external_attr>>16)&0o111)
        self.assertTrue(all(x==sites[0] for x in sites))
        self.assertEqual(len(json.loads((self.root/'release/release-set-v0.1.0-preview.2.json').read_text())['artifacts']),4)
    def test_old_release_cannot_be_overwritten(self):
        with self.assertRaisesRegex(SystemExit,'Version differs'):self.invoke('--version','v0.1.0-preview.1')
    def test_unexpected_website_source_rejected(self):
        (self.root/'web/dist/leak.as').write_text('fixture')
        with self.assertRaisesRegex(SystemExit,'Unexpected production file'):self.invoke()
    def test_dirty_default_rejected(self):
        with self.assertRaisesRegex(SystemExit,'Commit/review'):self.invoke(dirty=True)
    def test_dirty_review_package_marked(self):
        self.invoke('--allow-dirty',dirty=True);a=next((self.root/'release').glob('*.manifest.json'));self.assertTrue(json.loads(a.read_text())['build']['uncommittedSource'])
    def test_commit_time_used_for_update_cache_freshness(self):
        self.invoke();a=next((self.root/'release').glob('*.zip'))
        import time
        with zipfile.ZipFile(a) as z:self.assertEqual(z.infolist()[0].date_time[:5],time.gmtime(1804453200)[:5])
    def test_bad_version_rejected(self):
        with self.assertRaisesRegex(SystemExit,'Use a version'):self.invoke('--version','../../bad')
    def test_public_forking_is_verified_not_sent_as_a_mutable_setting(self):
        spec=importlib.util.spec_from_file_location('publisher',HERE/'publish-release.py');publisher=importlib.util.module_from_spec(spec);spec.loader.exec_module(publisher)
        desired={'has_issues':False,'has_pull_requests':False,'allow_forking':True}
        self.assertEqual(publisher.repository_patch(desired),{'has_issues':False,'has_pull_requests':False});self.assertTrue(desired['allow_forking'])
    def test_publication_requires_approval_before_any_git_or_gh_work(self):
        r=subprocess.run([sys.executable,str(HERE/'publish-release.py'),'--repo','example/mii-editor-web','--version','v0.1.0-preview.2','--expected-commit','0'*40],capture_output=True,text=True)
        self.assertNotEqual(r.returncode,0);self.assertIn('No upload',r.stderr)

if __name__=='__main__':unittest.main()
