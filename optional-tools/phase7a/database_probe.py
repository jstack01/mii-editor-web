#!/usr/bin/env python3
"""Optional, offline-capable analysis. Never writes an existing database or NAND.

inspect reads a copy. build-reference creates a fresh directory and invokes the
pinned, unmodified external Java reference implementation, NOT an editor codec.
Downloading the reference requires the explicit --fetch-reference option.
"""
import argparse
import binascii
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import urllib.request

REFERENCE_COMMIT = 'ae6a5372b302f5036f82c21db6a050cff1c486b4'
REFERENCE_URL = ('https://raw.githubusercontent.com/Alex9303/Mii-Database-Editor/'
                 + REFERENCE_COMMIT + '/src/Util.java')
REFERENCE_SHA256 = '3b9f7f00a43d9c94ad4d66e8853aeec210bc798cf4c948d7ad41f16a509470af'
DATABASE_SIZE = 779968
CRC_OFFSET = 127454
RECORD_SIZE = 74


def inspect_database(data):
    """Observed layout, not an exhaustive Nintendo database validator."""
    if len(data) != DATABASE_SIZE:
        raise ValueError('Expected a 779968-byte RFL_DB.dat, not a raw .mii file.')
    if data[:4] != b'RNOD' or data[7424:7428] != b'RNHD':
        raise ValueError('Unrecognized database headers.')
    expected = binascii.crc_hqx(data[:CRC_OFFSET], 0)
    actual = int.from_bytes(data[CRC_OFFSET:CRC_OFFSET+2], 'big')
    entries, seen, duplicates = [], {}, []
    for slot in range(100):
        record = data[4+74*slot:4+74*(slot+1)]
        if not any(record):
            continue
        identity = bytes(record[24:32])
        first = int.from_bytes(identity[:4], 'big')
        temporary = bool(first & 0x20000000)
        valid_id = any(identity)
        if valid_id and not temporary:
            if identity in seen:
                duplicates.append([seen[identity], slot])
            else:
                seen[identity] = slot
        entries.append({'slot': slot, 'name': record[2:22].decode('utf-16-be', errors='replace').split('\0')[0],
                        'hex': record.hex(), 'createId': identity.hex(),
                        'idKind': 'zero' if not valid_id else 'temporary' if temporary else 'normal' if first & 0x80000000 else 'special'})
    return {'length': len(data), 'sha256': hashlib.sha256(data).hexdigest(),
            'crcValid': actual == expected, 'storedCRC': f'{actual:04x}', 'calculatedCRC': f'{expected:04x}',
            'occupiedSlots': len(entries), 'duplicatePersistentIds': duplicates, 'entries': entries,
            'scope': 'Header/CRC/record/ID inspection only; no ownership, glyph, game or hardware certification.'}


def build_reference(records, work_dir, reference=None, fetch=False):
    records = list(records)
    if len(records) > 100:
        raise ValueError('At most 100 records fit in this reference database.')
    for record in records:
        if not isinstance(record, dict) or not isinstance(record.get('hex'), str) or len(record['hex']) != 148:
            raise ValueError('Each record needs exactly 148 hexadecimal characters.')
        if len(bytes.fromhex(record['hex'])) != 74:
            raise ValueError('Invalid record length.')
    if reference:
        source = Path(reference).read_bytes()
    elif fetch:
        with urllib.request.urlopen(REFERENCE_URL, timeout=30) as response:
            source = response.read()
    else:
        raise ValueError('Supply local --reference Util.java, or explicitly allow --fetch-reference.')
    if hashlib.sha256(source).hexdigest() != REFERENCE_SHA256:
        raise ValueError('Reference hash differs from the reviewed upstream version.')
    for tool in ['javac', 'java']:
        if not shutil.which(tool):
            raise ValueError('This optional analysis needs an already-installed Java JDK; nothing is installed automatically.')
    work_dir = Path(work_dir).resolve()
    # mkdir without exist_ok is intentional: no live/preexisting directory is accepted.
    work_dir.mkdir(parents=False, exist_ok=False)
    (work_dir/'Util.java').write_bytes(source)
    shutil.copyfile(Path(__file__).with_name('ReferenceDatabase.java'), work_dir/'ReferenceDatabase.java')
    (work_dir/'records.hex').write_text('\n'.join(r['hex'] for r in records)+'\n', encoding='ascii')
    subprocess.run(['javac', 'Util.java', 'ReferenceDatabase.java'], cwd=work_dir, check=True)
    subprocess.run(['java', '-cp', str(work_dir), 'ReferenceDatabase', 'records.hex', 'RFL_DB.dat'], cwd=work_dir, check=True)
    report = inspect_database((work_dir/'RFL_DB.dat').read_bytes())
    if not report['crcValid']:
        raise ValueError('Independent reference CRC did not match the standard-library calculation.')
    for i, record in enumerate(records):
        actual = (work_dir/'RFL_DB.dat').read_bytes()[4+74*i:4+74*(i+1)].hex()
        if actual != record['hex'].lower():
            raise ValueError('Reference insertion changed a record.')
    (work_dir/'records.json').write_text(json.dumps(records, indent=2)+'\n')
    (work_dir/'report.json').write_text(json.dumps(report, indent=2)+'\n')
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    inspect = sub.add_parser('inspect'); inspect.add_argument('database', type=Path)
    build = sub.add_parser('build-reference')
    inputs = build.add_mutually_exclusive_group(required=True)
    inputs.add_argument('--records', type=Path); inputs.add_argument('--mii', type=Path)
    build.add_argument('--work-dir', type=Path, required=True); build.add_argument('--reference', type=Path)
    build.add_argument('--fetch-reference', action='store_true')
    args = parser.parse_args()
    try:
        report = inspect_database(args.database.read_bytes()) if args.command == 'inspect' else build_reference(
            ([{'name': args.mii.name, 'hex': args.mii.read_bytes().hex()}] if args.mii else json.loads(args.records.read_text())),
            args.work_dir, args.reference, args.fetch_reference)
        print(json.dumps(report, indent=2))
        return 0 if report['crcValid'] else 1
    except (ValueError, OSError, subprocess.CalledProcessError) as error:
        parser.exit(1, 'Analysis stopped: '+str(error)+'\n')

if __name__ == '__main__':
    raise SystemExit(main())
