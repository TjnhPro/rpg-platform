# v0.5.12 — Minimal Working Document MVP (DC19)

**READY_FOR_DEVELOPER_REVIEW** — finite manual Document workflow evidence.
This checkpoint does not establish Developer acceptance, universal SAFE_SAVE_PASS,
MIGRATION_PASS, rendered 2.5D behavior or Phase5 closure. Stop before v0.5.13.

## Exact baseline and authorized scope

- Repository: https://github.com/TjnhPro/rpg-platform
- Same Phase5 branch `feat/editor-document-contracts-v0.5`;
  existing draft [PR #5](https://github.com/TjnhPro/rpg-platform/pull/5), base `main`.
- Pre-change HEAD / v0.5.11:
  `e0d3193bcd7089b4fffb3d22d179bdba6f032937`.
- Accepted Phase4 baseline: `e46ec24dc662b1bc1588d5ec1c05d4f62739ac3c`.
  Earlier closure refs:
  P1 `4cec85b5a00e2477f00eee29e2da6025a532e973`,
  P2 `fea9b734b849fa1c6bc953530e1fa425d43cfca8`,
  P3 `5ce0feb4c1967c0dee14919b9c11d56991a46bd0`.
- Developer's standing session instruction authorizes supplied tasks without
  intermediate approval. This task authorizes this checkpoint only. Previous
  READY_FOR_DEVELOPER_REVIEW/CI is not silently relabeled as an explicit ACCEPTED
  verdict for every Phase5 checkpoint.
- Primary owner: **Editor** manual authored Document workflow. Canonical existing
  Scene/Object/Asset/Spatial operations retain semantics. Demo host owns actual
  filesystem reads/publication and commit receipts. Render is audit/build only;
  no cooperating production project change.
- Public/API/schema/source delta: **zero**. Editor134 and Render52 root symbols
  unchanged. No L1/L2 API use/change, version/lock/pin/manifest/workflow/tool change,
  gameplay entity, registry, GUI, extra package or new production storage adapter.
- Six changed paths: `editor/manual/document-mvp.md`,
  `editor/manual/README.md`, `editor/AGENTS.md`, `harness/CONTRACTS.md`,
  `harness/OWNERSHIP.md`, this report. No production TS/JS or declarations changed.
- Post-commit final SHA and exact-head CI evidence are recorded in PR5 ledger;
  no commit tries to embed its own hash.

Preflight read root AGENTS/ARCHITECTURE/FOUNDATION/README, relevant Editor/Render
guidance, Harness OWNERSHIP/CONTRACTS/WORKFLOW/VERIFICATION, manifests, public
roots/emitted declarations and current envelope/codec/session/diagnostics/load/
save/migration/Scene-preserving edit source. Inspected actual Scene/Object,
Asset identity/snapshot/catalog and Spatial shape before composing sample.
Harness route suggested Editor only; source/behavior ownership made the decision.

## Current capability audit

| Area | Source state | MVP use / limit |
| --- | --- | --- |
| Portable envelope, bounded codec | IMPLEMENTED v0.5.1/2/5 | Real create/encode/decode; no save inference |
| Sessions, dirty/revision, exact-ticket receipts | IMPLEMENTED v0.5.3/4 | Create/open/edit/close; late revision2 receipt with current3 |
| Owner/reference diagnostics | IMPLEMENTED v0.5.6 | Canonical Scene/Asset/Space checks; physical file NOT_CHECKED |
| Read/load, conditional Save, failure diagnostics | IMPLEMENTED v0.5.7–9 | Real local IO port; only host-proven commit advances saved baseline |
| Explicit compatibility/migration | IMPLEMENTED v0.5.10 | Named additive legacy Asset candidate only |
| Scene metadata-preserving replacement | IMPLEMENTED v0.5.11 | Used for known name/placement change |
| Scene direction semantic field / 3D depth | UNAVAILABLE | Opaque sample-owned facing intent, planar ground data only |
| Production filesystem adapter / existing-file CAS | UNAVAILABLE | Not invented; inline manual create-only host |
| Uncertain-write reconciliation/recovery | UNAVAILABLE | Not claimed; saved-snapshot restore is existing session operation |
| Future Engine config validation | DOCUMENTED_ONLY | No invented game schema or owner |

No root cause defect requiring a runtime change was found. This is deliberately
a manual demonstration/documentation checkpoint, not another persistence system.

## Delivered manual guide

[Run instructions and both commands](../../editor/manual/document-mvp.md):
build, then paste one finite PowerShell/Node sequence, followed by an optional
independent read-only Node process. Commands import only the Editor package root
and Node host built-ins. No direct Render/deep/cross-project source import.
Editor root still transitively loads its declared Runtime modules; loading their
modules is not allocating Render instances/resources. No independent
installability claim or changed dependency direction.

Inputs: project `document-mvp-project`, Document `zone-document`,
Scene `zone-01`, Asset `visual-0012` with string sourceId `0012` and
`sprites/0012.png` source. Ground space is right/down, origin0, tile units.
One `player-visual`, three `monster-*` and `vfx-visual` placeholders share
that Asset. VFX declares an attachment to Player. No HP/AI/combat/VFX execution.
Two context sidecars (Asset/Space) are manual fixture inputs, not a new content
bundle/dependency format or automatically loaded document dependencies.

All four supported metadata slots carry unknown authored data. Facing intent
uses an explicitly named angle convention inside opaque customVisualProfile.
Its portability/retention is observed, not semantic validation, renderer direction
or a new universal Scene schema. This is a planar authored-data example usable
for 2.5D authoring, not depth/projection/sprite/visual verification.

Expected and observed progression:

| Action | Observed state / evidence |
| --- | --- |
| create -> open | created1 / open1, saved null, dirty true |
| selection/zoom + same-reference content operation | complete authored snapshot unchanged |
| change monster-2 name and placement | current2, saved null, dirty true; old snapshot unchanged |
| validate/serialize | valid; content/Asset/Spatial CHECKED; physical file NOT_CHECKED |
| Save to absent scene.json | committed2, saved2, clean; 3474 actual bytes equal serialized candidate |
| close -> real load | old session terminal closed; new open session current1/saved1 clean |
| restore authored data from disk | exact envelope equality; IDs/order/reference/attachment/placement/facing/unknown metadata retained |
| edit loaded document then Save to existing scene.json with absent precondition | EXTERNAL_CONFLICT; bytes/current/saved/dirty snapshot unchanged; still dirty |
| revertToSaved | current3/saved1 clean; loaded saved content restored, no IO |
| missing Asset target | TARGET_NOT_FOUND; reference retained, validation-diagnostics, zero dispatch, no state change, dirty true |
| real revision2 publication, edit3 before receipt delivery | disk contains2; acknowledged2 -> current3/saved2 still dirty |
| explicit older Asset profile migration | read-only/migration-needed -> migrated candidate; unknown metadata/IDs retained, no source overwrite/save/session adoption |
| content99 vs numeric target2 | rejected/future-content |
| envelope2 load | unsupported-schema, no session |
| text-only envelope | valid without Scene/Map/canvas |
| separate fresh Node process | loaded actual bytes into new clean1/1 session with same file SHA; sprite physically absent in fixture, logical checks remain separate |

## Actual storage evidence and limits

Executed on Node `v24.18.0`, Windows local filesystem:
`.artifacts/document-mvp-v0.5.12-DfxXxC`.

- `before.json`: SHA256
  `c1c88c7b782848c1a4ac003e3e322b11c3107accff395b254952e6dc4e6f9849`,
  unchanged by pure edit, Save, conflict and reopen.
- `scene.json`: 3474 bytes; SHA256
  `5db6e42af8b0d243d0ac93524bdf3ed3707897122ebe2d42bee62a09c98cff82`.
  Equal to edited serialized payload; unchanged after conflicted write.
  Same SHA independently observed in a fresh Node process.
- `late.json`: actual revision2 payload, before releasing real receipt delivery.
- Three write-port attempts: **two actual commits + one real existing-file conflict**.
  Missing-reference Save never reached the port.
- Preconditions: `{kind:'absent'}`; storage identity/revision `null/null`.
  These are not session generation or Document/Asset IDs.
- Stage: exclusive open `wx`, UTF-8 payload write, file sync, close, then filesystem
  `link(stage,destination)`. EEXIST is conflicted; unknown publication errors are
  uncertain. No pre-read/hash plus unconditional rename is mislabeled as CAS.
- Stages remain: `.stage-167a8a90-7317-4269-ab87-368d8f99e089`,
  `.stage-d3200cb8-8515-4f49-afde-3aa60e15a672`,
  `.stage-fcb1b383-fab7-44ff-987d-fff45c961247`.
  No cleanup/retry/removal of potential sole valid payloads.
- Fixture also contains before.json, catalog-asset.json, coordinate-space.json,
  future-envelope.json, older-asset.json, scene.json and late.json; broken.json
  was not written. All fixtures/build outputs remain ignored, not committed.
- Read host is exact strict UTF-8 with post-read byte cap and lexical direct-child
  containment in a fresh trusted fixture. Not adversarial symlink authorization,
  preallocation memory bounds or a production host implementation.
- No existing-file replacement CAS, directory fsync/power-loss durability,
  crash/recovery, distributed storage or concurrent-reader stress proof.

The controlled Promise gates acknowledgement of an actual disk receipt, not a
mock IO success. It proves this finite save/late-edit sequence, not arbitrary
host scheduling or distributed consistency. The conflict is a real create-only
collision, not a claim to revision-token replacement safety.

Legacy migration input uses the historical Asset record shape confirmed with
`git show e63981d:editor/src/asset-definition.ts` (v0.2.2): schema1, identity,
kind, metadata; no sources/dependencies. Demo **Document-content profiles1 ->2**
are explicit example bindings, not published Asset2 or envelope2.
The existing owner factory adds empty collections. Original older-asset.json hash
and existing session remain unchanged; candidate is not automatically saved.

## Required automatic gates

- `node harness/cli.mjs check`: **ARCH_CHECK_PASS**, 69 JS/TS source files.
- `node harness/cli.mjs scope --projects editor --allow-infra`: **SCOPE_PASS**,
  six documentation/guidance paths including this report.
- `node harness/cli.mjs verify --projects editor --with-consumers`:
  **BUILD_PASS Editor**, existing public API consumers unchanged.
- `npm run build -- --force`: **PASS** runtime-engine, runtime-render, editor,
  game-client, game-server (actual all-five TypeScript build).
- `npm run foundations:prepare`: **FOUNDATIONS_READY** cached artifacts match
  exact pins. Core2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775`;
  Gameplay0.15.2 `acea332aa80f67552192a72b30f81c0bbbfc56bd`.
- Existing public-root consumer compile: zero diagnostics with ES2022 only,
  types:[], strict/exactOptionalPropertyTypes/noUncheckedIndexedAccess,
  skipLibCheck:false. Source/emitted export inventory: Editor134/134, Render52/52.
- Production source/manifests/locks/pins/workflow diff against prior checkpoint:
  empty. Emitted declaration public surfaces unchanged. Root-only export maps.
- Committed whitespace audit clean; no failed/unconfigured project build.
  Existing Windows Harness child-process DEP0190 warning remains unchanged.
- No unit/integration/UI/browser/E2E/snapshot tests, runners, coverage, test files,
  dependencies or runtime demo CI job added or run. Manual commands are printed
  in documentation only; ignored local compile inputs are not test artifacts.

Static boundary checks cover the configured scan rules, not exhaustive dependency
semantics. Build does not establish gameplay, visual correctness or manual acceptance.
Remote exact-head push/PR build results and final SHA are in PR5 ledger.

## Reference principles and unverified scope

References consulted, with no implementation copied:
[VS Code custom editors](https://code.visualstudio.com/api/extension-guides/custom-editors)
for document/view and explicit save separation;
[Unity serialization](https://docs.unity3d.com/Manual/script-serialization.html)
for supported serialization ownership;
[Godot saving](https://docs.godotengine.org/en/stable/tutorials/io/saving_games.html)
for explicit selection of persisted data;
[Unreal versioning](https://dev.epicgames.com/documentation/en-us/unreal-engine/versioning-of-assets-and-packages-in-unreal-engine)
for incompatible-data write safety.
JXQY ProjectDocumentRegistry/DurableFileTransaction source is unavailable here;
no parity, replacement or copied framework claim.

No visual product review, Renderer initialization, resource loading, full 2.5D
scene, depth/direction semantic verification, Editor GUI, UI Save/Undo/AutoSave,
Engine config, Client/Server behavior, production filesystem adapter or general
recovery was exercised. No blocked source/API mismatch was found for this finite
MVP; future storage/semantic capabilities remain open.

## Observed main transcript

Output below is from the final documented command, not expected/projected results.
It includes old/new snapshots. Reproduction commands live in the manual guide.

```text
created {"state":"created","revision":1,"saved":null,"dirty":true}
opened {"state":"open","revision":1,"saved":null,"dirty":true}
UI and same-reference no-op {"unchanged":true,"ui":{"selectedObjectId":"monster-2","zoom":2}}
edited {"state":"open","revision":2,"saved":null,"dirty":true}
old snapshot {"schemaVersion":1,"identity":{"projectId":"document-mvp-project","documentId":"zone-document"},"documentKind":"scene","contentSchemaVersion":null,"content":{"scene":{"identity":{"projectId":"document-mvp-project","sceneId":"zone-01"},"metadata":{"authorNote":"keep"}},"objects":[{"definition":{"objectId":"player-visual","displayName":"player-visual","classification":"visual-placeholder","metadata":{"customVisualProfile":{"authorIndex":0}}},"assetReference":{"projectId":"document-mvp-project","assetId":"visual-0012","expectedKind":null,"subresourceId":null},"layerKey":"ground-actors","placement":{"coordinateSpaceId":"ground","point":{"x":1,"y":2}},"metadata":{"customVisualProfile":{"facing":{"angleRadians":1.5707963267948966,"zeroAxis":"positive-x","positiveRotation":"toward-positive-y"},"leadingZero":"0012","nested":{"uninterpretedReference":{"assetId":"future-metadata-target"}}}}},{"definition":{"objectId":"monster-1","displayName":"monster-1","classification":"visual-placeholder","metadata":{"customVisualProfile":{"authorIndex":1}}},"assetReference":{"projectId":"document-mvp-project","assetId":"visual-0012","expectedKind":null,"subresourceId":null},"layerKey":"ground-actors","placement":{"coordinateSpaceId":"ground","point":{"x":2,"y":2}},"metadata":{"customVisualProfile":{"facing":{"angleRadians":1.5707963267948966,"zeroAxis":"positive-x","positiveRotation":"toward-positive-y"},"leadingZero":"0012","nested":{"uninterpretedReference":{"assetId":"future-metadata-target"}}}}},{"definition":{"objectId":"monster-2","displayName":"monster-2","classification":"visual-placeholder","metadata":{"customVisualProfile":{"authorIndex":2}}},"assetReference":{"projectId":"document-mvp-project","assetId":"visual-0012","expectedKind":null,"subresourceId":null},"layerKey":"ground-actors","placement":{"coordinateSpaceId":"ground","point":{"x":3,"y":2}},"metadata":{"customVisualProfile":{"facing":{"angleRadians":1.5707963267948966,"zeroAxis":"positive-x","positiveRotation":"toward-positive-y"},"leadingZero":"0012","nested":{"uninterpretedReference":{"assetId":"future-metadata-target"}}}}},{"definition":{"objectId":"monster-3","displayName":"monster-3","classification":"visual-placeholder","metadata":{"customVisualProfile":{"authorIndex":3}}},"assetReference":{"projectId":"document-mvp-project","assetId":"visual-0012","expectedKind":null,"subresourceId":null},"layerKey":"ground-actors","placement":{"coordinateSpaceId":"ground","point":{"x":4,"y":2}},"metadata":{"customVisualProfile":{"facing":{"angleRadians":1.5707963267948966,"zeroAxis":"positive-x","positiveRotation":"toward-positive-y"},"leadingZero":"0012","nested":{"uninterpretedReference":{"assetId":"future-metadata-target"}}}}},{"definition":{"objectId":"vfx-visual","displayName":"vfx-visual","classification":"visual-placeholder","metadata":{"customVisualProfile":{"authorIndex":4}}},"assetReference":{"projectId":"document-mvp-project","assetId":"visual-0012","expectedKind":null,"subresourceId":null},"layerKey":"effect","attachment":{"kind":"attachment","target":{"sceneId":"zone-01","objectId":"player-visual"}},"placement":{"coordinateSpaceId":"ground","point":{"x":5,"y":2}},"metadata":{"customVisualProfile":{"facing":{"angleRadians":1.5707963267948966,"zeroAxis":"positive-x","positiveRotation":"toward-positive-y"},"leadingZero":"0012","nested":{"uninterpretedReference":{"assetId":"future-metadata-target"}}}}}],"metadata":{"customVisualProfile":{"future":"retain"}}}}
new snapshot {"schemaVersion":1,"identity":{"projectId":"document-mvp-project","documentId":"zone-document"},"documentKind":"scene","contentSchemaVersion":null,"content":{"scene":{"identity":{"projectId":"document-mvp-project","sceneId":"zone-01"},"metadata":{"authorNote":"keep"}},"objects":[{"definition":{"objectId":"player-visual","displayName":"player-visual","classification":"visual-placeholder","metadata":{"customVisualProfile":{"authorIndex":0}}},"assetReference":{"projectId":"document-mvp-project","assetId":"visual-0012","expectedKind":null,"subresourceId":null},"layerKey":"ground-actors","placement":{"coordinateSpaceId":"ground","point":{"x":1,"y":2}},"metadata":{"customVisualProfile":{"facing":{"angleRadians":1.5707963267948966,"zeroAxis":"positive-x","positiveRotation":"toward-positive-y"},"leadingZero":"0012","nested":{"uninterpretedReference":{"assetId":"future-metadata-target"}}}}},{"definition":{"objectId":"monster-1","displayName":"monster-1","classification":"visual-placeholder","metadata":{"customVisualProfile":{"authorIndex":1}}},"assetReference":{"projectId":"document-mvp-project","assetId":"visual-0012","expectedKind":null,"subresourceId":null},"layerKey":"ground-actors","placement":{"coordinateSpaceId":"ground","point":{"x":2,"y":2}},"metadata":{"customVisualProfile":{"facing":{"angleRadians":1.5707963267948966,"zeroAxis":"positive-x","positiveRotation":"toward-positive-y"},"leadingZero":"0012","nested":{"uninterpretedReference":{"assetId":"future-metadata-target"}}}}},{"definition":{"objectId":"monster-2","displayName":"Monster edited","classification":"visual-placeholder","metadata":{"customVisualProfile":{"authorIndex":2}}},"assetReference":{"projectId":"document-mvp-project","assetId":"visual-0012","expectedKind":null,"subresourceId":null},"layerKey":"ground-actors","placement":{"coordinateSpaceId":"ground","point":{"x":7,"y":-4}},"metadata":{"customVisualProfile":{"facing":{"angleRadians":1.5707963267948966,"zeroAxis":"positive-x","positiveRotation":"toward-positive-y"},"leadingZero":"0012","nested":{"uninterpretedReference":{"assetId":"future-metadata-target"}}}}},{"definition":{"objectId":"monster-3","displayName":"monster-3","classification":"visual-placeholder","metadata":{"customVisualProfile":{"authorIndex":3}}},"assetReference":{"projectId":"document-mvp-project","assetId":"visual-0012","expectedKind":null,"subresourceId":null},"layerKey":"ground-actors","placement":{"coordinateSpaceId":"ground","point":{"x":4,"y":2}},"metadata":{"customVisualProfile":{"facing":{"angleRadians":1.5707963267948966,"zeroAxis":"positive-x","positiveRotation":"toward-positive-y"},"leadingZero":"0012","nested":{"uninterpretedReference":{"assetId":"future-metadata-target"}}}}},{"definition":{"objectId":"vfx-visual","displayName":"vfx-visual","classification":"visual-placeholder","metadata":{"customVisualProfile":{"authorIndex":4}}},"assetReference":{"projectId":"document-mvp-project","assetId":"visual-0012","expectedKind":null,"subresourceId":null},"layerKey":"effect","attachment":{"kind":"attachment","target":{"sceneId":"zone-01","objectId":"player-visual"}},"placement":{"coordinateSpaceId":"ground","point":{"x":5,"y":2}},"metadata":{"customVisualProfile":{"facing":{"angleRadians":1.5707963267948966,"zeroAxis":"positive-x","positiveRotation":"toward-positive-y"},"leadingZero":"0012","nested":{"uninterpretedReference":{"assetId":"future-metadata-target"}}}}}],"metadata":{"customVisualProfile":{"future":"retain"}}}}
validate {"status":"valid","codes":[],"checks":{"content":"CHECKED","assetReferences":"CHECKED","spatialReferences":"CHECKED","fileExistence":"NOT_CHECKED"}}
before-image preserved {"unchanged":true}
save {"status":"committed","revision":2,"state":{"state":"open","revision":2,"saved":2,"dirty":false},"observation":{"identity":null,"revision":null}}
disk evidence {"locator":"D:\\python_code\\game_dev\\jx1_web\\rpg-2d\\.artifacts\\document-mvp-v0.5.12-DfxXxC\\scene.json","bytes":3474,"sha256":"5db6e42af8b0d243d0ac93524bdf3ed3707897122ebe2d42bee62a09c98cff82","exactPayload":true}
closed {"state":"closed","revision":2,"saved":2,"dirty":false}
load {"status":"loaded","validation":"valid","checks":{"content":"CHECKED","assetReferences":"CHECKED","spatialReferences":"CHECKED","fileExistence":"NOT_CHECKED"}}
restored {"state":{"state":"open","revision":1,"saved":1,"dirty":false},"sameEnvelope":true,"documentId":"zone-document","sceneId":"zone-01","objects":[{"id":"player-visual","ref":{"projectId":"document-mvp-project","assetId":"visual-0012","expectedKind":null,"subresourceId":null},"placement":{"coordinateSpaceId":"ground","point":{"x":1,"y":2}},"attachment":null,"facing":{"angleRadians":1.5707963267948966,"zeroAxis":"positive-x","positiveRotation":"toward-positive-y"}},{"id":"monster-1","ref":{"projectId":"document-mvp-project","assetId":"visual-0012","expectedKind":null,"subresourceId":null},"placement":{"coordinateSpaceId":"ground","point":{"x":2,"y":2}},"attachment":null,"facing":{"angleRadians":1.5707963267948966,"zeroAxis":"positive-x","positiveRotation":"toward-positive-y"}},{"id":"monster-2","ref":{"projectId":"document-mvp-project","assetId":"visual-0012","expectedKind":null,"subresourceId":null},"placement":{"coordinateSpaceId":"ground","point":{"x":7,"y":-4}},"attachment":null,"facing":{"angleRadians":1.5707963267948966,"zeroAxis":"positive-x","positiveRotation":"toward-positive-y"}},{"id":"monster-3","ref":{"projectId":"document-mvp-project","assetId":"visual-0012","expectedKind":null,"subresourceId":null},"placement":{"coordinateSpaceId":"ground","point":{"x":4,"y":2}},"attachment":null,"facing":{"angleRadians":1.5707963267948966,"zeroAxis":"positive-x","positiveRotation":"toward-positive-y"}},{"id":"vfx-visual","ref":{"projectId":"document-mvp-project","assetId":"visual-0012","expectedKind":null,"subresourceId":null},"placement":{"coordinateSpaceId":"ground","point":{"x":5,"y":2}},"attachment":{"kind":"attachment","target":{"sceneId":"zone-01","objectId":"player-visual"}},"facing":{"angleRadians":1.5707963267948966,"zeroAxis":"positive-x","positiveRotation":"toward-positive-y"}}],"allOpaqueData":true,"sourceId":"0012"}
external conflict {"status":"conflicted","reason":"EXTERNAL_CONFLICT","sessionUnchanged":true,"state":{"state":"open","revision":2,"saved":1,"dirty":true},"bytesUnchanged":true}
restore saved snapshot {"state":{"state":"open","revision":3,"saved":1,"dirty":false},"sameAsLoaded":true,"noIO":true}
missing reference {"status":"validation-diagnostics","codes":["TARGET_NOT_FOUND"],"retained":{"projectId":"document-mvp-project","assetId":"missing-asset","expectedKind":null,"subresourceId":null},"noDispatch":true,"sessionUnchanged":true,"dirty":true}
published before ack {"receipt":"committed","state":{"state":"open","revision":3,"saved":null,"dirty":true},"diskIsRev2":true}
late acknowledgement {"status":"committed","acknowledged":2,"state":{"state":"open","revision":3,"saved":2,"dirty":true},"savedIsRev2":true,"currentName":"Revision three"}
explicit migration {"inspection":"read-only","reason":"migration-needed","result":"migrated","candidate":{"schemaVersion":1,"identity":{"projectId":"document-mvp-project","documentId":"legacy-asset-document"},"documentKind":"asset","contentSchemaVersion":2,"content":{"schemaVersion":1,"identity":{"projectId":"document-mvp-project","assetId":"visual-0012","sourceId":"0012"},"kind":"image","metadata":{"customVisualProfile":{"vendor":"opaque","frames":["0012",{"keep":true}]}},"sources":[],"dependencies":[]}},"unknownRetained":true,"sourceUnchanged":true,"noSave":true,"sessionUnchanged":true}
future content {"status":"rejected","reason":"future-content"}
future envelope {"status":"unsupported-schema","hasSession":false}
headless text "valid"
host evidence {"dir":"D:\\python_code\\game_dev\\jx1_web\\rpg-2d\\.artifacts\\document-mvp-v0.5.12-DfxXxC","node":"v24.18.0","expected":{"kind":"absent"},"observation":{"identity":null,"revision":null},"attempts":3,"commits":2,"files":[".stage-167a8a90-7317-4269-ab87-368d8f99e089",".stage-d3200cb8-8515-4f49-afde-3aa60e15a672",".stage-fcb1b383-fab7-44ff-987d-fff45c961247","before.json","catalog-asset.json","coordinate-space.json","future-envelope.json","late.json","older-asset.json","scene.json"],"beforeSHA256":"c1c88c7b782848c1a4ac003e3e322b11c3107accff395b254952e6dc4e6f9849"}
```

Independent read-only fresh-process output:

```text
{"freshProcess":true,"status":"loaded","checks":{"content":"CHECKED","assetReferences":"CHECKED","spatialReferences":"CHECKED","fileExistence":"NOT_CHECKED"},"revision":1,"saved":1,"dirty":false,"identity":{"projectId":"document-mvp-project","documentId":"zone-document"},"scene":{"projectId":"document-mvp-project","sceneId":"zone-01"},"editedObject":{"definition":{"objectId":"monster-2","displayName":"Monster edited","classification":"visual-placeholder","metadata":{"customVisualProfile":{"authorIndex":2}}},"assetReference":{"projectId":"document-mvp-project","assetId":"visual-0012","expectedKind":null,"subresourceId":null},"layerKey":"ground-actors","placement":{"coordinateSpaceId":"ground","point":{"x":7,"y":-4}},"metadata":{"customVisualProfile":{"facing":{"angleRadians":1.5707963267948966,"zeroAxis":"positive-x","positiveRotation":"toward-positive-y"},"leadingZero":"0012","nested":{"uninterpretedReference":{"assetId":"future-metadata-target"}}}}},"vfxAttachment":{"kind":"attachment","target":{"sceneId":"zone-01","objectId":"player-visual"}},"sourceId":"0012","spriteFile":"absent in fixture","sha256":"5db6e42af8b0d243d0ac93524bdf3ed3707897122ebe2d42bee62a09c98cff82"}
```

**STOP: READY_FOR_DEVELOPER_REVIEW.** No v0.5.13, merge, tag, release or publish.
