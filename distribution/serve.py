#!/usr/bin/env python3
"""Loopback-only static server for a prebuilt release; no application backend."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys
import webbrowser

class StaticHandler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, '.js': 'application/javascript', '.mjs': 'application/javascript', '.css': 'text/css'}
    def list_directory(self, path):
        self.send_error(404)
        return None
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()
    def log_message(self, format, *args):
        # A shared URL may contain personal character data. Do not log queries.
        print(self.command, self.path.split('?', 1)[0], flush=True)

def main():
    if sys.version_info < (3, 9):
        raise SystemExit('Python 3.9 or newer is required. Install Python 3 from python.org.')
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8765)
    parser.add_argument('--no-browser', action='store_true')
    args = parser.parse_args()
    site = Path(__file__).resolve().parent / 'website'
    if not (site / 'index.html').is_file():
        raise SystemExit('website/index.html is missing. Extract the complete prebuilt release ZIP first.')
    if not 1 <= args.port <= 65535:
        raise SystemExit('Choose a port from 1 to 65535.')
    try:
        server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(StaticHandler, directory=str(site)))
    except OSError as error:
        raise SystemExit('Cannot start the local server: '+str(error)+'. Stop an existing instance or choose --port 8766.')
    url = 'http://127.0.0.1:'+str(args.port)+'/'
    print('Mii Editor Web: '+url+' — press Ctrl+C to stop.', flush=True)
    if not args.no_browser:
        try:
            webbrowser.open(url)
        except Exception:
            print('Open the address above in your browser.', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nStopped.', flush=True)
    finally:
        server.server_close()

if __name__ == '__main__':
    main()
