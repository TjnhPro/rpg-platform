# v0.8.5 — SR07 Instance Transform & Alignment

Runtime Render owns current live presentation transforms and private backend
nodes. Authored Scene/Document data remain Editor-owned; Engine/gameplay state,
resource loading, viewport lifecycle and host scheduling keep their existing owners.

## Public delta

Four additive root names: `setRenderVisualInstanceTransform`,
`getRenderVisualInstanceTransform`, `RenderVisualInstanceTransformInput`,
`RenderVisualInstanceTransformSnapshot`. Existing instance/resource/session
signatures and required snapshots are unchanged. A new instance has null transform.

```ts
setRenderVisualInstanceTransform(scene, instance, {
  placement, // Phase 4 PlaneProjectionPoint2D, explicit project/space/unit/axes
  local, // Phase 4 PlanarTransform2D, same source units and axes
  anchor, // Phase 4 VisualAnchor2D, numeric local coordinates, exact source unit
  orientation, // Phase 4 neutral facing, exact source axes
  projection, // Phase 4 OrthographicPlaneProjection, explicitly selected below
});
getRenderVisualInstanceTransform(scene, instance); // detached last accepted snapshot
setRenderVisualInstanceTransform(scene, instance, null); // remove transform/node only
```

Snapshots contain the detached input plus unrotated `alignment`, `localToScene`,
`localToClip`, actual transformed `attachment` and `projectedAttachment`. They are
frozen historical CPU descriptions, not GPU liveness, pixel visibility or gameplay
authority. Handle/ID/ordinal/correlation and instance-owned resource rights remain
unchanged by transform updates or null. Geometry/materials are not inferred.

## Explicit composition and fixed MVP projection

All arithmetic uses existing Phase 4 factories, resolveVisualAlignment2D,
composePlanarTransforms2D, applyPlanarPoint2D and projectPlanePoint2D. A private
ordered projection-step helper is shared by point mapping and instance composition;
no duplicated axis/unit projection formula or TRS decomposition is introduced.
Public point projection retains its previous two-step arithmetic order.

With column points and the existing TRS convention:

`localToScene = T(alignment.pivot) * localTRS * T(-anchor.pivot)`.

Phase 4 alignment gives `origin = placement + localOffset - anchor` and
`alignment.pivot = origin + pivot`. Local translation is in source-plane axes,
after scale/rotation; localOffset stays in source axes and is not rotated. At
identity local TRS, the local anchor lands at placement + localOffset. Set pivot
equal to the ground anchor and local translation zero to keep that contact fixed
under rotation/scale. Changing image dimensions alone does not move placement:
there is no center/bounds inference. When changing ground anchor to match new
geometry, update pivot with it to preserve that invariant. An intentionally
different pivot rotates/scales the attachment around that pivot; the returned
attachment exposes the actual result. Binary64 rounding is not exact arithmetic.

Forward projection composes the canonical source-origin translation and signed
unit ratio/destination-origin mapping after localToScene. Source plane must match
placement exactly: project, coordinateSpaceId, unit and both axes. Destination is
explicitly restricted to **same project / render-clip-2d / clip-unit / right,up**.
The current backend uses its existing identity Camera and z=0; -1..1 represents
clip extent, outside points are allowed and can be clipped. Ratios/origins must be
supplied, never guessed from CSS, DPR, texture pixels or viewport dimensions.

For a manual ground-contact example, a caller may select right/up scene-unit
space, ground anchor=pivot=(0,-1), localOffset=(0,0), and placements (-2,0)/(2,0).
Explicit clip ratios (0.25,0.25), both origins (0,0), map the two contact points
to (-0.5,0)/(0.5,0). Update only the first local rotation/scale, then replace its
anchor and pivot together (e.g. (0,-2)); its contact remains the same in real
arithmetic. These are optional authored example values, not executed assertions.
Numeric local geometry must eventually use these units; this checkpoint does not
automatically interpret texture dimensions or implement a sprite quad.

No inverse is needed by this forward-only operation. Finite zero/negative scale
retains Phase 4 collapse/reflection semantics. No inverse-based picking or
noninvertibility acceptance is claimed. No hierarchy, perspective, 3D, camera
controller, depth rule, orientation-driven rotation/frame or animation selection.

## Native path, admission and cleanup

Canonical session -> existing private Three backend -> one private Object3D per
transformed live instance in the same THREE.Scene. No extra renderer/canvas,
resource allocation/cache or public native object. The affine coefficients fill
Matrix4 rows [a,c,0,tx], [b,d,0,ty], [0,0,1,0], [0,0,0,1], with matrixAutoUpdate
false and explicit world-matrix update. No .position shortcut or lossy TRS
decomposition. Current nodes are non-drawable: accepted matrices do not yet move
visible sprites. Existing frame clear/resource diagnostic drawing is unchanged.

Capture the entire candidate, validate/freeze nested Phase 4 data and finite
composition, recheck exact live handle/current transform/correlation/binding,
write native matrix, then publish accepted transform. Admission errors preserve
the prior transform/node and resource. Invalid/extra dimensions and incompatible
unit/axes/mapping throw TypeError; nonfinite arithmetic throws RangeError;
unknown host exceptions propagate. Changed/reentrant targets use existing
INSTANCE_CHANGED/removed/terminal admission diagnostics. Native failure or real
context loss follows the canonical terminal graphics cleanup; no rollback to a
dead backend and no successful snapshot is published.

Non-null mutation while a frame is in progress rejects with existing
FRAME_IN_PROGRESS, before native mutation. Null/removal cleanup is allowed to
unlink non-drawable nodes even in reentrant teardown. Successful native writes
mark existing frame demand; they never schedule or submit. A null/null no-op
does not allocate a node or mark demand. Suspension still allows state updates;
the existing viewport rules govern subsequent frame submission.

Unset removes only the node/transform, preserving resource usage/membership.
Remove/clear/dispose/session-end unlink nodes and drain existing owned resource
rights. Resource cleanup is attempted even if node removal fails; all drained
entries are attempted, and cleanup exceptions propagate. On session termination
the backend is already unlinked: scene cleanup relinquishes CPU state, then the
canonical backend disposes/clears native nodes. No alternate terminal lifecycle,
automatic recovery or leak-free/GPU completion claim.

Three 0.186.1 / types 0.186.0 unchanged. Official
[Object3D](https://threejs.org/docs/pages/Object3D.html) and
[Matrix4](https://threejs.org/docs/pages/Matrix4.html) documentation consulted for
manual matrix updates and row-ordered set arguments. No native type in root
contracts. Phase 9 must explicitly supersede this fixed projection if necessary;
this checkpoint does not choose a future camera architecture.

## Optional manual handoff — compiled only

`manual/visual-instance-transform.mts` takes a real canonical unoccupied session,
two distinct placement inputs, a replacement for the first and optionally a real
GPU-ready Phase 7 binding from that session. It logs historical/current transforms,
authored inputs, unchanged second/resource observations, rejected nonfinite/unit/
3D/unsupported mapping updates and unset, then disposes only its own scene.
Use ground anchor=pivot as described above to inspect contact invariance. Caller
retains the session and input lease. No fake resources, assertions, automatic run,
frame submission, test suite or generated test artifacts.

Strict package-root ES2022 consumer compile, without ambient DOM/native types:

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir runtime-render/manual --outDir .artifacts/visual-instance-transform runtime-render/manual/visual-instance-transform.mts runtime-render/manual/visual-instance-resource.mts runtime-render/manual/visual-instance-operations.mts runtime-render/manual/visual-instance-membership.mts runtime-render/manual/visual-scene-lifecycle.mts
```

Run only in an actual authorized host. This checkpoint's manual execution and
browser observations are NOT_EXECUTED: FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED.
Rollback removes the four additive root names, transform state/private dispatch
and native nodes; no persisted data, authored schema or resource API migration.
