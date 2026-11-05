"""Independent SWF binary checks plus synthetic timeline regression cases."""
import json
import os
from pathlib import Path
import struct
import unittest
import xml.etree.ElementTree as ET
import zlib
from collections import Counter

from recover_evidence import matrix, timeline, digest

ROOT = Path(os.environ.get('MII_PROJECT_ROOT', Path(__file__).resolve().parents[1]))
EVIDENCE = Path(os.environ.get('MII_EVIDENCE_ROOT', ROOT / 'evidence'))

class Bits:
    def __init__(self, data, byte=0):
        self.data, self.bit = data, byte * 8
    def u(self, count):
        value = 0
        for _ in range(count):
            value = value * 2 + ((self.data[self.bit // 8] >> (7 - self.bit % 8)) & 1)
            self.bit += 1
        return value
    def s(self, count):
        value = self.u(count)
        return value - (1 << count) if count and value & (1 << (count - 1)) else value
    def affine(self):
        a = d = 1
        b = c = 0
        if self.u(1):
            n = self.u(5)
            a, d = self.s(n) / 65536, self.s(n) / 65536
        if self.u(1):
            n = self.u(5)
            b, c = self.s(n) / 65536, self.s(n) / 65536
        n = self.u(5)
        return [a, b, c, d, self.s(n) / 20, self.s(n) / 20]


def original_swf(path):
    data = path.read_bytes()
    data = data[:8] + zlib.decompress(data[8:]) if data[:3] == b'CWS' else data
    n = data[8] >> 3
    start = 8 + (5 + n * 4 + 7) // 8 + 4
    counts, matrices = Counter(), {}
    def tags(data, start, owner):
        cursor, own = start, []
        while cursor < len(data):
            header = struct.unpack_from('<H', data, cursor)[0]
            cursor += 2
            kind, size = header >> 6, header & 63
            if size == 63:
                size = struct.unpack_from('<I', data, cursor)[0]
                cursor += 4
            body = data[cursor:cursor+size]
            cursor += size
            counts[kind] += 1
            if kind == 39:
                tags(body, 4, struct.unpack_from('<H', body)[0])
            elif kind in (26, 70):
                flags = body[0]
                offset = 3 if kind == 26 else 4
                flags2 = body[1] if kind == 70 else 0
                if kind == 70 and (flags2 & 8 or (flags2 & 16 and flags & 2)):
                    offset = body.index(b'\0', offset) + 1
                if flags & 2:
                    offset += 2
                own.append(Bits(body, offset).affine() if flags & 4 else None)
            if kind == 0:
                break
        matrices[owner] = own
    tags(data, start, 0)
    return counts, matrices


class TimelineTests(unittest.TestCase):
    def test_move_inherits_transform_and_name_but_new_placement_resets(self):
        tags = ET.fromstring('''<tags>
          <item type="PlaceObject2Tag" depth="1" characterId="10" name="part" placeFlagMove="false"><matrix scaleX="2" translateX="40" /></item>
          <item type="ShowFrameTag"/>
          <item type="PlaceObject2Tag" depth="1" characterId="11" placeFlagMove="true"/>
          <item type="ShowFrameTag"/>
          <item type="RemoveObject2Tag" depth="1"/>
          <item type="ShowFrameTag"/>
          <item type="PlaceObject2Tag" depth="1" characterId="12" placeFlagMove="false"/>
          <item type="ShowFrameTag"/>
        </tags>''')
        frames = timeline(list(tags), 4)['frames']
        self.assertEqual(frames[0]['displayList'][0]['characterId'], 10)
        self.assertEqual(frames[1]['displayList'][0]['matrixPx'], [2, 0, 0, 1, 2, 0])
        self.assertEqual(frames[1]['displayList'][0]['name'], 'part')
        self.assertEqual(frames[2]['displayList'], [])
        self.assertEqual(frames[3]['displayList'][0]['matrixPx'], [1, 0, 0, 1, 0, 0])
        self.assertIsNone(frames[3]['displayList'][0]['name'])

    def test_affine_order_negative_translation_and_fixed_precision(self):
        self.assertEqual(matrix(ET.fromstring('<matrix scaleX="-1" scaleY="2" rotateSkew0="0.5" rotateSkew1="-0.25" translateX="-31" translateY="42"/>')), [-1, 0.5, -0.25, 2, -1.55, 2.1])
        self.assertEqual(matrix(ET.fromstring('<matrix scaleX="1.4285736"/>'))[0], 93623 / 65536)

    def test_bad_frame_count_and_orphan_moves_fail(self):
        with self.assertRaises(ValueError):
            timeline([], 1)
        with self.assertRaises(ValueError):
            timeline([ET.fromstring('<item type="PlaceObject2Tag" depth="1" placeFlagMove="true"/>')], 1)


class OriginalEvidenceTests(unittest.TestCase):
    def test_manifest_matches_binary_tags_and_all_placement_matrices(self):
        ids = {1: 'ShowFrameTag', 26: 'PlaceObject2Tag', 70: 'PlaceObject3Tag', 28: 'RemoveObject2Tag', 39: 'DefineSpriteTag', 43: 'FrameLabelTag', 76: 'SymbolClassTag', 82: 'DoABC2Tag'}
        for module in ('assets', 'classicGUI'):
            with self.subTest(module=module):
                m = json.loads((EVIDENCE / 'manifests' / f'{module}.json').read_text())
                source = ROOT / m['source']['path']
                self.assertEqual(m['source']['sha256'], digest(source))
                counts, matrices = original_swf(source)
                for code, name in ids.items():
                    self.assertEqual(counts[code], m['tagCountsRecursive'].get(name, 0), name)
                xml = ET.parse(EVIDENCE / 'raw' / f'{module}.xml').getroot()
                xml_lists = {0: list(xml.find('tags'))}
                xml_lists.update({int(s.get('spriteId')): list(s.find('subTags')) for s in xml.iter('item') if s.get('type') == 'DefineSpriteTag'})
                for owner, expected in matrices.items():
                    actual = [matrix(tag.find('matrix')) if tag.find('matrix') is not None else None for tag in xml_lists[owner] if tag.get('type') in ('PlaceObject2Tag', 'PlaceObject3Tag')]
                    self.assertEqual(expected, actual, f'all fixed-point matrices for owner {owner}')
                self.assertEqual(m['validation']['unresolvedPlacementReferences'], [])

    def test_known_root_layout_and_blank_symbol_frames(self):
        m = json.loads((EVIDENCE / 'manifests/classicGUI.json').read_text())
        self.assertEqual(m['rootTimeline']['frameCount'], 14)
        basic = m['rootTimeline']['frames'][1]
        self.assertEqual(basic['labels'], ['frame_basic'])
        name = next(p for p in basic['displayList'] if p.get('name') == 'nameText')
        self.assertEqual(name['characterId'], 379)
        self.assertEqual(name['matrixPx'], [1, 0, 0, 1, 243.05, 146.85])
        self.assertTrue(any(p.get('name') == 'updateFPMessage' for p in basic['displayList']))
        a = json.loads((EVIDENCE / 'manifests/assets.json').read_text())
        self.assertEqual(a['registrations']['0'], 'mii.display.MiiCharacterGraphics')
        self.assertEqual(a['symbols']['36']['timeline']['frameCount'], 72)
        self.assertEqual(a['symbols']['36']['timeline']['frames'][1]['displayList'], [])
        self.assertEqual(a['symbols']['36']['timeline']['frames'][2]['displayList'], [])
        self.assertTrue(all((ROOT / path).exists() for mod in (a, m) for s in mod['symbols'].values() for path in s['extractedExports']))

    def test_protected_inputs_unchanged(self):
        expected = json.loads((EVIDENCE / 'protected-inputs.sha256.json').read_text())
        current = {str(p.relative_to(ROOT)): digest(p) for d in ('SOURCE', 'EXTRACTED-SWF') for p in (ROOT / d).rglob('*') if p.is_file()}
        # Finder added EXTRACTED-SWF/.DS_Store between milestones, before Phase 2.
        # Keep every Phase 1 tracked hash immutable; a separate Phase 2 baseline
        # additionally protects the full current tree without rewriting history.
        self.assertEqual({path: current.get(path) for path in expected}, expected)
        phase2 = EVIDENCE / 'phase2/protected-inputs.sha256.json'
        if phase2.exists():
            self.assertEqual(current, json.loads(phase2.read_text()))
        else:
            self.assertEqual(current, expected)

if __name__ == '__main__':
    unittest.main()
