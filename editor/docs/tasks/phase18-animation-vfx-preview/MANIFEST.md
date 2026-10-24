# Phase 18 — Animation & VFX Preview · Execution Manifest

**Repository:** https://github.com/TjnhPro/rpg-platform  
**Primary production owner:** L4 `editor`. Existing `@rpg-platform/runtime-render` foundation is read-only.  
**Version range:** `v0.18.0–v0.18.13` · **14 task files, 14 ordered commits, 14 Harness checkpoints, one branch and one PR**.  
**User goal:** Chọn visual Asset → kiểm tra real frame/direction, Play/Pause/Resume/Stop/Loop, playback FPS/speed preview-local, VFX single-sequence, inspect alignment và preview trong Scene — **không Runtime Engine**.  
**Merge policy:** ChatGPT final whole-PR review; Developer owns final acceptance. No self-merge or premature visual PASS.

## Current code and dependencies — source inspected 2026-10-24

On inspected GitHub `main` commit `0d8c4ea8e63ec284259ce05e2619010199f545e9`, Phase14 Asset Manager **merged** (PR #14). Project state owner `ProjectManagerWorkspace` already lives above Shell; `AssetBrowserWorkspace` exposes context and selected Asset; `AssetViewport` supports a real PNG static preview but current browser host's `VisualSourceProvider.read` admits `image` role and `image/png`, **not demonstrated atlas-metadata access**. Earlier `editor/manual/animation-preview*` (Phase10) and `editor/manual/vfx-preview*` (Phase11) are manual consumers; their APIs are reuse references, not Editor feature UI.

Existing Render public root provides `SpriteAnimationPlayback` (eight-way), `SpriteSequencePlayback` (non-directional), `SpriteTimedClip` and repeat `once|repeat`, `createSpriteAnimationVisualBinding` and `createSpriteSequenceVisualBinding`, atlas parser/revisions/frame resolver, `VisualEffectDefinition` (`kind:'sprite-sequence'`), `VisualEffectInstance` playback/lifetime/placement/attachment/frame sync, `VisualSourceProvider`, resource cache/lease and Render scene/camera/viewport. **Phase15 Map, Phase16 Inspector, Phase17 Object Placement are prerequisites for actual in-Scene wiring and MUST be verified at execution HEAD**; their prepared task files do not prove completed implementation. Asset-only preview work cannot be misreported as Scene integration.

## The 14-version task folder

| Version | ID | Capability | Task file |
| --- | --- | --- | --- |
| `v0.18.0` | `AP01` | Animation & VFX Preview Architecture & Contract Foundation | [rpg-platform-v0.18.0-animation-vfx-preview-architecture-contract-foundation-task.md](./rpg-platform-v0.18.0-animation-vfx-preview-architecture-contract-foundation-task.md) |
| `v0.18.1` | `AP02` | Project-Bound Preview Context | [rpg-platform-v0.18.1-project-bound-preview-context-task.md](./rpg-platform-v0.18.1-project-bound-preview-context-task.md) |
| `v0.18.2` | `AP03` | Atlas & Frame Inspection | [rpg-platform-v0.18.2-atlas-frame-inspection-task.md](./rpg-platform-v0.18.2-atlas-frame-inspection-task.md) |
| `v0.18.3` | `AP04` | Animation Clip & Direction Selection | [rpg-platform-v0.18.3-animation-clip-direction-selection-task.md](./rpg-platform-v0.18.3-animation-clip-direction-selection-task.md) |
| `v0.18.4` | `AP05` | Sprite Playback Controller | [rpg-platform-v0.18.4-sprite-playback-controller-task.md](./rpg-platform-v0.18.4-sprite-playback-controller-task.md) |
| `v0.18.5` | `AP06` | Playback Configuration: Timing, Loop & Speed | [rpg-platform-v0.18.5-playback-configuration-task.md](./rpg-platform-v0.18.5-playback-configuration-task.md) |
| `v0.18.6` | `AP07` | VFX Definition & Preview Context | [rpg-platform-v0.18.6-vfx-definition-preview-context-task.md](./rpg-platform-v0.18.6-vfx-definition-preview-context-task.md) |
| `v0.18.7` | `AP08` | VFX Playback & Lifetime | [rpg-platform-v0.18.7-vfx-playback-lifetime-task.md](./rpg-platform-v0.18.7-vfx-playback-lifetime-task.md) |
| `v0.18.8` | `AP09` | Frame & Resource Synchronization | [rpg-platform-v0.18.8-frame-resource-synchronization-task.md](./rpg-platform-v0.18.8-frame-resource-synchronization-task.md) |
| `v0.18.9` | `AP10` | Alignment Preview & Diagnostics | [rpg-platform-v0.18.9-alignment-preview-diagnostics-task.md](./rpg-platform-v0.18.9-alignment-preview-diagnostics-task.md) |
| `v0.18.10` | `AP11` | Scene Preview Integration | [rpg-platform-v0.18.10-scene-preview-integration-task.md](./rpg-platform-v0.18.10-scene-preview-integration-task.md) |
| `v0.18.11` | `AP12` | Preview Scheduling, Visibility & Lifecycle | [rpg-platform-v0.18.11-preview-scheduling-lifecycle-task.md](./rpg-platform-v0.18.11-preview-scheduling-lifecycle-task.md) |
| `v0.18.12` | `AP13` | Minimal Working Animation & VFX Preview UI | [rpg-platform-v0.18.12-minimal-working-animation-vfx-preview-ui-mvp-task.md](./rpg-platform-v0.18.12-minimal-working-animation-vfx-preview-ui-mvp-task.md) |
| `v0.18.13` | `AP14` | Animation & VFX Preview Integration & MVP Closure | [rpg-platform-v0.18.13-animation-vfx-preview-integration-mvp-closure-task.md](./rpg-platform-v0.18.13-animation-vfx-preview-integration-mvp-closure-task.md) |

## Cross-task invariants (mandatory)

1. **No second animation/VFX engine.** Editor owns only selection/control/preview scheduling and host/UI composition; Render retains timing, frame selection, VFX state, scene resources, GPU and camera. `runtime-render`, `runtime-engine`, `game-client`, `game-server`, L1/L2 remain read-only; five workspace graph unchanged.
2. **Real asset provenance.** No fabricated clips/directions/FPS, derived compass from filename, hardcoded atlas keys or PNG disguised as metadata. Real TPSheet parsing needs authorized `atlas-metadata` role via a minimal correctly scoped Editor host seam. If unavailable, mark `HOST_METADATA_UNAVAILABLE` and don't call VFX MVP PASS.
3. **Direction/timing truth.** Eight-way selection only for declared eight-direction clips; neutral single-sequence/VFX have direction N/A. Preview-local FPS/once-repeat/speed overrides never silently write `AssetDefinition` or Scene documents. Frame index playback comes from Render; no unsupported random `seek` claim.
4. **Live preview lifetime.** Only one Editor playback scheduler supplying bounded delta and on-demand viewport requests. No second native Render/GPU scheduler/canvas. Hidden tab pauses with no catch-up; A→B/asset switch/unmount disposes only owned playback/instances/leasing and rejects late async publications.
5. **Scene dependency honesty.** Real in-Scene placement/attachment must use installed Phase15–17 APIs + Phase8/9 Render; no pretend scene preview from only a manual fixture. Editor preview never writes Scene/Project/Asset Document, does not clear dirty/revisions or imply Save All.
6. **UI bounded.** One React/Mantine inspector panel, existing stable Project owner, Asset Browser/viewport, Phase12 theme/`EditorPanel`/`ui:check`. No new design system, app shell, CSS canvas hacks, skill editor, hitbox or runtime gameplay.
7. **Build and verification.** Build/check/scope/finite real-host observations, with truthful `UI_BUILD_PASS` vs actual browser/visible pixels. No newly generated large unit/integration/E2E/Playwright/snapshot/coverage suites; full UI verification deferred to dedicated phase.
8. **Minimal already-authorized Editor seams:** one focused cross-feature UI composition or atlas-metadata host adapter change is within Phase18 scope if source-backed, additive, nonbreaking, same owner and no permissions widening; document evidence/checkpoint. Any protected canonical API/schema/workspace/security boundary change requires `BLOCKED_WITH_EVIDENCE` + minimal Developer delta proposal, not a workaround.

## Agent execution instructions (one folder → one PR)

1. Re-audit actual code and branch/HEAD; compare Phase10/11 Render public exports, Phase13 stable Project owner and Phase14 Asset Manager, plus actual status of Phase15–17.
2. Follow AP01 → AP14 strictly: before each capability inspect exact prior checkpoint, implement scope for that version alone, run gate, record finite positive/negative evidence, then commit. No routine Developer pause per version. **Never combine or skip version commits.**
3. Checkpoint `harness/checkpoints/animation-vfx-preview-v0.18.N.md` for every task, with exact source HEAD, file delta/public exports, gates, evidence, unsupported/unverified statuses and next version. Suggested branch `feat/animation-vfx-preview-v0.18`.
4. Gate examples (adapt only to *real scripts* at HEAD):

   ```bash
   node harness/cli.mjs check
   node harness/cli.mjs scope --projects editor --allow-infra
   node harness/cli.mjs verify --projects editor --with-consumers
   npm --workspace @rpg-platform/editor run ui:check
   npm --workspace @rpg-platform/editor run ui:build
   ```

   Final: full `verify --projects runtime-engine,runtime-render,editor,game-client,game-server --with-consumers`, `npm run build -- --force`, exact PR HEAD CI checks. Do not conflate `BUILD_PASS`, Frame Loaded/Bound, Scene Preview and Pixels Verified.
5. Stop on genuine missing source capability needed for the next step, permission safety or public contract/owner delta with evidence and smallest correct-owner plan. Same-owner local refactor within declared scope needs no additional routine approval.
6. Developer final PR review only; no self-merge, tag, release or next phase.

## Minimal finite MVP for AP13/AP14

**Sprite lane:** an existing selected same-project **real** animation resource + actually authorized atlas metadata and explicit clip/frame declarations, choose clip/direction 0–7 (if declared), Play/Pause/Resume/Stop/Step and once/repeat/speed, observe canonical Render sample and frame binding. No guessed source FPS/compass and no pixel PASS from a simple submitted receipt.

**VFX lane:** one **real** `sprite-sequence` VFX/atlas resource with correct source revisions, create/validate `VisualEffectDefinition`, Run canonical effect Play/Pause/Stop/Repeat and frame sync; remove/dispose with cleanup evidence. Preview at explicit world position or attached to a real Scene target only if Phase15–17 integration exists, else disclose `SCENE_PREVIEW_NOT_VERIFIED`.

**A/B negative:** while asset/page load is in flight switch Project A→B; retired A result must not publish to B, and A rights must drain. Hidden/unmount also releases preview-owned activity. UI visual verification is deferred but controls must be genuinely wired and compile.

## Closure packet

`editor/docs/animation-vfx-preview-v0.18.13-closure.md` plus `harness/checkpoints/animation-vfx-preview-v0.18.13.md`: task-by-task commits/files/evidence, API/declaration delta, protected-path audit, real host source/frame, Render playback/binding, Scene/visual honesty, cleanup and exact-head CI. Record explicitly any missing host metadata/Scene dependency, unsupported asset format, cleanup uncertainty and browser/pixel NOT_VERIFIED.

## Deferred

Animation Designer, persistent clip/graph authoring, arbitrary image-to-animation inference, multi-track editor, generic asset importer, authoring Save/Project Save integration, skill effect designer, particle/fly/projectile/collision/hitbox/damage, runtime gameplay, full UI test/visual matrix.
