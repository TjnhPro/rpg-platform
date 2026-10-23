# Phase 7 closure audit — v0.7.14

**READY_FOR_DEVELOPER_REVIEW — v0.7.14** is review-packet readiness, not acceptance.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED**.
No native successful PNG decode, GPU reuse/cleanup or displayed image was observed
in this phase's recorded runs. No production feature is added at closure.

Baseline: Phase 6 merge `33c9da5ac79cfce27043927fe5d7e08e3bd6d02c`.
Production endpoint: `8e43b40df3375559e703d416109b48e6360ccf48` (v0.7.13).
[PR7](https://github.com/TjnhPro/rpg-platform/pull/7), branch
`feat/visual-resource-loading-v0.7`. See the [15-slot commit/full-file inventory](phase-inventory-v0.7.14.md),
[complete public declaration delta](public-api-delta-v0.7.14.md),
[checkpoint/gates](../../harness/checkpoints/visual-loading-v0.7.14.md) and
[manual reproduction](../manual/visual-resource-mvp.md).

## Acceptance matrix VL01–VL20

IMPLEMENTED means source/contract exists and compiles, **not** behavioral acceptance.
DESIGN_ONLY means a documented decision, not executable support. NOT_VERIFIED marks
missing acceptance observations even when implementation exists. DEFERRED and
BLOCKED are used only for explicitly postponed work or a demonstrated dependency
blocker. No mandatory architecture dependency blocker was found; browser evidence
is pending. Feature allocation below follows the actual supplied checkpoint tasks,
superseding the provisional v0.7.0 future allocation (notably VL06/10/12/15/16).
Each version links a report; its exact commit and both CI runs are in the inventory.

| ID / actual checkpoint | Delivery status | Canonical source / decision | Evidence and acceptance limit |
| --- | --- | --- | --- |
| VL01 / [0](../../harness/checkpoints/visual-loading-v0.7.0.md) | DESIGN_ONLY | visual-loading-v0.7.0 ownership/layers | Render sole resource owner; five projects preserved; no code at v0 |
| VL02 / [0](../../harness/checkpoints/visual-loading-v0.7.0.md), [2](../../harness/checkpoints/visual-loading-v0.7.2.md) | IMPLEMENTED | visual-source-load.ts; baseline/public delta inventories | 70 legacy Render names unchanged; source lifecycle compile + finite source observations; not GPU proof |
| VL03 / [1](../../harness/checkpoints/visual-loading-v0.7.1.md) | IMPLEMENTED | visual-source.ts | Explicit host authority, copied bytes, safe one-shot codes; no locator grants permission |
| VL04 / [2](../../harness/checkpoints/visual-loading-v0.7.2.md) | IMPLEMENTED | visual-source-load.ts | Requested/pending/acquired/released, late-byte discard and original errors observed on finite file consumer |
| VL05 / [3](../../harness/checkpoints/visual-loading-v0.7.3.md) | IMPLEMENTED; native success NOT_VERIFIED | png-image.ts, png-bitmap.ts | Real CC0 PNG admitted; DECODER_UNAVAILABLE in Node; truncated original INVALID_PNG; native decode/close unobserved |
| VL06 / [4](../../harness/checkpoints/visual-loading-v0.7.4.md) | IMPLEMENTED; runtime NOT_VERIFIED | render-texture.ts, texture-lifetime.ts, three-frame.ts | Context-bound native upload/diagnostics and cleanup source-audited/compiled; no actual upload receipt |
| VL07 / [5](../../harness/checkpoints/visual-loading-v0.7.5.md) | IMPLEMENTED (restricted profile) | unity-atlas.ts | Actual TexturePacker Unity40300 TPSheet bytes parsed; not generic TPSheet/JSON support |
| VL08 / [5](../../harness/checkpoints/visual-loading-v0.7.5.md) | IMPLEMENTED | atlas-metadata.ts | Two real pages, eleven frames normalized; separate metadata/image bindings, atomic reject, no pixels |
| VL09 / [6](../../harness/checkpoints/visual-loading-v0.7.6.md) | IMPLEMENTED | atlas-frame.ts, atlas-metadata.ts | Exact keys/revision snapshot resolution and missing/stale failures observed; no authored resolver migration |
| VL10 / [7](../../harness/checkpoints/visual-loading-v0.7.7.md) | IMPLEMENTED; GPU view NOT_VERIFIED | atlas-geometry.ts | Official exporter source + offline original pixels establish bottom-left conversion; numerical geometry observed; borrowed GPU view unobserved |
| VL11 / [8](../../harness/checkpoints/visual-loading-v0.7.8.md) | IMPLEMENTED; shared decode NOT_VERIFIED | png-load-scope.ts | Concurrent finite real reads deduplicated; release/failure/retry traces observed; successful native alias sharing unobserved |
| VL12 / [9](../../harness/checkpoints/visual-loading-v0.7.9.md) | IMPLEMENTED; live reuse NOT_VERIFIED | visual-resource-cache.ts CPU/GPU keys | Bounded live-only reuse; canonical session needed; empty/admission observations only |
| VL13 / [9](../../harness/checkpoints/visual-loading-v0.7.9.md) | IMPLEMENTED; native lifetime NOT_VERIFIED | cache waiter/retire; texture-lifetime.ts | Independent leases, idempotent release, no idle retention; native final-close/delete unobserved |
| VL14 / [9](../../harness/checkpoints/visual-loading-v0.7.9.md) | IMPLEMENTED; cross-session runtime NOT_VERIFIED | cache groups; frame-session terminal subscriptions | CPU can span sessions; GPU per session; A disposal/B survival supplied as manual scenario, not observed |
| VL15 / [10](../../harness/checkpoints/visual-loading-v0.7.10.md) | IMPLEMENTED; live replacement NOT_VERIFIED | invalidateVisualResourceCache, source revision guards | Guard updates/limit observed without IO; old live A/new B success or failure survival unobserved |
| VL16 / [10](../../harness/checkpoints/visual-loading-v0.7.10.md) | IMPLEMENTED; GPU failures NOT_VERIFIED | safe cache classifier; PNG/atlas budgets; session diagnostics | Known denied/missing/over-budget codes observed; native loss/cleanup not exercised |
| VL17 / [11](../../harness/checkpoints/visual-loading-v0.7.11.md) | IMPLEMENTED (optional manual consumer); runtime NOT_VERIFIED | editor/manual/editor-visual-resource.mts and atlas-mvp.mts | Actual authored catalog/reference/descriptor and unchanged unsaved document observation; replacement/unmount/browser unobserved |
| VL18 / [12](../../harness/checkpoints/visual-loading-v0.7.12.md) | IMPLEMENTED (optional manual consumer); runtime NOT_VERIFIED | game-client/manual/visual-resource.mts and atlas-mvp.mts | Real selected File provider, atlas/source observations; no Editor dependency; same-realm host isolation unobserved |
| VL19 / [13](../../harness/checkpoints/visual-loading-v0.7.13.md) | NOT_VERIFIED (MVP behavior); implementation present | visual-resource-demo.ts, demo-quad.ts, manual MVP | One explicit texture/frame fixed quad within existing backend, compiled; real metadata/failure observations only; image display/sharing/release/revision demonstration not executed |
| VL20 / [14](../../harness/checkpoints/visual-loading-v0.7.14.md) | IMPLEMENTED (closure packet) | This audit, public/commit/file inventories, task/report, PR ledger | Static/build/exact-head CI evidence delivered separately from functional/manual acceptance; Developer decides acceptance |

DEFERRED beyond this phase: generic atlas formats/rotation/trim reconstruction,
Scene renderer, sprite/animation/VFX playback, idle cache eviction/LRU/TTL, measured
GPU memory/performance, production Editor/Client product UX. None is fabricated to
close Phase 7. No mandatory item is silently marked DEFERRED or PASS.

## Ownership and public compatibility

| Boundary | Audit result | Evidence |
| --- | --- | --- |
| Render resource implementation | Sole owner, 17 production paths added/modified; no Editor import | Complete diff inventory; src index/source/PNG/atlas/cache/frame/backend |
| Editor authored state | Production src unchanged; optional hosts adapt catalog/reference and grant source access | asset-visual.ts, asset-reference.ts; editor/manual entries |
| Client independent consumer | Production root unchanged; optional provider/consumer imports Render root only | game-client/manual modules; Harness composes hosts |
| Engine / Server / frozen L1/L2 | No phase diff, no new foundation calls | Diff vs Phase6; unchanged manifests/lock/pins |
| External backend | Three0.186.1 / @types0.186.0 unchanged | Native WebGL texture upload inside existing Three-owned session, no alternate renderer |
| Legacy metadata API | Source unchanged, synchronous NOT_PERFORMED | visual-resource.ts; headless import observation and declaration inventory |
| Legacy graphics API | Same declarations and clear-only renderFrame; texture cleanup joins canonical terminal path | frame-session.ts/three-frame.ts diffs; no public failure-union expansion |
| Authored subresource | Opaque; Editor resolver still SUBRESOURCE_NOT_SUPPORTED | asset-reference.ts unchanged; Render resolves explicit real atlas snapshot separately |
| Workspace/tooling | Exactly five independent projects; Harness tooling only | Root workspaces/config unchanged, no shared/common package or loader singleton |

Dependencies remain: Engine -> external Core/kernel + Gameplay; Render -> Three;
Editor and Client -> Engine + Render; Server -> Engine (Render permission optional,
not a required GPU dependency). Core2.0.0 commit
`04b7239f998c3c688a0dfa3202f11811a9acd775`; Gameplay0.15.2 commit
`acea332aa80f67552192a72b30f81c0bbbfc56bd`. No deep/private imports or copied rules.

## Cache identity, lifetime and failure audit

| Stage / path | Actual source semantics | Remaining limit / evidence |
| --- | --- | --- |
| Source / visual-source.ts + visual-source-load.ts | Provider authority captured, project checked, host validates exact grant/source, returned length/media/revision bounded and bytes copied; single-use start/release | No general source-byte settled cache; host must bound allocation and enforce filesystem realpath/containment if it implements filesystem access; Render has no fetch/filesystem fallback |
| In-flight / png-load-scope.ts | One fixed provider scope/read method per scope. Key = complete detached descriptor + image index + exact expected revision + decode limits + fixed browser decode profile | Conservative full descriptor can prevent reuse. Different scope/cache instances never share automatically. Provider auth change requires replacement, not mutation of old scope |
| Decode / png-image.ts | Static PNG container admission; native createImageBitmap, fixed orientation/premultiply/color/no-resize options; private bitmap, independent alias rights | Not independent decompressor/CRC validator. Rejects APNG/eXIf profile. Native decoder/GPU allocations are not total-memory budgets |
| Settled CPU / visual-resource-cache.ts | Same CPU key as pending scope; retained while GPU entries in any session hold users; no separate atlas parse cache | Final CPU use releases the shared image; final native close unobserved. Metadata and image revisions are not automatically atomic/coherent as a pair |
| GPU / cache groups + three-frame.ts | Key adds sampling/color options within canonical session group. New sessions allocate separate native textures even with shared CPU. Same-session hits get independent texture aliases | No cross-context GPU sharing. Canonical session identity prevents foreign/stale reuse. Counters are attempts/ownership, not bytes, timing or completion |
| Lease / waiter, retire | One right per consumer; lease or alias release consumes same right once; last waiter retires GPU entry then decrements CPU; unlink before native cleanup | Snapshot/result is historical. Observe current handle before use; terminal result Promise is not a live resource guarantee |
| Session terminal / frame-session.ts + render-texture.ts | Mark terminal, drain subscriptions/revoke pending and usable group rights before backend teardown, then texture/quad/listener/scene/renderer cleanup | CPU remains only if another explicit owner exists. Actual context loss and A/B isolation unobserved; terminal recovery requires explicit new session |
| Late completion / source, PNG, scope, cache | Released source skips late response adoption; late decoded bitmap is closed; abandoned/replaced jobs cannot evict a newer job; closed GPU entry cannot upload | No physical host IO abort/timeout promised. Unexpected errors retain identity; already terminal lease may have settled before later failure |
| Invalidation / cache revisions | Future admission guard = fixed provider + project/resource + source index, independent of locator/options; exact new revision required before lookup/IO; old rights including pending work remain pinned | No automatic file freshness. Same-revision invalidation is idempotent; rollback can reuse live old revision. Reordered slots require host update/replacement |
| Replacement failure | Source/decode/parser failure rejects candidate, retires its own entry; old content is not implicitly mutated/deleted | GPU terminal failure invalidates the whole failing session, so old same-session resources are not guaranteed to survive GPU failure; another session owns its independent rights |
| Cleanup failure | All owners attempted; sticky delete/close/graphics uncertainty preserved; native resource release failure routes canonical session failure/quarantine | Logical terminal states/deleted calls cannot establish reclaimed GPU bytes or leak-free behavior. Native cleanup throwing paths remain source-audited only |
| Bounds / limits | CPU1..1024, GPU1..4096, revision guards1..4096; no valid-owner eviction or idle retention. PNG <=16MiB/8192 per axis/16M pixels; atlas <=1MiB/sheet,8MiB total,64pages,65536frames; host can lower | Host pre-hash/byte copies/native work are outside aggregate budgets. Parser no-rotation/zero-borders/unknown-trim constraints are explicit |

## Real asset evidence and provenance

Observed evidence below comes from the named finite checkpoint consumers; this
closure introduces no new runtime experiment or test. Originals remain unmodified
outside Git because redistribution rights are unestablished.

| Input | Bytes / SHA256 | Actual observation |
| --- | --- | --- |
| Original CC0 editor/manual/png-sample/rgba-2x2.png | 76 / e9aa41812d69aa8ebbee3fb351fede258f2a159c4a547b3187ee54184dea0b79 | Real bytes, 2x2 PNG admission; Node has no native createImageBitmap |
| Wound_7.tpsheet | 594 / 2a4f8e481fb7934b84431bf47deaece16d28af31c220646cd799cb0effc8f57d | Actual40300 profile parsed, 3 keys0050/0052/0054 |
| Wound_7.png | 4132 / 564e290a89c9352aa8535e83857f8fc17ae16325d7e073a18ad21bd9f38b1a3d | Acquired/hashed through host; independently decoded offline128x128 at v7, not Render browser decode |
| Attack1_0.tpsheet | 888 / fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7 | Actual40300 profile parsed, 8 keys0000..0014 step2 |
| Attack1_0.png | SHA256 f31783508fe55cc39a421b9f3505503a831d7727605c1f2278e4a690585d3cd2 | Offline native-file pixel decode128x256, not browser/GPU evidence |

Original pairs: `../jx1-manager-editor/data/asset-sources/monster/ani063/`.
The parser supports **unity-tpsheet-40300-rect** only: strict UTF8, five supported
directives, eleven semicolon fields, finite pivot, unrotated rectangles and zero
borders. No inferred animation grammar; trim/sourceSize remain unavailable/null.
Unknown directives/unsupported variants are rejected rather than claimed supported.

v0.7.7 inspected official TexturePacker8.3.0 exporter source from its archive
(SHA256 `2a19ffd1d1af5a8f61293f5311d5ddcd9a6fb22192d70c455ab02400371dff9d`),
not executed. Exporter/TransformCoords establishes bottom-left `H-y-h` conversion.
Frame0050: native x1,y80,60x47 -> top-left x1,y1,60x47 on128x128; normalized UV
(.0078125,.0078125,.4765625,.375). Real parse/geometry support is evidenced, so a
blanket TPSHEET_NOT_VERIFIED would hide that evidence. **TPSHEET_VISUAL_NOT_VERIFIED**
still applies. v11's historical TPSHEET_NOT_VERIFIED label concerns its PNG-only
preview checkpoint, not absence of the earlier parser sample.

Finite observations across checkpoints include denied/missing source, revision
mismatch, independent copied bytes/release, shared source read/failure/retry/late
completion, parser/frame failures and explicit revision/entry limits. v13 observed
FRAME_NOT_FOUND and SOURCE_NOT_FOUND; a transient20-byte truncated original PNG
yielded INVALID_PNG, handles released. No fake decoder/context or success fixture.

## Developer manual handoff and open decisions

Browser execution was NOT_EXECUTED in the recorded phase runs. Earlier tooling
inventory had apps[]/browsers[]; Phase6 also recorded unavailable iab. This is an
environment observation, not proof native graphics is unsupported. No new browser
availability claim is made at closure. No submission/display can be inferred from
builds, counters or offline PNG inspection.

Use the existing [MVP runbook](../manual/visual-resource-mvp.md) and
`harness/manual/visual-resource-mvp.html`, plus the separate
`harness/manual/resource-host-isolation.html` for Editor/Client survival review.
Record actual browser/version, selected source hashes, native decode/texture states,
A1/A2/B1 IDs/counters, partial/final release, A disposal/B draw, real context loss,
replacement SHA256/old-right survival, failure diagnostics and visible image/frame.
Expected counters in the runbook are not observations. No performance/leak-free
conclusion follows from that short manual demonstration.

Open for Developer: functional/visual Phase7 acceptance (VL19 especially), inherited
Phase6 browser evidence, whether selected supported format/profile is sufficient,
and any production host UX/future format support. No owner move or breaking API
decision is required by this closure. Developer alone decides acceptance/merge and
next phase. Stop after closure commit/push/exact-head CI/PR ledger; no auto-next task.
