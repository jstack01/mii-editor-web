#!/usr/bin/env python3
"""Foreground, loopback-only static server. Python stdlib parses HTTP, not custom TCP."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import os
from pathlib import Path
import re
import signal
import stat
import sys
import threading
from urllib.parse import unquote, urlsplit
from urllib.request import ProxyHandler, Request, build_opener
import webbrowser

MIME = {'.html':'text/html; charset=utf-8','.js':'application/javascript','.mjs':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.gif':'image/gif','.ico':'image/x-icon','.webp':'image/webp','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf'}

class StaticHandler(SimpleHTTPRequestHandler):
    extensions_map = MIME
    def log_message(self, format, *args):
        pass  # Keep terminal output readable; never log shared character queries.
    def end_headers(self):
        self.send_header('Cache-Control','no-cache')
        self.send_header('X-Content-Type-Options','nosniff')
        super().end_headers()
    def list_directory(self, path):
        self.send_error(404,'No website page exists here.')
        return None
    def send_head(self):
        expected = '127.0.0.1:'+str(self.server.server_port)
        if self.headers.get('Host','') != expected:
            self.send_error(421,'Use the printed 127.0.0.1 address.')
            return None
        try:
            raw = urlsplit(self.path).path
            if re.search(r'%(?![0-9a-fA-F]{2})',raw):
                raise ValueError('Invalid URL encoding')
            decoded = unquote(raw,errors='strict')
            if not decoded.startswith('/') or any(c in decoded for c in ['\\','\0',':']):
                raise ValueError('Invalid path')
            parts = [p for p in decoded.split('/') if p]
            if any(p.startswith('.') for p in parts):
                raise ValueError('Hidden/traversal path')
            root = Path(self.directory).resolve(strict=True)
            path = root
            for part in parts:
                path = path/part
                attributes = path.lstat()
                if stat.S_ISLNK(attributes.st_mode) or getattr(attributes,'st_file_attributes',0)&0x400:
                    raise ValueError('Links are not served')
            canonical = path.resolve(strict=True)
            if canonical != root and root not in canonical.parents:
                raise ValueError('Outside website')
            if canonical.is_dir():
                index = canonical/'index.html'
                if not index.is_file() or index.is_symlink():
                    self.send_error(404,'No website page exists here.')
                    return None
                info=index.lstat()
                if getattr(info,'st_file_attributes',0)&0x400:
                    raise ValueError('Links are not served')
            elif not canonical.is_file() or canonical.suffix.lower() not in MIME:
                self.send_error(404,'Only website assets are served.')
                return None
        except FileNotFoundError:
            self.send_error(404,'Website file not found.')
            return None
        except (OSError,ValueError,UnicodeError):
            self.send_error(403,'This path is not part of the website.')
            return None
        return super().send_head()
    def unsupported(self):
        self.send_error(405,'This server only reads website files.')
    do_POST=do_PUT=do_DELETE=do_PATCH=do_CONNECT=do_OPTIONS=unsupported

class LocalServer(ThreadingHTTPServer):
    daemon_threads=True
    block_on_close=False
    # POSIX reuse permits immediate restart after TIME_WAIT, without SO_REUSEPORT.
    # Windows uses exclusive binding instead of its unsafe SO_REUSEADDR semantics.
    allow_reuse_address=os.name != 'nt'
    def server_bind(self):
        # Exclusive binding also avoids Windows SO_REUSEADDR port sharing.
        if hasattr(__import__('socket'),'SO_EXCLUSIVEADDRUSE'):
            import socket
            self.socket.setsockopt(socket.SOL_SOCKET,socket.SO_EXCLUSIVEADDRUSE,1)
        super().server_bind()
        assert self.socket.getsockname()[0]=='127.0.0.1'

def supports_hyperlink(stream=sys.stdout):
    return stream.isatty() and (bool(os.environ.get('WT_SESSION') or os.environ.get('VTE_VERSION') or os.environ.get('KONSOLE_VERSION')) or os.environ.get('TERM_PROGRAM') in ['iTerm.app','WezTerm','vscode','ghostty'] or os.environ.get('TERM')=='xterm-kitty')

def show_address(url):
    print('\nMii Editor is running!\n')
    print('Open: '+url)
    if supports_hyperlink():
        print('\033]8;;'+url+'\033\\Open Mii Editor\033]8;;\033\\')
    print('\nYour browser should open automatically.')
    print('Press Ctrl+C to stop the server.')
    print('Closing this terminal window also stops the server.\n',flush=True)

def open_browser(url):
    try:
        opened=webbrowser.open(url)
    except Exception:
        opened=False
    if not opened:
        print('Your browser could not be opened. Copy the Open address above into your browser.',flush=True)

def fail(message, code=1):
    print(message,flush=True)
    if os.environ.get('MII_LAUNCHER')=='1' and os.environ.get('MII_NO_PAUSE')!='1' and sys.stdin.isatty():
        try:
            input('Press Enter to close. ')
        except (EOFError,KeyboardInterrupt):
            pass
    return code

def main(argv=None):
    if sys.version_info<(3,9):
        return fail('Python 3.9 or newer is needed. See START-HERE.md for optional installation instructions.')
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port',type=int,default=8080,help='Explicit override only; changing ports changes browser storage origin.')
    parser.add_argument('--no-browser',action='store_true',help='For terminal/testing use; normal launch opens the default browser.')
    args=parser.parse_args(argv)
    if not 1024<=args.port<=65535:
        return fail('Choose a port from 1024 to 65535. The normal address uses port 8080.')
    site=Path(__file__).resolve().parent/'website'
    try:
        linked=site.is_symlink() or bool(getattr(site.lstat(),'st_file_attributes',0)&0x400)
    except OSError:
        linked=True
    if linked or not (site/'index.html').is_file():
        return fail('The website folder is missing or linked elsewhere. Extract the complete ZIP and try again.')
    url='http://127.0.0.1:'+str(args.port)+'/'
    try:
        server=LocalServer(('127.0.0.1',args.port),partial(StaticHandler,directory=str(site)))
    except OSError:
        print('Could not start Mii Editor on '+url)
        print('The port may already be in use. Close the other launcher or application and try again.')
        return fail('No other port was selected. Your saved Miis belong to this address.',42)
    stopped=threading.Event()
    handlers={}
    def stop(signum,frame):
        stopped.set()
    for name in ['SIGINT','SIGTERM','SIGHUP','SIGBREAK']:
        if hasattr(signal,name):
            sig=getattr(signal,name)
            try:
                handlers[sig]=signal.signal(sig,stop)
            except (ValueError,OSError):
                pass
    worker=threading.Thread(target=server.serve_forever,kwargs={'poll_interval':0.1},daemon=True,name='mii-static-server')
    try:
        worker.start()
        # Confirm our bound server actually answers HTTP before opening a browser.
        request=Request(url,method='HEAD')
        with build_opener(ProxyHandler({})).open(request,timeout=3) as response:
            if response.status!=200:
                raise OSError('Website readiness check failed')
        show_address(url)
        if not args.no_browser:
            threading.Thread(target=open_browser,args=(url,),daemon=True,name='mii-browser-open').start()
        while worker.is_alive() and not stopped.wait(0.2):
            pass
        return 0 if stopped.is_set() else 1
    except (OSError,ValueError):
        print('The website did not start correctly. Re-extract the ZIP and try again.',flush=True)
        return 1
    except KeyboardInterrupt:
        return 0
    finally:
        server.shutdown()
        server.server_close()
        worker.join(timeout=2)
        for sig,handler in handlers.items():
            signal.signal(sig,handler)
        print('Mii Editor stopped.',flush=True)

if __name__=='__main__':
    sys.exit(main())
