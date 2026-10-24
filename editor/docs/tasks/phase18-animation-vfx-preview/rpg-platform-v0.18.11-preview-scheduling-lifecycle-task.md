# TASK — RPG Platform v0.18.11: Preview Scheduling, Visibility & Lifecycle

**Phase:** 18 — Animation & VFX Preview  
**Checkpoint:** 12/14 · **Capability:** AP12  
**Canonical owner:** L4 `editor` only (consumes read-only `runtime-render` public root)  
**Repository:** https://github.com/TjnhPro/rpg-platform  
**Status:** Implementation task specification, **not** implementation/visual evidence  
**Execution:** complete task folder, 14 strictly ordered version commits/checkpoints, one branch, one PR

## A. One objective and this-version requirements

**Objective:** Drive continuous preview playback through a single Editor-owned scheduling adapter while preserving Render command and viewport ownership.

### Required implementation decisions

- Implement one **optional Editor UI host-driven** preview clock: requestAnimationFrame or pre-existing viewport frame-demand callback only while playing/visible/acquired. Never call Render draw routines directly from a second canvas/renderer or spawn setInterval timers.
- One monotonic host timestamp per live generation yields bounded nonnegative delta; apply preview speed once and call only canonical `advanceSpriteAnimationPlayback` or `advanceVisualEffectInstance` per active frame as appropriate.
- The existing `mountEditorViewport`/Phase6 host still owns native frame submission, resizing/DPR and its own on-demand callback. Playback driver requests redraw through the host seam; must not register competing ResizeObserver, RAF frame submission or GPU owner.
- Visibility hidden/unmount/viewport unavailable must suspend logical time and cancel scheduling. On visibility return require explicit Resume or documented reset of last timestamp with **no background catch-up**.
- Pause/Stop/completion should cancel next animation demand. Step manually is permitted while paused only according to actual playback semantics; no fabricated elapsed progression.
- Use one generation/AbortController/scope at every Project/Asset/Clip/Scene/unmount transition; revoke provider, cancel in-flight metadata/page loads, release source-load snapshots, unbind textures, remove VFX, release preview-owned lease/cache and scene only when owned.
- Dispose in dependency order; catch cleanup failures separately and continue draining, report uncertainty. Borrowed Project/Asset contexts and Render session/scene/viewport host must not be disposed by a child unless it created/owns them.
- React StrictMode setup/cleanup replay must create fresh issued handles, not reuse disposed playback or provider. No late setState from retired mount and no abandoned requestAnimationFrame.
- Keep preview read-only; changing visibility, pause or playback state cannot mark Scene or Project Document dirty.

### Finite acceptance for exactly v0.18.11

- Actual finite live playback observation shows increasing canonical elapsed, frame change and on-demand viewport requests while playing, no playback progress while paused/hidden.
- Unhide resumes with no time jump; switching A→B during load does not render A or adopt stale leases.
- Unmount leaves zero preview-owned effects/bindings/scheduled callbacks; cleanup failures recorded without false success.
- No extra Render frame loop, second canvas, document mutation or background polling is introduced.

### Negative/adversarial evidence

- No generic game clock, simulation loop, autoplay on mere selection or timed gameplay effects.

### File delta ceiling for this checkpoint

`editor/ui/src/features/animation-vfx-preview/preview-clock.ts`/hook and focused lifecycle controller; minimal existing `editor/ui/src/viewport/Viewport.tsx` or editor viewport host **only if a demonstrated correct-owner additive seam is required**, with evidence. Do not alter Render frame scheduler or CSS/layout.

## B. Canonical ownership, source truth & non-negotiable invariants

**Canonical production owner: L4 `editor` only.** Phase18 is a preview *consumer/composition*. Animation/VFX playback, direction/frame resolution, sampling/timing, atlas parser, source/lease/cache, visual instance, attachment/alignment, camera and GPU/render loop stay with **`runtime-render`**. Runtime Engine, game-client, game-server, installed L1 `@rpg/core/kernel` and L2 `@rpg/gameplay` are **READ-ONLY**; no sixth workspace. No Editor-to-Render private imports, exported Render API changes, package/schema/dependency/CI reconfiguration.

**Real inspected baseline (2026-10-24 GitHub `main`, commit `0d8c4ea8e63ec284259ce05e2619010199f545e9`):** Phase14 Asset Manager is merged (PR #14). `ProjectManagerWorkspace` remains mounted above Shell and hands `ActiveEditorProject` to children. `AssetBrowserWorkspace` exposes a project-scoped catalog/selection and UI; `AssetViewport` already does static selected-image preview. `editor/ui/src/features/asset-browser/host.ts` is an explicit same-origin resource provider whose `read` accepts **image** role and returns PNG; this is not a verified general text atlas provider. Render public root exports existing Phase10 `SpriteAnimationPlayback`/`SpriteSequencePlayback`, eight-way direction, timing/visual binding; Phase11 `VisualEffectDefinition`, `VisualEffectInstance`, playback/lifetime, world/attached placement and frame sync. Earlier `editor/manual/animation-preview*` and `vfx-preview*` are **manual browser consumers**, not reusable current Editor Shell preview products. **Phase15–17 must be checked from actual execution HEAD**; their task documents do not prove merged code. Do not infer current source from this dated snapshot.

1. **No second canonical engine:** only implement Editor adapters, controls, diagnostics, source grant and lifecycle. Never duplicate Render playback/frame picker/atlas parser/instance or issue gameplay animations/events.
2. **Preview is non-authoring by default:** frame selection/clip/direction/loop/speed/temporary anchor/offset/target are ephemeral. No Asset/Project/Scene Document mutation, revision/dirty acknowledgement, schema version change or hidden auto-save. If a future explicit authoring action is needed, it must be a separate already existing correct-owner API and separately authorized.
3. **Project, asset and host rights:** exact `projectId`/AssetReference/source role/permission generation/atlas revision. Borrowed root/project/catalog/render handles are never disposed by child. A→B isolation also applies to pending async results and cache keys.
4. **Truthful provenance:** preserve actual source metadata, explicit frame names/order, SourceRevision, atlas revision, media type/role, scene coordinate unit and alignment source; do not guess missing artist FPS/direction compass/ground anchor or interpolate unprovided clip frames.
5. **Two independent preview modes:** directional sprite uses eight-way APIs **only when eight real declared directions exist**; neutral single-sequence Sprite/VFX uses its own APIs with direction N/A. Current VFX supports `kind:'sprite-sequence'`, not trajectory/projectile/explode/precast/skill simulation.
6. **Rendering & lifecycle:** Phase6 Editor viewport host owns native scheduling/resize, Render owns drawing and resources. A modest Editor-only playback command scheduling adapter may supply bounded delta and request demand frames; no duplicate renderer, no graphics acquisition from unrelated child and no hidden-tab catch-up.
7. **Scene integration dependency:** use actual Phase15 Map/Phase16 Visual Profile/Phase17 Placement public contracts only if they are installed. A manual sample for asset-only playback is not proof of full in-Scene integration. No Render source or generic Scene Foundation rewrites for an Editor preview.
8. **Preserve Phase12 UI:** React19/Mantine9, `EditorShell`, `EditorPanel`, one provider/theme, `ui:check`, limited feature CSS only when existing policy permits. No new UI kit, duplicate Shell, hidden second Project owner, CSS canvas layout hacks or free-standing VFX designer.
9. **No unapproved owner delta:** additive same-Editor local composition/host adjustments explicitly listed in this Phase18 scope are preauthorized when evidence-backed and nonbreaking. If actual code needs protected canonical source outside that scope, changed schema, package export, cross-workspace changes or new filesystem security semantics, stop `BLOCKED_WITH_EVIDENCE` and propose the smallest owner delta. Avoid routine approval pauses for fixes already within the allowed same-owner seam.
10. **Verification budget:** build/check, finite CLI/API/real-host observations, optional small browser smoke when available. No new generated unit/integration/E2E/Playwright/snapshot/coverage suite or broad screenshot matrix. `BUILD_PASS` is not `SOURCE_LOADED`, `PLAYBACK_OBSERVED`, `FRAME_BOUND`, `UI_INTERACTION_VERIFIED` or `PIXELS_VISUALLY_VERIFIED`.

## C. Phase-level allowed scope and protected paths

Allowed new feature sources: `editor/src/animation-vfx-preview-*.ts` (only when a portable reusable Editor adapter is justified); `editor/ui/src/features/animation-vfx-preview/**`; minimal `editor/manual/animation-vfx-preview-*` finite host/reproduction, relevant `editor/docs/animation-vfx-preview-*` docs, task copies `editor/docs/tasks/phase18-animation-vfx-preview/**`, and `harness/checkpoints/animation-vfx-preview-v0.18.N.md`. `editor/src/index.ts` may gain **only** explicitly justified additive portable exports—not mandatory. Do not export React, DOM/host I/O, Render handles or CSS from portable root.

**Named narrow existing Editor seams:** `editor/ui/src/app/App.tsx` + `editor/ui/src/features/asset-browser/AssetBrowserPanel.tsx`/`AssetViewport.tsx` for feature composition at AP13; `editor/ui/src/features/asset-browser/host.ts` + a narrowly authorized `editor/manual/*host.mjs` for real atlas-metadata source access at AP09; `editor/ui/src/viewport/Viewport.tsx` or `editor/src/viewport-host.ts` only for an evidenced minimal existing content/requestFrame integration seam at AP12. If no gap, leave them unchanged. Keep Phase13 `ProjectManagerWorkspace` stable lifecycle intact; leave Shell/theme/CSS and generic `editor/src/{document-*,asset-*,scene-*,project-*}` contracts unchanged.

Do not touch `runtime-render/**`, `runtime-engine/**`, `game-client/**`, `game-server/**`, L1/L2, root `package.json`/lockfile, top-level CI, `harness/cli.mjs` or harness verification config. Do not circumvent a missing host capability by returning hardcoded bytes, bypassing role checks or opening unrestricted resource paths. The **version-specific file ceiling in section A is stricter** than this general scope.

## D. Required agent execution (one folder, sequential commits)

1. Preflight actual working tree/HEAD/branch/parent and the previous v0.18.N checkpoint. Read repository `AGENTS.md`, `ARCHITECTURE.md`, `FOUNDATION.md`, `editor/AGENTS.md`, `harness/{OWNERSHIP,CONTRACTS,WORKFLOW,VERIFICATION,FAILURES}.md`, this task and actual affected implementation. Check Phase15–17 dependencies before using them.
2. Implement **only this version**, rerun the actual architecture/scope/build gates after relevant changes, record a finite positive/negative observation and unsupported conditions. A passing static check does not imply browser pixels. Keep source/framework imports through package public roots.
3. Commands from repository root, matched to exact HEAD scripts:

   ```bash
   node harness/cli.mjs check
   node harness/cli.mjs scope --projects editor --allow-infra
   node harness/cli.mjs verify --projects editor --with-consumers
   ```

   When UI touched, run authentic `npm --workspace @rpg-platform/editor run ui:check` and `npm --workspace @rpg-platform/editor run ui:build` or the workspace command actually supported by execution HEAD. Full 5-workspace verify and `npm run build -- --force` at closure, not automatically for every subtask. Record exit code/log and whether the step was configured/actually executed.
4. Create exactly `harness/checkpoints/animation-vfx-preview-v0.18.N.md`: task link, source/head/parent, changed paths, owner/public delta, actual commands, finite positive and negative evidence, statuses `PASS` vs `NOT_CHECKED` vs `BLOCKED`, and next version. One checkpoint **and one separate commit per version**; do not combine capabilities or quietly advance while blocked.
5. One branch `feat/animation-vfx-preview-v0.18` (suggested), one PR covering v0.18.0 → v0.18.13. Execute consecutively without intermediate routine Developer approval. Halt only for material boundary/security/schema/required-dependency conflicts. Do **not** self-merge, tag, publish or start next phase. ChatGPT reviews the complete PR; Developer authorizes final merge.

## E. Evidence terminology and finite gates

- **`ARCH_CHECK_PASS`/`BUILD_PASS`** only with actual command exits, no skip-as-pass; root/public declaration compatibility must be evaluated for any additions.
- **`FRAME_INVENTORY_OBSERVED`** means real authorized source metadata parsed; not inferred clip/frame list. **`SOURCE_LOADED`** means bytes actually acquired with host scope/revision and bounds. **`FRAME_BOUND`** means canonical Render binding result, *not* visible pixels.
- **`SPRITE_PLAYBACK_OBSERVED`**/**`VFX_PLAYBACK_OBSERVED`** require actual canonical Render command/advance snapshots for each respective mode. **`SCENE_PREVIEW_OBSERVED`** requires real Scene and matching Render target/source/space, otherwise **`SCENE_PREVIEW_NOT_VERIFIED`**.
- **`UI_BUILD_PASS`** means TS/`ui:check`/Vite; **`UI_INTERACTION_VERIFIED`** needs actual browser interaction; **`PIXELS_VISUALLY_VERIFIED`** requires actual visual observation of correct rendered frame. Never equate submitted-frame or historical receipt with proof of visible content.
- **`HOST_METADATA_UNAVAILABLE`**, **`UNSUPPORTED_ASSET`**, **`PROVENANCE_NOT_VERIFIED`**, **`CLEANUP_UNCERTAIN`**, and **`UI_NOT_VERIFIED`** are valid truthful outcomes; don't invent success, browser artifacts or Scene host authority.

## F. Explicitly deferred

Animation Designer and keyframe editor, animation state graphs, asset clip persistence schema, multi-track timeline, native editor scene gizmos, particle graph, projectile/fly/hitbox/collision/damage/skills, gameplay AI or combat, true VFX authoring/verification mark, cloud resource scanning, generalized multi-format atlas inference, arbitrary filesystem picker, screenshot matrix, large generated automated tests, and full UI visual verification (planned separate UI Verification phase).

## G. Handoff to following version

- This checkpoint is `v0.18.11` / `AP12`. Keep commit scope exclusive to **Preview Scheduling, Visibility & Lifecycle**; record exact task markdown path, source observations and any limitation in `harness/checkpoints/animation-vfx-preview-v0.18.11.md`.
- Commit after gate evidence with a focused message, e.g. `feat(editor): preview scheduling lifecycle (v0.18.11)` (AP01/AP14 may be docs-only). Never squash versions.
- **Next:** `v0.18.12` — Minimal Working Animation & VFX Preview UI. Continue only after current version was committed; no routine approval pause. If blocked, provide exact source/owner/minimal delta and stop rather than implementing later features.
