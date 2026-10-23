# v0.8.5 — SR07 Instance Transform & Alignment

Outcome: **READY_FOR_NEXT_CHECKPOINT** for scoped implementation/build/static
prerequisites. **FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**. Build success is
not observed contact invariance, backend execution or visible sprite rendering.

## Preflight and owner

Starting HEAD `01537e9a85f9f6d98d30489a0fa8861b12f97539`, branch
`feat/scene-rendering-v0.8`, existing draft PR #8 OPEN at that head. Fetched
main/base remains `ffb347140fbe6bf432bb8fe33c7057bed9a93941`. Tracked checkout
clean before this checkpoint; existing unrelated untracked `.mcp.json` excluded.
Previous checkpoint exact-head push and PR CI both succeeded (PR ledger).

Read root AGENTS/ARCHITECTURE/FOUNDATION, Harness CONTRACTS/OWNERSHIP/WORKFLOW/
VERIFICATION/FAILURES and Render/Editor/Client agent guidance. Inspected actual
public roots, manifests/declarations/compiler configs, frame session/teardown,
private Three backend, resource/cache/frame geometry, Phase 4 TRS/affine/alignment/
projection and Editor Scene/Asset/Document/spatial and Client host boundaries.
The route scanner suggested Server from generic backend language; rejected that
keyword hint. Canonical primary owner is **runtime-render**: live instance state
and native presentation. Editor/Client require compatibility builds only; Harness
records decisions/evidence. Supplied SR07 explicitly authorizes this additive
public contract; no dependency reversal or breaking change.

## Dependency gate and external API audit

At preflight HEAD, canonical createRenderFrameSession/renderFrame, Phase 6
viewport/terminal subscription/invalidation and private Three renderer are real
implementations. Phase 7 cache.acquire produces a public usable texture lease
only after decode and real native upload. SR06 binding retains its own canonical
waiter, validates session/revision/frame and releases independently. None is
replaced by metadata readiness, a mock, copied loader or second resource cache.
Transforms do not acquire/release/replace that binding; existing instance teardown
still drains it. Native texture-to-material/draw integration is not implemented
by SR06 and is not fabricated by this transform checkpoint.

Installed/pinned Three 0.186.1 / types 0.186.0 unchanged. Official
[Object3D](https://threejs.org/docs/pages/Object3D.html) and
[Matrix4](https://threejs.org/docs/pages/Matrix4.html) docs checked for explicit
matrix updates and Matrix4.set argument order. New native calls are private.
Core2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775` and Gameplay0.15.2
`acea332aa80f67552192a72b30f81c0bbbfc56bd` remain frozen; no new L1/L2 usage.
No assets imported or new sample rights/TPSheet parsing assumed.

## File and API delta

- `visual-instance-transform.ts`: owner-local capture and Phase 4 composition;
  neutral input/snapshot types, exact source context and fixed MVP mapping checks.
- `plane-projection.ts`: extract owner-local ordered projection steps, reused by
  existing point projection (same arithmetic order) and instance composition.
- `visual-scene.ts`: exact-handle set/get transform, detached immutable state,
  precommit rechecks, node cleanup plus existing resource drain.
- `visual-transform-backend.ts`: private weak canonical session writer dispatch,
  no enumerable registry, alternate backend or root export.
- `frame-session.ts`: connect writer to the existing backend/lifecycle and mark
  existing redraw demand; preserve frame admission, no schedule/submit/clock.
- `three-frame.ts`: private Object3D per transformed instance in existing scene,
  affine Matrix4 with manual updates, remove/clear/dispose; no drawables/materials.
- `index.ts`: four additive names: set/getRenderVisualInstanceTransform and
  RenderVisualInstanceTransformInput/RenderVisualInstanceTransformSnapshot.
- Optional `manual/visual-instance-transform.mts`, independent contract/task docs,
  Render guidance, Harness ownership/contracts and this checkpoint report.

Source paths above are under `runtime-render/src`. Rebuilt root symbol counts:
**Render154 / Editor134 / Client0**, previously150/134/0. New declarations contain
only existing neutral Phase 4 data, no THREE.Vector/Matrix, Sprite or Camera.
Existing required signatures/failure unions/resource snapshots are unchanged.
No Engine/Server/Editor/Client production edit, sixth project, dependency/pin/
lockfile/compiler/workflow change, assets or test infrastructure.

## Composition, failures and decisions

`localToScene = T(alignment.pivot) * localTRS * T(-localPivot)`, using existing
Phase 4 affine compose. Phase 4 unrotated alignment supplies origin/pivot; the
same canonical projection steps compose localToClip. Snapshots expose actual
transformed anchor and projected point. Placement + localOffset is contact at
identity; with pivot=anchor and zero local translation that contact stays fixed
under rotate/scale and anchor/pivot replacement together, subject to binary64
rounding. A different pivot intentionally moves contact around it. Numeric local
units/axes are explicit, never normalized fractions or inferred image-center.
Facing remains independent metadata, never frame selection or geometry rotation.

Fixed MVP destination: same project / render-clip-2d / clip-unit / right,up,
existing identity Camera, z=0. Host selects origin and positive ratios; no CSS/
DPR/screen-coordinate fallback. Out-of-extent clipping is allowed. Source plane,
units and axes must match exactly. Phase 9 camera policy stays open. Forward-only
operations need no inverse: finite zero/negative scale keeps approved Phase 4
semantics, with no inverse/picking claim. No hierarchy or imported authored Scene.

Capture/freeze/validate candidate before native mutation; recheck exact handle,
current transform/correlation/binding; write node then commit snapshot. Invalid
input/3D/unit/axes/mapping => TypeError; arithmetic overflow => RangeError;
unexpected exceptions propagate. Admission rejection preserves last accepted
transform and resource rights. Non-null reentrant frame mutation rejects before
write with FRAME_IN_PROGRESS. Native exception/context loss uses canonical
terminal cleanup; no successful transform or rollback to dead graphics.

null removes transform/node only; repeated null is a no-op. Node cleanup is
allowed during reentrant teardown so removal cannot leave an orphan. Success
marks existing demand, never schedules/submits a frame. Remove/clear/terminal
unlink membership/state before attempting every owned cleanup; resource release
is attempted even on node failure. Canonical backend disposal clears nodes after
terminal listeners. Cleanup exceptions retain committed removal/terminal state;
no cleanup/leak-free/GPU-success guarantee follows from idempotence or build.

Rejected alternatives: direct Three.position assignment from authored points,
duplicated matrix/projection math, implicit image-center or pixel-unit conversion,
TRS decomposition losing affine composition, second scene renderer/cache, camera
controller, sprite/draw integration, animation/physics/gameplay policy. Rollback
removes additive API/state/private writer/nodes; no saved-data migration.

## Verification evidence

| Gate | Observed result |
| --- | --- |
| `npm run build --workspace runtime-render` | exit0, genuine Render build |
| `node harness/cli.mjs check` | exit0, ARCH_CHECK_PASS, 117 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | exit0, SCOPE_PASS; scanner includes unrelated .mcp.json, staging excludes it |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | exit0, genuine Render/Editor/Client builds PASS |
| `npm run build -- --force` | exit0, forced workspace build of all five project references PASS |
| Strict ES2022 public-root manual compile, new SR07 + unchanged SR02/SR03/SR04/SR05/SR06 consumers | exit0, no ambient DOM, skipLibCheck false |
| TypeScript checker public-root enumeration and declaration inspection | exit0; 154/134/0; neutral transform declarations |
| Git whitespace and staged scope inspection | exit0; declared Render/Harness files only |

Exact final SHA and actual push/PR CI URLs are recorded in the existing PR #8
ledger after push/remote completion. Both workflows genuinely build every project;
this report does not predict their outcome. Existing Windows Harness DEP0190
warning remains; no failed/unconfigured build observed. No tests created or run.

## Acceptance limits and handoff

Two placements, first-only immutable update, contact/pivot replacement, resource
preservation, nonfinite/unit/3D/unsupported mapping rejection and last-state reads
are implemented and public-consumer compiled. Optional real-session walkthrough
is NOT_EXECUTED; none of those observable cases is marked behaviorally PASS.
Native Object3D matrix integration is source-backed but not browser-observed.
Nodes have no drawable: renderFrame still submits the existing clear; no visible
sprite movement, material/resource draw, frame latency or GPU memory proof.
Inherited TPSHEET_METADATA_OBSERVED / TPSHEET_VISUAL_NOT_VERIFIED is not rerun.

No dependency blocker found for this scoped transform checkpoint. Future drawable
integration must reuse the existing native backend and Phase 7 allocation owner.
v0.8.6 task contents are not supplied: no speculative next-version implementation.
Continue the next supplied task without intermediate review approval. Stop here
for this scope; no merge/main edit, release/tag/publication or MVP closure claim.
