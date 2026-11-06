# Phase 7A — Wii/Dolphin transfer investigation

**Phase 7A completed. Phase 7B physical Wii/game testing is deferred indefinitely by owner decision.** The editor still exports the same 74-byte records. No new export format, owner conversion, database-writing UI or compatibility toggle has been added. Start with the [safe manual guide](../docs/WII_DOLPHIN_TESTING.md); see [the software profile](WII_PROFILE.md) for the separate scalar/calendar/ID rules.

## What was actually executed

On 2026-11-06: macOS 27.0.1 ARM64, installed **Dolphin 2609a**, Metal, existing locally installed Mii Channel title `0001000248414341`. Only disposable copies of the existing Wii environment were run using `-u`. No game/channel/NAND/key downloads were made. SHA-256 inventories of all 342 original Wii files were taken before/after; the primary profile was not used for booting.

The independent [Alex9303 reference implementation](https://github.com/Alex9303/Mii-Database-Editor/blob/ae6a5372b302f5036f82c21db6a050cff1c486b4/src/Util.java) built fresh synthetic databases. Its exact unmodified Java data routines were compiled locally; the GUI and its network preview were not run. Input bytes were inserted unchanged. Python's independent standard-library CRC calculation agreed with the Java output. The [optional bridge/inspector](../optional-tools/phase7a/README.md) cannot overwrite an existing output directory/database and is excluded from runtime distributions.

Dolphin's own PNG frame dump provided rendered evidence without changing macOS screen-recording/accessibility settings. Its Pipe controller backend successfully exercised pointer movement, A/B and HOME input. An image-guided A+B drag of the zero-owner default boy into Edit Mii produced the explicit message **“You can’t edit Miis you didn’t create.”** Earlier positioning/tutorial/new-character attempts stayed in disposable copies and no new character was saved. This establishes non-editability in the tested destination only; no ownership conversion was attempted.

| Test | Observed result | Scope |
| --- | --- | --- |
| 13 positive records: Default Boy/Girl, 8 deterministic randoms, repaired FAIL-1/2/3 | Mii Channel Plaza displayed characters; all 13 exact records and valid database checksum survived two launches; complete database unchanged | Real emulator/channel execution, not just decoder acceptance. Unknown-owner browser defaults/randoms were not remapped. |
| Zero-owner default boy → Edit Mii | Channel refused editing with “You can’t edit Miis you didn’t create”; exact bytes retained | Display works, destination editing permission does not. No guessed ownership change applied. |
| Special/local-only record | Displayed with gold pants; exact bytes/checksum unchanged | Display confirmed; editing/game privileges unverified. |
| Temporary-ID negative | Single record removed; copied database rewritten with valid checksum | Confirms this channel rejects it as a persistent Plaza entry; does not forbid temporary Miis in every RAM/game context. |
| All-zero eight-byte CreateID negative | Record remained on disk but no Mii displayed | Container retention is not character acceptance; the editor correctly rejects this ID. |
| Two identical persistent CreateIDs | Two characters displayed; duplicate records remained unchanged | This channel did not resolve duplicates. Game/reference safety is not proven. |
| Original unrepaired FAIL-1 (mole size 9) | Single record removed; copied database checksum updated | Actual channel rejection of this supplied historical record. A controlled mole-only repair already passes independent decoding; no claim that every channel rejection reason is uniquely identified by this one run. |

The three repaired historical failures were all tested in the positive channel case. All seven original and seven proposed/repaired corpus variants were also tested by the independent decoder. FAIL-2/3 **unrepaired** were not separately booted in Mii Channel; their software errors remain covered. The 28-case fixture additionally records the negative ID and duplicate cases explicitly.

Local, non-shipped captures/reports are retained under ignored `release/phase7a/`: README desktop/mobile previews, positive-channel screenshots, special/temporary/zero/duplicate/legacy-invalid screenshots, before/after record reports and regression logs. Copied Nintendo channel resources, original databases, system identities, keys and external source are **not committed or distributed**. The public [fixture records](../optional-tools/phase7a/fixtures/records.json) and [results summary](../optional-tools/phase7a/fixtures/results.json) identify the tested synthetic payloads and outcomes. Rendered observation is not pixel-perfect cross-renderer certification.

## Transfer routes and what each proves

| Destination/route | Payload | Evidence and status |
| --- | --- | --- |
| Dolphin → copied Mii Channel with a fresh reference database | Database containing raw 74-byte slots | **Executed successfully**, limited to the isolated route above. Not a live-database insertion service. |
| Dolphin Tools → Import Wii Save | Wii save archive (`data.bin`) | [Dolphin's UI](https://github.com/dolphin-emu/dolphin/blob/4a70679d0adcd17220568f5c18d2d4005eeea0a2/Source/Core/DolphinQt/MenuBar.cpp#L1214) calls its [save-archive importer](https://github.com/dolphin-emu/dolphin/blob/4a70679d0adcd17220568f5c18d2d4005eeea0a2/Source/Core/Core/HW/WiiSave.cpp#L545). This is not a standalone `.mii` import command. Source verified; no inappropriate live import attempted. |
| SaveGame Manager GX per-Mii installation | Raw 74 bytes, conventionally `.miigx` | Reviewed [installer](https://github.com/djskual/savegame-manager-gx/blob/ae3cb59cb5bbae91bf65d48cb61961ed49d896d3/branches/savegame-manager-gx_R126/trunk/source/Miis/MiiInstaller.cpp#L295) reads a raw record into a selected slot and recalculates the database CRC. Source-confirmed route; this version was **not executed on a Wii or in Dolphin**. Do not assume another version has the same ownership policy or safe overwrite behavior. |
| Wii Remote / stock Mii Channel | Remote-memory container/physical remote | Standalone `.mii` is not an official SD-card Mii import workflow. Remote writing/transfer was not tested; no speculative converter added. |
| Individual games | Game-specific records, references, saves and sometimes 76-byte RSD | No games booted. Mii Channel display does not certify game player association, saves, special flags or checksums. |

Dolphin [WiiRoot.cpp](https://github.com/dolphin-emu/dolphin/blob/4a70679d0adcd17220568f5c18d2d4005eeea0a2/Source/Core/Core/WiiRoot.cpp) copies the Mii database into/out of some session NAND configurations. Therefore verify the actual user/session folder rather than assuming a hard-coded Windows path or editing a running emulator's files.

## Formats, checksums and identity

**Observed database layout:** 779,968-byte file; `RNOD` header; 100 × 74-byte Plaza records at offset 4; `RNHD` at 7,424; big-endian two-byte header CRC at 127,454. The reviewed reference and [SaveGame Manager GX structure](https://github.com/djskual/savegame-manager-gx/blob/ae3cb59cb5bbae91bf65d48cb61961ed49d896d3/branches/savegame-manager-gx_R126/trunk/source/Miis/MiiInstaller.h) agree on this region. CRC-16/XMODEM (poly 0x1021, initial zero) covers bytes `[0,127454)`. It is a **container-header** checksum, not a checksum on each raw `.mii`, nor validation of all trailing texture data. The reference constructor's empty header CRC is `9aff`; the 13-record test's was `c6c4`. Corruption inside the covered header is detected; bytes outside it require other validation. No checksum/padding was added to editor exports.

The [community format reference](https://github.com/HEYimHeroic/MiiDataFiles/blob/73d63981a248498a70b460d731b2561363ce22c2/README.md) distinguishes raw RCD from RSD with an extra two-byte checksum. The [Mario Kart Wii reverse-engineered structure](https://github.com/snailspeed3/mkw/blob/78572c95c41dbf6cbb7dd251a567e538560ce1d8/src/system/Mii.hpp) contains a 0x4c-byte raw-Mii buffer and an eight-byte Mii ID. These are evidence for destination-specific structures, **not proof that inserting an RSD into any game save works**. No game-save or RSD writer has been implemented.

[Independent RFL reverse engineering](https://github.com/doldecomp/ogws/blob/e5a4d369011062fe243aa63f6c2e2853854c395d/src/RVLFaceLib/RFL_Database.c) checks the complete eight-byte CreateID, treats all-zero as invalid, excludes temporary IDs from persistent identity equality, and compares both four-byte halves for ordinary equality. Search returns a matching database index; duplicate full IDs therefore remain ambiguous for consumers. The observed duplicate display is not a uniqueness guarantee. Special/local-only checks and complete-width facial fields remain covered by the existing profile tests.

**Ownership conversion remains unresolved:** new browser records intentionally have zero/unknown system-owner bytes. The tested default boy displayed but the channel explicitly refused editing; we did not fabricate or copy a console owner to bypass it. The normal-ID flag is not proof of console ownership; names and appearance do not establish editability. The external database tool's owner-edit controls do not establish a universal safe ownership conversion. No serial/MAC-derived owner, automatic ID reassignment or game identity migration was introduced. Changing an existing full ID can break a game's reference even if appearance stays identical. Destination-aware collision/ownership policy needs a separately reviewed milestone before a production transfer feature.

## Reproduction and regression results

Generate the labelled fixtures and independent containers with the [analysis guide](../optional-tools/phase7a/README.md). Use only a copied user environment, launch `Dolphin -u COPY -n 0001000248414341`, retain before/after bytes and captures, and quit before inspecting/replacing the copied database. Restoration means returning to the untouched primary profile, not copying a synthetic database into it.

The completed local test counts and environment are recorded in the results summary. Existing binary/hex/XML/graphics/editor/file/image/repair coverage remains intact; the independent MiiJS decoder accepts **10,000/10,000** deterministic newly randomized records. MiiJS accepted temporary/zero-ID negatives too, demonstrating why the independent persistent-ID rules must remain separate. No editor/codec/renderer/randomizer fix was justified by this investigation.

An actual regression run exposed a **Docker verification helper** bug: containerd may report a multi-platform index in `container.Image`. The helper now inspects the platform-specific `ImageManifestDescriptor` when present, retains the classic-engine fallback, and still rejects architecture mismatches. New tests cover both; both published architecture images were then executed successfully (ARM64 native to the Docker VM, AMD64 emulated). This does not change the website, image, release tag or its bytes.

## Phase 7B deferred; software release gates

Physical Wii writes, firmware/region differences, authorized importer execution, safe ownership conversion, Wii Remote transfer and individual-game play/save/reload remain **unverified**. The owner does not own a Wii and does not intend to obtain hardware or perform physical testing. Phase 7B is deferred indefinitely; no Wii, discs, NAND images or additional equipment is requested. These unverified targets do not block software QA or a release with accurate disclosures.

The Phase 7A results above remain the evidence boundary. No physical console/game certification is claimed and no owner conversion is invented. Remaining browser/device coverage is in [browser compatibility](../docs/BROWSER_COMPATIBILITY.md), hosting limits in [hosting](../docs/HOSTING.md), and Phase 8A/8B release readiness/approval in [the roadmap](../MIGRATION_PLAN.md). Publishing still requires explicit authorization. No routine QA reruns of database modifications are needed.
