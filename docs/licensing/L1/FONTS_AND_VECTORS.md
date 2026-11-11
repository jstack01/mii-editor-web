# Historical vectors and fonts

Local review draft. No asset license is granted or inferred.

## Concrete recovered font evidence

Read-only inspection of `evidence/manifests/classicGUI.json` found these DefineFont3 symbols:

| Source symbol | Name/flags | Source glyph count | Modern output |
|---|---|---:|---|
| 269 | `_sans`, bold | 0 | Device-font placeholder; not an embedded outline grant. |
| 273 | `Arial`, bold, not italic | 44 | Used by 33 recovered static text symbols in GUI catalog. |
| 332 | `_sans`, regular | 32 | Source glyphs exist, but no DefineText use found; not consumed by current static-text export. Do not infer an open font license from `_sans`. |
| 335 | `_typewriter`, regular | 0 | Device placeholder. |
| 356 | `Arial`, bold italic | 13 | Used by static text symbols 357 and 364. |

Font 273 supplies text symbols **274, 275, 296, 297, 299, 300, 320, 322, 324, 326, 327, 330, 334, 340, 341, 345, 346, 347, 348, 350, 351, 375, 380, 381, 382, 383, 384, 385, 387, 389, 393, 394, 403**. Font 356 supplies **357, 364**. The raw character SWF also names `_sans` at symbol 386 with zero glyphs.

`web/scripts/generate-gui-assets.mjs` reads glyph shapes and emits `<path>` outlines for fixed text. These are embedded in `web/src/generated/gui-assets.ts`, then the production JS bundle, every runtime ZIP, Docker's `/usr/share/nginx/html/assets/index-*.js`, and the proposed Pages copy. Catalog and symbol hashes establish the chain. There is no current tracked TTF/OTF/WOFF file, but that does not mean the build contains no font-derived outlines. Hidden/unused symbols remain in the catalog as shipped; hiding a branding symbol is not a licensing removal.

The SWF names alone do not establish font version, foundry, original desktop/application license, valid embedding grant, conversion rights or surviving third-party ownership. Arial is a proprietary-font family associated with Monotype/Microsoft distributions, but the precise font source here is unverified. Do not claim a specific font licensor approved this extraction. `_sans` is a Flash alias, not evidence of a public-domain typeface.

## Distinctions that matter

Microsoft's [font FAQ](https://learn.microsoft.com/en-us/typography/fonts/font-faq) distinguishes CSS font stacks, ordinary rendered graphic output, document embedding and redistributing/converting font programs for applications. Some fixed-word graphic output can be permitted under appropriate originating licenses. Therefore this audit does **not** declare every outlined label infringement or assume purchasing an application font license is necessarily the only route. However, extracted SWF outlines plus an unknown original license do not prove our reusable SVG/application delivery is permitted. Type design, font software and extracted outlines may be treated differently by jurisdiction; obtain a scope determination rather than relying on a file extension.

`web/src/editor.css` and diagnostic CSS also name Arial, Helvetica, Courier New and generic fallbacks. That ordinary use requests fonts already available on the visitor's system; no new font is downloaded. Keep this distinct from the recovered static labels.

## Resolution options (not implemented)

1. Obtain original font provenance/license/embedding evidence from the original author and confirm our specific fixed-label extraction, modification, distribution, forks and public-hosting uses with the relevant rights holder or qualified adviser.
2. Regenerate the static labels from a suitable independently licensed font, preserving layout/registration as closely as possible. Pin the exact font version, retain its license and observe reserved-name/redistribution terms if applicable. This would require measured visual regression checks; an OFL font is an example to evaluate, not a replacement chosen or downloaded here.
3. Replace labels with system-rendered SVG/HTML text where usable, accepting documented visual differences and testing clipping/metrics. This does not resolve nontext historical GUI/character artwork rights.
4. If no permission/replacement route is acceptable, withhold the unresolved complete graphical distribution and consider an independently licensed code-only publication. That would not be the existing complete ready-to-run editor and must be described honestly.

The same principles apply to the two graphic catalogs: format conversion, path simplification, AI transcription and rebuilding identical geometry do not alone establish new ownership. Permission must cover the author's relevant art and any separate third-party/Nintendo interests, or those components need a lawful replacement/other established basis. Keep attribution regardless of whether additional rights are granted.
