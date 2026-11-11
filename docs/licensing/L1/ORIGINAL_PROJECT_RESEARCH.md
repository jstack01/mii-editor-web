# Original project licensing evidence

Status: local research draft, November 10, 2026. Source retrieval hashes are in source-evidence.json. Facts below are distinct from inferences and open questions.

## Exact older package used by this project

**Fact:** Internet Archive item [mii-editor](https://archive.org/details/mii-editor), [metadata endpoint](https://archive.org/metadata/mii-editor), identifies creator `senocular`, date `2007-11-28`, title Mii Editor (Original My Avatar Editor). Its `collection` value is `open_source_software`, but no `licenseurl` or explicit reuse permission is supplied in the retrieved metadata. That collection classification is not a license. The uploader is not assumed to own the application; personal uploader contact information is intentionally omitted from this audit.

**Fact:** [MiiEditorair.zip](https://archive.org/download/mii-editor/MiiEditorair.zip) contains the executable SWFs, AIR manifest/signatures, icons, default XML and mimetype. Both SWFs byte-match local SOURCE originals:

| File | SHA-256 |
|---|---|
| SOURCE/assets.swf | ab8b3dd8f588b79001b6a8ed6cf12cc4cea0e9d1ac9460a37f607ec3f2461d92 |
| SOURCE/classicGUI.swf | d53f6c65b351f2b22d5a89a3937ffbbc4e1f54a75784746d690e1e1d02acca4b |

No license/permission file was present in that ZIP; AIR signatures and creator identifiers are not a reuse grant. The checksum table was computed read-only from the local originals and independently compared with the archived package.

**Fact:** The known preservation site is [mii-editor.nekoweb.org](https://mii-editor.nekoweb.org/). Fresh direct retrieval of its home/FAQ returned HTTP 403. A search-indexed [FAQ](https://mii-editor.nekoweb.org/faq.html) attributes the original to senocular and reports historical legal action. The previously pinned preset page hash in docs/PRESETS.md remains evidence of the older retrieval. Neither indexed FAQ nor prior local docs establishes permission. Reported takedowns are historical claims, not independently adjudicated legal findings here. Do not bypass the site's access restrictions.

## Positive evidence for the later My Avatar Editor

**Fact:** The author's [My Avatar Editor blog](https://myavatareditor.blogspot.com/2009/) announces source release on February 18, 2009, and discusses MIT and changes from the earlier Mii Editor. The [2008 archive](https://myavatareditor.blogspot.com/2008/) discusses redesigning the UI/XML to remove Wii/Mii-specific references. These are author-attributed historical statements, not Nintendo permission.

**Fact:** The archived Google Code [project metadata](https://storage.googleapis.com/google-code-archive/v2/code.google.com/myavatareditor/project.json) names `myavatareditor`, declares `license: mit`, and describes ActionScript and FLA sources. The corresponding [source archive](https://storage.googleapis.com/google-code-archive-source/v2/code.google.com/myavatareditor/source-archive.zip), SHA-256 in source-evidence.json, includes:

- `myavatareditor/trunk/License.txt`: MIT, **Copyright (c) 2009 Trevor McCauley**.
- `myavatareditor/trunk/README.txt`: same author/product and MIT statement; includes as3corelib credit.
- `src/myavatareditor.fla`, `src/myavatarcharacter.fla`, `bin/myavatareditor.swf`, `bin/myavatarcharacter.swf`, ActionScript source and upstream Adobe utility code.

A [Google Code export mirror](https://github.com/kharaone/myavatareditor/tree/4b6f5aadb512acaa79fc7c5e1dcf7f02657cde42) provides a second copy with the same license/readme. This mirror is an archive, not assumed the author or rights holder. Its `src/com/myavatareditor/data/Range.as`, `AvatarData.as` and `fla/character/AvatarCharacter.as` contain the Trevor McCauley MIT header. No exact SWF match to our assets.swf/classicGUI.swf was found anywhere in the downloaded Google Code archive, including its SVN-base files. This does not prove that individual drawings/code are different: no complete geometry-by-geometry or FLA provenance comparison was performed, so component-level reuse under that later license remains a research route, not a completed clearance.

**Inference requiring component review:** some logic demonstrably persists between the versions. Our `web/src/model/Range.ts` declares a direct port of older Range.as; later MIT Range.as has corresponding range/clamp/step arithmetic. A deliberate rebase or exact expression mapping to that licensed file, preserving Trevor McCauley's notice, is a credible clearance route for that component. It does not clear every old file, graphic, font or Nintendo right. No whole-program equivalence analysis or rebase is claimed here.

**Unresolved:** whether the author intended the later MIT grant to cover the earlier 2007 source/assets; which old illustrations are the author's independently owned work; whether any parts originated with Nintendo or other contributors; and what third-party glyph embedding rights originally applied. MIT cannot convey rights its grantor did not possess, or automatically settle trademarks. Do not label the current complete older-style editor MIT based solely on the successor's project license.

## Rights holders and contact preparation

The archived author's own copyright notice identifies **Trevor McCauley**, publicly known as **senocular**. The current [senocular.com](https://www.senocular.com/) links to [senocular.github.io](https://senocular.github.io/). No email address has been inferred or verified, and no message has been sent. Use a verified contact method the author publicly offers before sending the prepared request; do not assume archive uploaders/mirror owners can authorize the underlying work.

Nintendo is a separate possible rights holder for character appearance, Mii/Wii/Nintendo marks and replicated Mii Channel designs. The project does not establish which individual vector was drawn by Nintendo versus the editor author. Nintendo's [intellectual-property notice](https://www.nintendo.com/au/legal/nintendo-intellectual-property/) is not a permission grant. Its [business/IP-request guidance](https://www.nintendo.com/en-gb/Support/Contact/Business-Proposals-Including-General-Requests-to-Use-Nintendo-Trademarks-or-Copyrights-or-Requests-for-Promotional-Items-or-Donations-2483154.html) is a route for research, not evidence a license is obtainable. Game-video/screenshot allowances must not be treated as authorization to distribute an interactive recreation. Keep copyright, trademark/naming/endorsement and font rights as separate questions.
