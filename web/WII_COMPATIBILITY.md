# Randomized .mii compatibility investigation

## Finding

No TypeScript randomizer, packing or file-export defect was found. The 74-byte Wii record length is correct. All seven supplied records round-trip through the current model and actual browser Blob downloads unchanged. All 45 numeric fields match the original Flash ranges. All four working records pass the independent Wii RCD decoder; all three failing records fail **only moleSize** in that decoder.

| Record | Wii mole size | Wii eyebrow size | Wii eyebrow Y | Wii birth month | Separate DS NCD failure |
| --- | --- | --- | --- | --- | --- |
| FAIL-1 | 9 | 5 | 9 | 10 | eyebrowSize 10 |
| FAIL-2 | 11 | 0 | 7 | 1 | birthMonth 13 |
| FAIL-3 | 14 | 2 | 3 | 11 | eyebrowYPosition 20 |

MiiJS tries RCD (Wii big-endian) and NCD (DS with endian changes), both 74 bytes. Its diagnostics identify a first failed field for each attempted format. The reported eyebrow/month errors are accurate for the attempted DS interpretation, but are not Wii field values. Larger-format length errors are unrelated detection failures. An isolated run of unmodified MiiJS reproduces the user's messages exactly. No InfiniMii upload or live-server processing was required. The inspected public MiiJS revision is pinned; this does not assert that the deployed server runs that exact revision.

## Original behavior versus Wii limits

Both extracted applications contain identical MiiCharacterData.as, Range.as and MiiDataValue.as. The original declaration is `defineValue("moleSize",MOLE,11,4)` with no explicit max. The wrapper defaults max to zero, and MiiDataValue replaces zero with `2^width - 1`, hence 15. The randomizer visits all 45 numeric values then four ID bytes, using `min + floor((max-min+1)*Math.random())`, and sets Random/Mii Editor names. It does not skip hidden/inactive features or constrain mole size to 8. Values 9–15 therefore occur with probability 7/16 under independent uniform draws. This is demonstrated source behavior, not evidence that the original author deliberately intended nonstandard Wii data rather than omitted a bound.

Eyebrow size has explicit 0–8, eyebrow Y 3–18 and birth month 0–12. Original randomization cannot produce the reported DS-only violations in these Wii fields. The migration's earlier mole 0–15 description was correct for the Flash application; it should not have been read as a Nintendo-compatible range. Wii RCD/MiiJS and the independently inspected RFL decompilation constrain mole scale to 0–8. There is no evidence that InfiniMii should accept 9–15 as valid Wii values.

A deterministic 10,000-record run (xorshift32 seed 0x5a74) compares every byte to an independent arithmetic oracle parsed directly from ActionScript declarations. All 10,000 match. MiiJS accepts 5,614 and rejects 4,386, all solely for moleSize. No other numeric field escapes the RCD scalar profile. Minimum/maximum draws, reserved-bit sentinels and all supplied files have separate regression tests.

Unmodified executable SWFs in Ruffle 0.7.1 wgpu-webgl produced 24 unique Random records, recovered through their original share field. Thirteen have mole sizes above 8, including 15. MiiJS independently validates those records with the same scalar outcome. This corroborates the source; Ruffle is an emulator, not Adobe Flash or hardware certification. Its randomness was not seeded and the captured sample is not a statistical distribution guarantee.

## Additional hardware constraints

MiiJS scalar acceptance is insufficient to certify a real Wii import. The inspected ogws RFL reconstruction defines CreateID across bytes 24–31, considers an all-zero eight-byte ID invalid, marks bit 29 temporary (not valid on NAND in VERSION_RSPE01_01), and considers a valid nontemporary ID special when bit 31 is clear. That revision requires a special Mii to be local-only, and validates actual month/day combinations (including Feb 29). Flash randomizes all bits of the first four ID bytes and preserves the other four; it does not enforce these relationships.

In the deterministic run, 5,014 records have temporary IDs, 1,222 have a special-ID/mingling conflict and 1,196 fail the calendar rule. These categories overlap. FAIL-1 has a special/mingling conflict; FAIL-2 has the temporary flag; FAIL-3 has a special/mingling conflict **and November 31**. Even changing just its mole to 8 makes FAIL-3 pass MiiJS while leaving those hardware cautions. Some user-labeled working files also have temporary IDs. No flags were normalized.

The read-only audit also checks preserved padding and upper bits that RFL groups into wider rotation/scale fields. Source/MiiJS sometimes label these upper bits unknown/disabled instead. Nonzero padding is reported cautiously, not assumed invalid. It checks full-byte body dimensions, source type bits remain preserved, and no system ID is assigned to a real console. Name validity/glyph support, database uniqueness, ownership/console context, destination permissions and container/checksum requirements remain outside this audit. RFL revision differences exist: the inspected body constants permit 128 while the ordinary editor/MiiJS profile is 0–127. A 74-byte RCD has no trailing CRC; RSD/database/remote containers require their own correct checksums. Do not pad a file to 76 bytes as a repair.

These references are open-source decoder implementations and a decompilation, not a published Nintendo conformance specification or a physical-Wii test.

## Least intrusive response and retesting

The original randomizer, model, ranges, import validation, XML behavior, renderer and .mii bytes remain unchanged. Save Mii now adds a **nonblocking, read-only** message below the original stage identifying out-of-RCD-range fields and applicable ID/calendar/padding cautions. It still downloads the authentic original 74 bytes. This uses the existing status area, with no replacement graphics or new dialog. No Wii mode or normalized-copy export was introduced, and no production dependency was added.

Run web/dev.sh, open http://127.0.0.1:5173/, choose File → Load, select any sample, then Save. Its downloaded bytes should still match the input, and known failures should still be rejected by InfiniMii: warnings do not repair them. For an explicit compatibility experiment, return to the editor, select Accessories → Mole, and decrease mole size to 8 or less before saving a separate file. This is a user edit and changes only that field. All three such temporary test copies pass local MiiJS RCD validation; original sample files remain untouched. Do not change eyebrows or month based on the DS fallback messages. Review the separate hardware cautions before attempting console transfer.

The approved direction now makes Wii-compatible creation, editing and randomization the standard after the tested reproduction baseline is committed. There will be no permanent legacy/Wii mode toggle. Imported legacy bytes must be preserved until explicitly corrected, with unresolved issues preventing Wii-compatible export claims. The earlier optional-mode proposal is superseded by MIGRATION_PLAN.md phases 6–8. This investigation's source arithmetic oracle and failing corpus remain historical fidelity evidence, separate from future corrected-behavior tests.

## Verification and evidence

265 unit tests, all existing XML/rendering/GUI/interaction/file browser suites in development and production, the new sample/random-download browser suite, TypeScript, production build and six Python recovery tests pass. The new browser suite verifies all seven imports/real downloads and 24 further seeded UI randomizations per build mode, including the unchanged in-memory bytes, persistence and warning text. Chrome download bursts are paced in the test harness to avoid its rate limiter. Firefox/WebKit runtimes remain unavailable. No protected SOURCE/EXTRACTED-SWF bytes or original sample bytes changed.

All-field/source/Wii comparison, pinned sources/hashes, unmodified MiiJS results, deterministic counts, Ruffle captures, regression reports and reproduction commands are in evidence/randomization-compatibility/. No Phase 5B work began during that investigation; the subsequently completed image work is documented in IMAGE_EXPORT.md.
