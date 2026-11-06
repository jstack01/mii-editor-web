"""Real foreground process/HTTP checks; POSIX tests report the actual host only."""
import contextlib, http.client, importlib.util, io, os
from pathlib import Path
import shutil, signal, socket, subprocess, sys, tempfile, time, unittest
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location('server',ROOT/'distribution/serve.py');server=importlib.util.module_from_spec(spec);spec.loader.exec_module(server)
class LauncherTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory(prefix='Mii space 水 ');self.addCleanup(self.tmp.cleanup);self.root=Path(self.tmp.name)
        for p in (ROOT/'distribution').iterdir():
            if p.is_file():shutil.copy2(p,self.root/p.name)
        site=self.root/'website';site.mkdir();(site/'index.html').write_text('<h1>Mii</h1>');(site/'app.js').write_text('export {}');(site/'x.svg').write_text('<svg/>');(site/'style.css').write_text('body{}');(site/'secret.py').write_text('no');(site/'.hidden').write_text('no');(site/'empty').mkdir();(self.root/'outside.txt').write_text('private');(site/'escape.txt').symlink_to(self.root/'outside.txt')
        with socket.socket() as s:s.bind(('127.0.0.1',0));self.port=s.getsockname()[1]
        self.procs=[];self.addCleanup(self.stop_all)
    def stop_all(self):
        for p in self.procs:
            if p.poll() is None:p.terminate();p.wait(timeout=5)
            if p.stdout:p.stdout.close()
    def start(self,extra=(),env=None,script=False):
        cmd=['/bin/sh',str(self.root/'Start Mii Editor.command')] if script else [sys.executable,str(self.root/'serve.py')]
        p=subprocess.Popen(cmd+['--port',str(self.port),'--no-browser',*extra],cwd='/',env={**os.environ,'MII_NO_PAUSE':'1',**(env or {})},stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True);self.procs.append(p)
        for _ in range(100):
            if p.poll() is not None:raise AssertionError(p.stdout.read())
            try:
                if self.request('/')[0]==200:return p
            except OSError:pass
            time.sleep(.03)
        self.fail('readiness timeout')
    def request(self,path,method='GET',host=None):
        c=http.client.HTTPConnection('127.0.0.1',self.port,timeout=2);c.request(method,path,headers={'Host':host or '127.0.0.1:'+str(self.port)});r=c.getresponse();result=r.status,r.getheader('Content-Type'),r.read();c.close();return result
    def test_http_root_mime_and_security(self):
        self.start()
        for path,mime in [('/','text/html'),('/app.js','application/javascript'),('/x.svg','image/svg+xml'),('/style.css','text/css')]:
            status,content,_=self.request(path);self.assertEqual(status,200);self.assertTrue(content.startswith(mime))
        self.assertEqual(self.request('/',method='HEAD')[2],b'')
        c=http.client.HTTPConnection('127.0.0.1',self.port,timeout=2);c.request('GET','/');r=c.getresponse();self.assertEqual(r.getheader('Referrer-Policy'),'no-referrer');self.assertEqual(r.getheader('X-Content-Type-Options'),'nosniff');r.read();c.close()
        for path in ['/../outside.txt','/%2e%2e/outside.txt','/%5coutside.txt','/%00','/%ff','/%zz','/C:foo','/.hidden','/escape.txt']:
            self.assertIn(self.request(path)[0],[403,404],path)
        for path in ['/serve.py','/config.json','/secret.py','/empty/']:self.assertEqual(self.request(path)[0],404)
        self.assertEqual(self.request('/',host='evil.example')[0],421)
        for method in ['POST','PUT','DELETE','PATCH','CONNECT','OPTIONS']:self.assertEqual(self.request('/',method)[0],405)
    def test_busy_port_no_fallback_or_browser(self):
        p=self.start();r=subprocess.run([sys.executable,str(self.root/'serve.py'),'--port',str(self.port)],capture_output=True,text=True);self.assertEqual(r.returncode,42);self.assertIn('No other port',r.stdout);self.assertIsNone(p.poll())
    def test_signals_restart_and_no_child_server(self):
        for sig in [signal.SIGINT,signal.SIGTERM,signal.SIGHUP]:
            p=self.start();p.send_signal(sig);self.assertEqual(p.wait(timeout=5),0)
            self.assertIn('Mii Editor stopped',p.stdout.read())
            with self.assertRaises(OSError):self.request('/')
    def test_wrapper_unicode_path_and_missing_python(self):
        self.start(script=True,env={'MII_PYTHON':sys.executable})
        r=subprocess.run(['/bin/sh',str(self.root/'Start Mii Editor.command')],env={**os.environ,'MII_PYTHON':'/does-not-exist','MII_NO_PAUSE':'1'},capture_output=True,text=True);self.assertEqual(r.returncode,1);self.assertIn('Nothing was installed',r.stdout)
    @unittest.skipUnless(sys.platform=='darwin','macOS stub protection')
    def test_apple_python_stub_is_never_invoked(self):
        alias=self.root/'python3';alias.symlink_to('/usr/bin/python3')
        r=subprocess.run(['/bin/sh',str(self.root/'Start Mii Editor.command')],env={**os.environ,'MII_PYTHON':str(alias),'MII_NO_PAUSE':'1'},capture_output=True,text=True);self.assertEqual(r.returncode,1);self.assertIn('installers were not opened',r.stdout)
    def test_browser_failure_and_terminal_hyperlink(self):
        out=io.StringIO()
        with patch.object(server.webbrowser,'open',return_value=False),contextlib.redirect_stdout(out):server.open_browser('http://127.0.0.1:8080/')
        self.assertIn('Copy the Open address',out.getvalue())
        with patch.object(server,'supports_hyperlink',return_value=True),contextlib.redirect_stdout(out):server.show_address('http://127.0.0.1:8080/')
        self.assertIn('\033]8;;http://127.0.0.1:8080/',out.getvalue());self.assertIn('Open: http://127.0.0.1:8080/',out.getvalue())
    def test_readiness_before_browser(self):
        import threading
        seen=[]
        def browser(url):
            seen.append(self.request('/')[0]);os.kill(os.getpid(),signal.SIGTERM)
        # Run main in this process so a real browser callback can confirm HTTP readiness.
        with patch.object(server,'__file__',str(self.root/'serve.py')),patch.object(server,'open_browser',browser),contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(server.main(['--port',str(self.port)]),0)
        self.assertEqual(seen,[200])
    @unittest.skipIf(os.name=='nt','POSIX terminal hangup')
    def test_terminal_close_stops_foreground_server(self):
        import pty
        pid,fd=pty.fork()
        if pid==0:os.execve(sys.executable,[sys.executable,str(self.root/'serve.py'),'--port',str(self.port),'--no-browser'],os.environ)
        try:
            for _ in range(100):
                try:
                    if self.request('/')[0]==200:break
                except OSError:pass
                time.sleep(.03)
            else:self.fail('PTY readiness timeout')
            os.close(fd);fd=None
            for _ in range(100):
                done,status=os.waitpid(pid,os.WNOHANG)
                if done:break
                time.sleep(.03)
            else:self.fail('terminal hangup left server running')
            with self.assertRaises(OSError):self.request('/')
        finally:
            if fd is not None:os.close(fd)
            try:os.kill(pid,signal.SIGKILL)
            except ProcessLookupError:pass
if __name__=='__main__':unittest.main()
