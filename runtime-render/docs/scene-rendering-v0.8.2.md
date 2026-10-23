# v0.8.2 / SR03–SR04 — Visual instance identity and membership

Canonical owner: Runtime Render. This extends the SR02 logical scope with
lightweight immutable registrations only. No mesh, resource right, draw, scene
graph, sorting, transform, Editor schema or gameplay policy is added.

## Public delta / identity

Seven additive root exports; existing scene/session required members unchanged:

```ts
interface RenderVisualCorrelation {
  readonly projectId: string;
  readonly sceneId: string;
  readonly objectId: string;
}
interface RenderVisualInstanceInput {
  readonly visualInstanceId: string;
  readonly correlation?: RenderVisualCorrelation | null;
}
// Factory-issued, nominal, frozen record; private brand omitted in this sketch.
interface RenderVisualInstance {
  readonly visualInstanceId: string;
  readonly sceneId: symbol;
  readonly sessionId: symbol;
  readonly insertionOrdinal: number;
  readonly correlation: RenderVisualCorrelation | null;
}
addRenderVisualInstance(scene: RenderVisualScene, input: RenderVisualInstanceInput): RenderVisualInstance
getRenderVisualInstance(scene: RenderVisualScene, visualInstanceId: string): RenderVisualInstance | undefined
listRenderVisualInstances(scene: RenderVisualScene): readonly RenderVisualInstance[]
removeRenderVisualInstance(scene: RenderVisualScene, instance: RenderVisualInstance): boolean
```

Caller-selected strings support adapter-local names without another ID factory.
They are unique only among live entries of one scope. `sceneId`/`sessionId` in
the handle are runtime symbols; correlation.sceneId is an authored label only.
Render owns these neutral string fields, imports no Editor types and never uses
correlation for uniqueness, lookup, resource loading or gameplay identity. Same
correlation may appear many times within one scene or across independent sessions.
No resource identity field is needed before the resource-binding checkpoint.

The frozen record is both a capability and historical registration observation:
it contains no mutable live state, native object, session reference or callback.
Object identity distinguishes registrations even when their string key is reused.
The private nominal brand discourages structural creation; runtime provenance is
checked by each scene's private issued-handle WeakSet. Copy/spread/cast/serialization
cannot manufacture a usable capability. No handle is serialized into authored data.

## Operations and lifetime

| Condition / operation | Defined behavior |
| --- | --- |
| add | Canonical active scope only; exact plain own enumerable data records, no extra fields/accessors/symbol keys. IDs and correlation fields are nonempty whitespace-free strings, exact case preserved. Correlation omitted/null becomes null; explicit undefined rejects. Captures/freeze-detaches correlation before commit |
| Duplicate live ID | TypeError; no replacement or ordinal consumed |
| Ordinal | Zero-based scene-local insertion order; increases only for accepted adds, never reset by remove/clear. Safe-integer exhaustion rejects with RangeError before mutation. Ordinal is a future tie key, never sorting/depth today |
| get | Valid absent key returns undefined; invalid key TypeError. Returns the original immutable registration, no clone/upsert |
| list | New frozen array of immutable issued records, current Map insertion order. Later changes do not alter old arrays/records. No mutable collection escapes |
| remove | Exact issued handle from this scene required, including scene identity rather than just equal ID/session. Foreign/copied/fake handle TypeError. Current handle returns true; already removed/cleared same-scene handle returns false |
| ID reuse | Allowed after remove/clear; always fresh object and fresh higher ordinal. Stale handle returns false and cannot delete replacement |
| scene.clear | Clears only this scene's registration map, keeps ordinal and weak provenance. Empty clear remains no-op. No resource release needed: these records own no resources |
| scene/session terminal | Existing SR02 end sets terminal, clears membership, drops session callback, then canonical session continues native teardown. All four membership functions throw TypeError afterward; retained handle metadata and scene.getSnapshot remain readable |
| Foreign scene argument | Canonical weak dispatch rejects TypeError before invoking caller methods. A replacement scope on the same session rejects old instance handles too |

Validation reflection can execute Proxy traps; host exceptions propagate. Add
rechecks terminal state and duplicates after capture before committing, so reentrant
calls cannot reopen a disposed scope or silently replace a nested registration.
The factory's session environment remains separate from metadata collection state;
terminal clears strong membership and drops its detach callback. Issued provenance
is weak. This is source-level analysis, not measured GC/GPU leak evidence.

There is no frame invalidation for metadata registration: nothing drawable changes
in SR03/SR04. Existing renderFrame still renders its existing private backend scene;
the membership list does not imply a frame, visual readiness, pixels or GPU resources.

## Compiled consumer / optional manual observation

[visual-instance-membership.mts](../manual/visual-instance-membership.mts) consumes
only the Render package root, accepts two real browser canvas bindings and an
inspection sink, and releases actual graphics sessions through finally. It runs
nothing on import, submits no frames, uses no fake backend, fixtures or assertions.
It illustrates repeated correlation, separate live keys/ordinals, current/missing
lookup, duplicate/foreign rejection, input mutation, remove/re-add/stale handles,
clear/history and session terminal isolation. It has been **compiled only**.

```powershell
npm run build -- --force
New-Item -ItemType Directory -Force .artifacts/empty-types | Out-Null
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir runtime-render/manual --outDir .artifacts/visual-instance-membership runtime-render/manual/visual-instance-membership.mts
```

For optional Developer-owned observation, serve the trusted checkout with the
same Render/three import map as [graphics host](../manual/graphics-lifecycle.html).
Import `/.artifacts/visual-instance-membership/visual-instance-membership.mjs` and
call `observeVisualInstanceMembership({target: canvasA}, {target: canvasB}, console.log)`
with distinct real positive-size canvas nodes. Do not concurrently acquire them
in another demo. Inspect actual output and cleanup errors rather than treating
expected output as observed. Browser execution here: **NOT_EXECUTED**;
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**.

## Compatibility / limits / rollback

Root symbols: Render137 / Editor134 / Client0. Source/required signatures of Editor,
Client, Engine, Server, Phase 4/6/7 and upstream L1/L2 are unchanged. Exactly five
projects; manifests, pins, lockfile, native backend and committed assets unchanged.
Three0.186.1/types0.186.0 installed source agrees with the relevant official
[Object3D identity/order documentation](https://threejs.org/docs/pages/Object3D.html):
native IDs and renderOrder belong to native objects, not this membership key or
ordinal. No native API is added or version upgrade needed. Existing atlas evidence
remains TPSHEET_METADATA_OBSERVED / TPSHEET_VISUAL_NOT_VERIFIED, not re-executed.

Rejected: inferred IDs from resources/roles/files, global scene catalog, ID-only
destructive remove, silent duplicate replacement, ordinal recycling, mutable lists,
Editor type import, extra renderer/cache, anticipatory instance transforms/resources.
Rollback removes seven root additions, membership implementation/clear additions
and this consumer/documentation; SR02 signatures and empty semantics are retained.
No resource/persisted-data migration. v0.8.3 requires its own supplied task.
