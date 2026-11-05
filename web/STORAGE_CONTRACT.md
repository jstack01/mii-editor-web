# Browser storage and shared URLs — version 1

The application stores one current character, entirely locally. No account, backend, Flash storage, remote service or file dialog participates.

## Exact contract

- Key: **`mii-editor.character.v1`**, scoped by the browser's origin.
- Value: exactly **148 lowercase hexadecimal characters**, representing the existing **74 bytes / 37 big-endian words**. No JSON wrapper, extra metadata, timestamp, checksum or binary-format change.
- Input validation accepts uppercase or lowercase hex of exactly that length, then checks every one of the 45 numeric fields against its original declared range. Unknown/reserved bits, names' UTF-16 units, Mii ID and Wii ID bytes are preserved. Hex is canonicalized to lowercase; numeric values are never silently repaired.
- This strict transport validator is distinct from the unchanged original permissive `setHexData()` API. Wrong length, separators, whitespace, nonhex input and out-of-range known fields are invalid here.

Startup chooses the original default, then a valid saved character, then a valid **single `?mii=` parameter** at highest priority. Empty, malformed, duplicated or out-of-range URL values are ignored, with a visible status message; saved/default data remains usable. Storage access failures never prevent a valid URL or default from opening.

Initialization resolves precedence before it renders or writes anything. A valid URL import is saved as the final chosen character; it cannot be overwritten by an intermediate old local value. A saved/default startup does not write merely because the page opened. Invalid saved data is left untouched until a real valid edit replaces it.

Every actual binary edit saves synchronously through localStorage: text, IDs, toggles, randomization, every tile/palette/option, and each changed integer slider value. No-op clamping, navigation and page browsing do not write. A failed read/write/getter is caught; the editor remains usable in memory and reports storage unavailability. A failure to read on startup keeps the status conservative until reload. No other application keys are read or deleted. No storage-event listener replaces an actively edited character; multiple tabs follow last successful writer wins. Private-browser cleanup and browser settings remain browser policy.

## Sharing and refresh

The original footer's read-only **Mii URL** field now displays a working URL generated from the current application's origin/path, preserving other query parameters and its fragment, with exactly one canonical `mii` parameter. Focus selects the complete URL for copying. It uses no historical miieditor.com service.

Opening that URL restores the exact binary, ahead of saved browser data. Editing an opened share updates both saved data and the address bar with `history.replaceState`, so a normal refresh restores the latest edit rather than the stale original parameter. A plain URL remains plain while editing; reload uses saved data. The displayed share field always contains the current data. If the browser blocks History API updates, the field still supplies the latest link; copy that link rather than relying on an unchanged address bar. There is no Clipboard API dependency, automatic external navigation or upload.

## Characterized original behavior and intentional changes

`ClassicGUI.as` starts from its default, then uses a truthy `LocalSharedStorage.getLocal()[0]`, then a truthy loader `mii` parameter. Those values go through the permissive original hex decoder. The new strict saved/URL validation is intentional and user-approved; legacy codec APIs remain unchanged.

`LocalSharedStorage.as` uses SharedObject `localMiis.data.miiArray`, wrapping a single value in an array and flushing it. Errors return false/null. The Flash editor ignores save failure results. `ClassicGUI.updateURLText()` both updates the URL field and saves; category entry and most edit handlers call it. **Size's `updateDataFromSliders()` does not**, so the avatar/data changes immediately while the old URL/save can remain stale until another action. The browser deliberately saves all valid edits consistently and reports actual storage failure.

Original Size updates **both** attributes from each thumb's floating-point position using `int(127 * getPercent())`. Reconstructing `x = 301 + 227 * value/127`, then computing `(x-301)/227 * 127`, can truncate some untouched values one unit lower. The browser preserves the original drag formula for the edited dimension and keeps the other dimension's bytes intact. Category entry and navigation never re-quantize either value. Evidence includes an exhaustive 0–127 characterization in `evidence/phase4b/legacy-slider-rounding.json`.

There is no automatic SharedObject/LSO migration, multi-character library, schema conversion, cross-device sync or file import/export in this contract. Those features are not represented as complete.
