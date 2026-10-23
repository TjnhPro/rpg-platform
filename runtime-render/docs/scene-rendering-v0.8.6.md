# v0.8.6 — SR08 Visibility & Active State

Runtime Render owns transient per-instance draw intent. Hidden is not removed,
disposed, unloaded, gameplay stealth/death or an authored Editor status. Phase 6
already supplies viewport suspension; no separate scene activity lifecycle is added.

## Additive public surface

```ts
setRenderVisualInstanceVisible(scene, instance, false);
getRenderVisualInstanceVisibility(scene, instance);
// { visible: false, viewportSuspended: false, effectiveVisible: false }
setRenderVisualInstanceVisible(scene, instance, true);
```

Three new root names: the two functions and
`RenderVisualInstanceVisibilitySnapshot`. Existing required instance/input/session
shapes remain unchanged. Every new registration starts with explicit visible=true
in Render-owned live state, not in its historical registration handle or authored
Scene data. Supply a primitive boolean; no coercion, null, auto-toggle or defaults
on updates. Both functions require the exact live instance in the specified scene.

`effectiveVisible = visible && !viewportSuspended`, within an admitted active
scene/session. This means the visibility/suspension **gate permits participation**,
not that a drawable/resource exists, clipping passes, pixels changed, graphics
remain continuously healthy or a frame was submitted. No resource-readiness probe
or freshness guarantee is folded into this flag. A visible unbound/unplaced
instance can have effectiveVisible=true and still produce no drawable.

Snapshots are frozen scalar observations. Reads and returned updates capture the
current canonical Phase 6 suspension flag; old snapshots never change. Session
termination closes the scene and rejects subsequent live reads rather than
returning a misleading active/effectively-visible result. No durable false flag
is written on suspension, and no suspend/resume callback changes instance flags.

## State transitions and invalidation

| Operation | Result |
| --- | --- |
| true -> false / false -> true | native flag update first, commit boolean, mark existing frame demand |
| repeated hide/show | fresh observation, no native write/invalidation/reload |
| hide before first placement | store flag, no native node allocation; first transform creates a hidden node |
| transform while hidden | update the same native matrix with visible=false; no show or resource replacement |
| unset transform while hidden | remove node, retain false flag and binding; later placement remains hidden |
| show after hidden update | same native node/latest matrix, retained valid Phase 7 usage, no load/upload |
| viewport suspend | retain explicit flags; effectiveVisible false for every instance, frame submission remains Phase 6-rejected |
| show during suspension | explicit true, effective false; demand pending for host-driven resume/frame |
| viewport resume | effective visibility follows retained per-instance flags; existing resize/resume demand applies |
| remove / clear / dispose | existing ownership teardown, not an effect of hiding |

No automatic frame/RAF/queue is introduced. Changed intent invalidates even when
no node currently exists; repeated equal intent does not add invalidation, but
does not clear previously pending demand. Existing successful renderFrame
acknowledges only the demand it captured. Hidden transforms/resources remain
editable through existing APIs. No ordering API is invented ahead of its task;
future ordering operations must preserve hidden state too.

Admission uses existing FOREIGN_SCENE/FOREIGN_INSTANCE/MISSING_INSTANCE/
SCENE_DISPOSED/SESSION_UNAVAILABLE diagnostics; getRenderVisualInstanceFailure
remains the safe classifier. A handle from another scene/session is foreign even
with the same string key. Removed handles reject after ID reuse. Invalid boolean
input uses INVALID_DESCRIPTOR. Terminal/identity admission precedes value
validation; no-op does not bypass terminal guards. Visibility writes during an
in-progress frame reject with FRAME_IN_PROGRESS before changing the flag or node.
Native context loss/exception uses existing graphics terminal cleanup; no new
successful flag is committed on that failure. Cleanup diagnostics retain their
existing uncertainty. No automatic recovery or retry/reload.

## Existing backend integration and draw limitation

The same private dispatch created for SR07 now carries transform, visibility and
canonical viewport-suspension read operations. It is not a public manager or
second state machine. Per-instance flag belongs to existing scene membership.
Private Three backend writes Object3D.visible on an existing node without
removal/recreation/geometry or texture release; subsequent transforms apply the
current flag, including first node creation. No node is created just to hide/show.

Three 0.186.1 / types 0.186.0 unchanged. Official
[Object3D documentation](https://threejs.org/docs/pages/Object3D.html) describes
visible and visible traversal. Installed Three WebGLRenderer.projectObject checks
object.visible===false before constructing draw participation. This is source
evidence for the native gate, not proof of submitted instance pixels. Future
drawables attached to these nodes must preserve that gate; any future custom
submission list must explicitly honor it and viewport suspension.

**DRAW_NOT_IMPLEMENTED**: current SR07 nodes have no material/mesh, and Phase 7
textures are not yet mapped into a native sprite material. renderFrame continues
the existing clear/optional standalone resource diagnostic. That diagnostic is
not an instance draw and is not controlled by a particular instance's visible
flag. No culling, line-of-sight, fog, gameplay active state, authoring dirty state,
camera, frame selector, cache policy or draw pipeline is introduced here.

## Optional real-session manual consumer

`manual/visual-instance-visibility.mts` takes a real canonical unoccupied active
session, actual Phase 4 transforms, fresh host metrics/limits and optionally a real
same-session ready Phase 7 binding and a real foreign-scope handle. It logs initial
history, hide-before-placement, hidden transform update, repeated hide, second
instance, show/latest transform/resource, viewport suspend/show/resume and
foreign/missing/terminal rejection. It disposes its own scene, keeps host session
and input resource rights, and explicitly changes the host viewport size on
resume. Caller must authorize that manual walkthrough and supply fresh metrics;
it is not an auto-run or a substitute for host layout observation.

Strict compile (also include unchanged earlier scene manual entries):

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir runtime-render/manual --outDir .artifacts/visual-instance-visibility runtime-render/manual/visual-instance-visibility.mts runtime-render/manual/visual-instance-transform.mts runtime-render/manual/visual-instance-resource.mts runtime-render/manual/visual-instance-operations.mts runtime-render/manual/visual-instance-membership.mts runtime-render/manual/visual-scene-lifecycle.mts
```

No assertions, fixtures, mocks, tests, automatic invocation or frame submission.
Compiled only: manual/browser observations NOT_EXECUTED; FEATURE_NOT_VERIFIED /
VISUAL_NOT_VERIFIED. A demand log alone cannot prove that equal updates avoid new
invalidation if demand was already pending. Pixel proof requires an actual future
instance draw path and independent observation. Rollback removes three additive
root names, live flags and private native visibility integration; no authored or
persisted content, dependency direction or resource-public contract migration.
