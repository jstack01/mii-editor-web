#!/usr/bin/env python3
"""Stage the immutable preview.5 static release for an optional Pages demo. No upload."""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import shutil
from urllib.request import urlopen
import zipfile

ROOT = Path(__file__).resolve().parents[1]
VERSION = 'v0.1.0-preview.5'
REVISION = '27da544cb9b8e1feac14001e4de65529d440b549'
ARCHIVE = 'mii-editor-web-static-' + VERSION + '.zip'
SHA256 = 'f1ec763e6932537283c7cb6b009c8aa7e325192198048e368670283adaa2252e'
URL = 'https://github.com/jstack01/mii-editor-web/releases/download/' + VERSION + '/' + ARCHIVE
OUTPUT = ROOT / 'release/pages-site'
FOOTER = '''<footer style="max-width:640px;margin:1.5rem auto;padding:0 1rem;font:14px/1.5 system-ui;color:#34484b"><p><strong>AI-generated / vibe-coded project — unmaintained.</strong> Unofficial, provided as-is. No Nintendo affiliation or endorsement. Software validation does not guarantee every Wii console or game.</p><p>Original materials: <a href="https://mii-editor.nekoweb.org/" rel="noreferrer">mii-editor.nekoweb.org</a> and <a href="https://archive.org/details/mii-editor" rel="noreferrer">Internet Archive</a>; original developer credited as senocular.</p><p><a href="./LICENSE.md">Licensing</a> · <a href="./NOTICES.md">Credits and unresolved historical asset rights</a> · <a href="https://github.com/jstack01/mii-editor-web" rel="noreferrer">Project and downloads</a></p><p>Edits stay in your browser. Opening a shared URL sends its Mii query to GitHub; GitHub Pages logs visitor IP addresses. Browser saves are specific to this browser origin. No application analytics or accounts.</p></footer>'''


def prepare(archive):
    data = archive.read_bytes()
    if hashlib.sha256(data).hexdigest() != SHA256:
        raise ValueError('Static release checksum mismatch; refusing to stage.')
    with zipfile.ZipFile(archive) as z:
        prefix = 'mii-editor-web-static-' + VERSION + '/'
        names = z.namelist()
        if len(names) != len(set(names)):
            raise ValueError('Duplicate ZIP entries.')
        for name in names:
            path = PurePosixPath(name)
            if not name.startswith(prefix) or path.is_absolute() or '..' in path.parts:
                raise ValueError('Unexpected ZIP path.')
        build = json.loads(z.read(prefix + 'BUILD-INFO.json'))
        if build['version'] != VERSION or build['commit'] != REVISION or build['uncommittedSource']:
            raise ValueError('Unexpected release provenance.')
        for line in z.read(prefix + 'FILES.sha256').decode().splitlines():
            digest, name = line.split('  ', 1)
            if hashlib.sha256(z.read(prefix + name)).hexdigest() != digest:
                raise ValueError('Internal inventory mismatch: ' + name)
        required = {'index.html', 'BUILD-INFO.json', 'LICENSE.md', 'NOTICES.md', 'LICENSES/Vite-LICENSE.md'}
        entries = {n[len(prefix):]: z.read(n) for n in names
                   if n[len(prefix):] in required or n[len(prefix):].startswith('assets/')}
        if not required <= entries.keys() or not any(n.endswith('.js') for n in entries):
            raise ValueError('Missing production website files.')
    # Only this fixed staging folder is replaced; no user-supplied deletion path.
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir(parents=True)
    for name, content in entries.items():
        p = OUTPUT / name
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_bytes(content)
    p = OUTPUT / 'index.html'
    html = p.read_text()
    if html.count('</body>') != 1:
        raise ValueError('Unexpected production HTML.')
    html = html.replace('</head>', '<meta name="referrer" content="no-referrer"/></head>')
    p.write_text(html.replace('</body>', FOOTER + '</body>'))
    (OUTPUT / '.nojekyll').write_text('')
    report = {'version': VERSION, 'releaseRevision': REVISION, 'archiveSHA256': SHA256,
              'expectedURL': 'https://jstack01.github.io/mii-editor-web/',
              'applicationAssetsUnchanged': True, 'demoOnlyChanges': ['disclosure footer', 'no-referrer meta', '.nojekyll'],
              'files': {str(p.relative_to(OUTPUT)): hashlib.sha256(p.read_bytes()).hexdigest()
                        for p in sorted(OUTPUT.rglob('*')) if p.is_file()}, 'published': False}
    (ROOT / 'release/pages-preparation.json').write_text(json.dumps(report, indent=2) + '\n')
    print('Prepared ' + str(OUTPUT) + '; no GitHub setting changed and nothing published.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--archive', type=Path, help='Use an already downloaded exact static ZIP.')
    args = parser.parse_args()
    archive = args.archive or ROOT / 'release' / ARCHIVE
    if not archive.exists():
        if args.archive:
            raise SystemExit('Specified ZIP does not exist.')
        archive.parent.mkdir(parents=True, exist_ok=True)
        with urlopen(URL, timeout=60) as response:
            data = response.read()
        if hashlib.sha256(data).hexdigest() != SHA256:
            raise SystemExit('Downloaded ZIP checksum mismatch.')
        archive.write_bytes(data)
    prepare(archive)


if __name__ == '__main__':
    main()
