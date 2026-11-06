"""Shared configuration behavior, independent of platform wrapper syntax."""
import contextlib,importlib.util,io,json,os
from pathlib import Path
import subprocess,sys,unittest
from unittest.mock import patch
from test_launchers import LauncherTests,server
class ConfigParsingTests(unittest.TestCase):
 def setUp(self):
  import tempfile
  self.temp=tempfile.TemporaryDirectory(prefix='Mii config 水 ');self.addCleanup(self.temp.cleanup);self.root=Path(self.temp.name)
 def config(self,text):
  (self.root/'config.json').write_text(text,encoding='utf-8');return server.load_config(self.root)
 def test_missing_file_key_default_and_unknown_safe(self):
  self.assertEqual(server.load_config(self.root),{'port':8080})
  for text in ['{}','{"future": {"host":"0.0.0.0"}}','{"port":8080}','{"port":8090,"host":"0.0.0.0"}']:
   self.assertEqual(self.config(text)['port'],8090 if '8090' in text else 8080)
 def test_bounds(self):
  for n in [1024,8080,8090,65535]:self.assertEqual(self.config(json.dumps({'port':n})),{'port':n})
 def test_invalid_values(self):
  for n in ['8080',True,False,None,8080.0,8080.5,0,1023,65536,-1,[],{}]:
   with self.subTest(value=n),self.assertRaisesRegex(ValueError,'whole JSON number'):self.config(json.dumps({'port':n}))
 def test_invalid_json_and_root(self):
  for text in ['','{','{"port":8080,}','{"future":NaN}']:
   with self.subTest(text=text),self.assertRaisesRegex(ValueError,'valid JSON'):self.config(text)
  for text in ['[]','null','8080','true']:
   with self.assertRaisesRegex(ValueError,'JSON object'):self.config(text)
class ConfigProcessTests(LauncherTests):
 # Inherits the full security/lifecycle suite, with a real adjacent config file.
 def test_configured_wrapper_and_conflict(self):
  (self.root/'config.json').write_text(json.dumps({'port':self.port,'host':'0.0.0.0'}))
  p=subprocess.Popen(['/bin/sh',str(self.root/'Start Mii Editor.command'),'--no-browser'],cwd='/',env={**os.environ,'MII_PYTHON':sys.executable,'MII_NO_PAUSE':'1'},stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True);self.procs.append(p)
  import time
  for _ in range(100):
   try:
    if self.request('/')[0]==200:break
   except OSError:pass
   time.sleep(.03)
  else:self.fail('config readiness failed')
  bound=subprocess.run([sys.executable,str(self.root/'serve.py'),'--no-browser'],capture_output=True,text=True);self.assertEqual(bound.returncode,42);self.assertIn('127.0.0.1:'+str(self.port),bound.stdout)
  p.terminate();self.assertEqual(p.wait(timeout=5),0);output=p.stdout.read();self.assertIn('Open: http://127.0.0.1:'+str(self.port)+'/',output)
  # Same configured origin is available immediately after clean shutdown.
  self.start(script=True,env={'MII_PYTHON':sys.executable})
 def test_configured_readiness_browser_and_link(self):
  (self.root/'config.json').write_text(json.dumps({'port':self.port}))
  observed=[];out=io.StringIO()
  def browser(url):
   observed.append(url);self.assertEqual(self.request('/')[0],200);os.kill(os.getpid(),__import__('signal').SIGTERM)
  with patch.object(server,'__file__',str(self.root/'serve.py')),patch.object(server,'open_browser',browser),patch.object(server,'supports_hyperlink',return_value=True),contextlib.redirect_stdout(out):self.assertEqual(server.main([]),0)
  url='http://127.0.0.1:'+str(self.port)+'/'
  self.assertEqual(observed,[url]);self.assertIn('Open: '+url,out.getvalue());self.assertIn('\033]8;;'+url,out.getvalue())
 def test_invalid_config_fails_instead_of_binding(self):
  (self.root/'config.json').write_text('{"port":true}')
  r=subprocess.run([sys.executable,str(self.root/'serve.py'),'--no-browser'],capture_output=True,text=True);self.assertEqual(r.returncode,1);self.assertIn('config.json',r.stdout)
if __name__=='__main__':unittest.main()
