# Phase 2 data API

Phase 2 implements the data model; the browser screen remains the existing Phase 1 name preview. Original renderer/UI, file dialogs and persistence have not been added. No dependency was added for Phase 2.

## Binary and hex

```ts
import { MiiCharacterData } from './src/model/MiiCharacterData';
const character = MiiCharacterData.fromBytes(bytes); // exactly 74 bytes, strict
const fixture = MiiCharacterData.fromHex(hex);       // exactly 148 hex chars, strict
character.parseByteData(bytes);                    // false on wrong length; no mutation
character.setHexData(legacyText);                  // source-compatible permissive import
character.setData(bytesOrString);                  // original dispatch and caught errors
const copy = character.toBytes();                  // independent Uint8Array
const words = character.toWords();                 // independent 37-word Uint16Array
const hexString = character.toHex();               // canonical lowercase hex
```

Aliases `getData()` and `getHexData()` retain source method names. Binary serialization is big-endian regardless of host byte order. Strict decoders never invoke permissive user-import behavior. Legacy `setHexData` tokenizes alphanumeric pairs, accepts partial hex prefixes, zero pads short data, truncates excess data, and treats empty input as a no-op. Nonempty separator-only input loads zeros. Raw loads never clamp numeric fields.

## Fields, ranges and ordering

```ts
character.setValue('height', 90);         // AS3 int conversion, then declared clamp
const height = character.getValue('height');
const range = character.getMiiValue('height'); // MiiDataValue: min/max/value/span/percent
character.name = 'Mii';
character.creator = 'Creator';
character.setHex('id', '80-7f-5f-c2');
character.setHex('wii', '42-89-98-00');
const id = character.getValue('id');      // independent four-byte number array
const frame = character.getFrame('hairType'); // one-based original MovieClip frame
const value = character.frameToValue('hairType', frame);
```

All 45 numeric fields are declared in generated `src/generated/mii-schema.ts`. `MII_FIELDS` gives word/shift/width/min/max; `MII_VALUE_NAMES` preserves original iteration/XML/random order; `MII_PERMUTATIONS` preserves every eye/eyebrow/hair/nose/mouth mapping. `Range` and `MiiDataValue` implement original arithmetic, normalization, stepping, clamping and bit isolation. Writes preserve every bit outside the addressed field; unknown fields return null/false as appropriate. The renderer can use `getMiiValue(...).getValuePercent()` together with its original geometric ranges in Phase 3.

Both names use ten UTF-16 code units. Writes zero pad; reads skip every zero; truncation may split a surrogate. Mii/Wii IDs are four bytes each, not six-byte MAC addresses. `getHex()` preserves the legacy formatting bug for bytes 10–15 (`a`–`f` without a leading zero). Hyphen-delimited IDs still re-import correctly. Raw `toHex()` is always two characters per byte.

## XML

```ts
const text = character.toXMLString();     // source declarations + mii-collection
const root = character.getXMLData();      // DOM Element; browser required
const parsed = MiiCharacterData.fromXML(text); // throws on parse/import errors
character.parseXMLData(textOrElementOrDocument); // may throw after partial mutation
character.setXMLData(text);               // original string wrapper swallows errors
```

XML import uses native browser DOMParser; no parser package, network requests or document insertion is used. XML string export and the other data operations work without a DOM. Node unit tests cover XML string export; native browser tests exercise XML import and semantic round trips.

The first direct `mii` child is imported (or a `mii` root). Names, creator and ordered `data` entries are read. The embedded `mii/@value` hex is ignored. Numeric `format` attributes are informational. Y values/mingle/type permutations use the original inversions and lookup order. Repeated fields are applied in order, so the final value wins; data entries may override name/creator. Unknown fields are ignored.

Import resets all words before assigning fields, clearing reserved and unspecified bits. A malformed XML syntax error occurs before reset. A well-formed input missing name/creator can throw after reset or after a partial name write, exactly as source control flow indicates; the string `setXMLData` wrapper swallows that error. Its Element/Document overload propagates errors like the original XML-object overload. `setData` always catches errors. None of these wrappers promises rollback.

E4X defaults trim XML whitespace from parsed text nodes and ignore comments/PIs. Original external DTD/style declarations are retained as inert metadata. Internal DTD subsets and complex element-valued name/creator content are explicitly unsupported and documented rather than approximated. General E4X expression syntax, custom parser settings and exotic namespace constructs are not certified. XML serialization preserves document semantics, field order, header and values; incidental pretty-printing/self-closing tag choices are not a byte-identical E4X claim. XML round trips need not preserve raw reserved bits or invalid packed values; valid fully defined data and the original default round trip correctly.

## Randomization

```ts
character.randomize();             // original inclusive uniform integer algorithm
character.randomize(() => 0.5);    // deterministic test injection
```

Exactly 49 draws: the 45 `MII_VALUE_NAMES` entries in source order, followed by the four Mii ID bytes in order. Names become `Random` and `Mii Editor`. Wii ID and unused bits are retained. No plausibility filtering or new generation rules are introduced.

## Provenance and verification

`node scripts/generate-source-data.mjs` extracts default data, schema and permutation tables read-only from the ActionScript and records its SHA-256. `--check` fails on stale generated files; `--manifest` also writes `../evidence/phase2/schema.json`. Build/dev regenerate; tests check provenance. `src/model/compatibility.test.ts` independently reads source declarations for expected masks/ranges/order and uses arithmetic byte oracles, not the implementation's own masks. The original Phase 1 tests remain unchanged.

`pnpm test` covers 189 unit cases, including exhaustive allowed numeric values and boundary writes. `pnpm test:browser` includes 62 XML cases in native Chrome in addition to the existing UI checks. `pnpm test:browser:production` checks the production UI. `pnpm typecheck` and `pnpm build` validate the compiled app. Tests exercise source/language-derived behavior; they are not a differential certification against an executed original Flash VM. Cross-browser XML validation remains future release work.

The data model now supplies the fields, normalized percentages, source frame mappings, names/IDs, and interchange needed for the Phase 3 character renderer. Phase 3 must still implement original graphics composition, color transforms, geometry, layer ordering and reference-image validation.

## Wii decoder compatibility clarification (post Phase 5A)

The ranges above describe the original Flash editor, not a Nintendo conformance certificate. In particular moleSize is source-defined 0–15 while Wii RCD decoders/RFL permit 0–8. The unchanged original randomizer can generate 9–15. DS fallback diagnostics must not be interpreted as Wii field values. See WII_COMPATIBILITY.md and evidence/randomization-compatibility/FIELD_COMPARISON.md for all-field decoding, ID/calendar/padding constraints and the nonblocking export warning. No data is silently repaired.
