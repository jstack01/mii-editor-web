# Phase 7 — console, emulator and game verification (not implemented)

The intended destinations are **real Wii consoles, emulators and Wii games**. Phase 6 supplies software-validated standalone RCD records; no physical console or individual game has been certified. There is no direct console connection, database writer or speculative ownership conversion in the editor.

## Formats and transfer routes

The community [MiiDataFiles Wii format documentation](https://github.com/HEYimHeroic/MiiDataFiles#wii-formats) distinguishes **74-byte RCD** (community `.mii`, `.miigx`, `.mae` extensions) from **76-byte RSD** with a two-byte CRC. Importers may require a particular extension/wrapper; some games store RCD and others RSD or additional structures. The standalone editor must not blindly append bytes or call an RCD checksum-protected.

A Wii/Dolphin **RFL_DB.dat** is a database/container, not a single exported `.mii`. The [RFL extractor](https://github.com/SuperFromND/rfl_mii_extractor) documents Wii and Dolphin database locations and extraction. Extraction support is not evidence that arbitrary record insertion is safe. A destination-aware tool must correctly handle database indices, ID duplicates, CRC/container rules, backups and ownership. Do not overwrite an existing database to test a file without an established recovery route.

## Required matrix

| Target | Evidence required before a compatibility claim |
| --- | --- |
| Standalone independent decoder | Pin decoder version, exact record bytes, format selected and decoded values. Phase 6 supplies this evidence only. |
| Dolphin / emulator Mii Channel | Record emulator version, system region, importer and accepted wrapper, backing-up existing database, display and edit/reload behavior, duplicate handling, owner interpretation and database checksum correctness. |
| Real Wii Mii Channel | Record hardware/firmware/region and authorized transfer tool/version, its ID/owner mapping policy, successful load/display/edit/reboot persistence, unrelated database entries intact and a tested backup/restore route. |
| Individual Wii games | Record title/region/version and actual destination save/container, Mii select/load/display/save/reload behavior, character identity/reference behavior and game-specific restrictions. Success in Mii Channel or one game does not certify another. |
| Identity and flags | Test normal, valid special/local-only and intentionally temporary fixtures through their supported route. Verify copy/edit permissions, Mingle behavior, destination duplicates, console ownership and fresh-character handling. Never invent a console ID or remap existing imports silently. |
| Text and dates | Test unset birthday, February 29, regional fonts/Unicode names, supplementary glyph handling and unsupported characters. Software UTF-16 validity does not guarantee glyph display. |

Destination-specific collision handling is particularly important: unknown-owner browser records do not have a verified global namespace. Sequential local IDs are not a global uniqueness guarantee; separate browsers or concurrent tabs can collide. Confirm whether the importer assigns destination ownership/fresh identity and preserves references, or whether a documented explicit transformation is required. Do not implement a guessed serial/MAC-based owner.

Retain original fixtures, proposed transformations, exported payload and extracted destination bytes; compare every changed field. Keep original/backup files outside any destructive test path. Record unavailable equipment as **unverified**, not passed. Hardware certification must name the tested route/game and limitations. No Phase 7 implementation or physical testing is part of Phase 6.
