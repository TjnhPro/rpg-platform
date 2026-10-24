# v0.9.12 - CM19 Editor and Game Client camera integration

**READY_FOR_NEXT_CHECKPOINT** for the authorized implementation/build delta.
Native integration remains **FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**.
Developer alone accepts feature/phase completion. No v0.9.13 work is included.

## Fresh preflight and one-page contract plan

Previous checkpoint/local/fetched upstream HEAD:
`4dd297a838cf2ceda3a962e56a4400501a3c55ec` (v0.9.11). Branch:
`feat/camera-projection-v0.9`; main/merge-base:
`e4464ac8e1c84a1c872f8e7a722885942a268a28`. Same open draft
[PR9](https://github.com/TjnhPro/rpg-platform/pull/9), base main, matching baseline
head. Tracked baseline clean; preexisting untracked `.mcp.json` was already recorded
in v0.9.11, remains untouched/excluded. The containing commit is this checkpoint's
delivery HEAD; exact SHA and current completed CI links are recorded in the PR
after push. This report claims no previous-head CI as current-head verification.

Read root AGENTS/ARCHITECTURE/FOUNDATION; Harness CONTRACTS/OWNERSHIP/WORKFLOW/
VERIFICATION/FAILURES; Render/Editor/Client AGENTS and v0.9.11. Inspected actual
Phase4 affine/plane/viewport/inverse, Phase6 acquisition/viewport/frame hosts,
Phase7 lease/cache and original PNG provider, Phase8 preview bridge/visual instances,
Camera configuration/zoom/viewport/inverse/Scene binding and public-root exports.
Real Phase7/8 prerequisites exist; the task's historical warning is stale.
Installed lockfile: Three0.186.1, @types/three0.186.0, TypeScript6.0.3. Local
Node24.18.0/npm12.2.0. No dependency, lockfile or external foundation change.

Requested behavior: two independent host Camera states with different input/frame
policies, through one existing canonical Render implementation. **runtime-render**
is the single canonical owner of the camera/projection contract. Source changes
belong to its justified host collaborators **editor** and **game-client**. Route
returned Render as a hint; source established this allocation. No Render gap or
public signature delta was needed. External L1/L2 APIs used: none. Runtime Engine
and Server remain untouched; no gameplay/network authority is inferred.

Pre-change plan: reuse the existing Phase6 scheduling/viewport code using internal
content callbacks; integrate Editor's existing Scene preview bridge; give Client
manual neutral presentation coordinates; use root Camera operations and selected
plane conversion only; refresh the binding after accepted resize; close before
draining late async work; compile roots/consumers, run Harness and real builds.
No breaking signature, owner move, graph change, sixth project or approval gate.

## File scope and implemented behavior

Thirteen intended paths (plus excluded local .mcp.json in scope observations):

- `editor/src/viewport-host.ts`: optional internal acquired/configured/release
  callbacks. Existing on-demand scheduler/metrics/visibility/disposal retain
  ownership. Content release runs before session disposal, with finally cleanup.
- `editor/src/manual-camera-host.ts`: captured authored Scene/catalog through
  existing preview bridge; separate workspace Camera. Pointer capture drag calls
  public screen-to-selected-plane inverse and pan; wheel uses public screen mapping
  and focus zoom. No Scene update/Document write or backing-buffer/native access.
- `game-client/src/viewport-host.ts`: extracts the existing Phase6 continuous
  host into a scoped function, adding the same owner-local composition callbacks.
  No content: existing acquire/configure/explicit-start behavior. Camera content:
  suspended layout waits for explicit Start before native Camera context capture.
- `game-client/src/manual-frame-continuous.ts`: existing Phase6 page binds its
  controls to that extracted host; no second loop or implementation copy.
- `game-client/src/manual-camera-host.ts`: independent Camera/Scene/cache/session;
  real Phase7 lease and one neutral visual. Absolute presentation center/zoom inputs;
  continuous frames through the existing host. No fake Engine entity/follow policy.
- `editor/manual/camera-workspace.mts`: finite manual public-root CPU observations,
  including authored Scene/Document preservation and independent Camera B.
- `editor/manual/README.md`, `game-client/manual/README.md`: link the manual guide.
- `editor/docs/tasks/camera-v0.9.12.md`: supplied standalone task, trailing spaces
  normalized; not a source-capability claim.
- `harness/manual/camera-hosts.mts`: manual composition of optional hosts, original
  manifest/PNG provider with exact scope/path, byte budget/length/SHA-256 checks;
  actual authored Scene and Document snapshots alongside neutral Client placement.
- `harness/manual/camera-hosts.html`: two scoped, untransformed/borderless canvases,
  separate ratio controls, independent lifecycle/input controls and inspection.
- `harness/manual/camera-hosts.md`: exact compile/serve commands, ownership and
  manual acceptance/negative/lifecycle procedure, expected vs observed vs unknown.
- This report. No historic accepted report was rewritten.

Mount closure is synchronous; late graphics are disposed by Phase6. Content
generation/closed guards ignore late PNG results; bridge/lease/cache cleanup is
owner-local. Every content cleanup stage is attempted, first thrown error retained;
uncertain content cleanup blocks re-acquisition through that mount. Native context
loss cancels host frames; Render determines terminal cleanup, not a synthetic event
or host recovery. Resize/ratio updates go through Phase6 only and refresh the
Camera binding with the exact receipt before frames. Explicit hidden/zero/stop
resume/start policy is retained. No native buffer write while Render owns graphics.

## Public compatibility and rejected alternatives

Exact emitted root declaration comparison against v0.9.11:
Render231->231, Editor138->138, Client0->0; additions0, removals0, changes0.
New browser functions/types are internal modules, absent from public package roots.
Existing root consumers compile strictly under ES2022 without DOM, skipLibCheck
false; Node imports all three roots with window/document undefined. This does not
prove universal semantic compatibility or browser behavior.

Both hosts import Render only from @rpg-platform/runtime-render; no Three/private
Render import, duplicate renderer/projection/cache/scene, authored schema change,
Engine/Server/L1/L2 edit or new UI framework. No new Camera public export is justified.
Legacy Phase8 clip projection input uses the existing Phase4 factory; Camera-bound
drawing uses the canonical localToScene path, never a host camera formula. Input
delta/zoom step is host policy; inverse/focus math stays Render-owned. Camera,
instance transform, authored placement and neutral presentation point are separate.

Rejected: host projection helper, renderer replacement, fake successful graphics,
dummy geometry/fallback texture, speculative Engine Player-follow, shared host
project, generic gesture/picking framework and new diagnostics/error union.
CSS transform/padding/border support is outside this scoped manual host contract.
The committed traveler is236 bytes, SHA256
2483022fb684d52f0054bf6baf4dc15d5a867a749a7828f89afbb51c4637cb2f,
matching its existing manifest (32x48). No source pixel dimensions are inferred.

## Actual commands and evidence

| Command / observation | Final result |
| --- | --- |
| `node harness/cli.mjs check` | exit0 ARCH_CHECK_PASS,159 JS/TS source files |
| `node harness/cli.mjs scope --projects editor,game-client --allow-infra` | exit0 SCOPE_PASS; final14 paths,13 intended + excluded .mcp.json |
| `node harness/cli.mjs verify --projects editor,game-client --with-consumers` | exit0 BUILD_PASS Editor/Client; genuine referenced builds |
| `npm run build -- --force` | exit0 genuine five-project build |
| Strict two-host manual compilation, command in guide | exit0 DOM host consumer, skipLibCheck false |
| Strict camera-workspace consumer compilation, command in guide | exit0 ES2022-only, no DOM/ambient browser types |
| `node node_modules/typescript/bin/tsc -p .artifacts/closure-portable-tsconfig.json` | exit0 existing public-root consumer, ES2022/no DOM |
| `node .artifacts/camera-v0.9.12-public-audit.mjs` | exit0 exact baseline/current emitted declaration comparison above |
| Finite `observeCameraWorkspace` via emitted public-root consumer | exit0 observations below |
| Node import of Editor/Client/Render package roots | exit0 window/document undefined |
| `node --check .artifacts/camera-hosts-page.mjs` | exit0 extracted module-script syntax only |
| Original PNG byte/hash/manifest inspection | exit0 matching236 bytes/hash/32x48 |
| `git diff --check` / staged diff check | exit0 |

Initial manual compile used an empty PowerShell --types argument (TS6044), then
revealed missing required Document schemaVersion/session baseline (TS2554/2345).
Corrected to explicit empty typeRoots and actual owner signatures. One later
Client build/whole-workspace attempt failed TS1345/2339 because a cleanup action
array inferred void; corrected its unknown result narrowing and reran both real
build gates successfully. A local task-copy attempt hit Windows cp1252 encoding;
rewrote the standalone task in UTF8. No failed/unconfigured build remains. Existing
Harness DEP0190 warning remains. No tests, runners, coverage, matrices or CI jobs.

**EXPECTED:** A pan5 moves its CSS projection left5, B remains independent. Pointer
focus zoom preserves the selected-plane point, authored placement/Document and
neutral inputs remain equal. Invalid dimensions/zoom/unknown plane reject atomically.
Native ratio changes preserve CSS projection; B continues while A suspended/closed.

**OBSERVED through public package roots, CPU only:** A projection160,120 before,
155,120 after pan(5,0). Client pointer240,180 with explicit origin40,80 selects
source205,100 both before/after zoom2; placement projects110,140 afterward. Sample
differences are0 within1e-9 tolerance. Width0, zoom0 and unknown plane threw TypeError,
retaining exact A view identity. Safe classifier reports unknown/UNKNOWN_FAILURE,
cleanupFailed null; no fabricated stable camera code. After A disposal, B retains
exact same issued view and projection160,120. Actual authored Scene placement160,120
and entire Document snapshot remain unchanged: currentRevision1, savedRevision null,
isDirty true. This does not claim persisted IO or a live native Scene observation.

**NOT_OBSERVED:** Computer Use inventory returned apps[]/browsers[]; no browser
executed. Native pixels, accepted DPR/resize behavior, continuous/on-demand timing,
real expired resource binding, context loss, pending native acquisition/unmount,
native session A/B isolation, cleanup-failure paths and GPU reclamation remain
unobserved. The guide gives exact two-canvas steps plus the existing public-root
Camera Scene negative-resource page. No live Engine/gameplay positions were supplied;
Client coordinates are explicitly neutral. Submission receipt is not pixel proof.

## Handoff

No blocking source dependency remains for this authorized delta. v0.9.13 may use
these unchanged Render contracts after its own supplied task/fresh preflight.
All native/manual acceptance above remains pending Developer review. No phase
self-acceptance, merge, tag, release, publish or unsupplied next-version work.
Rollback is revert of this scoped checkpoint, preserving accepted history.
