# Original scene MVP sample sources

These are original procedural pixel-art illustrations authored for the authorized
v0.8.13 repository demo. No third-party game files, JX1 extraction, downloaded art,
personal data or runtime texture fallback is included. Permission: use, modify and
redistribute these sample illustrations and their source generator with this
repository or independently; attribution is not required.

`generate.mjs` is the complete source artwork and PNG encoder, using Node standard
library only. Five committed PNGs are **input content for the manual demo**, not
build outputs. Recreate with `node runtime-render/manual/scene-mvp-assets/generate.mjs`.
`manifest.json` records exact source byte lengths, dimensions and SHA-256 revisions.
The browser provider uses a fixed source allowlist, bounded reads and verifies
length/hash before returning actual bytes to Phase7. No file selection or remote
third-party source is needed. The local repository manifest is trusted content,
not a cryptographic signature or an untrusted asset import format.

| Source | Purpose | Encoded pixels |
| --- | --- | --- |
| courtyard.png | One static background/map image | 320x240 |
| traveler.png | One blue-coated Player illustration | 32x48, binary alpha |
| monsters.png | Actual single PNG atlas: red, green, violet horned creatures | 96x48, binary alpha |
| potion.png | One gold potion Item illustration | 24x24, binary alpha |
| static-spark.png | One static VFX-placeholder illustration | 32x32, binary alpha |

`monsters.atlas.txt` is hand-authored **40300 rectangular parser-profile metadata**
for the actual atlas PNG: three 32x48 cells at x=0/32/64, native bottom-left y=0,
normalized pivots 0.5/0, all borders zero. The existing public
`parseUnityAtlasMetadata` reads acquired source bytes; existing frame resolution
normalizes geometry. All rows have full-page height, so vertical packing variation
is not demonstrated. No JSON is renamed `.tpsheet`. This source is not advertised
as output of TexturePacker/Unity or proof of compatibility with arbitrary TPSheet
exporters, rotation, trim or multipage layouts. **TPSHEET_NOT_VERIFIED** remains.

The art is deliberately simple demonstration content, not approved production game
art. Loading failure rejects opening; no placeholder replaces a failed texture.
The static spark is the requested VFX placeholder, not loading fallback/animation.
