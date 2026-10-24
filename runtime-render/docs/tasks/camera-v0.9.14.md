# TASK — RPG Platform v0.9.14: Camera Foundation Integration & MVP Closure

**Phase:** 9 / 20 — Camera & Projection
**Version:** `v0.9.14` · Checkpoint **15/15** · Feature IDs: **CM20 (Closure)**
**Canonical primary owner:** `runtime-render (primary), editor/client (consumers), Harness (audit)`
**Repository:** https://github.com/TjnhPro/rpg-platform
**Delivery:** one phase branch/PR; 15 independent checkpoints; continuous execution to MVP without per-version Developer review.
**Source status:** forward-looking task specification, **not evidence that required code already exists**.

## A. Objective and only authorized scope — v0.9.14

**Goal:** Audit toàn Phase 9 với evidence trung thực; không triển khai capability mới.

**Prerequisite:** `v0.9.13` at an actual source/commit baseline, plus Phase 4 Spatial, Phase 6 viewport/frame, Phase 7 resource loading and Phase 8 live Scene integration **as required by this version**. Do not assume roadmap files equal installed public APIs.

**Expected touched scope:** Harness report/docs; no production delta. Suggested files: `harness/checkpoints/camera-v0.9.14.md`, `harness/CONTRACTS.md`, `harness/OWNERSHIP.md`, project AGENTS pointers if stale; production only if prior defect blocks closure and has separate explicit scope. This is a source orientation, not permission to refactor all listed projects.

### Required implementation decisions / work items

- Audit all 15 checkpoint commits v0.9.0–v0.9.14 (closure self commit recorded in PR ledger), source/API changes, exact types/declarations and owner graph. One branch, one PR, exact HEAD CI mapping.
- Inventory camera identity/state/config, pan/zoom/focus, viewport/DPR, world/screen/inverse, 2.5D fixed-height, bounds, Phase 8 visual scene and Phase 6 frame integration, Editor+Client manual hosts.
- Review end-to-end no duplicate projection formulas, camera backend, resource manager, second graphics session, accidental Scene/Document mutation or gameplay position authority.
- Record contract compatibility explicitly for Phase 4/6 consumers; expanded diagnostics union migration in Phase 6 is accepted but Phase 9 must not quietly introduce new breaking unions.
- Re-read manual MVP evidence. Separate `BUILD_PASS`, `ARCH_CHECK_PASS`, `NUMERIC_MANUAL_OBSERVED`, `FRAME_SUBMITTED`, `VISUAL_OBSERVED` and `VISUAL_NOT_VERIFIED`; no global MVP_PASS without required proof.
- Document unsupported perspective/split-screen/arbitrary 3D inverse, extreme precision, camera smoothing, missing browser or incomplete Phase 7/8 visual prerequisites as OPEN, not fake support.
- No tags, release, merge or phase acceptance by agent. Developer performs final acceptance; checkpoint can be delivered `READY_FOR_DEVELOPER_REVIEW / FEATURE_NOT_VERIFIED` with blockers/evidence.

### Exact public contract and compatibility boundary

Closure only: avoid new exports, production behavior, dependency or project graph change. If critical defect found, report and seek tightly scoped correction rather than hiding in a doc-only checkpoint.

**Acceptance cannot be substituted by:** a new helper performing projection math in Editor/Client, host-side fake Three renderer, aliasing old semantics, invented clip/texture/scene APIs, dummy scene geometry, unvalidated source pixel assumptions or no-op demo scripts.

## B. Observable acceptance and manual proof

- Build/check/scope exact HEAD and compile impacted public consumer entrypoints; compare actual Render .d.ts and pure Node imports to ensure no Three/DOM leak.
- Inventory what manual developer observed vs not observed, including visual camera pan/zoom, inverse residual, independent host sessions, context loss/cleanup.
- Final report classifies every milestone implemented/deferred/not verified and gives explicit merge/risk acceptance question if runtime proof remains unavailable.

**Required negative/ownership proof:** reject invalid dimensions/zoom/unknown plane/expired resource according to the version's applicable contract; explain unsupported behavior honestly. Demonstrate new behavior through **public package root**, not internal imports or screenshots alone. Compare before/after immutable authored placements and gameplay positions if a live Scene consumer is involved. Check independent Camera A vs B whenever session identity is used. Record `EXPECTED`, `OBSERVED`, `NOT_OBSERVED` separately.

**Version-specific exclusions:** Không thêm v0.9.15, performance optimizers, novel camera modes, tests, or auto-merge; closure chỉ audit/report.

**Checkpoint result:** `READY_FOR_NEXT_CHECKPOINT` only when the authorized delta, real builds, public consumer compile and architectural preconditions are sound. Use `API_DESIGN_ONLY` when no production API is appropriate. If genuine blocking precondition fails, `BLOCKED_DEPENDENCY` or `BLOCKED_WITH_EVIDENCE` with real source/commit details. Runtime/visual observations not performed stay `FEATURE_NOT_VERIFIED` / `VISUAL_NOT_VERIFIED`.

## C. Architecture guardrails — no workaround by bypassing contracts

| Layer / domain | Canonical owner and enforced routing |
|---|---|
| L1 `@rpg/core/kernel` / L2 `@rpg/gameplay` | **Read-only external**, exact pinned artifacts. No changes, private imports, reproduced formulas or tests on upstream. |
| L3 `runtime-engine` | Game-specific gameplay positions, movement, camera-follow *intent* and gameplay policies. Does not own Render camera state or world-to-screen math. Do not mutate Engine in Phase 9. |
| L4 `runtime-render` | **Sole canonical camera**, pure spatial/projective math, session-bound camera lifecycle, private Three backend integration, projection results and graphics state; reuse Phase 4/6/8 public APIs. |
| L4 `editor` | Authored Scene and placements, Document save/dirty, workspace camera controls and UI measurements. Calls Render public root; no copy of projection/zoom/pan math and no direct Three import. |
| L4 `game-client` | Input/UI/host scheduling and requested camera presentation intent. No Editor import or alternate rendering camera. |
| L4 `game-server` | No camera, viewport, DOM or GPU dependency; gameplay correctness independent of frames. |

**Non-negotiable invariants:**

1. `Camera Transform ≠ Visual Instance Transform ≠ Authored Scene Placement ≠ Gameplay Position`. Pan/zoom may change screen pixels only, never world truth, object depth keys or document dirty state.
2. `World/Scene Plane ≠ Viewport-local CSS px ≠ Drawing-buffer device px ≠ Host screen/client coordinates`. Exact project/space/axes/unit, logical dimensions, accepted buffer and optional explicit screen origin; **DPR is not applied twice**.
3. `Camera Identity ≠ Render Session Identity ≠ Authored Scene/Object/Asset ID ≠ GameplayEntityId`. One active camera/session is MVP; separate sessions independent. Text RPG/no graphics is still valid.
4. **Render Phase 4 canonical math**: `createOrthographicPlaneProjection`, `projectPlanePoint2D`, `createViewportMapping2D`, `projectPointToViewport2D`, `viewportPointToPlane2D`, `screenPointToViewport2D` plus affine operations. Don't reimplement inverse/plane validation in Editor/Client or introduce duplicate generalized camera math.
5. **Phase 6 owns graphics lifecycle, accepted viewport resize, frame invalidation & submission**; **Phase 7 owns resource load/cache/texture leases**; **Phase 8 owns live scene/visual instances/layer/depth sorting**. Phase 9 integrates, never substitutes these owners.
6. `screen → world` is only a **selected-plane inverse** with declared depth/elevation if needed. One screen pixel does not determine an arbitrary 3D world point. Constrained numeric inverse, finite inputs, singular rejection, no fake exactness.
7. Camera updates/invalidations are not gameplay ticks or native browser RAF creation in Render. Render root portable: no `THREE.*`, `HTMLElement`, DOM, WebGL or GPU types in neutral exported DTOs.
8. No sixth project (`shared/common`), universal component/ECS/physics engine, separate Camera Manager in Editor, game-specific `PlayerCamera` hierarchy, general perspective/cinematics, animation (Phase 10), VFX (Phase 11), or Map Editor (Phase 14–16).

## D. Mandatory fresh preflight at execution time

1. **Inspect exact checkout**, not this task as a source snapshot: `git status`, current branch/HEAD/upstream, `git diff`, PR/base/merge-base; read `AGENTS.md`, `ARCHITECTURE.md`, `FOUNDATION.md`, `harness/{CONTRACTS,OWNERSHIP,WORKFLOW,VERIFICATION,FAILURES}.md`, `runtime-render/AGENTS.md`, relevant Editor/Client AGENTS and previous checkpoint. Resolve source drift before edits; never silently use stale types.
2. **Confirm dependency baseline**: Phase 4 spatial public math, Phase 6 graphics/viewport/resize/frame, **implemented and consumable** Phase 7 loaded PNG/atlas/texture APIs **and Phase 8 live Scene/instance/rendering** when needed. At task-authorship inspection (2026-10-23), Phase 1–6 are merged; Phase 7 PR #7 is open; no Phase 8 implementation/PR observed. This is only a historical note: check fresh source when executing. If a required upstream capability is absent or not integration-ready, report `BLOCKED_DEPENDENCY` with exact SHAs/types/missing operation **without writing bypass logic**.
3. Inspect actual public-root declarations and implementation under `runtime-render/src/` (spatial `plane-projection.ts`, `viewport-mapping.ts`, `planar-affine.ts`, session `frame-session.ts`, viewport `viewport-size.ts`, backend `three-frame.ts`; locate moved equivalents), Editor `scene-visual.ts`, `scene-visual-alignment.ts`, `plane-projection.ts`, `viewport-mapping.ts`, Client host and Phase 7/8 code. Verify Three.js/TypeScript versions from lockfile, not memory.
4. Preflight a one-page contract plan: canonical owner, touched projects, reason for every file, public signature delta, compatibility with existing exhaustive consumers, failure/release policy, manual proof scenario. `node harness/cli.mjs route -- "camera and projection"` is a hint only. Respect pre-approved **additive** Phase 9 contract changes; STOP on breaking contract or owner transfer without explicit Developer authorization.
5. Preserve clean committed checkpoints and exact Git scope. If unexpected dirty worktree, base drift, missing version checkpoint, source/semantic ambiguity, stop with evidence rather than rewriting history or crossing project boundary.

## E. Continuous checkpoint workflow and escalation

- **Single Phase 9 branch**: proposed `feat/camera-projection-v0.9`; **one PR**. **Each version = one independent `.md` task + one scoped checkpoint commit + own report** `harness/checkpoints/camera-v0.9.N.md` (`N`=patch 0..14). Commit code/docs only for the current version, never pre-implement next versions.
- **Continuous execution as Developer approved**: after mandatory static checks, real build/consumer compilation, honest evidence/report and push on valid baseline, proceed to the next numbered task **without waiting for per-version Developer review**. Build PASS is not functional acceptance; checkpoint status must preserve unobserved runtime/visual behavior.
- **STOP & ESCALATE**: missing Phase 7/8 real API, breaking public signatures/exhaustive union without prior approval, conflicting spatial unit convention, owner/dep graph change, need to edit L1/L2 or `runtime-engine` gameplay, duplicate renderer/camera math/cache, silent data loss, invalid native resource ownership, or structural/security issue. Provide exact evidence and smallest contract-preserving options; no task-dodging substitute.
- Browser/WebGL unavailable by itself does **not** justify fake visual PASS, mock graphics or adding Playwright suites. Mark `VISUAL_NOT_VERIFIED` and continue legitimately independent code/checkpoints; actual MVP visual acceptance stays pending unless truly observed. No agent self-merge, tag, release, publish or project auto-acceptance.

## F. Verification and report gate

The repo's verification policy is **BUILD ONLY**; use actual affected projects (minimum legitimate scope) and `--allow-infra` only when Harness reports/docs are changed. Check CLI help/config if flags differ:

```bash
node harness/cli.mjs check
node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra
node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers
npm run build -- --force
```

For Render-only checkpoints, reduce `scope --projects` to `runtime-render` and still build **all impacted public consumers** through `--with-consumers`; preserve true observed command outputs, no invented PASS. Final full workspace build at MVP/closure. Compile actual installed package roots and emitted `.d.ts` (Node ES2022-only import portability when applicable); never import Render internals from Editor/Client.

**Do not create** unit/integration/e2e/browser/Playwright/visual/snapshot tests, runners, coverage, assertion matrices or new CI jobs. A small **manual API consumer or browser demo** for observable proof is permitted; record exact input, expected, observed and unknown outcomes. `ARCH_CHECK_PASS` ≠ full architectural proof; `BUILD_PASS` ≠ `FEATURE_PASS`; frame receipt `submitted` ≠ browser pixel observation. `NOT_OBSERVED` is valid evidence status, not success.

Each checkpoint report MUST capture exact HEAD/base/branch/PR, touched files/owners, public API diff, status/capability claims, actual commands+exit codes, manual expected-vs-observed with tolerances, CI links matching current SHA only if completed, outstanding compatibility/runtime limits, and whether the next checkpoint can proceed. Do not alter historic accepted checkpoint reports to hide incompatibilities.

## G. Future-contract stress (DESIGN ONLY beyond this checkpoint)

| Future situation | Contract stress / required non-assumption |
|---|---|
| Text RPG/headless Server | Camera optional; pure import can succeed without window/DOM/GPU; Server correctness never depends on rendering. |
| Map 2.5D with oblique/isometric ground | Explicit affine basis and elevation context, stable plane ID/unit; no implicit `screenY == worldY`. |
| Player movement/camera follow later | Runtime Engine owns world position; Client requests camera center; Render never changes gameplay state. |
| Multiple Editor previews | Camera/session isolation, no single global current camera, close A doesn't invalidate B. |
| DPR/viewport aspect change | Accepted viewport metrics separate from CSS logical space; pan/zoom projections stable, no repeated DPR multiplication. |
| Sprite, VFX, effect anchors | Camera project whole presentation consistently, don't change sprite frame choice or anchor/source authored coordinates. |
| World/camera depth and ordering | Phase 8 chooses layer/depth keys independently of camera pan; camera never sorts by projected Y unless explicitly handed a Phase 8 sorting policy. |
| Perspective, split-screen, picking, cinematic tracks | Unsupported/deferred extension; no speculative engine/framework in Phase 9. |

## H. Definition of Done for this checkpoint

- [ ] Correct exact previous baseline/branch/PR and prerequisite API evidence; no unapproved drift.
- [ ] All version-specific work items delivered **only in the canonical owner**; explicit API compatibility inventory, exact fallback/non-support policy.
- [ ] No L1/L2/gameplay changes, no sixth workspace, no duplicate projection/renderer/cache/scene, no Three or DOM public DTO leaks.
- [ ] Real changed-project + consumer builds, Harness architecture/scope commands and clean diff recorded accurately; no new automated test framework/suite.
- [ ] Public-root manual proof with actual expected/observed results where possible; browser behavior not claimed if unobserved.
- [ ] One `v0.9.14` checkpoint report with decisions/rejected alternatives and one scoped commit (push/CI at exact HEAD if available); no Developer review pause before next task unless STOP condition.

## I. Handoff to next checkpoint

**Next:** Developer final Phase 9 review (do not self-merge or create v0.9.15). State clearly what is proven, what remains pending, and any compatibility constraints passed to the next version. Preserve old Phase 4/6 contracts even when Camera API is extended.
