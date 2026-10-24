# TASK — RPG Platform v0.10.0: Sprite Animation Architecture & Contract Foundation

**Phase:** 10/20 — Sprite & Directional Animation
**Version:** `v0.10.0` · checkpoint **1/13** · Feature ID: **SA01**
**Canonical primary owner:** `runtime-render / Harness design`
**Collaborator:** Editor, Game Client only for contract impact audit
**Repository:** https://github.com/TjnhPro/rpg-platform
**Delivery:** **one Phase10 branch, one PR, one independently scoped commit per version**, continuous to MVP; no per-checkpoint Developer review pause.
**Status:** implementation instructions only; do not confuse this task with actual source/CI/visual evidence.

## A. Outcome — only capability authorized at this checkpoint

**Goal:** Khóa một đường duy nhất từ authored clip/frame reference → Render playback → Phase 8 instance → Phase 6 frame; không cấp gameplay authority cho animation.

**Permitted scope:** Architecture and precise public contract design only. No runtime feature implementation at v0.10.0.

### Exact work items

- Audit authoritative implementations and emitted declarations for Phase 4 orientation/alignment, Phase 6 graphics/frame, Phase 7 atlas/texture leases, Phase 8 live visual instances and Phase 9 camera; identify exact supported status and missing dependencies.
- Produce an explicit **contract map** for frame sequence, clip ID/set ID, eight direction slots, timing, playback state, frame binding and disposal. Define immutable authored data versus independent session-local runtime state. Record planned public root API names as a **proposal**, check collisions and consumers before subsequent implementation.
- Lock **8 directions only**: eight explicit keys/indexes `0..7`, sector width `2π/8`, configured zero-angle/index convention consistent with Phase 4 `VisualOrientation2D`; no 16/32 variants, fallback, flipping or filename inference. Direction count is not a dynamic extension setting in this MVP.
- Define timing rules upfront: one normalized positive interval; mutually exclusive FPS or interval inputs; `once` and `repeat`; no independent clock. Define same-clip idempotence, direction-change progress preservation, once completion and stop/reset before introducing APIs.
- Identify exact frame-origin authority and missing metadata: Phase 7 `sourcePivot` may be present, `trim/sourceSize` are not generally supported. Alignment must be explicit or rejected, never inferred.
- Document old/new resource/session ownership: the animation runtime borrows/owns declared Phase 7 rights through canonical operations; one texture may support multiple independently advancing instances.
- Inventory supported current files/PRs, absent upstream implementation and phase gate, with `API_DESIGN_ONLY` when no implementation is legitimate.

### Version-specific acceptance (must be observed or truthfully marked not observed)

- A one-page concrete contract/ownership table resolves all six seams without contradictory types; each API is assigned exactly one owner.
- Architecture report includes 8-direction index/angle/tie example, timing state transition table, resource reference/lifetime sequence and known frame-origin limitations.
- All existing Phase 4/6/7/8/9 contracts remain unchanged; no new production modules in this checkpoint.
- If live Phase 8/9 APIs are absent, clearly state the missing concrete public symbols and downstream blocking checkpoints, never fabricate them.

**Out of scope, even when convenient:** No clip parser, animation playback, test runner, UI designer, general scheduling, new Render graphics session, texture manager, 16/32 direction modes or gameplay animation state machine.

## B. Actual baseline and prerequisite discipline

- At task creation (2026-10-23), GitHub **main** includes merged Phases 1–6. Phase 7 PR [#7](https://github.com/TjnhPro/rpg-platform/pull/7) is **open**; the inspected Phase 7 branch provides actual `VisualFrameReference`, `resolveAtlasFrame`, `resolveAtlasFrameGeometry`, `createAtlasTextureView`, `parseUnityAtlasMetadata`, `createVisualResourceCache` and texture/lease contracts. **Phase 8 and Phase 9 source/PR implementation had not been confirmed**. This note is a point-in-time observation, NOT permission to assume those later dependencies exist when executing.
- Re-read **the exact local checkout/HEAD**, active Phase10 branch and prior checkpoint commit; compare installed/emitted declarations, not roadmap documents. When missing a version prerequisite, report the exact absent contract, current SHAs and why the work cannot legitimately proceed; do not create surrogate Visual Scene, Camera, texture loader or Renderer.
- Prior v0.10 checkpoint must be committed and valid before this checkpoint's implementation. The phase starts from a genuine integration-compatible baseline. Pure clip metadata can be validated headlessly, but that does **not** establish readiness of live Phase8 integration or visual MVP.
- Phase 4: `VisualOrientation2D`, `createVisualOrientation2D`, `VisualAnchor2D`, `resolveVisualAlignment2D`, planar transforms. Phase 6: `RenderFrameSession`, `invalidateRenderFrame`, viewport/session lifecycle. Phase 7: authoritative atlas/frame source and revision geometry, texture rights/leases. Phase 8: visual instances, layer/depth/visibility. Phase 9: camera projection when rendering in world/viewport. Inspect source for the **actual** names and semantics before implementation. Do not bind an absent future API by making up a type.
- **Hard resource format limit from inspected Phase 7**: the observed Unity TPSheet profile currently supports `rotation:'none'`, `trim:null`, `sourceSize:null`; `sourcePivot` exists in atlas metadata. The owner of future trim/rotated frame support is Phase 7, not Phase 10. Do not extend parser/geometry here solely to make demos PASS.

## C. Canonical ownership and contract locks

| Owner | Allowed role in Phase10 | Forbidden substitution |
| --- | --- | --- |
| L1 `@rpg/core/kernel` / L2 `@rpg/gameplay` | Read-only frozen public API, no Phase10 change | Never edit, reimplement or deep-import gameplay foundations |
| L3 `runtime-engine` | Owns game-specific animation **intent**, action/state/facing authority and gameplay consequences | No Render-driven HP/damage/movement/AI/skill timing |
| L4 `runtime-render` | **Only** animation data validation, 8-way mapping, playback state, elapsed advance, frame selection, origin handling and live instance binding | No parallel renderer, clock, source loader, texture cache or Scene manager |
| L4 `editor` | Authored references/config + minimal preview host, consumes Render root | No independent animation math, playback state engine, image cropping or inferred direction order |
| L4 `game-client` | Owns client UI/input/frame scheduling and passes explicit presentation intent/elapsed delta | No duplication of Render state transitions; does not import Editor runtime |
| L4 `game-server` | No mandatory animation/DOM/GPU participation | Do not make game correctness depend on visual frame completion |

**Non-negotiable semantics:**

1. **Clip definition ≠ eight-direction mapping ≠ per-instance playback ≠ live Visual Instance ≠ gameplay authority.** Each has one owner and distinct identity. Clip keys (`idle`, `walk`, etc.) are authored strings, not builtin game-specific states.
2. **Exactly eight directions, indexes 0..7.** All eight sequences must be explicitly bound for MVP. Orientation angles use Phase4's canonical axes/`[0,2π)` convention; no filename sort, magic sprite-sheet layout, flip/mirror fallback or 16/32-direction implementation. A 45° sector is a directional selection rule, **not** a gameplay movement constraint.
3. **Frame identity is Phase7 resource/frame identity.** `subresourceId` is an opaque string (may be `"0012"`); preserve exact ID, atlas version/revision and verified geometry. No fabricated frame IDs, PNG bytes, fake image content, crop/upload-per-frame or implicit asset path fetch.
4. **Timeline depends only on explicit `deltaMs` and normalized timing.** Playback state cannot be inferred from RenderFrameReceipt, native frame count, Date.now, `performance.now` or RAF inside Render. Hosts decide scheduling; changing facing doesn't implicitly restart a repeating clip.
5. **World placement/ground anchor belongs to existing Spatial/Visual Scene contracts.** A frame change can change its draw rectangle/UV/alignment but not authored or gameplay position. Missing untrimmed metadata is never treated as trim=0/center=origin unless explicitly verified.
6. **Phase7 owns resource provider/decode/cache/leases; Phase8 owns visual instances/layer/depth/visibility; Phase6 owns frame invalidation; Phase9 owns camera/projection.** Phase10 integrates solely by public contractual seams, never by re-implementing their behavior.
7. **Failure and lifetime are explicit.** Nonexistent frame/clip/direction, mismatched atlas revision, disposed session/instance/lease, incomplete source or invalid numeric time must not be coerced into a successful frame. A failed attempted update may not silently corrupt the last valid bound state.
8. **Browser-neutral public root.** No exported `THREE.*`, DOM, Canvas, GPU types in neutral frame/clip/time descriptors. No global mutable animation registry, sixth `shared` project, general ECS, skeletal system, state machine or unnecessary future abstraction.

### Foundation contract seam for implementation (structural intent, not fake existing exports)

- `FrameSequence` — ordered immutable Phase7 `VisualFrameReference` values; deep-captured and source-scope checked.
- `Clip/Timing` — host-chosen `clipId`, normalized positive `frameIntervalMs`, explicit `'once'|'repeat'`, no per-frame duration for MVP.
- `EightWayClip` — **exactly eight** explicitly declared direction entries with authored order/zero-angle binding; pure angle→slot mapping.
- `PlaybackHandle/Snapshot` — ephemeral independent instance state: clip, direction, elapsed, frame, playing/paused/stopped/completed, disposed; no graphics root dependency for pure readback.
- `VisualFrameBinding` — only when actual Phase8 API exists; selects canonical Phase7 frame/texture view and updates existing instance, retaining lease/cleanup ownership.

Names above are **contract concepts**, not authorization to duplicate or rename preexisting exported APIs. `v0.10.0` establishes proposed root surface; later checkpoints may implement additive capabilities within this approved shape after verifying real source. If signatures would break old consumers, STOP with a compatibility delta before changing them.

## D. Mandatory execution workflow — continuous, without shortcuts

1. **Preflight owner and source once per checkout/change:** read root `AGENTS.md`, `ARCHITECTURE.md`, `FOUNDATION.md`, relevant `runtime-render/AGENTS.md` and consumer AGENTS; `harness/{OWNERSHIP,CONTRACTS,WORKFLOW,VERIFICATION,FAILURES}.md`; inspect exact previous checkpoint and relevant `src`/emitted public `.d.ts`. Do a **delta-focused** audit after prior checkpoint, not a redundant full repository reread unless source/baseline changed. `node harness/cli.mjs route -- "sprite animation directional"` provides routing hints, not ownership authority.
2. **Contract-first implementation:** write down touched files, one canonical owner, collaborators, actual used public symbols, anticipated export delta, compatibility implications, error/release states and version-only acceptance. Build implementation from existing pattern. Do not expand to adjacent versions for convenience or defer missing required behavior with no-op code.
3. **One version = one scoped code/doc change + one checkpoint report + one commit** on **one Phase10 branch/PR** (suggested `feat/sprite-directional-animation-v0.10`, avoid creating a second PR). Report path: `harness/checkpoints/sprite-animation-v0.10.N.md`. Record full SHA after commit in PR ledger, not in a self-referential report. Complete actual checks before marking a checkpoint ready. Push/CI policy follows the existing Harness; never invent PASS while CI pending.
4. **Continue automatically** to the next numbered task if committed checkpoint, static architecture, true build/consumer compatibility and required contracts are sound. Do **not** pause for routine per-version Developer acceptance. Browser manual output that cannot be observed remains `VISUAL_NOT_VERIFIED`; it must not be promoted into `MVP_PASS`.
5. **Stop only for genuine blockers:** missing necessary Phase7/8/9 public API, breaking public contract without approved migration, conflicting Phase4 angular convention, unverified mandatory 8-way source asset for visual MVP, invalid lifetime/ownership, need to modify L1/L2/L3 gameplay, cross-project dependency reversal or loss of authored data. Return `BLOCKED_DEPENDENCY`/`BLOCKED_WITH_EVIDENCE`, exact source/commits and smallest legitimate resolution. Do not implement an alternate subsystem to keep the phase green.
6. Never self-merge, tag, publish, release, edit another repository or claim Developer acceptance. Review and real product/visual proof remain Developer-owned.

## E. Verification — original Harness build-only policy

**Required commands (narrow changed scope first):**

```bash
node harness/cli.mjs check
node harness/cli.mjs scope --projects runtime-render --allow-infra
node harness/cli.mjs verify --projects runtime-render --with-consumers
```

If Editor/Client sources change, include their names in `scope`/`verify --projects`. Run `npm run build -- --force` for end-to-end MVP and closure; also run when truly required for public cross-project compatibility, not mechanically for every Render-only edit. `--with-consumers` is mandatory when Render public API changes. Preserve the actual command results, failed/unconfigured builds, diff audit and exact SHA CI status. Do not weaken existing Harness architecture/scope gates.

**Manual functional evidence** may use an isolated public-root `.mts` consumer or real browser demo with actual source/frame references. For each case record `INPUT`, `EXPECTED`, `OBSERVED`, `NOT_OBSERVED` and type/precision limitations; static compilation cannot verify playback/render pixels. No new unit, integration, browser, Playwright, snapshot or E2E test suite, test runners, coverage targets, synthetic success scripts or CI matrices.

**A valid checkpoint report** states: exact base and HEAD/branch/PR; source/d.ts inspected; primary owner; scoped file/contract delta; applicable decision table for 8 directions/timing/origin; commands and actual exit statuses; manual evidence vs nonobservations; compatibility/lifetime/cleanup blockers; next task readiness. Runtime Render frame receipt `submitted` ≠ evidence of actual sprite pixels.

## F. Definition of done

- [ ] Correct previous checkpoint/source implementation and dependency baseline identified; no assumed Phase8/9 APIs.
- [ ] **Version-specific work/acceptance above is complete**, not replaced by merely describing an interface or writing demo placeholders.
- [ ] `8-way ONLY`, no inference/auto-mirroring, no gameplay animation authority and no duplicate timing/cache/renderer path.
- [ ] Additive public-root contract as approved; actual changed-project builds/consumer compilation and architecture checks captured honestly.
- [ ] One report and checkpoint commit exists; actual manual observations are recorded without false visual or functional PASS.
- [ ] Report gives next checkpoint handoff; stop only on a real dependency/ownership/public-breaking issue.

## G. Next checkpoint

**Next:** v0.10.1 — capture immutable frame sequences. Preserve prior invariants; never silently reinterpret frame indexes, direction keys, origin or timing between checkpoints.
