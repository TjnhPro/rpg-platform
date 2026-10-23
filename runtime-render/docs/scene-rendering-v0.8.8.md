# v0.8.8 — SR11/SR12/SR13 Depth Sorting & Stable Ordering

Runtime Render owns presentation ordering in the existing visual scope. No
gameplay targeting, collision, world authority, authored schema, camera heuristic,
second backend or new material/draw pipeline is introduced.

## Additive public contract

Eight new root exports; existing required input/snapshot/failure shapes unchanged:

- `setRenderVisualLayerOrderingPolicy(scene, layerKey, policy)` and
  `getRenderVisualLayerOrderingPolicy(scene, layerKey)` return a detached frozen
  `RenderVisualLayerOrderingPolicy`. Both require an existing active layer.
- `setRenderVisualInstanceDepthKey(scene, instance, key | null)` and
  `getRenderVisualInstanceDepthKey(scene, instance)` return a frozen
  `RenderVisualDepthKey | null`, through the exact issued live handle.
- `getRenderVisualDepthFailure(error)` and `RenderVisualDepthFailure` recognize
  only package-branded depth errors; unknown host errors remain unknown.

Policy union:

```ts
type RenderVisualLayerOrderingPolicy =
  | { readonly kind: 'explicit-order' }
  | { readonly kind: 'depth-key'; readonly unit: string; readonly front: 'higher' | 'lower' }
  | { readonly kind: 'ground-y'; readonly plane: ProjectionPlane2D; readonly front: 'up' | 'down' };
interface RenderVisualDepthKey { readonly value: number; readonly unit: string }
```

All layers start explicit-order, including default. Policies are intentionally
separate from v0.8.7 layer definitions: priority/visibility updates retain the
selected policy and old callers cannot silently reset it. clear retains layer
definitions/policies and monotonic counters. Empty layer deletion discards its
policy; recreation defaults explicit. Terminal cleanup clears policies/cache.
Get policy for missing layer throws the existing MISSING_LAYER; no implicit
definition, fallback, global registry or native handle escapes.

Changing policy validates **every** member, including hidden ones, before native
write/commit. Required depth context is strict. To prepare a member, create in an
explicit layer, set its valid transform/key, then assign to the opted-in layer.
Direct creation in a ground-y/depth-key layer rejects because creation supplies
neither transform nor depth key. Alternatively populate an explicit layer, then
opt in atomically after preparation. No partially sorted/unready members.
To unset required transform/key, reassign to an explicit layer or switch policy
first. Removal/clear/disposal still work without first changing policies.

## Total comparator, planes and conventions

Ascending painter tuple, drawing front last:

1. layer priority;
2. layer creation ordinal for equal-priority layer groups (v0.8.7 unchanged);
3. normalized policy depth (zero for explicit-order);
4. per-instance explicit order;
5. immutable instance registration ordinal.

Ordinals are unique in a scope; no additional ID/locale/load/update-order tie.
Depth is never compared across different layer groups, even when priorities tie.
Explicit-order therefore exactly retains the previous comparator. Finite negative
depths, nonintegers, gaps and extremes are accepted; comparisons are relational,
not subtraction that could overflow. No epsilon/unstable tolerance or sort from
async load completion. Equal depths always use explicit order then original
ordinal; movement never changes identity/resource/correlation/ordinal.

Depth-key requires a finite numeric value and exact nonblank unit. `front=higher`
uses value as depth; `front=lower` negates it. No unit conversion. A stored key is
ignored by explicit-order/ground-y; it can be prepared before policy activation.
null clears an unused key, but rejects while depth-key requires it. Equal writes
are no-ops. Key units mismatching an active policy reject without overwriting.

Ground-y explicitly designates a source scene/world **ground plane** by project,
coordinateSpaceId, unit and x/y axes. The caller owns that declaration; labels
are not a registry or proof of real-world semantics. Phase 4's canonical projection
factory captures valid plane conventions. Existing transform admission validates
placement/orientation/projection. Exact plane/axes/unit mismatch rejects; there is
no inferred isometric conversion, CSS/screen Y, image top-left or pixel-height
compensation. The numeric key comes from the already computed Phase 4
`transform.attachment.y = localToScene(anchor).y`, before projection, including
explicit local translation/offset/pivot rotation/scale. The anchor must represent
ground contact as declared by the host, rather than assuming any sprite pivot.

| Ground axes Y | Front direction | Normalized key | Later/front |
| --- | --- | --- | --- |
| down | down | attachment.y | larger Y |
| up | down | -attachment.y | smaller Y |
| up | up | attachment.y | larger Y |
| down | up | -attachment.y | smaller Y |

X may be right or left but must match exactly; it does not affect Y depth.
Unsupported orientation strings/conventions reject. Non-ground planes, sloped
height, arbitrary 3D or camera-projected depths are unsupported rather than guessed.

## State, recalculation and failure ownership

The accepted-order cache is scene-local, keyed by a revision token and immediately
dropped on membership, layer definition/policy, order, depth-key, transform or
visibility edits. Resource load/completion/bind, correlation, frame submission and
viewport sampling do not change depth. Suspension filters participation through
Phase 6 on each candidate read without persisting a false flag.

Cache rebuild decorates once in O(n), sorts O(n log n), maps in O(n), O(n) storage.
Depth/context validation never runs inside the comparator. Repeated unchanged
candidate reads reuse sort order and construct fresh filtered immutable candidate
records in O(n); no per-frame graph traversal or O(n²) all-pairs ordering. Changed
native ordering operations prepare one proposed sorted view before commit. Current
implementation invalidates conservatively on all transform/visibility edits,
including ones that leave relative order unchanged; no performance/FPS benchmark
or incremental tree/index claim. Each individual changed edit can cost O(n log n).

Policy/key replacements, reassignment and **proposed new transform** participate
in sorting before native rank writes. This avoids a one-edit-late movement order.
The same existing private backend consumes visibility/rank batches, and the same
node receives its matrix. Native rank gaps after removal remain harmless until
the next sync. Native failure/context loss closes the canonical session; no
successful state publication or fallback to invalid resources. FRAME_IN_PROGRESS
rejects before state commit through existing frame admission. No new scheduler,
renderFrame call, cache usage/release, texture IO or GPU ownership operation.

New failure codes: INVALID_POLICY, INVALID_DEPTH_KEY, DEPTH_KEY_REQUIRED,
DEPTH_UNIT_MISMATCH, GROUND_CONTEXT_REQUIRED, GROUND_PLANE_MISMATCH. Descriptors
are strict plain own enumerable data records, captured/frozen before mutation;
getters/extra fields reject. Existing layer/instance provenance and terminal
failures remain unchanged. Reflected reentrant ordering changes reject via
ORDERING_CHANGED; transform retains INSTANCE_CHANGED. Independent host side
effects are not rolled back. Admission failure retains previous accepted state;
native failure instead follows existing terminal cleanup. Cache unlinking on
remove/clear/end prevents removed entries retaining their owned resource rights.

## Selected basic 2D alpha path and actual implementation limit

Audited pinned Three0.186.1/types0.186.0, installed WebGLRenderLists comparator/
bucket selection and Material defaults, plus official
[Object3D](https://threejs.org/docs/pages/Object3D.html) and
[Material](https://threejs.org/docs/pages/Material.html) documentation.
Three separates opaque/transmissive/transparent lists; renderOrder takes priority
over its z sort **inside one list**, after group order. Material defaults do not
automatically provide a painter-only sprite pipeline.

Chosen future MVP draw profile: flat 2D sprite quads in the **same transparent
list/group**, ascending unique candidate ranks applied to actual renderables,
`transparent=true`, `NormalBlending`, opacity1, `premultipliedAlpha=false` for
straight-alpha inputs, `depthTest=false`, `depthWrite=false`, alphaTest0. One
front-facing quad/pass per sprite; no double-sided dual pass. Source-over RGB is
Cs*As + Cd*(1-As), alpha As + Ad*(1-As), evaluated in the rendering pipeline's
color domain with explicit texture color handling. Validate source association
and color management when integrating the actual materials. This is a selected
integration decision, **not an installed material or observed pixel result**.

Current visual nodes remain ordinary non-drawable Object3D; Phase 7 resources
are not mapped to sprite materials. Do not allocate dummy materials or complete
the later draw milestone here. **DRAW_NOT_IMPLEMENTED / ALPHA_NOT_VERIFIED**.
Existing standalone Phase7 raw-GL quad uses source-over/depth-disabled drawing,
but it is not a three-instance overlap/comparator/material demonstration.

Unsupported: intersecting semi-transparent 3D surfaces, per-triangle ordering,
order-independent transparency, arbitrary cyclic occlusion, mixed render groups/
opaque/transmission passes, depth-writing occluders overriding painter intent,
custom postprocessing/blending and general 3D correctness. Ordinary parent
Object3D.renderOrder is not inherited by future child meshes. Layer priority is
a candidate/same-pass rank guarantee; it cannot reorder unrelated native passes.
No transparent-sprite visual acceptance before real drawable overlap observation.

## Optional compiled consumer and rollback

`manual/visual-instance-depth.mts` requires a real canonical unoccupied graphics
session; optional binding must be a genuine usable Phase7 resource. It constructs
explicit neutral Phase4 sample placement data and logs three-object ground Y
movement, repeated equal-depth candidates, explicit-order ties, both axes,
layer dominance, explicit key failures, retained identity/resource and context
rejections. No fake session/lease, assertions, test runner or auto-invocation/frame
submission. Browser/manual observation is **NOT_EXECUTED**. Compile from root:

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir runtime-render/manual --outDir .artifacts/visual-instance-depth runtime-render/manual/visual-instance-depth.mts runtime-render/manual/visual-instance-ordering.mts runtime-render/manual/visual-instance-visibility.mts runtime-render/manual/visual-instance-transform.mts runtime-render/manual/visual-instance-resource.mts runtime-render/manual/visual-instance-operations.mts runtime-render/manual/visual-instance-membership.mts runtime-render/manual/visual-scene-lifecycle.mts
```

No new tests/dependencies/assets; TPSHEET_VISUAL_NOT_VERIFIED remains inherited.
All behavioral acceptance remains FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED.
Rollback removes eight additive root names, private policy/key/cache state and
depth comparator extension; old explicit-only API/state remains. No persisted
schema, external L1/L2, Engine, Editor or Client contract migration.
