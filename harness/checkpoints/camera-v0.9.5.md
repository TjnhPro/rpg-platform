# v0.9.5 — CM09/CM10 Camera Viewport & DPR Integration

**READY_FOR_NEXT_CHECKPOINT** for the supplied additive read-adapter scope.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED** for integrated camera behavior.
Browser NOT_EXECUTED. Native DPR/resize observations remain NOT_OBSERVED; builds
and source inspection are not substituted for those observations. Developer owns
product acceptance. Only supplied v0.9.5 is implemented.

## Exact preflight / plan

Previous checkpoint HEAD/local/fetched phase upstream:
`72168e937afd37091db0853cd1b8bf6c5f99aad1` (v0.9.4).
Main and merge-base: `e4464ac8e1c84a1c872f8e7a722885942a268a28`.
Branch `feat/camera-projection-v0.9`, same OPEN draft
[PR #9](https://github.com/TjnhPro/rpg-platform/pull/9), base main, matching headSha.
Prior exact-head CI verified SUCCESS:
[push39967342709](https://github.com/TjnhPro/rpg-platform/actions/runs/39967342709),
[PR39967350949](https://github.com/TjnhPro/rpg-platform/actions/runs/39967350949).
The commit containing this report is the checkpoint HEAD. Its exact SHA and
matching completed current CI are recorded in PR after push; previous CI is not
current evidence. Tracked baseline clean; preexisting untracked `.mcp.json` remains
untouched/excluded. No base drift found.

Read root AGENTS/Architecture/Foundation, Harness contracts/ownership/workflow/
verification/failures, Render/relevant Editor/Client guidance and prior checkpoint.
Inspected actual camera/config/zoom, Phase4 plane/affine/viewport, Phase6 frame/
resize/backend, Phase7 cache/PNG/texture seams, Phase8 visual-scene path and Editor
adapters/Client host. Real Phase7/8 sources exist; task historical absence note is
stale. This adapter consumes no resources/live instances, so it requires no new
Phase7/8 contract or fake session/lease.

Behavior: derive current camera CSS mapping from host logical extent and accepted
Phase6 resize. **Canonical primary owner runtime-render**. Harness records contract
and evidence only; Editor/Client are build compatibility consumers, no source edits.
Route `camera viewport DPR integration` gave Render hint only. No Engine/Server or
L1/L2 APIs needed. Supplied task pre-approves additive Phase9 APIs, no review pause.

Pre-implementation plan: read adapter, not persistent camera binder; preserve-scale
and recompute current mapping on read. Use issued receipt identity to detect stale
equal-buffer resizes; session ID/size equality cannot do that. Minimal Phase6
owner-local provenance seam, never backend resize duplication. Separate requested
CSS, accepted buffer and effective per-axis ratio. Reject suspended/terminal/zero,
foreign/copied/stale receipts and camera disposal. No DOM/observer/native camera/
frame/authoring changes. Gates: static/scope, Render+consumers, portable emitted
roots/manual compile, workspace build, checkpoint commit/push and exact-head CI.

## Files / contracts / architecture

Eleven intended files:

- `runtime-render/src/camera-viewport.ts`: adapter and readonly observation.
- `runtime-render/src/frame-session.ts`: latest issued receipt WeakMap, private
  root-excluded guard; retain existing resize return shape/signature/ownership.
- `runtime-render/src/index.ts`: two additive root exports.
- `runtime-render/manual/camera-viewport.mts` and `.md`: finite public-root
  observation consumer, actual Node negative and optional native runbook.
- `runtime-render/docs/camera-v0.9.5.md` and `docs/tasks/camera-v0.9.5.md`:
  contract and supplied task, trailing whitespace normalized.
- `runtime-render/AGENTS.md`, `harness/CONTRACTS.md`, `harness/OWNERSHIP.md`:
  minimal guidance/pointers.
- This checkpoint report.

New root names: `getRenderCameraViewportSnapshot` and
`RenderCameraViewportSnapshot`. Signature takes existing RenderCamera,
RenderFrameSession, RenderViewportResizeReceipt and ViewportMetrics2D.
Snapshot: configured-not-applied status, current camera view, active viewport,
exact resize receipt, canonical CSS mapping. No mutable registry API/new factory.
Exact previous/current emitted declaration audit: Render204 ->206, Editor138 ->138,
Client0 ->0; removed0/changed0. Strict actual emitted roots compile without DOM.
This is declaration evidence, not universal runtime compatibility proof.

Every accepted resize/resume, including `unchanged`, replaces the private issuance
token. Only exact latest receipt on the same canonical active/ready session is
admitted. Active snapshot size/session must agree. Receipt records requested CSS,
accepted native extent, accepted/logical ratio. Host logical dimensions must match
exactly; CSS right/down plane must share source project. The source plane comes
from camera configuration; unknown matching labels remain declarations, no registry
existence claim. Recheck session/receipt and camera after host proxy capture.

Policy remains preserve-scale: center at logical midpoint, scale*zoom unchanged.
Aspect resize changes visible spans, never zoom or authored placement. Re-read after
accepted resize/ratio change on same camera/session. Buffer ratio is not multiplied
into CSS mapping. Device-plane logical input rejects; no new implicit device/screen
conversion. Existing explicit Phase4 screen context remains available.

Zero/invalid metrics and suspended/pending/unavailable/terminal viewport reject;
host must mark hidden/zero UI via existing Phase6 suspension rather than ask Render
to infer CSS visibility. Unconfigured/disposed cameras reject. Invalid state/data
TypeError, canonical numeric limits RangeError, host exceptions propagate. No camera
center/zoom/revision or session mutation in adapter. Historical snapshots do not
promise continued liveness. Phase6 already invalidates on accepted resize; this read
requests no frame, invalidation, scheduling or native camera application.

No required DTO member/union/signature change, compiler/package/lock/workflow change,
new project, new backend, domain schema or ownership/dependency change. Exactly five
projects. Installed/locked Three0.186.1, @types/three0.186.0, TS6.0.3 confirmed. Pins
remain Core2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775`, Gameplay0.15.2
`acea332aa80f67552192a72b30f81c0bbbfc56bd`, read-only/unmodified.

## EXPECTED / OBSERVED / NOT_OBSERVED

[Exact manual compile / Node command and optional native procedure](../../runtime-render/manual/camera-viewport.md).
Manual consumer imports actual package root only, no internal or fake graphics API.

| Scenario | EXPECTED | OBSERVED |
| --- | --- | --- |
| Node import / foreign `{}` session before receipt or metrics access | TypeError, preserve camera | TypeError `Expected a graphics handle from this Render package instance`; cameraUnchanged true; process exit0 |
| Actual emitted roots + finite manual browser consumer | strict portable compile | exit0; no native execution inferred |
| CSS800x450 / requested ratio1 and2 | same center400,225 CSS | NOT_OBSERVED on native session |
| Buffer candidates800x450 and1600x900 | receipt must supply actual native sizes/ratios separately | NOT_OBSERVED; no native acceptance claim |
| CSS600x400 | center300,200, scale2/zoom1 unchanged | NOT_OBSERVED on native session |
| Stale/copy/missing/cross-session receipt; even equal-buffer unchanged resize | TypeError, preserve camera/session | NOT_OBSERVED on native session; public-root walkthrough compiled |
| Zero/negative/nonfinite/mismatched extents; device-plane / other project | TypeError | NOT_OBSERVED on native session |
| Suspended/terminal session and disposed camera | reject; resume requires fresh receipt | NOT_OBSERVED on native session |
| A resizes while B retains its receipt/mapping/camera | independent B | NOT_OBSERVED on native session |
| Immutable accepted snapshot history | unchanged historical configuration | NOT_OBSERVED on native session |

No browser/WebGL/frame/pixel/GPU camera evidence. No browser test or automated
assertions were introduced to fill this gap. Optional browser consumer acquires two
real sessions, performs finite declared logical-size requests and finally disposes
them; it has not run. It declares numeric host extents, not a CSS measurement claim.
No live Scene consumer/gameplay owner is involved; authored Document/placement,
VisualInstance and gameplay before/after comparison NOT_OBSERVED/inapplicable here.
No expiry path: adapter consumes no resource lease. Existing invalid-zoom admission
is unchanged v0.9.4 behavior, not re-claimed as new observed evidence.

Rejected alternatives: structural receipt mock/equivalent without issuance, native
size equality as freshness, deriving CSS from viewport snapshot alone, requested
ratio as accepted ratio, multiplying DPR into logical mapping, second renderer,
backend/DOM/CSS/ResizeObserver edits, native-camera binding/occupancy or Phase8 mesh
mutation in this checkpoint. No missing production prerequisite/blocker established
for read-adapter scope. Integrated visual application remains pending.

## Actual gates / handoff

Preparation commands all exit0; required static/build gates repeat at committed
HEAD before push. Completed current SHA CI is linked in PR only after completion.

| Gate | Actual result |
| --- | --- |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS,143 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render --allow-infra` | SCOPE_PASS; eleven intended files, unrelated .mcp.json excluded |
| `node harness/cli.mjs verify --projects runtime-render --with-consumers` | Render/Editor/Client genuine BUILD_PASS |
| `npm run build -- --force` | forced five-project workspace BUILD_PASS |
| Strict actual emitted Render/Editor/Client roots + sixteen manual consumers | exit0; NodeNext ES2022/no DOM/empty typeRoots, strict/noUncheckedIndexedAccess/exactOptionalPropertyTypes/verbatimModuleSyntax/skipLibCheck false |
| New manual compile and Node foreign-session observation | exit0, actual output above |
| Exact emitted declaration audit against v0.9.4 | two additions, zero changed/removed |
| Git whitespace / protected-scope inspection | exit0; intended Render/Harness only |

No failed/unconfigured build remains. Existing Windows Harness DEP0190 is a warning.
No tests/runners/coverage/CI jobs added or historic suites executed. Static/build
success does not establish feature or visual acceptance. Rollback removes two root
names/new adapter/manual/docs/pointers and owner-local receipt provenance bookkeeping;
no migration or native cleanup required. Ready for next **supplied v0.9.6** after
fresh preflight. No unsupplied checkpoint, phase acceptance, merge, tag, release or
publication performed.
