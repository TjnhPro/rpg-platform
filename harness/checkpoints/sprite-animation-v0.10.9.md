# v0.10.9 SA10 — Editor animation integration

**IMPLEMENTED_EDITOR_MANUAL_CONSUMER / FINITE_REAL_BROWSER_OBSERVATIONS.**
No Phase10 MVP_PASS, general visual acceptance or Developer acceptance claim.

## Delta preflight and contract scope

Previous checkpoint/base: `6ff97e83ef1255865d1285210008c2ea104c5892` (SA09).
Main baseline: `78dc4a9d14288df33ca46b3af4d23d09ceef9b82`. Same branch
feat/sprite-directional-animation-v0.10 and open Draft
[PR10](https://github.com/TjnhPro/rpg-platform/pull/10). Containing full SHA and
actual exact-head CI are recorded in that PR's ledger after commit/push.
Tracked tree was clean; preexisting untracked .mcp.json remains excluded.

Delta-focused read of root/Editor/Render guidance, architecture/foundation and
Harness ownership/contracts/workflow/verification/failures preceded changes.
Inspected actual Scene membership/visual/spatial/alignment/preview bridge,
Asset catalog/reference/visual descriptor, Document session, Render clip/playback/
binding, atlas/source/cache and existing manual host source/emitted declarations.
Phase6 session, Phase7 real source/parser/cache/leases, Phase8 live instances and
Phase9 camera contracts exist at this HEAD; no assumed future capability.

Route hints name both Render and Editor. Canonical primary owner here is
**editor**, owning only authored-reference/browser preview adaptation. Render
remains animation/resource/instance authority and needs no change. Runtime
Engine/Client/Server and external L1/L2 receive no edits or new semantics. No
external foundation API calls are needed; Editor's existing root transitively
links its frozen foundation packages in the browser import graph.

Scope: optional Editor manual browser module/HTML/read-only server/compile config/
walkthrough, preserved supplied task, Editor guidance/manual index, Harness
ownership/report. No production src/public-root, authored storage/schema,
dependency, CI runner or project build configuration change. The optional manual
compile config only emits this consumer under ignored .artifacts. Tooling is not
a sixth production project.

Used Editor root APIs: createAssetCatalog/createAssetReference,
resolveAssetReference/describeResolvedVisualAsset, createSceneMembership,
createCoordinateSpaceDefinition, describeSceneObjectAlignment,
createScenePreviewBridge, createDocumentEnvelope/createDocumentSession.
Used Render root APIs: canonical frame references/resolution, source acquisition/
loads/parser/revision, resource cache/leases, frame session/Scene, orientation,
eight-way clips, playback commands/advance/snapshot, live visual binding,
instance/resource/viewport readback and safe diagnostics. No private import or
direct Three implementation. Browser-only globals stay in the optional entry;
Editor public root remains headless/import-safe.

## Host decisions

The [manual walkthrough](../../editor/manual/animation-preview.md) supplies exact
run commands and the slot/key table. Authored sample retains Scene/object and
Asset correlation in Editor, adapts canonical descriptors to Phase7 frame refs,
then validates every exact key through Render. One preview bridge creates the
subject instance; one Render playback and visual binding subsequently update it.
No repeated bridge sync overwrites animation. No Scene/document playhead writes.

Explicit per-slot source assignment uses16 real resources across idle/walk. Source
keys are preserved, including differing idle direction counts8/7. No filename
sort, padding, duplicate-direction substitute, atlas rewriting or crop/upload
per frame. Two clip names/timing are host-authored examples: idle150ms repeat,
walk125ms repeat. Render convention right/down, zero angle0 at slot0 is explicit
sample configuration, not a verified source compass. UI chooses numerical slots,
not angles. No gameplay direction/state/role interpretation.

The numerical inspection origin/anchor/pivot is frame-top-left(0,0), offset0,
pixel ratio1. It is an explicit presentation choice, not a claim of anatomical
ground, trim=0, original untrimmed origin or sourcePivot meaning. Placement stays
(140,90); Phase4 projection maps320x240 plane to the640x480 native buffer.

| Host input | Owner/policy |
| --- | --- |
| Clip / direction / play / pause / resume / stop | Delegate directly to the same Render playback handle |
| Step deltaMs | Explicit number passed to Render; no Editor elapsed accumulator/FPS math |
| Different clip | Render selectClip stopped-zero transition |
| Different direction | Same Render logical elapsed, actual target sequence count |
| Hidden document | Pause transport; explicit Resume policy; no scheduled loop |
| Close/pagehide | Closed latch first, detach controls/lifetime listeners, revoke/abort provider, release loads/bridge/binding/playback/leases/Scene/cache/session |
| Missing source | ASSET_NOT_AVAILABLE with Phase7 cause; drain resources, no fallback |
| Failed update/cleanup | Safe failure status; last valid bound frame retained; all cleanup stages attempted, uncertainty surfaced |

The provider authorizes exact project/resource/source role/index/path against the
authored catalog and immutable scope. HTTP reads stream within caller maxBytes;
hash revisions describe actual bytes. Revocation aborts pending IO and prevents
late return/adoption. Local server exposes only authorized source names and actual
emitted/package modules, with no writes. All16 small pages preload; no production
streaming/population system is introduced. Close leaves the authored Document
available for readback, rather than treating preview close as save/discard.

## Actual verification

| Command / audit | Observed result |
| --- | --- |
| node harness/cli.mjs check | exit0, ARCH_CHECK_PASS168 JS/TS sources |
| node harness/cli.mjs scope --projects editor --allow-infra | exit0, SCOPE_PASS; scoped paths audited before commit |
| node harness/cli.mjs verify --projects editor | exit0, genuine Editor BUILD_PASS; no failed/unconfigured builds |
| npx tsc -p editor/manual/animation-preview.tsconfig.json | exit0; strict ES2022/NodeNext actual manual emission, DOM confined to this optional consumer |
| node .artifacts/sprite-animation-v0.10.9-public-audit.mjs | exit0; actual emitted declarations against SA09: Render271/Editor138/Client0 unchanged, zero removed/changed/added root symbols |
| Node import of @rpg-platform/editor | exit0;58 runtime exports; globalThis.document undefined |
| git diff --check | exit0 |

No Render public contract changed, so no required Render consumer rebuild delta.
Editor build genuinely rebuilt its project references. No automated tests,
assertions, test suites/runners, coverage targets or CI matrices added/run.
Harness Node DEP0190 remains a nonfatal preexisting warning. Local optional browser
initialization first exposed missing foundation server routes and wrong per-slot
frame keys; both were corrected using actual installed modules and original
metadata before the observations below. No parser/geometry extension was made.

## Finite actual Chrome observations

Playwright CLI was used solely for manual UI interactions, status readback and
screenshots; no test program/assertion/suite was created. Real local read-only
sources: sibling jx1-manager-editor/data/asset-sources/monster/ani063,
NormalStand1_0..7 and NormalWalk_0..7 PNG/TPSheet pairs.32 original files:
the sorted name/byte-length/SHA256 manifest was captured locally at
.artifacts/sa10-source-manifest.json, SHA256
`2133f93a52d1ccf25d854e4d10b6ec08352f59006aa868a09b007caa730e4043`.
NormalStand1_0.png7096 bytes SHA256
`a248f7e1d94382ce52751ac95edf42002980589f580068fb61767d05105f9ba7`;
NormalWalk_7.tpsheet638 bytes SHA256
`9424f60bcf53d03d1cce75b63d287b9edc0752a9a62a4ac02b464b6e42c30e1a`.
No sibling edits or art copies were committed.

| INPUT | EXPECTED | OBSERVED |
| --- | --- | --- |
| Select idle slots0..7 | Eight actual resource/frame refs | NormalStand1_0..7 first keys0000/0016/0030/0046/0060/0076/0090/0106; every canonical bound frame equals selected ref; failure null |
| Select walk slots0..7 | Eight actual resource/frame refs | NormalWalk_0..7 first keys0000/0008/0016/0024/0032/0040/0048/0056; every canonical bound frame equals selected ref; failure null |
| Inspect16 canvas screenshots | Actual sprite pixels beyond submitted receipts | Inspected contact sheet shows eight distinct artwork facings for each clip, not identical copies or blank canvases; local screenshots under .artifacts/sa10-evidence after review |
| Walk slot7, Play, Step125 | Render elapsed125/frame1 | playing125, NormalWalk_7/0058 |
| Pause, Step125 | Retain time/frame | paused125, same0058 |
| Change paused direction to1 | Preserve elapsed; select target's frame1 | paused125, NormalWalk_1/0010 |
| Resume, Step125 | Continue same handle to250 | playing250, frame2/0012 |
| Stop then Step125 | Reset and remain stopped | stopped0, frame0/0008 |
| Step -1 then valid Play | Failure, preserved last frame; recover via valid command | PREVIEW_FAILED/UNKNOWN_FAILURE from rejected TypeError, stopped0/frame0008 unchanged; subsequent Play playing0/failure null |
| All controls and close | Preserve authored Document | revision1,dirty=true,sameEnvelope/sameRevision/sameDirty all true throughout; Scene/object correlation retained on preview-1 |
| Close after16 pages/controls, dispatch detached Step | Dispose/drain; no adoption | playback disposed; cache disposed CPU0/GPU0/leases0,cleanupFailed:false; detached event leaves readback unchanged |
| Reload then immediate Close during initialization; later readback | Closed mount cannot adopt readiness | playback null, cache disposed CPU0/GPU0/leases0/sourceJobs0/uploads0,cleanupFailed:false; later readback identical |
| Separate server configured to genuinely absent source directory | Honest missing asset, no generated substitute | closed, ASSET_NOT_AVAILABLE NormalStand1_0, Phase7 SOURCE_NOT_FOUND; no playback/visual, disposed empty cache; authored unchanged |

Initial loaded cache: CPU16/GPU16/sourceJobs16/uploads16/leases17; Phase8 retains
one usage in addition to16 host leases. Instance remains preview-1 with correlation
project editor-animation-manual / scene preview / object subject. Close reports
logical disposal diagnostics, not proof of native driver memory reclamation.

NOT_OBSERVED: independent product review, source compass-to-angle truth, source
FPS/gameplay roles, anatomical foot stability/untrimmed layout, hidden-tab native
transition, injected cleanup errors, native memory reclamation, context loss/
restoration in this Editor entry, camera interactions, multiple mounts/population
performance and continuous scheduling. No GPU/DOM requirement is imposed on
Server; no engine/gameplay authority is inferred from displayed frames.

SA10 is ready for the separately supplied v0.10.10 Game Client consumer task using
the same public Render contracts. No next-version implementation, merge, tag,
release or publication is included here. Developer alone accepts completion.
