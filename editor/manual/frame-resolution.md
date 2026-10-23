# Frame identity/resolution — finite manual consumer

This extends the v0.7.5 bounded exact-file host with optional `--frames`, using
only Render/Editor public roots. It prints data for human inspection; no assertions,
runner, expected-result suite, browser automation or CI entry. Default atlas-only
invocation retains its previous behavior. No catalog/document/Scene file is written.

```powershell
npm run build -- --force
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM --rootDir editor/manual --outDir .artifacts/atlas-manual editor/manual/atlas-metadata.mts editor/manual/frame-resolution.mts
node editor/manual/atlas-metadata-node.mjs --frames '../jx1-manager-editor/data/asset-sources/monster/ani063/Wound_7.tpsheet' Wound_7.png pages/wound.png '../jx1-manager-editor/data/asset-sources/monster/ani063/Attack1_0.tpsheet' Attack1_0.png pages/attack.png
```

Use authorized originals, never fabricated renamed JSON. See [original provenance,
hashes and profile](../../runtime-render/docs/visual-loading-v0.7.5.md). They are not
distributed in this repo. The demo requests exact keys0050/0000 from those originals;
other data can legitimately print missing-frame diagnostics. Two files compose one
logical `atlas-manual/selected-sheets` asset, not two invented gameplay entities.

Observed Node24.18.0, exit0:

- Holder-0 key0050 resolved page-0/image-0; holder-1 key0000 page-1/image-1.
  Pages/frames/rectangles/pivots/image sources frozen and page/frame result pointers
  distinct from atlas tables. Reference holders retained their opaque addresses.
- Missing key and ` page-0/0050 ` print FRAME_NOT_FOUND; null address prints
  SUBRESOURCE_NOT_SPECIFIED; wrong logical resource RESOURCE_MISMATCH; null atlas
  ATLAS_NOT_AVAILABLE; structural atlas copy ATLAS_NOT_SUPPORTED.
- Exact acquired metadata source SHA256 revisions are printed, with scoped provider
  identity. An explicitly labelled valid memory revision renames0050 to0050-revision:
  SHA256 `586824125b1cb702b759498ef2bc6b64eeef03b0bbd0640ae3e1f4332fc85095`.
  The originals remain unchanged. Snapshot tokens differ; old/new or new/old pairing
  prints ATLAS_REVISION_MISMATCH. New/new lookup of0050 prints FRAME_NOT_FOUND,
  explicit0050-revision resolves; old/old deliberately still observes history.
- Provider reads before/after all frame lookups:3/3. Final count5 includes the two
  original acquisitions, the memory revision and two malformed memory variants.
  The resolver does not load, decode, cache or release resources per holder.
- A transient public Editor catalog/reference composition still prints
  SUBRESOURCE_NOT_SUPPORTED for authored subresource0050. This demonstrates the
  existing Phase2 contract, not global frame support or a persisted catalog change.

These finite data observations are not general functional/visual acceptance.
AMBIGUOUS_FRAME is defensive and unreachable from the current duplicate-rejecting
parser, not claimed observed. Host current-slot/revision selection and external
freshness remain explicit responsibilities. No image/GPU/UV/geometry/animation work
was performed. FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED remain; see
[contract/limits](../../runtime-render/docs/visual-loading-v0.7.6.md).
