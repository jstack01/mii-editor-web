"""Integration-analysis safeguards, separate from the production editor."""
import binascii
import importlib.util
import json
import hashlib
from unittest.mock import patch
from pathlib import Path
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('database_probe', ROOT/'optional-tools/phase7a/database_probe.py')
probe = importlib.util.module_from_spec(spec); spec.loader.exec_module(probe)


def synthetic_database():
    # Factual container offsets; test data only, not a product database exporter.
    db = bytearray(probe.DATABASE_SIZE)
    db[:4] = b'RNOD'; db[7424:7428] = b'RNHD'
    return db


def checksum(db):
    db[127454:127456] = binascii.crc_hqx(db[:127454],0).to_bytes(2,'big')
    return db


class Phase7AnalysisTests(unittest.TestCase):
    def setUp(self):
        self.record = bytes.fromhex(json.loads((ROOT/'web/test-support/fixtures/mii-corpus.json').read_text())[0]['hex'])

    def test_raw_rcd_is_not_database(self):
        with self.assertRaises(ValueError): probe.inspect_database(self.record)

    def test_bad_headers_rejected(self):
        for pos in [0,7424]:
            db=synthetic_database();db[pos]=0
            with self.assertRaises(ValueError): probe.inspect_database(db)

    def test_crc_detects_change_inside_header(self):
        db=checksum(synthetic_database());self.assertTrue(probe.inspect_database(db)['crcValid'])
        db[100]^=1;self.assertFalse(probe.inspect_database(db)['crcValid'])

    def test_texture_tail_is_outside_header_crc(self):
        db=checksum(synthetic_database());db[-1]=1
        self.assertTrue(probe.inspect_database(db)['crcValid'])
        # This limited inspector explicitly does not validate texture/tail content.

    def test_all_100_slots_and_byte_order(self):
        db=synthetic_database();db[4+99*74:4+100*74]=self.record
        report=probe.inspect_database(checksum(db));entry=report['entries'][0]
        self.assertEqual(entry['slot'],99);self.assertEqual(entry['hex'],self.record.hex())
        self.assertEqual(entry['name'],'Random');self.assertEqual(entry['createId'],self.record[24:32].hex())

    def test_duplicate_uses_full_eight_bytes(self):
        db=synthetic_database();a=bytearray(self.record);a[24:32]=bytes.fromhex('8000000100000000')
        b=a[:];b[31]=1
        for i,r in enumerate([a,b,a]):db[4+74*i:4+74*(i+1)]=r
        self.assertEqual(probe.inspect_database(checksum(db))['duplicatePersistentIds'],[[0,2]])

    def test_temporary_and_zero_are_not_persistent_duplicates(self):
        db=synthetic_database()
        for i,identity in enumerate(['2000000000000000','2000000000000000','0000000000000000']):
            r=bytearray(self.record);r[24:32]=bytes.fromhex(identity);db[4+74*i:4+74*(i+1)]=r
        result=probe.inspect_database(checksum(db));self.assertEqual(result['duplicatePersistentIds'],[])
        self.assertEqual([e['idKind'] for e in result['entries']],['temporary','temporary','zero'])

    def test_existing_output_directory_and_sentinel_are_never_overwritten(self):
        with tempfile.TemporaryDirectory() as tmp:
            source=Path(tmp)/'reference.java';source.write_bytes(b'reviewed test source')
            out=Path(tmp)/'existing';out.mkdir();sentinel=out/'RFL_DB.dat';sentinel.write_bytes(b'precious original')
            with patch.object(probe,'REFERENCE_SHA256',hashlib.sha256(source.read_bytes()).hexdigest()), patch.object(probe.shutil,'which',return_value='existing-tool'):
                with self.assertRaises(FileExistsError):probe.build_reference([],out,source)
            self.assertEqual(sentinel.read_bytes(),b'precious original')

    def test_rejects_invalid_record_before_creating_directory(self):
        with tempfile.TemporaryDirectory() as tmp:
            out=Path(tmp)/'untouched'
            with self.assertRaises(ValueError):probe.build_reference([{'hex':'00'}],out)
            self.assertFalse(out.exists())

    def test_reference_download_requires_explicit_opt_in(self):
        with tempfile.TemporaryDirectory() as tmp:
            out=Path(tmp)/'untouched'
            with self.assertRaisesRegex(ValueError,'explicitly'):probe.build_reference([{'hex':self.record.hex()}],out)
            self.assertFalse(out.exists())

    def test_rejects_modified_upstream_without_writing_output(self):
        with tempfile.TemporaryDirectory() as tmp:
            source=Path(tmp)/'Util.java';source.write_text('unreviewed')
            out=Path(tmp)/'untouched'
            with self.assertRaisesRegex(ValueError,'hash differs'):probe.build_reference([],out,source)
            self.assertFalse(out.exists())

if __name__=='__main__':unittest.main()
