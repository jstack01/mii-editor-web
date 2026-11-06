"""Container distribution guards; no public uploads or credential changes."""
import importlib.util,json,os,shutil,subprocess,unittest
from unittest.mock import patch
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('anonymous',ROOT/'scripts/verify-ghcr-anonymous.py');anonymous=importlib.util.module_from_spec(spec);spec.loader.exec_module(anonymous)
class IndexTests(unittest.TestCase):
 def index(self,*arches):return {'manifests':[{'platform':{'os':'linux','architecture':a}} for a in arches]}
 def test_both_required_platforms(self):self.assertEqual(anonymous.validate_index(self.index('amd64','arm64')),['linux/amd64','linux/arm64'])
 def test_attestation_descriptor_does_not_count_as_architecture(self):
  index=self.index('amd64','arm64');index['manifests'].append({'platform':{'os':'unknown','architecture':'unknown'}});self.assertEqual(len(anonymous.validate_index(index)),2)
 def test_missing_or_extra_architecture_rejected(self):
  for arches in [('amd64',),('arm64',),('amd64','arm64','386'),('amd64','amd64','arm64'),()]:
   with self.subTest(arches=arches),self.assertRaises(ValueError):anonymous.validate_index(self.index(*arches))
 def test_non_manifest_rejected(self):
  with self.assertRaises(ValueError):anonymous.validate_index({'layers':[]})
class SourceContainerTests(unittest.TestCase):
 def test_pinned_build_inputs_and_nonroot_runtime(self):
  text=(ROOT/'Dockerfile').read_text();self.assertRegex(text,r'# syntax=docker/dockerfile:1@sha256:[0-9a-f]{64}');self.assertEqual(text.count('@sha256:'),3);runtime=text.split(' AS runtime',1)[1];self.assertIn('USER 101:101',runtime);self.assertNotIn('npm install',runtime);self.assertIn('STOPSIGNAL SIGQUIT',runtime)
 def test_no_automatic_publish_trigger_or_broad_token_permissions(self):
  text=(ROOT/'.github/workflows/container.yaml').read_text();self.assertIn('workflow_dispatch:',text);self.assertNotIn('\n  push:',text);self.assertNotIn('\n  schedule:',text);self.assertIn('default: false',text);self.assertEqual(text.count('packages: write'),1);self.assertIn("if: inputs.publish && github.repository == 'jstack01/mii-editor-web'",text);self.assertIn('persist-credentials: false',text)
 @unittest.skipUnless(shutil.which('docker'),'Docker Compose CLI unavailable')
 def test_actual_compose_defaults_custom_port_and_security(self):
  for port in ['8080','18900']:
   env={**os.environ,'MII_EDITOR_PORT':port};data=json.loads(subprocess.check_output(['docker','compose','-f',str(ROOT/'compose.yaml'),'config','--format','json'],env=env,text=True));self.assertEqual(set(data['services']),{'mii-editor'});service=data['services']['mii-editor'];self.assertEqual(service['image'],'ghcr.io/jstack01/mii-editor-web:v'+json.loads((ROOT/'web/package.json').read_text())['version']);self.assertEqual(service['restart'],'unless-stopped');self.assertTrue(service['read_only']);self.assertFalse(service.get('volumes'));self.assertFalse(service.get('privileged'));self.assertEqual(service['cap_drop'],['ALL']);self.assertEqual(service['ports'][0]['host_ip'],'127.0.0.1');self.assertEqual(str(service['ports'][0]['published']),port);self.assertEqual(service['ports'][0]['target'],8080)

spec=importlib.util.spec_from_file_location('container_verifier',ROOT/'scripts/verify-container.py');verifier=importlib.util.module_from_spec(spec);spec.loader.exec_module(verifier)
class OlderDockerInspectionTests(unittest.TestCase):
 def test_containerd_index_uses_selected_manifest(self):
  data={'Os':'linux','Architecture':'amd64'}
  with patch.object(verifier,'docker',return_value=json.dumps([data])) as call:
   selected={'Image':'sha256:index','ImageManifestDescriptor':{'digest':'sha256:amd64-leaf','platform':{'os':'linux','architecture':'amd64'}}}
   self.assertEqual(verifier.inspect_selected_image(selected,'linux/amd64'),data)
   call.assert_called_once_with('image','inspect','sha256:amd64-leaf')
 def test_local_buildx_leaf_uses_verified_platform_fallback(self):
  data={'Os':'linux','Architecture':'amd64'}
  selected={'Image':'sha256:index','ImageManifestDescriptor':{'digest':'sha256:leaf','platform':{'os':'linux','architecture':'amd64'}}}
  with patch.object(verifier,'docker',side_effect=[subprocess.CalledProcessError(1,['docker','image','inspect']),json.dumps([data])]) as call:
   self.assertEqual(verifier.inspect_selected_image(selected,'linux/amd64'),data)
   self.assertEqual(call.call_args_list[-1].args,('image','inspect','--platform','linux/amd64','sha256:index'))
 def test_unsupported_platform_fallback_fails_instead_of_guessing(self):
  selected={'Image':'sha256:index','ImageManifestDescriptor':{'digest':'sha256:leaf','platform':{'os':'linux','architecture':'amd64'}}}
  with patch.object(verifier,'docker',side_effect=subprocess.CalledProcessError(1,['docker','image','inspect'])):
   with self.assertRaises(subprocess.CalledProcessError):verifier.inspect_selected_image(selected,'linux/amd64')
 def test_wrong_manifest_platform_fails_closed(self):
  with patch.object(verifier,'docker') as call:
   with self.assertRaises(AssertionError):verifier.inspect_selected_image({'Image':'sha256:index','ImageManifestDescriptor':{'digest':'sha256:arm64','platform':{'os':'linux','architecture':'arm64'}}},'linux/amd64')
   call.assert_not_called()
 def test_inspects_selected_immutable_image_without_new_cli_flag(self):
  spec=importlib.util.spec_from_file_location('container_verifier',ROOT/'scripts/verify-container.py');verifier=importlib.util.module_from_spec(spec);spec.loader.exec_module(verifier)
  data={'Os':'linux','Architecture':'arm64','Id':'sha256:selected'}
  with patch.object(verifier,'docker',return_value=json.dumps([data])) as call:
   self.assertEqual(verifier.inspect_selected_image({'Image':'sha256:selected'},'linux/arm64'),data);call.assert_called_once_with('image','inspect','sha256:selected')
  with patch.object(verifier,'docker',return_value=json.dumps([data])):
   with self.assertRaises(AssertionError):verifier.inspect_selected_image({'Image':'sha256:selected'},'linux/amd64')

class PublicPackagePageTests(unittest.TestCase):
 def page(self,visibility='Public',repo='jstack01/mii-editor-web',version='v0.1.0-preview.4'):
  return '<h1>mii-editor-web '+version+'<span title="Label: Visibility">'+visibility+'</span></h1><h4>Details</h4><a href="https://github.com/'+repo+'">Source</a>'
 def test_public_badge_version_and_connected_repository(self):
  self.assertTrue(anonymous.validate_public_page(self.page(),'jstack01/mii-editor-web','v0.1.0-preview.4'))
 def test_private_or_different_source_is_rejected(self):
  for html in [self.page('Private'),self.page(repo='someone/else'),self.page(version='v0.0.0')]:
   with self.assertRaises(ValueError):anonymous.validate_public_page(html,'jstack01/mii-editor-web','v0.1.0-preview.4')
 def test_unrelated_public_text_and_navigation_link_are_insufficient(self):
  for html in [self.page().replace('title="Label: Visibility"','title="Other"'),self.page().replace('<h4>Details</h4>','')]:
   with self.assertRaises(ValueError):anonymous.validate_public_page(html,'jstack01/mii-editor-web','v0.1.0-preview.4')
if __name__=='__main__':unittest.main()
