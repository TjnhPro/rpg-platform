# v0.1.8 — Editor–Render integration and closure review (ER15)

**READY_FOR_DEVELOPER_REVIEW — v0.1.8**.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**. This is integration inspection and
build evidence, not phase ACCEPTED, FRAME_PASS or a claim of observed graphics.
Developer decides checkpoint/phase acceptance. No next phase, merge, tag, release
or publication is included.

## Preflight and exact scope

Baseline: clean `feat/editor-render-foundation-v0.1` at
`7f339055dabd9cef66c4f041613b593c803e68b2`; continuing Draft
[PR #1](https://github.com/TjnhPro/rpg-platform/pull/1), base `main` at
`4874c1b3ce72cba7483b183093ec8c36f56187ea` (Foundation Initialization).
[Preflight posted before edits](https://github.com/TjnhPro/rpg-platform/pull/1#issuecomment-6333351353).

Canonical primary owner: **runtime-render**, presentation contract/lifecycle
integration. **editor** collaborates for host orchestration and public consumption.
Harness owns the audit record/gates only. Root AGENTS, ARCHITECTURE, FOUNDATION,
Harness CONTRACTS/OWNERSHIP/VERIFICATION, both project AGENTS, actual source,
manifests, references, emitted declarations, prior checkpoint reports/history and
whole-PR diff were reviewed. Source matches v0.1.7; no new contract decision or
runtime regression requiring a code change was established by this audit.

Four documentation files change in v0.1.8: this report, `harness/CONTRACTS.md`,
`runtime-render/AGENTS.md`, `editor/AGENTS.md`. Two stale guidance statements are
corrected: GPU cleanup is implemented on the separate v0.1.7 graphics path, while
binding-only disposal still releases references only. Historical reports preserve
their checkpoint-time facts. No runtime/source, signature, dependency, package
version, export-map, compiler, checker, CI or foundation pin delta in v0.1.8.

## Nine-checkpoint inventory and Developer decisions

Exactly nine checkpoints in one branch/PR. **OPEN** means Developer acceptance is
not recorded; neither accepted nor rejected is inferred from the next task being
authorized. All nine remain OPEN. The v0.1.8 exact commit SHA and exact-head CI URLs
are recorded in PR #1 after commit/push; resolve the report's introducing commit
with `git log --diff-filter=A --format=%H -- harness/checkpoints/editor-render-v0.1.8.md`.
This avoids embedding a commit's own hash in the file that determines that hash.

| Checkpoint | Commit SHA | Public symbol / semantic delta | Developer decision |
| --- | --- | --- | --- |
| [v0.1.0](editor-render-v0.1.0.md) | `2ab3e032055c79e7e28f446f4787e5f6d2e2bce7` | No symbols; ownership/boundary design and static Editor→Three prohibition | OPEN |
| [v0.1.1](editor-render-v0.1.1.md) | `bf1fac160b054d5121b7a51dad7c987e3c5d0d60` | Render +`RenderHostBinding`, `RenderSessionDescriptor`, `createRenderSession`; Editor +`createEditorPreviewSession` | OPEN |
| [v0.1.2](editor-render-v0.1.2.md) | `2939b5df3cfceedc8e9597df366e2c98a55d179c` | Render +`RenderSessionSnapshot`, `RenderSessionLifecycle`, `createRenderSessionLifecycle`; Editor +`initializeEditorPreviewSession`; created→bound | OPEN |
| [v0.1.3](editor-render-v0.1.3.md) | `934a3a914f01376092bbe7a3a951553be0849e5f` | Render +`RenderSessionDisposal`, required lifecycle `dispose()`; Editor +`disposeEditorPreviewSession`; terminal disposal/getSnapshot rejection, initializer failure cleanup | OPEN |
| [v0.1.4](editor-render-v0.1.4.md) | `97e6eb4b6a9f7bc897b6c4929779a0c85d1bc901` | Render +`RenderFailure`, `getRenderFailure`; Editor +`getEditorPreviewFailure`; safe private-brand diagnostics, throwing channel preserved | OPEN |
| [v0.1.5](editor-render-v0.1.5.md) | `64d8924d19cab3d8fff4bff6ae2c90b9cf20ec8e` | Editor +`EditorPreviewHostSnapshot`, `EditorPreviewHost`, `createEditorPreviewHost`, `openEditorPreviewHost`; no Render symbol delta | OPEN |
| [v0.1.6](editor-render-v0.1.6.md) | `fb34a2fe0ef803bfa43709fa5ecd009f96e63c55` | No symbols/behavior delta; compatibility and extension decision gates | OPEN |
| [v0.1.7](editor-render-v0.1.7.md) | `7f339055dabd9cef66c4f041613b593c803e68b2` | Render +`RenderFrameSession`, `RenderFrameReceipt`, `RenderFrameFailure`, `createRenderFrameSession`, `getRenderFrameFailure`; separate graphics acquisition/frame path; no Editor root symbol delta | OPEN; visual evidence missing |
| v0.1.8 | Introducing commit of this report; exact SHA in PR #1 | No symbols/behavior delta; ER15 integration audit/closure review | OPEN |

v0.1.3's required dispose member and disposed-operation semantics were real contract
changes, not merely a new export; v0.1.4 changed error implementation/diagnostics.
v0.1.7 is additive but introduces explicit async/resource/error responsibilities on
the new path. None of these authorizations establishes a stable published release
or retrospective Developer acceptance. All five package versions remain private 0.0.0.

## Current implemented public API (source and declarations)

Render has **14 root symbols**, Editor **8**. Only `.` is exported from either
manifest, to built ESM/declarations. Internal emitted relative declaration imports
do not authorize consumer subpath imports; `FrameError` and `ThreeFrameBackend`
are not package-root exports. No public signature exposes Three or DOM types.

| Implemented Render symbols | Semantics and current consumer |
| --- | --- |
| `RenderHostBinding`, `RenderSessionDescriptor`, `createRenderSession` | Borrowed object; copied/frozen wrapper, fresh local symbol; Editor metadata adapter; no validation/resources |
| `RenderSessionSnapshot`, `RenderSessionDisposal`, `RenderSessionLifecycle`, `createRenderSessionLifecycle` | created/bound observations; initialize/getSnapshot/dispose; Editor initializer and preview-host, graphics factory internally |
| `RenderFailure`, `getRenderFailure` | INVALID_HOST_TARGET/initialize; SESSION_DISPOSED/initialize or getSnapshot; same-instance recognition; Editor forwarding and manual demo |
| `RenderFrameSession`, `RenderFrameReceipt`, `createRenderFrameSession` | Promise acquisition; lifecycle plus explicit renderFrame returning frozen sessionId/status submitted; separate manual browser demo |
| `RenderFrameFailure`, `getRenderFrameFailure` | Safe code/stage/cleanupFailed; same-instance recognition; manual demo reporting |

| Implemented Editor symbols | Semantics |
| --- | --- |
| `createEditorPreviewSession` | Metadata delegation; host owns returned descriptor |
| `initializeEditorPreviewSession`, `disposeEditorPreviewSession` | Binding initialize/cleanup forwarding; initializer disposes on failure |
| `getEditorPreviewFailure` | Forwards Render classifier; unknown stays unknown |
| `EditorPreviewHostSnapshot`, `EditorPreviewHost`, `createEditorPreviewHost`, `openEditorPreviewHost` | One private binding-session slot; mount/replace/unmount/close/getSnapshot; null means unavailable |

These are executable implementations compiled by real builds, not proven runtime
behavior. Scene/object authoring, asset pipeline, viewport/resize/context APIs,
camera controls, sprite/animation/VFX, save/export schema, gameplay preview and
Client/Server features remain **DEFERRED**, not implemented APIs. Foundational
interaction examples in CONTRACTS are prospective, not product capability claims.

## Whole-PR dependency and architecture audit

Audit range: Foundation `main` through v0.1.8. Before this closure the PR contains
25 paths; this report adds one, giving **26 paths**. Exact file inventory is
`git diff --name-only main...HEAD` on the PR branch. All grouped paths accounted for:

| Paths/categories | Observed delta / boundary assessment |
| --- | --- |
| Render src `index`, `frame-session`, `frame-failure`, `three-frame` (4) | Reference lifecycle, safe diagnostics and private lazy Three backend only; no Engine/Editor/Client/Server/Core/Gameplay import |
| Editor src `index`, `preview-host`, `manual-demo` (3) | Root Render consumption; existing Engine bootstrap import; no Three, drawing calls, duplicated renderer or gameplay calculation |
| Editor manual HTML/README (2) | Host canvas/buttons, import map and manual instructions; map selects manifest-declared root artifact, not private API; Three path is browser ESM resolution, no Editor TS/backend import |
| Render package, Render/Editor tsconfigs, root lockfile (4) | Only Render declares exact three 0.186.1 and dev @types/three 0.186.0; scoped DOM libs; Editor side-effect import checking enabled; project references unchanged |
| Render/Editor AGENTS, Harness CONTRACTS, nine checkpoint reports (12) | Boundary/contract history and current closure evidence; no ownership/dependency direction moved |
| Harness cli (1) | v0.1.0 adds five-line Editor direct Three/@types/three import/dependency prohibition; no simulated builds, test runner or policy weakening |

Actual dependency graph (arrows mean depends on):

```text
runtime-engine -> @rpg/core/kernel + @rpg/gameplay
runtime-render -> three                  (no workspace dependency)
editor         -> runtime-engine + runtime-render
game-client    -> runtime-engine + runtime-render
game-server    -> runtime-engine         (no Render dependency)
```

- Exactly five workspaces, each with independent `tsc -b --force`; root `tsc -b`
  references all five. Harness is tooling. No sixth project/package or test setup.
- Engine/Client/Server source, manifests, references and AGENTS are byte-unchanged
  from main. Root config, base compiler options, CI, foundation preparer and pins
  are unchanged. Client remains root-import compilation only; no Client renderer
  flow is implemented. Server keeps ES2022-only compile and no mandatory graphics.
- Render has no project references and cannot import foundations under Harness.
  Editor's only Render specifier is its public root. All Render internal imports
  stay within Render. Public declarations remain object/symbol/unknown based.
- Three runtime package has no further npm dependencies. @types/three brings
  rapier3d-compat, tween.js, stats/webxr types, fflate, meshoptimizer as locked
  development dependencies; none is imported by Platform source. Their presence
  is not physics/tween/asset implementation. `npm ls --all` resolves cleanly.
- DOM/DOM.Iterable libs are Render-scoped, DOM is Editor-scoped; no DOM lib is
  added to Engine/Client/Server or the shared base. `skipLibCheck: false` remains.
- Root Render evaluation defines functions/classes and a private WeakSet; the
  index/frame-session ESM cycle makes no top-level lifecycle call. Three is loaded
  only by explicit dynamic acquisition. Editor manual-demo DOM access is isolated
  from Editor root. This is source inspection, not import execution proof.
- Static Harness scanning is lightweight, not a proof against all computed imports
  or external library behavior; direct source/manifests/declaration review supplements it.

## Read-only foundation evidence

| Foundation | Exact unchanged revision | Version | Runtime Engine public import |
| --- | --- | --- | --- |
| L1 | `04b7239f998c3c688a0dfa3202f11811a9acd775` | 2.0.0 | `calculateStats` from `@rpg/core/kernel` |
| L2 | `acea332aa80f67552192a72b30f81c0bbbfc56bd` | 0.15.2 | `createGameplayRuntime` from `@rpg/gameplay` |

Neither API is invoked by the Foundation entrypoint. Named imports compile; no
copied gameplay logic or Core Legacy Gameplay replaces L2. No upstream checkout
is edited or synchronized. Git diff confirms no Engine/pin/preparer change;
Core/Gameplay lock entries are byte-equivalent JSON to main. Local ignored tarball
SHA-512 digests were recalculated and match `harness/foundation-pins.json` exactly.
Exports/source inside those artifacts were not rewritten. Clean-clone CI uses
unchanged foundations:prepare, locked install and real builds, not upstream tests.

## Lifecycle call-path inspection — two separate consumers

1. **Binding adapter:** Editor metadata/init adapters delegate through Render root.
   Preview-host mount creates/initializes a reference lifecycle; null reports
   unavailable without a session. Mounted means bound, never graphics acquired.
   Replace unmounts first, then mounts; failure has no rollback. Close is terminal
   and idempotent; Editor observation remains readable after close. Closed/occupied
   host misuse uses native Editor errors, not invented Render classifications.
2. **Graphics consumer:** manual HTML loads Editor manual-demo; Start awaits
   `createRenderFrameSession`. Render creates/initializes a binding, reserves its
   target, dynamically imports the backend, validates same-realm positive canvas,
   requests WebGL2 and constructs real WebGLRenderer/Scene/Camera. No frame is
   submitted by construction. This path does not go through preview-host mount.
3. **Frame:** demo calls public renderFrame once. Backend sets opaque blue clear
   (#147da8), renders an empty scene, checks Three frame-counter advancement and
   context/error state. Frozen submitted receipt identifies that session. No GPU
   readback, display acknowledgement or visual assertion exists. No permanent loop.
4. **Ownership/disposal:** host owns canvas/node/context lifetime, UI and retained
   observations; Render owns renderer/resources/listeners and mutable session.
   Identity is a fresh execution-local symbol, not authored/gameplay identity.
   Dispose attempts scene clear and renderer.dispose, restores data-engine only
   when still its value, terminally drops binding/backend references and normally
   releases reservation. It never removes/resizes canvas or forces context loss.
   Old caller snapshots can retain targets; host must drop them separately.
5. **Failures:** invalid reference preserves old RenderFailure. New graphics failures
   use UNSUPPORTED_TARGET, TARGET_IN_USE, GRAPHICS_UNAVAILABLE, ACQUISITION_FAILED,
   FRAME_FAILED, CLEANUP_FAILED plus stage/cleanupFailed. Unknown module-load/host
   exceptions remain unknown. Frame failure attempts terminal cleanup; explicit
   failed cleanup still terminates lifecycle and quarantines target. Repeated
   disposal does not retry resource cleanup. Throwing constructor without returned
   renderer marks cleanup uncertain. Private branding/target guard are package-local.
6. **Host lifecycle:** pending flag prevents overlapping starts; pagehide disposes
   active handle, late unwanted acquisition is disposed when leaving. Host awaits
   acquisition; there is no cancellation handle. No process-termination cleanup
   guarantee, automatic context restore, cross-package canvas coordination or retry.

## Future contract stress — inspection only, no added subsystems

| Scenario | Assessment / unresolved decision |
| --- | --- |
| Shared Editor/Client renderer | Client can consume same root directly without Editor; actual Client frame flow unimplemented |
| Optional Text/2D/2.5D | Text host can omit graphics/null preview; no universal projection/schema locked. Current graphics proof is empty canvas clear, not a 2D/2.5D scene system |
| Multiple previews | Independent binding slots and different-canvas graphics sessions by source design; same canvas excluded per package instance. Package duplicates/other renderers require host coordination; no observed concurrency proof |
| Headless Server | Actual Server imports Engine only; public Render types introduce no DOM. Root lazy path permits future optional metadata use by inspection; no headless render implementation/execution claim |
| Context/viewport/scene/camera | Additive APIs can compose with symbol identity/lifetime, but no resize/reconfigure/input contract is approved. Do not reinterpret bound/mounted or change sync dispose silently |
| Sprite/animation/VFX | Render owns future resources/playback; Engine owns outcomes. No universal Actor, events, coordinates, schema or gameplay timing inferred |
| Editor extraction to another repo | Root-only imports and manifest dependencies provide a boundary seam. Current private workspace 0.0.0 distribution, Engine dependency, packaging/manual import-map deployment need an explicit artifact/distribution decision; not extraction-ready by build alone |

These are constraints and future decisions, not promises that an arbitrary future
API is compatible. Expanding required members/unions, async cleanup, new data
ownership or signatures still needs Developer approval and consumer impact review.
No breaking fix or unresolved ownership move is needed for this docs-only closure.

## Verification and manual review limits

Required build-only gates:

```sh
node harness/cli.mjs check
node harness/cli.mjs scope --projects runtime-render,editor --allow-infra
node harness/cli.mjs verify --projects runtime-render,editor --with-consumers
npm run build -- --force
```

Infra allowance is only this report and CONTRACTS discovery. No checker/config
change in v0.1.8. Editor and Client are discovered Render consumers; Server is
covered by forced five-project build. Builds establish named public API resolution
and compilation, not lifecycle/cleanup correctness or graphics compatibility.

Manual instructions remain in [Editor manual README](../../editor/manual/README.md).
After setup/build, serve root with
`python -m http.server 4173 --bind 127.0.0.1 --directory .`, open
http://127.0.0.1:4173/editor/manual/, click Start and inspect solid blue, Dispose,
then Start again. Retained blue after dispose is not active renderer evidence.
Stop server with Ctrl+C. No observation was performed for v0.1.8; no screenshots
are available. v0.1.7 records unavailable IAB/browser surface, not a renderer failure.

Manual GPU execution, real displayed frame, same-canvas remount, context-loss and
actual resource reclamation remain unverified. No tests, UI/E2E/browser probes,
framebuffer readback, runners, coverage or upstream verify suites were added/run.
The missing visual evidence prevents declaring whole Phase 1 PASS/ACCEPTED.

Exact v0.1.8 SHA, push and PR workflow conclusions are attached to PR #1 after
push. The PR remains Draft; Developer review/acceptance is the next action.

Observed locally on Node 24.18.0 / npm 12.2.0:

| Gate | Result |
| --- | --- |
| `check` | ARCH_CHECK_PASS; 10 JS/TS source files |
| `scope --projects runtime-render,editor --allow-infra` | SCOPE_PASS; 4 documentation paths |
| Render independent build | BUILD_PASS |
| Editor independent build / named Render API compilation | BUILD_PASS |
| Discovered Game Client consumer independent build | BUILD_PASS; no source changes |
| Forced whole workspace build | BUILD_PASS; all five project references compiled |
| Runtime Engine / Game Server | BUILD_PASS in forced workspace build; no separate independent invocation in this checkpoint |
| Dependency tree / L1-L2 artifact integrity | npm ls resolves cleanly; exact SHA-512 matches both pins; foundation lock entries unchanged |
| Git whitespace | PASS |

No failed or unconfigured build remains. Existing Windows Harness DEP0190 warning
is unchanged; all real build commands exited 0. No behavioral or visual PASS is
derived from these results. **FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED** remain.
