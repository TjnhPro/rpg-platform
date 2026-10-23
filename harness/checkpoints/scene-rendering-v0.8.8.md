# v0.8.8 — SR11/SR12/SR13 Depth Sorting & Stable Ordering

Outcome: **READY_FOR_NEXT_CHECKPOINT** for scoped code/build/static prerequisites.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED / DRAW_NOT_IMPLEMENTED**.
No observable behavioral acceptance is claimed from compilation.

## Preflight and owner

Start `e98ee721680aeb64df4632e5ff90f8ba5741fd22` on
`feat/scene-rendering-v0.8`; draft PR [#8](https://github.com/TjnhPro/rpg-platform/pull/8)
OPEN at matching head. Fetched main `ffb347140fbe6bf432bb8fe33c7057bed9a93941`.
Tracked checkout initially clean; unrelated untracked `.mcp.json` untouched and
excluded. Prior exact-head [push CI](https://github.com/TjnhPro/rpg-platform/actions/runs/39941952647)
and [PR CI](https://github.com/TjnhPro/rpg-platform/actions/runs/39941961477) success.

Read root AGENTS/ARCHITECTURE/FOUNDATION, Harness CONTRACTS/OWNERSHIP/WORKFLOW/
VERIFICATION/FAILURES and Render/Editor/Client agent guidance. Audited public
roots, manifests, declarations, compiler settings, current source and actual
Phase4/6/7 ownership. Route gives no final ownership decision; source establishes
**runtime-render** as the single owner of live presentation sorting. Editor and
Client need compatibility builds only. Harness records ownership/contracts.
The supplied task explicitly authorizes the minimal additive ordering policy API.
No dependency direction change, sixth project or uncertain ownership.

Phase4 owns transform/anchor/plane capture; ground uses its existing source
attachment. Phase6 canonical graphics lifecycle, frame demand and native ordering
writes are reused. Phase7 real cache retain/release and decoded/uploaded usable
texture APIs remain intact; no metadata-only replacement or fake resource.
Editor authored scene/assets/documents/spatial adapters and Client host unchanged.
Engine/Server unchanged. No gameplay/world authority or collision policy.

Three0.186.1/types0.186.0 unchanged. Official
[Material](https://threejs.org/docs/pages/Material.html) and
[Object3D](https://threejs.org/docs/pages/Object3D.html) documentation plus installed
WebGLRenderLists/material source inspected for separate opaque/transparent passes,
renderOrder and depth settings. Core2.0.0
`04b7239f998c3c688a0dfa3202f11811a9acd775` and Gameplay0.15.2
`acea332aa80f67552192a72b30f81c0bbbfc56bd` remain pinned/read-only; no new calls.
No dependency/lockfile/compiler/workflow/assets change.

## File and public contract delta

- `runtime-render/src/visual-depth.ts`: neutral policies/keys, immutable strict
  data admission, finite normalized depth, canonical plane validation and branded
  depth failure classification.
- `visual-scene.ts`: scene-local per-layer policy/per-instance key; proposed-state
  validation, cached total ordering and existing native ranks/transform integration.
- `index.ts`: four set/get functions, one failure classifier, three neutral types;
  **eight additive root symbols**. Complete signatures in the
  [contract](../../runtime-render/docs/scene-rendering-v0.8.8.md).
  No changed required creation/handle shapes or existing failure unions.
- New optional real-session manual package-root consumer, independent supplied
  task and contract, this checkpoint, Render AGENTS and Harness ownership/contracts.
  Previous checkpoint records unchanged.

Rebuilt root symbols **Render179 / Editor134 / Client0** (previous171/134/0).
No native/DOM/GPU type escapes through the additive API.

## Decisions, failures and rollback

Default explicit-order preserves existing behavior. Policy selection is separate
from layer definition updates. Opt-in depth-key carries exact unit and higher/
lower front convention. Ground-y carries complete explicit source plane and up/
down front; source attachment is Phase4 localToScene(anchor), not projected clip,
CSS/screen Y, image top-left, camera inference or isometric guessing. If front
matches source Y axis, increasing Y draws later; otherwise decreasing Y does.
Full plane project/space/unit/axes must match. Missing context/keys, nonfinite
values, invalid orientation and mismatched units reject before accepted edits.
Prepare transforms/keys on an explicit layer before moving into a required policy.
Hidden members are validated too. Clear retains policies; deletion/termination
removes their owned policy state.

Ascending tuple: layer priority, layer creation ordinal (keeps equal-priority
layers grouped), normalized within-layer depth, explicit instance order, instance
creation ordinal. Finite relational comparison avoids subtraction overflow. No
load-completion/update timing or gameplay identity dependency. Depth changes keep
handles/correlation/placement/resource ownership; no IO/reload/recreation.

Decorate/validate each entry once, O(n log n) sort on relevant state change,
revision cache for unchanged observations, O(n) filtered frozen candidate output.
No generic recursive scene graph traversal or O(n squared) sorting work. Proposed
transform supplies ground depth before native rank/matrix writes and accepted
logical commit; unknown host errors remain unknown. Existing frame-in-progress
guard and terminal native failure cleanup remain canonical, not rollback claims.
No-op policies/keys avoid native invalidation; unused prepared keys do not request
frames. Changed presentation writes use existing demand, no new scheduler/frame.

Chosen future basic 2D alpha profile: same transparent list/group, actual drawable
rank assignment, NormalBlending, transparent=true, straight-alpha source with
premultipliedAlpha=false, opacity1, depthTest=false, depthWrite=false, alphaTest0,
single front-facing quad/pass. This is a documented integration choice, **not an
installed material**. Current Object3D nodes are non-drawable; ordinary parent
renderOrder does not order future mesh children. No general translucent3D,
intersecting primitives, cyclic/per-triangle occlusion, mixed native passes,
depth-writing occluders or custom compositor correctness guarantee.

Rejected: screen/top-left heuristics, silent context/unit fallback, global depth
engine, resource timing sorting, alternate renderer/cache, premature sprite draw,
dummy materials, general3D transparency claims. Rollback removes eight additive
root names/private policy-key-cache comparator extension; no persisted schema,
Engine, Editor, Client or external L1/L2 migration.

## Observed verification

| Command / inspection | Observed result |
| --- | --- |
| `npm run build --workspace runtime-render` | exit0, genuine Render build |
| `node harness/cli.mjs check` | exit0, ARCH_CHECK_PASS; 121 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | exit0, SCOPE_PASS |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | exit0, all three genuine builds PASS |
| `npm run build -- --force` | exit0, forced five-project workspace build PASS |
| Strict ES2022 package-root manual consumer compile, full command in contract | exit0; new depth and seven existing scene consumers; no ambient DOM |
| TypeScript checker declaration exports | exit0; 179/134/0 symbols |
| Git whitespace/scope inspection | exit0; Render/Harness only; .mcp.json excluded |

No unresolved failed/unconfigured build. Existing Windows Harness DEP0190 warning
unchanged. No tests, assertions, fixtures-as-tests, runner/framework, browser
automation or coverage introduced/executed. Exact new commit and actual push/PR
CI URLs are recorded in PR #8 ledger after completion, not predicted here.

## Acceptance evidence and handoff

Three-object ground Y movement, repeated equal-depth order, explicit ties, both
axis conventions and layer dominance: implemented and public-consumer compiled;
manual/browser observation **NOT_EXECUTED**. The walkthrough also logs rejected
context/key changes, retained identity/resource observations and explicit policy
switching. No behavioral checkbox PASS and no pixel/native-rank/lifetime proof.

Alpha support/unsupported limits are documented; drawable sprite material and
three-object overlap observation remain **DRAW_NOT_IMPLEMENTED / ALPHA_NOT_VERIFIED**.
The existing Phase7 raw-GL diagnostic quad cannot prove instance compositing.
TPSHEET_VISUAL_NOT_VERIFIED inherited; no new asset/support/license claim.
No blocker to this limited checkpoint; no Phase8 MVP/Developer acceptance claim.

Next v0.8.9 requires its supplied detailed task; no speculative next-version code
inside this commit. No intermediate review gate requested. No main change,
automatic merge, tag, release or publish.
