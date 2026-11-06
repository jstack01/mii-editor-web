**Milestone 6.1 presentation update:** original-download buttons are removed from the normal interface. Exact pending input and pre-repair bytes remain retained internally; cancellation, explicit repair approval and export blocking are unchanged. Optional read-only loading and diagnostics live under Advanced details. See [REPAIR_UX.md](REPAIR_UX.md); the older button descriptions below are historical Phase 6 behavior.

# Wii software compatibility profile — Phase 6

`Wii-RCD-persistent-v1` is the default application policy. There is no legacy generation mode or compatibility toggle. It validates standalone **74-byte, big-endian RCD records**, not a console database, transfer package, game save or hardware certificate. The completed, independently tested reproduction baseline is local Git commit `ebc0373`.

## Evidence and rule classifications

Pinned primary implementations: [MiiJS 3.1.1](https://github.com/Stewared/MiiJS/tree/de10c3c5237fbf18da88ac860f5c0ac7ad1a3b4b), and the [RFL decompilation](https://github.com/doldecomp/ogws/tree/e5a4d369011062fe243aa63f6c2e2853854c395d). File hashes are in `../evidence/randomization-compatibility/references.json`; the independently extracted RFL maxima, calendar and masks are in `../evidence/phase6/reference-rules.json`. A decompilation/revision is evidence, not an official universal Nintendo specification or a physical test.

| Rule | Evidence and status |
| --- | --- |
| 74 bytes, packing, scalar facial limits | RCD decoder layout and RFL fields/maxima; software-confirmed. No padding or invented checksum is added. |
| Mole size 0–8 | Both independent sources. Flash declared 0–15; this is an intentional correction. |
| Height/build 0–127 | Conservative intersection of decoder and original controls. The inspected RFL configuration permits **128**; this profile does not call 128 universally forbidden by Nintendo. Full 8-bit physical values are checked. |
| Birthday | Both zero means unset, otherwise valid month/day; February supports 29 because no year is stored. Calendar check appears under `VERSION_RSPE01_01` in RFL. This stricter persistent profile does not imply every RFL revision rejects every impossible date. |
| Complete CreateID nonzero | RFL checks the OR of both 32-bit halves of the eight-byte ID. A zero first half with nonzero system half is not incorrectly rejected. |
| Temporary bit `0x20000000` | RFL mask classification; inspected conditional NAND path rejects temporary IDs. Excluded from this **persistent** profile; temporary RAM records are not universally invalid. |
| Special and Mingle | Non-temporary, nonzero CreateID with normal bit `0x80000000` clear is special. Special must have local-only bit 269 set (Mingle off). Existing valid specials are preserved. Bit 30 alone is not invented as a universal invalidity rule. |
| Name starts nonzero | RFL text check. Creator can be empty. Visible fields stop at the first zero UTF-16 unit. |
| Well-formed UTF-16 | Additional application text-safety policy, not asserted as a Nintendo record requirement. Controls, supplementary characters and unsupported glyphs receive a warning; regional font support remains unverified. |
| Reserved/source bits | Nonzero uninterpreted padding/source flags produce advisory warnings and are preserved. No universal zero-padding requirement was established. Full known RFL fields are validated as explained below. |
| Owner/system identity, global uniqueness, destination containers | **Not verified.** Software acceptance does not establish ownership, editability, transferability, game acceptance or hardware safety. |

No supported scalar combination of gender, hairstyle or other ordinary features was found to require an invented aesthetic constraint. Only evidenced cross-field calendar and ID/Mingle rules are enforced.

## All 45 editable numeric attributes

Offsets count from the most significant bit of byte zero. These are decoder positions; values are stored without changing original permutation tables, frame mappings or the raw codec. `mingles=1` is the original editor's **local-only/Mingle-off** representation.

| Attribute | Bit offset | Width | Software profile range |
| --- | ---: | ---: | --- |
| gender | 1 | 1 | 0–1 |
| birthMonth | 2 | 4 | 0–12 |
| birthDate | 6 | 5 | 0–31 |
| favoriteColor | 11 | 4 | 0–11 |
| height | 176 | 8 | 0–127 |
| weight | 184 | 8 | 0–127 |
| headType | 256 | 3 | 0–7 |
| skinColor | 259 | 3 | 0–5 |
| facialFeaturesType | 262 | 4 | 0–11 |
| mingles | 269 | 1 | 0–1 |
| hairType | 272 | 7 | 0–71 |
| hairColor | 279 | 3 | 0–7 |
| hairPart | 282 | 1 | 0–1 |
| eyebrowType | 288 | 5 | 0–23 |
| eyebrowRotation | 294 | 4 | 0–11 |
| eyebrowColor | 304 | 3 | 0–7 |
| eyebrowSize | 307 | 4 | 0–8 |
| eyebrowY | 311 | 5 | 3–18 |
| eyebrowX | 316 | 4 | 0–12 |
| eyeType | 320 | 6 | 0–47 |
| eyeRotation | 328 | 3 | 0–7 |
| eyeY | 331 | 5 | 0–18 |
| eyeColor | 336 | 3 | 0–5 |
| eyeSize | 340 | 3 | 0–7 |
| eyeX | 343 | 4 | 0–12 |
| noseType | 352 | 4 | 0–11 |
| noseSize | 356 | 4 | 0–8 |
| noseY | 360 | 5 | 0–18 |
| mouthType | 368 | 5 | 0–23 |
| mouthColor | 373 | 2 | 0–2 |
| mouthSize | 375 | 4 | 0–8 |
| mouthY | 379 | 5 | 0–18 |
| glassesType | 384 | 4 | 0–8 |
| glassesColor | 388 | 3 | 0–5 |
| glassesSize | 392 | 3 | 0–7 |
| glassesY | 395 | 5 | 0–20 |
| mustacheType | 400 | 2 | 0–3 |
| beardType | 402 | 2 | 0–3 |
| facialHairColor | 404 | 3 | 0–7 |
| mustacheSize | 407 | 4 | 0–8 |
| mustacheY | 411 | 5 | 0–16 |
| moleType | 416 | 1 | 0–1 |
| moleSize | 417 | 4 | 0–8 |
| moleY | 421 | 5 | 0–30 |
| moleX | 426 | 5 | 0–16 |

MiiJS also treats bit 391 as `disablesMii`, constrained to zero. RFL reads wider **eyebrow rotation at 293/5 bits (0–11), eye rotation at 326/5 (0–7), eye scale at 339/4 (0–7), glasses scale at 391/4 (0–7)**. Validation checks those complete known fields, including high bits the Flash getters omit. Repair/editing changes those bits only when the relevant known field is explicitly changed. Other unknown bits survive.

## Creation and identity policy

A new default retains the recovered original appearance and data, but receives a new normal non-temporary ID and **zero system/owner bytes**. Zero is this application's explicit *unknown-owner representation*, not a claim that Nintendo designated it as a universally acceptable console identity. No MAC address, serial, console credential or fake owner is generated. Imports and repair preserve their existing system half; the advanced Wii ID text field changes it only on explicit user input and does not verify ownership.

The new ID uses the documented decoder convention: prefix `100`, followed by a 29-bit logical count of four-second slots since 2006-01-01 UTC. A session set and best-effort origin-local high-water mark prevent reuse in a session and sequential reloads, including clock rollback. Rapid generation advances the logical timestamp; it is not a claim of exact creation time. Existing known normal/zero-owner IDs are reserved. Out-of-window clocks or exhausted counters fail explicitly rather than wrap.

**Limits:** localStorage is not an atomic cross-tab allocator. Concurrent tabs can race. Separate origins/browsers using unknown owner zero in the same slot can generate identical full IDs; a permanent test demonstrates this limitation. No global or console-database uniqueness is claimed. Destination duplicate resolution and owner assignment require an established import route and Phase 7 evidence. This policy avoids speculative ownership modifications; it is a software-valid record policy, not a complete Wii transfer solution.

Random creates a fresh character with the standard limits, a valid birthday pair, normal ID, unknown owner and original factory reserved bits. It takes 45 bounded feature draws plus a separately allocated ID, instead of the original 49-draw algorithm. It never inherits an old console identity or hidden source flags. Injected RNG/clock/storage permit deterministic tests; a failed operation leaves the model unchanged.

## Editing, import review and export

Production controllers share `wiiProfile.ts`; sliders, feature options and palettes use those bounds. Mole stops at 8. Birthday drafts commit as a valid pair (both blank/zero clears); impossible drafts do not alter storage or data and revert on leaving both fields. Invalid ID/name drafts similarly do not commit. Existing valid special IDs cannot enable Mingle. Names and selected controls/preview update from the same stored model.

The low-level 37-word model, lossless binary/hex codec and legacy XML codec remain permissive for preservation and source-fidelity testing. A raw empty model is a decoding workspace, not a new editable character; application creation uses `newWiiDefaultBytes`. The development diagnostics remain a raw rendering/data test bench, not a validated creation/export product.

Complete imported records are staged without changing the current character. Incompatible records show all errors, ordered before/after changes, exact original/proposed hex, and original/proposed previews where recovered assets support them. Unsupported originals are not rendered approximately. **Cancel changes neither the current bytes nor character storage.** The latest pre-repair record is additionally backed up locally; the user's input file is never modified. An explicit archival download is byte-exact and marked unresolved. A source-renderable original may be explicitly loaded for **read-only inspection**; this quarantine is not a generation mode. Normal editing/export requires approved correction. Random explicitly replaces it with a new character.

Repair clamps invalid known scalar fields, caps impossible days to the month's last day, or clears incomplete/unknown birthdays to unset rather than invent a date. Temporary-to-normal conversion changes only the reviewed flag bits and preserves the payload/system half. Valid special IDs remain special with Mingle off. An all-zero complete ID gets a reviewed newly allocated normal first half. Empty/malformed names receive an explicitly shown fallback/replacement. The resulting record is revalidated before commit; failures/stale review cannot overwrite the active model.

Normal **Save Mii** calls the shared validator before creating a download. Unresolved records cannot pass this path. **Download original (archival, unresolved)** and **Download last pre-repair record (archival)** are distinct preservation operations, not compatibility claims. They add no padding, checksums or bytes. Warnings about unknown ownership, padding or destination semantics remain visible even for software-valid records.

XML still uses the existing original codec, including its lossy field representation. User imports now disclose detected numeric clamping/coercion, text truncation, ignored data fields and repeated-field resolution before acceptance, even when the decoded result passes the profile. The original file/edited XML text is available for archival download. The current active character stays unchanged after failed/cancelled XML. User-facing XML mole-size maximum metadata is 8; the raw source serializer retains 15 for fidelity tests. XML **does not preserve unknown binary bits** and is not a hardware certification format.

The original SVG transform and artwork rules remain intact. For example, mole drawing still uses the recovered Flash 0–15 interpolation scale; normal controls stop at 8 and render the actual value 8. No speculative Wii 3D appearance change was made. ID text now uses two-digit bytes; the raw legacy `getHex` behavior remains characterized separately.

## Verification and scope

Original Flash fidelity tests retain the old randomizer/controller in **test-only** modules. Their old range/arithmetic assertions remain separate from corrected production tests. `wiiProfile.test.mjs` tests 10,000 deterministic records, all scalar boundaries, all 512 stored month/day combinations, ID relationships and allocator limitations, byte preservation, every selection/palette/adjustment, the permanent seven-file corpus and transactional repairs. Browser checks exercise actual imports, cancellation, review previews, exports, XML normalization review, persistence, sharing and unavailable storage.

`../evidence/phase6/` records the final results and the independent pinned MiiJS run. MiiJS's scalar validation does **not** independently prove the calendar, persistent-ID or owner requirements; those have separate RFL/reference tests. Neither this evidence nor Ruffle execution is physical Wii/game certification. See [PHASE7_VERIFICATION.md](PHASE7_VERIFICATION.md).
