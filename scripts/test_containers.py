"""Container distribution guards; no public uploads or credential changes."""
import importlib.util,json,os,shutil,subprocess,unittest
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
   env={**os.environ,'MII_EDITOR_PORT':port};data=json.loads(subprocess.check_output(['docker','compose','-f',str(ROOT/'compose.yaml'),'config','--format','json'],env=env,text=True));self.assertEqual(set(data['services']),{'mii-editor'});service=data['services']['mii-editor'];self.assertEqual(service['image'],'ghcr.io/jstack01/mii-editor-web:v0.1.0-preview.4');self.assertEqual(service['restart'],'unless-stopped');self.assertTrue(service['read_only']);self.assertFalse(service.get('volumes'));self.assertFalse(service.get('privileged'));self.assertEqual(service['cap_drop'],['ALL']);self.assertEqual(service['ports'][0]['host_ip'],'127.0.0.1');self.assertEqual(str(service['ports'][0]['published']),port);self.assertEqual(service['ports'][0]['target'],8080)
if __name__=='__main__':unittest.main()
