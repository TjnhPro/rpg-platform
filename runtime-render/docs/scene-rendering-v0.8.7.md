# v0.8.7 — SR09/SR10 Visual Layers & Explicit Ordering

Runtime Render alone owns scene-local presentation layers, assignment and sorting.
Editor authored classification/layer refs remain opaque authoring data, not these
live definitions. A future adapter can map them explicitly through the public root.
No Editor type/import, global layer registry or gameplay category is introduced.

## Public delta

All names are exported only through `@rpg-platform/runtime-render`:

- `addRenderVisualLayer`, `updateRenderVisualLayer`, `getRenderVisualLayer`,
  `listRenderVisualLayers`, `removeRenderVisualLayer`.
- `setRenderVisualInstanceOrder`, `getRenderVisualInstanceOrder`,
  `listRenderVisualDrawCandidates`, `getRenderVisualLayerFailure`.
- Types `RenderVisualLayerInput`, `RenderVisualLayerSnapshot`,
  `RenderVisualInstanceOrder`, `RenderVisualDrawCandidate`, `RenderVisualLayerFailure`.
- Existing instance input gains optional `layerKey` and `order`; omitted fields
  mean built-in `default` and zero. Existing handle/registration snapshots and
  required shapes are unchanged. Ordering is read separately as current state.

Layer input has a nonempty whitespace-free string `layerKey`, safe-integer
`priority`, optional primitive-boolean `visible` (default true). Update is full
replacement by exact key, including visible defaulting true when omitted; it
preserves layer insertionOrdinal. It is not an upsert or key rename. Snapshots
are immutable historical scalars. get(valid-missing-key) returns undefined;
operations that need a definition reject a missing key. list includes hidden and
empty layers, sorted by priority then creation ordinal.

Each scope starts with `default`, priority=0, visible=true, layer ordinal=0.
It may be updated but cannot be deleted. No implicit layer creation, fallback,
or orphan assignments. Deleting an occupied custom layer rejects; reassign its
instances explicitly first. Deleting an empty layer succeeds; a later same-key
creation receives a fresh ordinal. `scene.clear()` removes instances and releases
their owned bindings/nodes but retains definitions, their flags and both monotonic
ordinal counters. Scene/session termination clears definitions too. Other scenes
can freely use identical keys. Ordinals never recycle; safe-integer exhaustion
throws RangeError before creating a definition/instance.

Instance order input is a complete `{layerKey, order}` replacement through the
exact live handle. Both priority/order allow negatives, gaps and collisions,
including safe-integer extrema; fractions, NaN, infinities, strings and unsafe
integers reject. Comparison uses relational comparisons rather than subtracting
large values. Zero is normalized. Assignment/reorder never recreates a handle,
changes ID/correlation/ordinal/transform, or touches Phase 7 rights and IO.

## Published comparator and participation

Candidates sort ascending by this tuple:

1. layer priority;
2. layer insertionOrdinal (keeps equal-priority layers grouped);
3. per-instance explicit order;
4. instance insertionOrdinal.

Layer creation order is deliberate input for equal-priority layer groups;
instance creation order is deliberate input for equal-order ties in one layer.
Neither is resource completion order. Changing correlation, binding, transform
or visibility does not change ordinals. Reassigning retains the instance's
original ordinal. No locale/key/object identity, Map iteration assumption, image
load timing, world/screen Y, asset metadata or gameplay role affects sorting.
`listRenderVisualInstances()` remains membership insertion order.

`listRenderVisualDrawCandidates()` returns a new frozen array of frozen records
containing the existing instance capability, layer key/priority/ordinal, explicit
order and instance ordinal. It filters hidden instances/layers and returns empty
while the canonical Phase 6 viewport is suspended. The candidates may lack usable
bindings, transforms or drawable geometry: this is an ordered participation view,
not a draw-ready list or a GPU/pixel receipt. Historical records never track edits.

The existing visibility snapshot now computes
`effectiveVisible = instance.visible && layer.visible && !viewportSuspended`.
Instance intent remains independent: show/transform cannot override a hidden
layer; show-layer cannot override a hidden instance. Hide/reorder/reassign does
not destroy/release/reload/unbind textures. Existing native nodes receive combined
visibility and ranks in the same private backend, never a second scene/renderer.

Layer updates/order replacements prepare the proposed complete sorting first,
write existing nodes, then commit logical state and invalidate existing frame
demand. Exact no-ops do not write/invalidate. Add-layer/delete-empty-layer and
metadata-only instance creation allocate no native node and do not invalidate.
When placing an instance, ranks are synchronized before setting its matrix so a
later first placement cannot collide with ranks after intervening membership
changes. Removal may leave native rank gaps; relative order is preserved until
the next full synchronization. Hidden entries retain a rank. No scheduling,
renderFrame submission, camera mutation or ordinal recycling occurs.

Private `Object3D.renderOrder` receives ordinal ranks, not raw signed priorities.
The [official Object3D API](https://threejs.org/docs/pages/Object3D.html) and
installed Three 0.186.1 document independent opaque/transparent sorting; this
checkpoint makes no cross-pass alpha/depth guarantee. Current Object3D nodes
are non-drawable. A future sprite/draw integration must consume these candidates
and apply ranks to actual renderable objects; child meshes do not automatically
inherit an ordinary Object3D parent's renderOrder. **DRAW_NOT_IMPLEMENTED**.
The standalone Phase 7 diagnostic quad remains unrelated to instance layers.

## Failure and lifetime rules

`getRenderVisualLayerFailure` recognizes only package-branded failures. Unknown
host exceptions remain unknown. New codes: INVALID_LAYER (key/record/visibility),
INVALID_PRIORITY, INVALID_ORDER, DUPLICATE_LAYER, MISSING_LAYER, LAYER_IN_USE,
RESERVED_LAYER, ORDERING_CHANGED (reentrant input changed scene ordering state).
Layer/order descriptors are captured from plain enumerable own data properties;
extra fields/accessors reject. Untrusted Proxy reflection can have independent
side effects: outer operation never rolls them back or overwrites newer state.
Admission errors occur before native writes and preserve prior accepted state.

Existing scene/instance failures still diagnose copied/foreign/missing/terminal
handles; transform reentrant conflicts retain INSTANCE_CHANGED. Existing
FRAME_IN_PROGRESS rejects native ordering/visibility writes before logical commit.
Native failure/context loss terminates through the canonical session cleanup,
rather than claiming a successful edit. No rollback to released resource rights,
GPU health/leak-free claim or revival of unavailable bindings is implied.

Rejected alternatives: implicit missing-layer fallback, in-use delete/reparent,
global named-layer tables, render order by Map/load/update timing, Y/depth policy,
Editor-owned comparator/native state and texture recreation on reorder/hide.
Rollback removes these additive names/optional input fields and private rank
integration; no persisted/authored data or resource-public contract migration.

## Optional manual consumer and limits

`manual/visual-instance-ordering.mts` takes a real canonical unoccupied graphics
session, real Phase 4 placement and optionally a genuine Phase 7 binding. It logs
different/equal priorities, order ties/reorder/reassignment, identity/resource
observations, hidden-layer transform/show, typed rejection and clear/delete/
terminal cases. It disposes its own scene only. No assertions, mocks, fixtures,
test runner, auto-execution or frame submission. Compile from the workspace root:

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir runtime-render/manual --outDir .artifacts/visual-instance-ordering runtime-render/manual/visual-instance-ordering.mts runtime-render/manual/visual-instance-visibility.mts runtime-render/manual/visual-instance-transform.mts runtime-render/manual/visual-instance-resource.mts runtime-render/manual/visual-instance-operations.mts runtime-render/manual/visual-instance-membership.mts runtime-render/manual/visual-scene-lifecycle.mts
```

Compiled only, **NOT_EXECUTED**. All four observable acceptance items remain
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**, not behavioral PASS. No draw,
alpha/depth correctness, native rank inspection, browser resource lifetime or
GPU leak-free observation. No new assets or TPSheet parsing claim;
TPSHEET_VISUAL_NOT_VERIFIED remains inherited. No new tests or framework.
