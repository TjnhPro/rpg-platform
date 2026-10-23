# v0.8.9 — SR14 Visual Scene Frame Integration

Outcome: **READY_FOR_NEXT_CHECKPOINT** for scoped code/build/static prerequisites.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED / ALPHA_NOT_VERIFIED**.
Actual sprite draw implementation is present; compilation is not visual proof.

## Preflight and ownership

Start `eff3bb6b13366d59c5804f61bb8041e6b2f90a14` on
`feat/scene-rendering-v0.8`; draft PR [#8](https://github.com/TjnhPro/rpg-platform/pull/8)
OPEN at matching head. Main baseline `ffb347140fbe6bf432bb8fe33c7057bed9a93941`.
Tracked checkout initially clean; unrelated untracked `.mcp.json` untouched and
excluded. Previous exact-head [push CI](https://github.com/TjnhPro/rpg-platform/actions/runs/39943334649)
and [PR CI](https://github.com/TjnhPro/rpg-platform/actions/runs/39943340952) success.

Read root AGENTS/ARCHITECTURE/FOUNDATION, Harness CONTRACTS/OWNERSHIP/WORKFLOW/
VERIFICATION/FAILURES and Render/Editor/Client guidance, public manifests,
declarations and current Phase4/6/7/8 implementation. The supplied detailed SR14
task authorizes this integration and minimal additive consumer operations.
**runtime-render** is the sole behavior owner. Editor and Client need compatibility
builds; their production source stays unchanged. Harness records the contracts.
No dependency direction change, sixth project or gameplay implementation.

Phase4 owns placement/projection math; Phase6 owns the canonical session, backend,
frame demand and terminal failure path; Phase7 owns real loaded texture/frame
leases, retain/release and native texture allocation. These implementations exist
at the input commit and are reused, not replaced with metadata/mock resources.
Core2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775` and Gameplay0.15.2
`acea332aa80f67552192a72b30f81c0bbbfc56bd` remain pinned/read-only; no new calls.

Three0.186.1/types0.186.0 unchanged. Official
[ExternalTexture](https://threejs.org/docs/pages/ExternalTexture.html) and
[MeshBasicMaterial](https://threejs.org/docs/pages/MeshBasicMaterial.html) docs plus
installed ExternalTexture/WebGLTextures source inspected. Public Three
ExternalTexture borrows Phase7 native allocations; no private Three deep import,
second upload/cache or ownership transfer. No lockfile/dependency/compiler change.

## File and public API delta

- `visual-sprite-layout.ts` and root exports: `RenderVisualSpriteLayout`,
  `setRenderVisualInstanceSpriteLayout`, `getRenderVisualInstanceSpriteLayout`.
  Explicit local image rect/unit; strict immutable capture, positive finite GPU
  extents and unit compatibility. Default null preserves metadata-only instances.
- `visual-scene.ts`: attach one private frame source, capture frozen ordered
  drawable data under submission guard, invalidate demand on relevant edits,
  remove stale drawables before releasing replaced bindings.
- `visual-transform-backend.ts` / `frame-session.ts`: private snapshot bridge,
  synchronous edit guard and canonical demand/submission/terminal cleanup.
- `three-visual-draw.ts` / `three-frame.ts`: same Three Scene/Camera/renderer;
  reused quad geometry/material and reference-counted ExternalTexture wrappers;
  actual Mesh ranks use the existing layer/depth/tie comparator.
- New version task/contract, optional manual consumer/page/guide, manual index,
  Render AGENTS and Harness CONTRACTS/OWNERSHIP/checkpoint.

Three additive public root symbols: Render182 / Editor134 / Client0 after genuine
declaration builds. Existing frame receipts remain `submitted`; no new display
status, schema, Editor/Client source, Engine/Server or L1/L2 change.

## Decisions, cleanup and limits

Local rect top-left is x/y, positive dimensions extend image right/down according
to explicitly declared source axes. The existing Phase4 localToClip matrix applies
anchor/pivot/local transform/projection, without copied transform math. Manual
fixed orthographic example maps source320x240 scene units to clip[-1,1], with
right/down source axes and right/up clip axes; 96x96 sprites use anchor/pivot48,96
at136/184,176. This is an explicit example, not a camera controller or inferred
pixel/unit policy. Canonical atlas UVs are consumed unchanged.

The synchronous submission guard freezes one scene revision/order and prevents
reentrant edits. Selected unavailable leases fail through Phase6; no stale success.
Create/update/remove/visibility/layer/depth/layout/binding edits request existing
demand; there is no RAF, interval or extra scheduler. Empty scenes preserve the
existing opaque clear; diagnostic Phase7 overlay remains separate and compatible.

Private unlit white transparent MeshBasicMaterial uses NormalBlending,
premultipliedAlpha=false, opacity1, alphaTest0, depthTest/write=false,
toneMapped=false, fog=false. DoubleSide + forceSinglePass handles axis/reflection
changes in one pass. This refines the earlier proposed front-facing quad while
preserving a flat two-triangle MVP. Actual drawable ranks determine transparent
list order; parent Object3D.renderOrder alone is insufficient.

Partial construction cleanup and terminal disposal attempt every owned stage.
Drawables are unlinked before resource usage release; backend teardown drains
drawables before native texture allocations. Wrapper disposal does not delete or
release shared Phase7 native textures. Hide retains instance lease ownership.
No cross-context sharing, GPU leak-free or successful cleanup claim from builds.
No general translucent3D/intersection/per-triangle/cyclic occlusion guarantee,
custom native passes, depth-writing occluders, postprocessing or dynamic cameras.

Rejected: second renderer/cache, fake usable leases, inferred screen-Y depth,
automatic image-pixel sizing, new frame loop, gameplay tick or Editor DOM ownership.
Rollback removes the three additive root symbols and private sprite draw/source
integration; existing membership/placement/frame contracts remain.

## Observed verification

| Command / inspection | Observed result |
| --- | --- |
| `npm run build --workspace runtime-render` | exit0, genuine Render build |
| `node harness/cli.mjs check` | exit0, ARCH_CHECK_PASS; 124 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | exit0, SCOPE_PASS |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | exit0, all three genuine builds PASS |
| `npm run build -- --force` | exit0, forced five-project workspace build PASS |
| Strict ES2022 package-root manual consumer compile, full command in manual guide | exit0; new frame consumer and eight previous scene consumers; no ambient DOM |
| TypeScript checker declaration export inspection | exit0; 182/134/0 symbols |
| Git whitespace/scope inspection | exit0; Render/Harness only; .mcp.json excluded |

No unresolved failed/unconfigured build. Existing Windows Harness DEP0190 warning
unchanged. No tests, assertions, runners, coverage, browser automation or new assets
introduced/executed. Actual push/PR CI and exact checkpoint SHA are recorded in
the PR #8 ledger after completion, not predicted in this commit.

## Manual evidence and handoff

[Manual guide](../../runtime-render/manual/visual-scene-frame.md) compiles a
public-root-only consumer and serves a button-driven two-PNG browser page. The
Developer selects authorized local PNGs; actual Phase7 load/decode/upload and
independent instance retains precede draw. No bundled third-party asset or endpoint.
The consumer can also receive existing canonical frame bindings.

Browser **NOT_EXECUTED**: two-item draw, empty clear, hide/move/order/ground sorting,
alpha/color, atlas pixels, cleanup and context failure behavior remain unobserved.
TPSHEET_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED inherited. No observable
acceptance checkbox PASS and no Phase8 MVP/Developer acceptance claim.

No dependency blocker for this limited checkpoint. Next v0.8.10 requires its
detailed supplied scope; no speculative next-version implementation here.
No intermediate review gate, main edit, merge, tag, release or publish.
