# Client visual resource consumer — v0.7.12 / VL18

Optional finite manual consumer; not a production Game Client. No automated test,
assertion suite, mock decoder/context, gameplay loop or sprite renderer.
Client uses Render public root only; no Editor runtime/package dependency.

From repository root:

```powershell
npm run build -- --force
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM --rootDir game-client/manual --outDir .artifacts/client-resource-manual game-client/manual/visual-resource.mts
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM --rootDir editor/manual --outDir .artifacts/editor-resource-manual editor/manual/editor-visual-resource.mts
python -m http.server 8000 --bind 127.0.0.1
```

Serve a trusted local checkout only. Open
`http://127.0.0.1:8000/game-client/manual/visual-resource.html` manually.
Choose an authorized matching PNG/original Unity TPSheet pair; files stay local.
Supply the exact `:texture` header label and opaque frame key explicitly. The host
never parses metadata, derives a filesystem path from a header, or treats a neutral
descriptor as arbitrary read permission. Both virtual source slots are explicitly
bound to the two selected immutable File snapshots. A fixed missing-image option
withdraws image availability and returns SOURCE_NOT_FOUND without that source read.

An existing local original example (not redistributed, rights not established):
`../jx1-manager-editor/data/asset-sources/monster/ani063/Wound_7.tpsheet` and
`Wound_7.png`, explicit texture label `Wound_7.png`, frame key `0050`.
Original sheet profile is format40300, 128x128, keys0050/0052/0054.
Use another authorized supported original pair if this private dataset is absent;
do not rename JSON or invent TPSheet data to replace it. The existing
[Render format/provenance contract](../../runtime-render/docs/visual-loading-v0.7.5.md)
still governs parsing and supported features.

Manual sequence:

- Open pair: one real graphics session, metadata source load, canonical parser,
  exact PNG revision SHA256, Render cache acquisition/native PNG decode/upload,
  canonical frame geometry and borrowed texture view. Inspect each actual result;
  failed acquisition/parse/decode is never projected as success.
- Request one frame: delegates to existing Render submission; clears the canvas.
  No sprite is drawn. Frame address/geometry/view and submitted frame are distinct
  stages; neither proves the selected image was displayed.
- Dispose: lease -> metadata source -> cache -> graphics, attempting every stage.
  Borrowed atlas view gets no independent lease/release. Inspect terminal states
  and sticky cleanup uncertainty, which blocks replacement on this mount.
- Open again: creates a new provider scope/cache/session after draining any earlier
  graphics acquisition. Pending IO never blocks revocation. Dispose/unmount during
  acquisition or source read: late results cannot be adopted; eventual sessions
  are disposed. Physical File reads may finish after revocation.
- Missing image: reopen with the checkbox, inspect canonical source failure.
  Wrong frame/header/unsupported metadata must remain explicit rejected results.
- Unmount is terminal; page exit also unmounts. Reload for a new mount.

Budgets: 1MiB per selected source before reading; parser one page/4096 frames and
1MiB sheet/total; decoded image max2048 per axis and4194304 pixels; one CPU/GPU
cache entry. Host hashes the chosen PNG once for expected revision, then the
provider hashes actual supplied bytes. These bounded transient copies and admission
counts are not a total memory, performance or leak-free guarantee.

For same-realm isolation, open
`http://127.0.0.1:8000/harness/manual/resource-host-isolation.html`.
This tooling page mounts the optional Editor and Client hosts with two canvases
and a single Render root URL/module instance. It is not Client runtime code.
Open Editor's committed PNG, then select/open Client's real pair. Wait for actual
usable results before drawing conclusions. Dispose Client only, compare Editor
lease/cache/graphics/authored observations, then request an Editor frame. Open
Client again to inspect recreation and unmount both at the end. Session-local
cleanup must not be inferred merely from separate provider IDs or a green build.

**Evidence this checkpoint:** compile/static checks and finite Node real-original
metadata/provider observations only. Browser **NOT_EXECUTED**; native image/GPU,
frame submission/display, same-realm isolation and late cleanup **NOT_VERIFIED**.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED**.
No production Client readiness claim; Developer owns manual acceptance.
