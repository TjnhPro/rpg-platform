# v0.8.1 / SR02 — empty Runtime Visual Scene lifecycle

Canonical owner: Runtime Render. This implements only the empty logical scope
from [SR01](scene-rendering-v0.8.0.md), not instances or a native scene renderer.
Editor/Client public consumers require no migration. No Engine/Server/L1/L2,
dependency-direction, package, manifest, lockfile or Three backend change.

## Additive public root contract

```ts
createRenderVisualScene(session: RenderFrameSession): RenderVisualScene

interface RenderVisualScene {
  readonly getSnapshot: () => RenderVisualSceneSnapshot;
  readonly clear: () => RenderVisualSceneSnapshot;
  readonly dispose: () => RenderVisualSceneDisposal;
}

type RenderVisualSceneSnapshot =
  | { readonly id: symbol; readonly sessionId: symbol; readonly state: 'active' }
  | RenderVisualSceneDisposal;

interface RenderVisualSceneDisposal {
  readonly id: symbol;
  readonly sessionId: symbol;
  readonly state: 'disposed';
  readonly reason: 'scene-disposed' | 'session-ended';
}
```

Four root additions; all existing signatures remain unchanged. Scene identity is
fresh, ephemeral and different from graphics session identity, authored Scene/Object
or gameplay identity. Symbols do not make handles serializable/rebindable. Only
the closure handle owns its operations; methods do not use `this` and cannot be
retargeted to another session via call/apply. No API accepts another scene/session
pair to transfer an existing scene. Plain/foreign/binding-only session lookalikes
are rejected by canonical identity admission before reading their properties.

## Operation and terminal semantics

| Operation / condition | Actual behavior |
| --- | --- |
| Create | Synchronous, canonical nonterminal graphics session only, including suspended sessions. Fresh empty scope; no native allocation, canvas access, upload, load, invalidation, frame or scheduling |
| Same-session second active scene | TypeError, leaves first scene unchanged. No implicit switch or shared instance state |
| Different sessions | Independent scene records/identities and per-session occupancy; no enumerable global registry |
| getSnapshot | Detached frozen metadata only; available after terminal. Old observations remain historical. active describes ownership, never GPU health or displayed pixels |
| clear while active | Empty-scene no-op, returns the current active snapshot. Owns zero instances/resources, so never clears another user's textures/cache or the private backend scene. Does not invalidate a frame because nothing changes |
| clear after terminal | TypeError, including session-ended scopes |
| dispose scene | Publishes disposed/scene-disposed first, clears occupancy and unsubscribes, drops the session-retaining callback. Does not dispose session/cache/canvas. Another scope can then be created on the same live graphics session with a fresh identity |
| Session disposal/failure/loss | Existing terminal broadcast publishes disposed/session-ended and unlinks before native backend disposal. Includes cleanup-uncertain session termination. Does not reopen or recreate anything |
| Repeat dispose | Returns the same terminal record; first reason/identity wins. Calling scene dispose after session termination does not replace session-ended with scene-disposed |
| Create after session ended | Existing branded texture SESSION_UNAVAILABLE error; use getRenderTextureFailure. No new duplicate graphics diagnostic family |

`requireTextureSession` and `onTextureSessionEnd` in `render-texture.ts` are reused
as the existing canonical graphics admission/terminal seam. Despite their historic
texture names, they require no texture upload. `frame-session.ts:disposeResources`
clears backend admission, calls `endTextureSession` (mark terminal, drain all
listeners), attempts backend disposal and retains existing cleanup diagnostics/
quarantine. Scene does not wrap/replace session.dispose or swallow its failure.
Relative ordering between sibling cache/scene listeners is not a new guarantee;
all execute before backend cleanup. SR02 owns no resource cleanup callbacks.

Private WeakSet occupancy is a guard keyed by actual session capability, not a
SceneRegistry, ID lookup or authored store. It holds no strong key. The scope's
closure is created in a separate environment from the factory's session argument;
termination drops the sole detach callback that references the session/subscription.
Terminal snapshots/handles retain only symbols, frozen logical state and methods.
This is a source-level retention analysis, not measured GPU/GC/leak-free evidence.

No cleanupFailed=false or GPU-deletion claim is synthesized by scene.dispose.
Inspect the original graphics acquisition/texture diagnostics for native outcomes.
Native context loss is observed according to existing Phase 6 events/operation
checks; scene metadata does not actively poll for unobserved loss.

## Compiled public consumer and manual handoff

[visual-scene-lifecycle.mts](../manual/visual-scene-lifecycle.mts) imports only
`@rpg-platform/runtime-render`. It is an optional finite host example with actual
graphics acquisition, two real canvas bindings and a caller-provided inspection
sink. It executes nothing on import; no fake session/backend, assertion runner,
resource fixtures, rendering, Editor dependency or timing loop. It demonstrates
the intended calls and releases both sessions through finally, including partial
acquisition or observer failure. Existing graphics exceptions still propagate.

Reproduce its genuine public-root compile without ambient DOM declarations:

```powershell
npm run build -- --force
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir runtime-render/manual --outDir .artifacts/visual-scene-lifecycle runtime-render/manual/visual-scene-lifecycle.mts
```

The isolated compiler config used for recorded verification has `types: []`,
`lib: ["ES2022"]`, `skipLibCheck: false`; it is ignored build tooling. The command
above isolates ambient type discovery via an empty typeRoots directory instead.
The emitted consumer imports the package root, not source files. For optional
manual execution, serve the trusted checkout and use an import-map host mapping
the Render root and `three` exactly as the existing
[graphics lifecycle host](../manual/graphics-lifecycle.html) does. Import
`/.artifacts/visual-scene-lifecycle/visual-scene-lifecycle.mjs` in that host and call
`observeVisualSceneLifecycle({target: canvasA}, {target: canvasB}, console.log)`
with two distinct real, positive-size canvases. This explicitly acquires and
disposes sessions; it is not a request to render a frame or remove either node.

Inspect actual IDs and reasons, the historical A snapshot, duplicate active-scene
rejection, A's empty clear/manual disposal/fresh identity/session cascade, terminal
clear rejection and B's independent active clear before its own session ends.
Repeat disposal preserves the first terminal cause. Report real session cleanup
errors rather than interpreting a missing observation as success. No expected
output is claimed as observed. Browser execution is **NOT_EXECUTED** in this
checkpoint; **FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED** remain.

## Compatibility / exclusions / rollback

Public roots become Render130 / Editor134 / Client0. Existing graphics and
binding-only entrypoints/receipts/viewport/demand semantics remain unchanged.
Three0.186.1/types0.186.0 and asset provenance/support limits remain as audited
in SR01; this checkpoint invokes no new Three/native API or PNG/TPSheet code.
TPSHEET_METADATA_OBSERVED / TPSHEET_VISUAL_NOT_VERIFIED remains inherited, not
re-executed. No new sample bytes are added/copied or rights assumed.

Rejected alternatives: second renderer/native Scene allocation; process-wide
registry; implicit same-session switch; cloned session.dispose implementation;
new generic lifecycle framework; accepting structural fake sessions; snapshot
readiness/cleanup claims. Reusing the existing private terminal subscription is
the minimum seam and requires no legacy public contract change.

Unsupported: instances/resources in the scene, update/remove/hide, attachment,
sorting/depth, native scene/material interop, frame submission integration, camera,
animation/VFX, authored data persistence, gameplay and protocol semantics.
Future scene-owned cleanup must drain its own rights before backend teardown and
preserve native failure evidence; this empty scope cannot establish that behavior.
Rollback removes the four additive exports/module and this consumer; no data/GPU
state or existing contract migration is involved. No v0.8.2 behavior is included.
