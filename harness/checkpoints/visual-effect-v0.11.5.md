# v0.11.5 VE06 — Effect World Position & Offset

IMPLEMENTED: explicit world-plane placement and translation-only local anchor
offset via the existing Phase8 transform. Finite manual API/resource evidence
below; full VFX FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED. Developer phase
acceptance remains pending.

## Baseline and authorized scope

Date: 2026-10-24 Asia/Bangkok. Branch feat/visual-effect-playback-v0.11, Draft PR11.
Main phase base aceea67f95cb309bdd06f1d6193767bfa06f42ce; previous exact VE05 HEAD
2046a4abe3a145e8c31179807ec585a2f061abbf. The containing checkpoint commit SHA
and exact-head push/PR CI are recorded in the PR ledger after commit.

Requested behavior: move an effect in explicit world units with anchor/offset,
preserving authored/gameplay position, identity, transport and resource ownership.
Canonical primary owner: runtime-render. Only visual-effect-instance.ts/root
exports and Render API docs change in production scope. Harness stores the supplied
task, checkpoint, contract and ownership ledger. Editor/Client are unchanged
public-contract build consumers. No Engine/Server/L1/L2, authored schema,
dependency/pin/package/CI or external repository edit. No external foundation
calls. Preexisting untracked .mcp.json and ignored artifacts are excluded.

Delta preflight read root/project AGENTS, ARCHITECTURE, FOUNDATION,
harness/{OWNERSHIP,CONTRACTS,WORKFLOW,VERIFICATION,FAILURES}, previous checkpoint
and actual related source/declarations. Route hint found no reliable keyword
owner; actual source determines Render ownership, not the route result.
The supplied task authorizes this additive seam and translation-only MVP;
no backward-incompatible or upstream-owner extension is required.

## Real dependencies and public delta

Phase4: ProjectionPlane2D / PlaneProjectionPoint2D,
OrthographicPlaneProjection/createOrthographicPlaneProjection, VisualAnchor2D,
PlanarTransform2D and resolveVisualAlignment2D plus planar affine composition.
The effect delegates capture/composition to existing captureVisualInstanceTransform;
there is no VFX vector/matrix or unit converter. Phase8 supplies
set/getRenderVisualInstanceTransform and canonical frame-state revision/membership
admission. VE03 supplies issued identity/scope, VE04 owns command serialization,
VE05 preserves playback/lifetime. Phase9 camera remains independent.

Four additions, Render317→321:

- setVisualEffectWorldPlacement
- getVisualEffectWorldPlacementSnapshot
- VisualEffectWorldPlacementInput
- VisualEffectWorldPlacementSnapshot

Compiler-generated declaration comparison found zero removed/changed old root
declarations across all five projects. Editor138 and Client/Engine/Server0 remain
unchanged. Strict emitted-root consumer compilation uses ES2022/types[] with
skipLibCheck:false and no DOM. Matching declarations are compatibility evidence,
not universal behavioral acceptance.

Input uses existing placement, anchor, projection records. Source project matches
the definition; existing placement source plane must remain exact across moves.
Translation-only local identity TRS makes world attachment = placement + offset;
local origin = attachment - local anchor. Explicit pivot is retained and cancels
under identity TRS. No center inference, pixels-as-world mapping, camera math,
auto-follow/hierarchy/path, frame binding or authored/gameplay mutation.
The [API/runbook](../../runtime-render/docs/visual-effect-v0.11.5.md) defines numeric
order, failure behavior, historical readback and lower-level mutation limits.

## Manual observation — actual graphics session, no pixel claim

Original sources from sibling jx1-manager-editor/data/asset-sources/monster/ani063:

| Source | Bytes | SHA256 |
| --- | --- | --- |
| Attack1_0.tpsheet | 888 | fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7 |
| Attack1_0.png | 12270 | f31783508fe55cc39a421b9f3505503a831d7727605c1f2278e4a690585d3cd2 |

Headed Chrome via installed Playwright CLI, real createRenderFrameSession/Three.js,
emitted Render public root, localhost8796. Explicit world context project ve06,
space world, world-unit, right/up. Original addresses0012/0000/0012,8fps repeat.
Host acquired the original PNG through existing cache and bound the whole texture
with frame:null to the effect's existing Phase8 membership. This demonstrates
preserved rights; it does not implement VE08 VFX frame binding or draw pixels.

| Input / expected | Actual observation |
| --- | --- |
| Initial effect without placement | transform null |
| placement(100,200), anchor(2,3), pivot(1,1), offset(-4,5) | origin(94,202), plane pivot(95,203), attachment(96,205); matches public Phase4 alignment and affine-applied anchor |
| Explicit .01 clip-unit/world-unit mapping | projected attachment(.96,2.05), source placement remains(100,200); binary64 coefficient rounding retained |
| Mutate original placement/offset records after commit | detached stored values remain unchanged |
| Move same effect to(-10,20) with same anchor/offset | origin(-16,22), attachment(-14,25), same visual handle, same playback snapshot playing187.5ms/frame1/0000, same resourceId |
| Preserve resource ownership during both moves | source reads1, uploadCalls1, CPU/GPU entries1, leases2 before/after; no resource recreation |
| Wrong anchor unit / mismatched axes / foreign project / changed coordinate-space | TypeError, previous transform identity preserved |
| Missing plane / NaN or Infinity offset | TypeError, previous transform identity preserved |
| MAX_VALUE world x + MAX_VALUE offset x | canonical RangeError, previous transform identity preserved |
| Configured CPU camera pan(30,-40), zoom2 | camera revision2; same effect transform object; camera unbound/not-applied |
| Forged effect handle | FOREIGN_INSTANCE |
| Reflection attempts nested effect play | TRANSITION_IN_PROGRESS, outer valid placement can commit |
| Removal during input reflection | INSTANCE_REMOVED; old visual membership absent, never resurrected |
| Move after explicit removal | INSTANCE_REMOVED; detached last placement remains readable |
| Frozen output | snapshot, transform and nested placement point frozen |
| Release host lease, dispose session/cache | scene instances/bound usages0, releaseAttempts1, cache CPU/GPU/leases0, cleanupFailed false |

Raw finite records: ignored .artifacts/ve06/observations-cli.txt, host/server and
compiler audit there. Browser console had only favicon404. One initial CLI eval
syntax error required a function expression; corrected observation then completed.
Browser and owned server closed. No mocks/fake assets/test runner or suite.

Not independently observed: actual on-screen placement/animation, VFX frame
synchronization, bound-camera pixel comparison, depth/layout conflict paths,
native cleanup fault injection or native allocation reclamation. Authored/gameplay
nonmutation is established by source scope, not a running Editor/Engine scenario.
No renderFrame was called. Logical retained-right counters are not GPU-profiler
receipts. Full VFX FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED remains explicit.

## Gates and handoff

| Command / audit | Actual result |
| --- | --- |
| node harness/cli.mjs check | Exit0 ARCH_CHECK_PASS,176 JS/TS sources |
| node harness/cli.mjs scope --projects runtime-render --allow-infra | Exit0 Render + Harness scope |
| node harness/cli.mjs verify --projects runtime-render --with-consumers | Exit0 BUILD_PASS Render, Editor, Game Client |
| node .artifacts/ve06/public-audit.mjs | Exit0 four additive roots, old root declarations unchanged |
| npx tsc -p .artifacts/ve06/tsconfig.json | Exit0 strict emitted-root consumer, no DOM |
| git diff --cached --check | Exit0 |

No failed/unconfigured final local build. Existing Harness DEP0190 warning is
nonfatal. Exact-head CI additionally verifies all five projects and the full
workspace build; SHA/run results are recorded in PR11. No unit/integration/
browser/Playwright/E2E/snapshot/visual-regression suite, runner, coverage or matrix
added/run. Browser CLI drove only the finite manual API observation described.

Next is v0.11.6 Visual Instance Attachment. No detailed next task supplied and
no next capability implemented. No routine review pause, merge/tag/publish or
Developer acceptance is inferred.
