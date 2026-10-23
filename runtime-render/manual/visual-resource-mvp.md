# v0.7.13 / VL19 — manual visual resource MVP

Status: **FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**. Browser **NOT_EXECUTED**.
This is a finite manual consumer, not an automated test or a production scene/sprite
renderer. Developer observes actual pixels and accepts behavior separately.

## Build and open

From repository root, compile the five projects and the optional root-API consumers:

```powershell
npm run build -- --force
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM --rootDir runtime-render/manual --outDir .artifacts/render-resource-mvp runtime-render/manual/visual-resource-mvp.mts
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM --rootDir editor/manual --outDir .artifacts/editor-resource-manual editor/manual/atlas-mvp.mts
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM --rootDir game-client/manual --outDir .artifacts/client-resource-manual game-client/manual/atlas-mvp.mts
python -m http.server 8000 --bind 127.0.0.1
```

Serve a trusted checkout locally. Open
`http://127.0.0.1:8000/harness/manual/visual-resource-mvp.html` manually in a modern
WebGL2/createImageBitmap browser. No npm dependency or second graphics backend.
Reload for each independent mount/scenario. Cleanup uncertainty forbids reusing a
mount; the page deliberately requires reload rather than guessing it is safe.

## Original source and authority

Existing local originals (not redistributed; redistribution rights unestablished):
`../jx1-manager-editor/data/asset-sources/monster/ani063/Wound_7.tpsheet` and matching
`Wound_7.png`. Select these explicitly using the file controls. Texture label:
`Wound_7.png`; frame key: `0050`. Original profile: TexturePacker Unity format40300,
128x128 page, three frames0050/0052/0054, unrotated, no trim/sourceSize. Canonical
frame0050 is top-left rectangle x1,y1,width60,height47. The source bottom-left
rectangle is x1,y80,width60,height47. Negative original pivot is metadata, not a
placement instruction for this demo.

| Original | Bytes | SHA256 |
| --- | ---: | --- |
| Wound_7.tpsheet | 594 | 2a4f8e481fb7934b84431bf47deaece16d28af31c220646cd799cb0effc8f57d |
| Wound_7.png | 4132 | 564e290a89c9352aa8535e83857f8fc17ae16325d7e073a18ad21bd9f38b1a3d |

If these local originals are absent, select another authorized original matching
the supported Unity profile and supply its exact header label/key. Do not invent
TPSheet data or rename JSON. Page/file matching is the host's explicit attestation;
equal dimensions do not establish semantic identity. Files remain local and are
never uploaded. Virtual locators authorize only the two selected immutable File
capabilities, not arbitrary filesystem/network access. Each read captures its File
before awaiting IO; revisions are SHA256 of the bytes actually returned.

Editor mode authors a Catalog/AssetReference, resolves it and obtains the neutral
descriptor through describeResolvedVisualAsset. Client mode constructs a direct
Render descriptor and independent provider; its module never imports Editor.
Both feed the same Render-owned manual consumer, which imports only Render's root.
Harness composes these optional modules; it is not another production project.

## Normal path and honest observations

1. Select Editor and the original pair, then Open. Repeat later in Client mode on
   a reloaded page. The metadata is parsed by Render; three acquisitions start
   before awaiting their outcomes: A1/A2 share session A, B1 owns session B.
2. Inspect actual source/atlas/concurrent outcomes. On success, expect one metadata
   provider read, one image provider read, sourceJobs1, uploadCalls2, cpuHits1,
   gpuHits1, cpuEntries1, gpuEntries2, leases3. Pre-hashing selected files for exact
   revisions is host IO outside these provider counters. SourceJobs counts a
   coordinated source/decode job, not a measured decode duration or separate native
   decoder instrumentation. Usable outcomes imply that job reached native decode
   and upload; counters alone cannot prove those stages succeeded.
3. The page assigns distinct inspection labels to symbol identities. A1/A2 have
   different lease/texture IDs and the same resourceId; B1 has a different
   session/resourceId. CPU image sharing never shares WebGL textures across contexts.
4. Look at both canvases. The chosen real frame should appear over the blue clear,
   stretched to the central80% of each viewport. This is deliberately no Scene,
   sprite instance, aspect/placement system, animation or VFX. Whole-page rendering
   is a separate explicit button, not fallback for an unresolved frame.
5. Record actual pixels as DISPLAYED only after visual inspection. A
   frame-submitted-NOT-display receipt records submission, not GPU completion or
   display. A compile cannot establish even SUBMITTED.

## Release, session isolation and revision

On a fresh successful open:

- Release A1: leases2, GPU entries2, CPU entries1; A2/B1 remain usable. Draw A2.
  A1's historical alias is released and cannot be drawn through the public demo.
- Release A2: leases1, GPU entries1, CPU entries1. A graphics session can remain
  ready after its final texture release. Draw B1; it should still show its frame.
- Dispose session A only: A becomes disposed while B remains ready/usable. On a
  separate fresh run, dispose A with both A leases live: they become invalidated;
  B1 remains usable and drawable. Neither path should destroy B's texture/context.
- Release B1: leases0, CPU/GPU entries0. This is ownership bookkeeping plus native
  cleanup attempts, not a GPU-memory/leak-free measurement. Close all disposes
  metadata/cache/graphics, attempting each owner even if another cleanup fails.
- For revision review, retain B1, select an authorized **different-byte PNG** with
  the same atlas layout/dimensions, and click Invalidate/acquire. Its SHA256 becomes
  the required revision. Expect one new image source job/read and B upload, a new
  resourceId/revision; B1 stays pinned to the old content. Observe the new holder's
  logged index and drawing, then Draw B1 to compare. Re-selecting identical bytes
  while B1 is live is idempotent reuse, not proof of invalidation/new acquisition.
  After final release of all rights, same-revision reacquisition can also require
  a new job because the cache retains no idle bitmap/texture.

Cache bounds: four CPU/four GPU entries, one source revision guard; metadata1MiB,
one page/4096 frames; PNG1MiB/2048 per axis/4194304 pixels. Repeated replacements
can hit an explicit limit while old holders remain live; close/reload rather than
silently evicting owners. No throughput, performance or absolute memory claim.
Commands are serialized by the tooling UI. Page exit prevents new commands and
eventually closes any late opening result; physical IO can finish after exit.

## Failure observations, no fallback

Reload between scenarios, inspect actual diagnostics, and Close all afterwards.

- Missing source: select a valid pair with Withdraw PNG availability checked.
  Provider returns SOURCE_NOT_FOUND; no decode/upload or placeholder is expected.
- Corrupt PNG: select a truncated copy of an authorized original PNG with its real
  sheet. A20-byte copy preserves its signature but is structurally incomplete:
  expect INVALID_PNG before native decode, zero uploads, released source/decode
  ownership. Other corruption can instead produce an original native decode
  exception (unclassified/withheld); do not relabel it as successful loading.
- Missing frame: valid original pair, key `not-a-real-frame`. Expect
  FRAME_NOT_FOUND and no frame submission through the selected-frame path. Bytes,
  decoded image and texture may legitimately exist until released. No default
  frame or whole-page fallback is chosen automatically.
- Wrong header or incompatible replacement dimensions remains an explicit parser/
  geometry rejection. Never project a failed source/decode/geometry as usable.

## Evidence at this checkpoint

| Stage | Actual observation |
| --- | --- |
| Five project builds, optional strict consumers, static boundary | PASS, see checkpoint report |
| Original Editor Catalog/reference/descriptor + source metadata | Observed in finite Node consumer |
| TexturePacker Unity .tpsheet parse/frame geometry | Original parsed; 0050 resolved; missing key FRAME_NOT_FOUND |
| Missing source / truncated-original PNG admission | SOURCE_NOT_FOUND / INVALID_PNG; handles explicitly released |
| Native successful PNG decode | UNVERIFIED in this checkpoint (Node has no createImageBitmap) |
| Live cache reuse, uploads, release/isolation/revision | Browser NOT_EXECUTED / FEATURE_NOT_VERIFIED |
| Render frame | NOT_SUBMITTED in observation run; browser submission NOT_EXECUTED |
| Actual pixels / TPSheet-derived display | VISUAL_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED |

Record browser/version, source hashes, actual counters/diagnostics, release order,
session states, replacement revision and which image/frame was visibly displayed
when Developer performs manual review. Do not convert expected outcomes into
observed evidence. No automated tests or browser automation were added/run.
