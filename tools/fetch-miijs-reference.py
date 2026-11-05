"""Fetch checksum-pinned, test-only MiiJS browser files. Never a production dependency."""
import argparse, hashlib, json, urllib.request
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('output',type=Path);args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
if args.output.resolve().is_relative_to(root):raise SystemExit('Use an external temporary output folder.')
refs=json.loads((root/'evidence/randomization-compatibility/references.json').read_text())
for name,digest in refs['sha256'].items():
 if not name.startswith('upstream/dist/') or not name.endswith('.js'):continue
 relative=name[len('upstream/'):];data=urllib.request.urlopen('https://raw.githubusercontent.com/Stewared/MiiJS/'+refs['miijsCommit']+'/'+relative).read()
 if hashlib.sha256(data).hexdigest()!=digest:raise SystemExit('Checksum mismatch: '+relative)
 dest=args.output/relative;dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(data)
print('Pinned independent MiiJS modules ready in',args.output)
