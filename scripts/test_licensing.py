"""Scoped license and distribution integrity; no rights-holder/network actions."""
import hashlib,json,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class LicensingTests(unittest.TestCase):
 def test_mit_is_scoped_and_standard(self):
  text=(ROOT/'LICENSE').read_text();self.assertIn('Copyright (c) 2026 jstack01',text);self.assertIn('Permission is hereby granted, free of charge',text);self.assertIn('THE SOFTWARE IS PROVIDED "AS IS"',text);self.assertNotIn('non-commercial',text)
  scope=json.loads((ROOT/'LICENSE-SCOPE.json').read_text());self.assertEqual(scope['license'],'MIT');self.assertNotIn('web/src/model/Range.ts',scope['files'])
  for f in scope['files']:
   self.assertTrue((ROOT/f).is_file(),f);self.assertFalse(f.startswith(('web/src/generated/','web/src/model/','web/src/render/','web/src/gui/','SOURCE/','EXTRACTED-SWF/')),f)
 def test_mixed_package_is_not_unqualified_mit(self):
  self.assertEqual(json.loads((ROOT/'web/package.json').read_text())['license'],'SEE LICENSE IN LICENSE.md');self.assertIn('](../LICENSE-SCOPE.json)',(ROOT/'web/LICENSE.md').read_text());self.assertIn('only to eligible modern contributions',(ROOT/'web/LICENSE.md').read_text())
 def test_every_required_notice_exists(self):
  paths=json.loads((ROOT/'release-notices.json').read_text());self.assertIn('LICENSE-SCOPE.json',paths);self.assertIn('ASSET_RIGHTS.md',paths)
  for path in paths:self.assertTrue((ROOT/path).is_file(),path)
 def test_all_generated_assets_are_unchanged(self):
  for f,h in json.loads((ROOT/'web/generated-resources.json').read_text())['sha256'].items():self.assertEqual(hashlib.sha256((ROOT/'web'/f).read_bytes()).hexdigest(),h)
 def test_runtime_sources_have_no_missing_recipe_inputs(self):
  p=ROOT/'LICENSES/container/SOURCE-INDEX.json'
  if not p.exists():self.fail('Runtime source index missing')
  data=json.loads(p.read_text());self.assertEqual(data['unresolvedEntries'],0)
  for origin in data['inputs']:
   for item in origin.get('inputs',[]):self.assertTrue(item['downloaded'],(origin['origin'],item['name']))
if __name__=='__main__':unittest.main()
