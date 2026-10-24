# TASK — RPG Platform v0.11.0: VFX Architecture & Contract Foundation

**Phase:** 11/20 — Visual Effect Playback
**Version:** `v0.11.0` · checkpoint **1/13** · Feature: **VE01**
**Canonical primary owner:** `runtime-render`
**Collaborators:** Harness; Editor/Client read-only contract audit
**Repository:** https://github.com/TjnhPro/rpg-platform
**Delivery:** One Phase11 branch, one PR, one scoped checkpoint commit per version; implement continuously through MVP, no routine review pause.
**Status:** Task specification only, **not** evidence of implementation, browser execution or Developer acceptance.

## A. Outcome — exactly this capability

**Goal:** Khóa canonical owner, API/lifecycle seam và mối quan hệ **Effect Definition → Effect Instance → Animation Playback → Visual Instance**, trước khi viết runtime VFX.

**Authorized version scope:** Architecture/harness contract proposal only; do not implement production VFX, effect-specific renderer, designer UI or change Phase10 source.

### Required implementation / audit decisions

1. Inventory real root exports/d.ts and versions from Phase4 spatial, Phase6 frame/viewport, Phase7 resource/atlas/leases, Phase8 Scene instances, Phase9 Camera, Phase10 clip/playback; label absent interfaces explicitly, never guess implementation names.
2. Declare four independent identities: authored asset/reference (Editor), portable effect definition ID (Render data), ephemeral effect instance ID (Render live owner), Phase8 visual instance ID (drawable). Neither is L3 gameplay entity ID.
3. Specify explicit lifecycle states and transitions: created/playing/paused/stopped/completed/removed (or a justified existing equivalent); after terminal remove no playback or attachment writes. Define which states hold drawable and resource leases.
4. Resolve **non-directional VFX timeline** issue explicitly. Phase10 roadmap fixes 8 directional slots for character animation; do not duplicate one track eight times and do not create a VFX timer. Check actual Phase10 public clip/timeline primitive. If no neutral single-sequence path, record the smallest upstream Phase10 public extension and request Developer authorization before changing that owner.
5. Freeze time model: host-supplied finite nonnegative `deltaMs`, frame interval owned by Phase10, effect lifetime owned by VFX, pause freezes both, no wall clock. Define once/repeat and finite/infinite lifetime compatibility.
6. Freeze placement modes: world-local placement or single attachment to existing Phase8 Visual Instance with an explicit offset plane/unit, translation-only inheritance in MVP, target loss `remove-effect` policy. No scene hierarchy.
7. Record release and revision ownership: Phase7 source/texture leases, Phase8 drawable lifecycle, Phase10 playback; VFX coordinates releases without replacing any canonical manager.
8. Map each VE02–VE13 to exactly one capability/version, API boundary, consumer, success evidence and dependency gate. Project extensions limited to approved owner, not a new workspace.

### Version-specific acceptance (must be demonstrated or reported as not observed)

- [ ] Architecture decision ledger identifies each canonical owner, input/output type family, boundary, error category and lifetime relationship; no unresolved collision between VFX/Phase10 playback.
- [ ] Checklists distinguish actual source APIs from proposals and required missing upstream surfaces; compare live checkout to accepted earlier docs and emitted declarations.
- [ ] One v0.11.0 checkpoint commit with scoped Harness docs only; real Harness check and no invented `BUILD_PASS`/visual proof.

**Forbidden shortcuts / explicit deferrals:**

- Do not claim Phase8/9/10 are implemented because task Markdown exists.
- Do not silently implement a second generic animation or timeline system to bypass an 8-way-only Phase10 contract.
- Do not define game-specific skill/buff/attack types as VFX public contracts.

**Foundation deliverable:** a concise source-backed decision ledger/contract map that downstream tasks can implement. This v0.11.0 is architecture-only by design; do not implement a speculative API solely to show new exports.

## B. Baseline & dependency gate (actual source overrides task notes)

- **Point-in-time audit at task authoring (2026-10-23):** `main` contains merged Phases 1–6. [PR #7](https://github.com/TjnhPro/rpg-platform/pull/7), `feat/visual-resource-loading-v0.7`, was open and had Phase7 checkpoints through `v0.7.13` on inspected HEAD `8e43b40df3375559e703d416109b48e6360ccf48`; Phase8, Phase9, Phase10 implementation was **not confirmed** in repo. Check current checkout/branch before execution, not only this historical note.
- **Phase4 (actual merged):** `VisualAnchor2D`, `resolveVisualAlignment2D`, planar affine/transform, scoped coordinate-space/projection primitives. **Phase6 (merged):** `RenderFrameSession`, `invalidateRenderFrame`, viewport state and graphics terminal lifecycle. **Phase7 (PR branch, do not assume merged):** `VisualFrameReference`, `resolveAtlasFrame`, `resolveAtlasFrameGeometry`, `createAtlasTextureView`, `VisualResourceLease`/cache/provider semantics. **Phase8** supplies live visual instance, layer, visibility, depth and scene owner **when really implemented**. **Phase9** supplies canonical camera application. **Phase10** supplies canonical animation clip/timeline/playback.
- The observed Phase7 Unity TPSheet profile supports rectangular unrotated frames, `rotation:'none'`, `trim:null`, `sourceSize:null` in frame geometry; actual metadata has `sourcePivot`. Unsupported trim/rotated-image/origin guarantees must not be invented in VFX.
- This Phase11 plan **does not authorize implementation against absent future APIs**. A task may perform safe pure contract work where prerequisites exist, but live creation/rendering must stop as `BLOCKED_DEPENDENCY` with exact missing owner API/commit. Do not fill gaps with a parallel renderer, timer, atlas decoder, Scene store or browser mock.
- Before starting this version inspect previous checkpoint's actual exports/d.ts, accepted compatibility decisions and the exact phase branch HEAD, then determine whether the specific dependency was really delivered. If a public breaking change/ownership expansion is required, stop and escalate the smallest delta, not a unilateral migration.

## C. Canonical ownership & non-negotiable contracts

| Project/layer | Permitted responsibility | Forbidden behavior |
| --- | --- | --- |
| **L1 `@rpg/core/kernel` / L2 `@rpg/gameplay`** | Frozen read-only external dependencies | No production edits, deep import or VFX/gameplay duplication |
| **L3 `runtime-engine`** | Gameplay action/state/skill outcomes, source/target selection and optional presentation intent | Render may not determine hit/damage/buff expiry or skill completion from VFX frames |
| **L4 `runtime-render`** | VFX definitions, instance lifecycle, presentation placement/attachment, orchestration over Phase10 clip playback and Phase7/8/9 resources/scenes | No second animation engine, Scene Renderer, GPU cache, asset catalog, clock or 3D game rule system |
| **L4 `editor`** | Authored asset/config/reference and browser preview host via Render public root | No independent sprite/VFX decoder/player, no authored Document mutation for preview-only state |
| **L4 `game-client`** | Client input/host frame scheduling and presentation requests via Render public root | No Editor runtime import, no second renderer or client-side gameplay authority |
| **L4 `game-server`** | No mandatory VFX/DOM/GPU participation | Server/game correctness cannot depend on visible effect completion |

**Contract invariants to preserve in EVERY checkpoint:**

1. **Authored Effect Reference ≠ Render Effect Definition ≠ Effect Instance ≠ Phase8 Visual Instance ≠ Gameplay Effect/Entity.** Reuse exact identities; never equate different owner IDs.
2. **Non-directional VFX uses shared Phase10 timing/playback only.** Phase10's intended 8-way character mapping is not a reason to forge eight identical VFX directions. Missing neutral single-sequence support is an upstream contract blocker requiring a separately approved owner extension, never a VFX-private playback algorithm.
3. **No clock authority in VFX.** Only explicit host `deltaMs` drives Phase10 playback and finite presentation duration; `pause` freezes both. No Date.now, `performance.now`, setInterval, RAF or graphics submission count for animation advancement in Render.
4. **Resources and pixels are Phase7-owned.** Atlas/frame ID and revision are authoritative; exact `subresourceId`, geometry/pivot and lease lifetime must survive playback. No upload/copy/crop on every animation frame and no reader inference of unsupported trim/rotation.
5. **Visual Scene/Camera remain Phase8/9-owned.** Effect presentation may update existing drawable state and transform, never authored Scene placement or L3 gameplay position. Camera pan/zoom does not change effect world position.
6. **Attachment is presentation-only.** One target Visual Instance in same Render Scene/session; no gameplay entity lookup, parent graph, nested effect chains, target physics or projectile tracking in MVP. Missing target follows explicit `remove-effect` policy.
7. **Lifetime is separate from animation cycle.** `once`, indefinite repeat and finite-duration repeat each have defined completion/stop/remove semantics; terminal release is exact-once and must not evict another live consumer's shared resource.
8. **Public imports only.** Editor/Client import `@rpg-platform/runtime-render` root; Render does not import Editor/Client/Engine; no leaked THREE/DOM/GPU types in neutral DTOs, no sixth project, no speculative `VFXGraph` framework.
9. **Guard truthful evidence.** `ARCH_CHECK_PASS`/`BUILD_PASS`/`submitted` do not prove effect animation on screen. Without real browser observation mark `VISUAL_NOT_VERIFIED` and preserve repro details.

## D. Execution workflow — one capability, one checkpoint, continuous phase

1. **Preflight source (delta-focused):** Read root `AGENTS.md`, `ARCHITECTURE.md`, `FOUNDATION.md`, relevant project `AGENTS.md`, `harness/{OWNERSHIP,CONTRACTS,WORKFLOW,VERIFICATION,FAILURES}.md` and **actual related source/exported declarations**. Check the prior checkpoint. `node harness/cli.mjs route -- "visual effect playback instance attachment"` is advisory, not final owner proof. Do not reread the entire unchanged repo for every checkpoint.
2. **Explicit scope:** Record canonical owner, touched files, affected consumers, real reused public symbols, intended additive type/export delta, compatibility and terminal cleanup. Authorize only this version's capability. If the code already provides it, document/verify actual behavior instead of duplicating it.
3. **Implementation:** One Phase11 branch/PR (suggested `feat/visual-effect-playback-v0.11`) for the entire phase. **One numbered version = one independently scoped checkpoint commit** plus `harness/checkpoints/visual-effect-v0.11.N.md`. Do not bundle unrelated capabilities or shorten required functionality for speed.
4. **Continue automatically** to the next numbered task after real source/build/static gate success and a valid prior checkpoint; no routine Developer review stop. **Stop only on material blocker** (missing real Phase7–10 prerequisite, backward-incompatible public API, canonical owner violation, unavailable mandatory asset for a required *visual proof*, prohibited L1/L2/L3 change, lost data, or unsafe cleanup). Give exact SHA/source and minimum required decision. Missing optional browser observation may be carried as `VISUAL_NOT_VERIFIED` where phase policy allows, never as `MVP_PASS`.
5. **No self-merge/release:** No automatic tag, release, publish, merge or external repository edits; Developer owns final phase acceptance and risk deferral.

## E. Verification — real builds, no expanding test suite

For Render implementation and public API edits:

```bash
node harness/cli.mjs check
node harness/cli.mjs scope --projects runtime-render --allow-infra
node harness/cli.mjs verify --projects runtime-render --with-consumers
```

For Editor/Client changes, replace `--projects` names with exactly touched packages (plus Render where changed). `--with-consumers` is mandatory for changed Render public declarations. During end-to-end MVP and closure also run `npm run build -- --force` for all five workspaces, actual public consumer compilation, and review the diff/CI HEAD. Preserve real command statuses; no fake script or skipped required build. Avoid mechanically rerunning unrelated full workspace builds in every narrow checkpoint.

**No unit/integration/E2E/Playwright/browser/snapshot/visual-regression suite, mocking framework, CI test matrix, coverage target or fake asset generation** without explicit Developer approval. Manual evidence is allowed: public-root Node/TypeScript scenarios for pure lifecycle/timing and real browser/graphics observations for VFX rendering, using verified assets. Report input, expected, observed, not-observed and actual source identity/time context; distinguish API success, submitted frame and seen pixels.

**Checkpoint report minimum:** exact branch/base/HEAD, prior dependency exports, owner and diff scope, changed declarations, version-specific observations, architecture/build/consumer commands with actual exits, lifetime/compatibility impacts, runtime/visual verification status and next handoff. The phase is not finished merely because code compiles.

## F. Definition of done for v0.11.0

- [ ] This version's **VE01** capability and version-specific acceptance have a real implementation/audit artifact; no task was silently skipped or substituted with metadata-only claims.
- [ ] Actual baseline and dependency source verified; unresolved Phase8/9/10 or non-directional clip contract reported as blocker, not circumvented.
- [ ] Correct owner (`runtime-render`), public-root consumer boundary and non-duplicated Phase7/8/9/10 responsibility preserved.
- [ ] Actual scoped Harness check + project build + impacted public consumer compilation run and results honestly recorded. The applicable scope is `runtime-render`; add directly modified projects, never hide scope.
- [ ] One independently scoped `v0.11.0` checkpoint report and commit are created within the existing Phase11 branch/PR; next task can proceed automatically only when real required gates are satisfied.
- [ ] Any unobserved manual/browser action explicitly marked `FEATURE_NOT_VERIFIED` / `VISUAL_NOT_VERIFIED`, not described as a functional PASS.

## G. Next checkpoint

**Next:** v0.11.1 — Effect Definition & Visual Asset References. Preserve this checkpoint's actual contracts and failure/cleanup semantics. Do not add capability of the next version ahead of its task.
