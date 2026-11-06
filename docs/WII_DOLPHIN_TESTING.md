# Testing your Mii with Dolphin or a Wii

The editor saves a **74-byte Wii character record**. A Wii Mii database and a game save are different files. Do not rename a `.mii` to `RFL_DB.dat` or use Dolphin's **Import Wii Save** command to import it.

**Verified so far:** in an isolated Dolphin 2609a Mii Channel, both default presets, eight randomized characters and the three repaired historical failures displayed successfully. Their exact record bytes survived two channel launches. The zero-owner default boy displayed, but this channel refused editing it as a Mii created elsewhere. Physical consoles, games and any ownership conversion remain unverified. See the [full results](../web/PHASE7_VERIFICATION.md).

## Export from the editor

1. Open **File → Files → Save Mii** and save the `.mii` file.
2. If repairs are requested, review the before/after changes and accept only the changes you want. Cancel leaves the current character unchanged.
3. Keep the exported file and, for imported legacy characters, your original file. XML does not preserve every unknown binary bit.

## Dolphin: the tested laboratory route

This route needs Dolphin, your own legally obtained/installed Mii Channel resources, and a **disposable user folder**. No Nintendo channel, game, NAND or keys are provided by this project. A normal blank Dolphin installation does not establish that these resources are available.

1. **Quit Dolphin.** Make a complete backup of its user folder using your normal file manager. Locate it through Dolphin's **Open User Folder** command; locations differ between systems. Keep the backup outside the test folder.
2. Create a separate copy for testing, including its `Wii` folder. Launch only that copy using Dolphin's `-u` option. On macOS, for example:
   ```sh
   /Applications/Dolphin.app/Contents/MacOS/Dolphin -u "/absolute/path/to/disposable-dolphin-user"
   ```
   Confirm the user folder before testing. Never run a second emulator against the same folder.
3. For the reproducible **fresh-database experiment only**, follow the [optional analysis tool instructions](../optional-tools/phase7a/README.md). They use existing Python/JDK tools and a hash-pinned independent reference builder to place your exported record into a new synthetic database. This is not a normal editor feature or a live-database importer.
4. With the disposable emulator stopped, put that synthetic `RFL_DB.dat` **only in the disposable copy's** `Wii/shared2/menu/FaceLib/` folder. Back up that copied database first too. A synthetic database replaces its entire test Plaza/Parade; it must never replace your real database.
5. Boot the existing copied channel. The tested title ID is `0001000248414341`; the corresponding macOS command is:
   ```sh
   /Applications/Dolphin.app/Contents/MacOS/Dolphin -u "/absolute/path/to/disposable-dolphin-user" -n 0001000248414341
   ```
6. Check appearance, selection, editability and behavior after closing/reopening. After quitting, the optional read-only inspector can compare the copied database's records/checksum. A character appearing once does not prove ownership or game compatibility.
7. Stop the disposable instance. Keep its before/after evidence if useful; return to your normal launch without `-u`. Your primary data should be unchanged. Do not copy the experimental database back to the primary folder.

The reference Java builder is used only for fresh lab containers. Its full GUI/database-save behavior was not tested and may rebuild other database regions; it is **not recommended here for preserving an existing database**. The project does not automatically assign a console owner or resolve destination duplicate IDs.

## Physical Wii: investigate before writing

SaveGame Manager GX has a documented per-Mii installation route. The reviewed source reads 74-byte `.miigx` records into a selected database slot and updates the database checksum. A **copy** of an editor `.mii` can use the `.miigx` extension without adding bytes. This is source-confirmed, **not physically tested by this project**, and importer versions/permissions differ. Read the tool's current instructions and backup requirements before using it; do not install system modifications just for this test without understanding them.

Before any console writes, have a recovery-capable NAND backup, a separate Mii database backup and backups of the relevant game saves. Use a spare/empty slot, inspect the exact importer's overwrite and identity policy, and keep existing Miis/game identities intact. Never overwrite the entire live database with this project's synthetic test file. Do not change owner bytes or IDs merely to make a Mii editable: games may identify an existing player by those bytes.

A real Wii Remote can transfer Miis through a supported Mii Channel workflow, but that does not make a raw PC `.mii` directly readable by an unmodified console. Remote-memory conversion and physical transfer have not been tested here.

## What Phase 7B needs from you

- A Wii with its region/firmware recorded, a tested backup/restore method, and the exact authorized per-Mii importer/version you intend to use.
- Your legally owned test games and their exact region/version. Suggested first checks: Wii Sports, Wii Sports Resort and Mario Kart Wii, each separately.
- Confirmation of display, editing permission, restart persistence and unchanged unrelated entries/saves; then game selection, play/save/reload and existing player identity.
- Test default, random and repaired characters first. Special Miis, duplicate IDs and temporary-ID negatives belong in a disposable emulator experiment before considering hardware.

Do not send private NAND dumps, keys or commercial game images to this repository. Physical testing is a separate milestone, not enabled automatically by these instructions.
