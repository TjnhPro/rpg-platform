# TASK — RPG Platform v0.11.9: Editor VFX Preview Integration

**Phase:** 11/20 — Visual Effect Playback
**Version:** `v0.11.9` · checkpoint **10/13** · Feature: **VE10**
**Canonical primary owner:** `editor`
**Collaborators:** runtime-render public root; authored Asset/Scene adapters
**Repository:** https://github.com/TjnhPro/rpg-platform
**Delivery:** One Phase11 branch, one PR, one scoped checkpoint commit per version; implement continuously through MVP, no routine review pause.
**Status:** Task specification only, **not** evidence of implementation, browser execution or Developer acceptance.

## A. Outcome — exactly this capability

**Goal:** Cho Editor Preview chọn effect, tạo instance, play/pause/stop, chỉnh position/offset và remove bằng cùng Render public API.

**Authorized version scope:** Minimal real Editor browser/public-root consumer; no VFX Designer, timeline editor, asset tagging migration or second renderer.

### Required implementation / audit decisions

1. Inspect actual Editor `AssetReference`, `describeResolvedVisualAsset`/Scene visual bridge and browser preview host; use authored references and existing explicit asset catalog/provider access.
2. Build a narrow editor-side adapter from authored asset/effect reference + preview-config to neutral VFX definition; actual identity translation stays at boundary, no Editor type imported by Render.
3. Reuse existing Phase6 Editor viewport/Render graphics host and Phase8 scene/Phase9 camera. Never instantiate custom Canvas2D renderer, RAF scheduling inside Render or independent clip player.
4. Expose manual controls: select verified effect, create world-position effect, attach to an existing preview visual if available, play/pause/resume/stop/restart/remove, edit explicit offset. Unsupported prerequisites report why rather than silently skipping required controls.
5. Supply `deltaMs` via Editor-owned host frame policy with clear pause/visibility behavior; no gameplay tick in Editor. Distinguish preview playback state from authored document dirty/save.
6. Preserve authored source/atlas revision requirements; show safe failure codes and ready/loading/terminal state separately from frame receipt and visible-pixel observation.
7. Unmount/dispose cancels Editor callbacks/listeners and releases its effects even if async acquisition completes late; does not affect Client session or external game execution.

### Version-specific acceptance (must be demonstrated or reported as not observed)

- [ ] Editor manual preview can select one real effect, place it at one ground/world point, play/pause/resume/stop and observe VFX state through public root.
- [ ] Changing preview-only offset or starting/stopping a preview does not dirty/save/mutate authored Scene/Document content.
- [ ] Unresolved asset/source or unloaded atlas shown as an explicit failure/pending state, no fake image; editor has no duplicate frame advancement or texture cache.
- [ ] Editor build and Render public consumer compile succeed; real browser visual observation reported separately.

**Forbidden shortcuts / explicit deferrals:**

- No drag-and-drop VFX Designer, effect chain authoring or editor timeline UI.
- Do not persist ephemeral effect IDs/playheads into a document.
- Do not import `runtime-render/src/...` or private Three backend.

**Contract drafting discipline:** The names and examples here describe required semantics, **not verified existing exports**. Match actual installed Phase7/8/9/10 public API names/signatures; propose the smallest additive Render public seam only where necessary and already authorized by v0.11.0. Do not invent absent foundational APIs or force a dependency to compile by adding an alternate implementation.

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

## F. Definition of done for v0.11.9

- [ ] This version's **VE10** capability and version-specific acceptance have a real implementation/audit artifact; no task was silently skipped or substituted with metadata-only claims.
- [ ] Actual baseline and dependency source verified; unresolved Phase8/9/10 or non-directional clip contract reported as blocker, not circumvented.
- [ ] Correct owner (`editor`), public-root consumer boundary and non-duplicated Phase7/8/9/10 responsibility preserved.
- [ ] Actual scoped Harness check + project build + impacted public consumer compilation run and results honestly recorded. The applicable scope is `editor`; add directly modified projects, never hide scope.
- [ ] One independently scoped `v0.11.9` checkpoint report and commit are created within the existing Phase11 branch/PR; next task can proceed automatically only when real required gates are satisfied.
- [ ] Any unobserved manual/browser action explicitly marked `FEATURE_NOT_VERIFIED` / `VISUAL_NOT_VERIFIED`, not described as a functional PASS.

## G. Next checkpoint

**Next:** v0.11.10 — Game Client VFX Integration. Preserve this checkpoint's actual contracts and failure/cleanup semantics. Do not add capability of the next version ahead of its task.
