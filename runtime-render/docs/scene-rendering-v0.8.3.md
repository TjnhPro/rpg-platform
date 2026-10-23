# v0.8.3 / SR05 — Visual instance creation and operations

Owner: Runtime Render. `addRenderVisualInstance` remains the single creation path;
`removeRenderVisualInstance` remains exact-handle removal. This checkpoint adds
current state and complete single-instance replacement, not another factory/store.
The smallest demonstrated payload is the existing optional neutral correlation
reference, now replaceable or explicitly clearable. No invented readiness flag,
transform, visibility, ordering, resource slot, native object or draw is added.

## Additive root surface

```ts
interface RenderVisualInstanceProperties {
  readonly correlation: RenderVisualCorrelation | null;
}
interface RenderVisualInstanceSnapshot extends RenderVisualInstanceProperties {
  readonly visualInstanceId: string;
  readonly sceneId: symbol;
  readonly sessionId: symbol;
  readonly insertionOrdinal: number;
}
getRenderVisualInstanceSnapshot(scene: RenderVisualScene, instance: RenderVisualInstance): RenderVisualInstanceSnapshot
updateRenderVisualInstance(scene: RenderVisualScene, instance: RenderVisualInstance, properties: RenderVisualInstanceProperties): RenderVisualInstanceSnapshot
interface RenderVisualInstanceFailure {
  readonly code: 'INVALID_DESCRIPTOR' | 'INVALID_ID' | 'DUPLICATE_ID'
    | 'FOREIGN_SCENE' | 'FOREIGN_INSTANCE' | 'MISSING_INSTANCE' | 'INSTANCE_CHANGED'
    | 'SCENE_DISPOSED' | 'SESSION_UNAVAILABLE';
}
getRenderVisualInstanceFailure(error: unknown): RenderVisualInstanceFailure | undefined
```

Six additions; rebuilt roots Render143 / Editor134 / Client0. Existing required
interfaces/signatures remain unchanged. Known admission failures remain TypeError
instances, now with safe private-brand classification. Ordinal exhaustion remains
RangeError; unknown host errors propagate and classify as undefined, never success.

The factory handle remains frozen **registration history**, including its original
correlation. `get`/`list` continue returning exactly those issued handles to preserve
identity and SR03/SR04 semantics. Use `getRenderVisualInstanceSnapshot` for current
properties. Snapshots are separate, deeply frozen detached metadata records, carry
no private capability brand and cannot be passed back as instance capabilities.
Retained snapshots do not change after update/remove/clear/session termination.
Reading fresh state after terminal/removal rejects rather than fabricating liveness.

## Operation semantics / admission

| Condition | Result |
| --- | --- |
| Create | Existing add validates exact input, captures optional correlation (omitted => null), rejects duplicate live keys and assigns one handle, snapshot and increasing ordinal |
| Replace | Exact `{correlation}` record required; explicit null clears, omission/undefined/unknown fields/accessors rejected. Correlation is the existing exact three-string data record, not arbitrary JSON or Editor state |
| Stable identity | Same issued handle, visualInstanceId, runtime sceneId/sessionId, insertionOrdinal and collection position survive update. No remove/add or ordinal increment |
| No-op | Equal null or equal three string values return the same current snapshot object. No revision, reordering, recreation, native work or frame invalidation |
| Invalid candidate | INVALID_DESCRIPTOR; no state committed by this operation, old snapshot remains valid |
| Duplicate create | DUPLICATE_ID; no replacement/ordinal consumption |
| Get missing string ID | Existing get returns undefined; invalid string lookup reports INVALID_ID |
| Read/update removed same-scene capability | MISSING_INSTANCE, even if its string ID has been reused; replacement is untouched |
| Foreign/copied/fake instance | FOREIGN_INSTANCE; validation occurs before reading instance properties |
| Foreign/fake scene | FOREIGN_SCENE before calling any scene methods or reading candidate |
| Explicit scene terminal | SCENE_DISPOSED; read/update/add/get/list/remove reject. Repeat scene dispose still preserves its SR02 outcome |
| Session-ended scene | SESSION_UNAVAILABLE via existing terminal cascade (also native failure/loss). No polling/GPU-health claim; first terminal cause wins |
| Remove | true only for exact live issued capability; repeat removed/cleared same-scene capability returns false. Releases entry/current props, does not delete any shared image/cache asset |

Admission precedence: scene provenance, terminal state, instance provenance/current
membership, candidate validation, final current-entry recheck, then commit. Thus a
terminal scene is not misclassified as a missing record and a foreign handle is
not misclassified as a bad replacement. Create validates descriptor before duplicate
check, preserving SR03/SR04 ordering. Error messages are not classifier contracts.
Graphics factory/scene acquisition errors retain existing Phase 6/7 classifiers;
the new classifier does not relabel those exceptions or native cleanup evidence.

## Capture / atomicity / cleanup

Update is synchronous **replace**, not a patch/upsert: identity fields are not part
of the payload. Capture/validate/freeze correlation, recheck live exact capability,
compare the entry's pre-capture snapshot, then assign one snapshot pointer. No ID
map insertion or list-order mutation occurs. Caller input mutation afterward cannot
affect committed state. Equal replacements retain the current object.

Plain own data records reject getters, but Proxy reflection can run host code.
Reentrant removal/re-add or termination fails final admission; a nested changed
snapshot yields INSTANCE_CHANGED and the outer operation does not overwrite it.
Host side effects/nested operations are outside this operation's atomicity promise;
they are not rolled back if input reflection throws. There are no callbacks/awaits
between final recheck and commit. No command bus, transaction framework, undo,
history manager, bulk synchronization or generic state schema is introduced.

Scene clear/end empties the same owned entry map. Current snapshots contain only
strings/symbols and frozen correlation. Weak issued-handle provenance remains safe
for stale checks; no strong removed-instance state or session/native reference is
retained there. Source retention analysis is not measured GC/GPU leak proof.
Hidden, removed and disposed remain distinct: this checkpoint implements removal,
not hidden state or per-instance disposal/native resource lifetime.

## Genuine compiled consumer / optional manual handoff

[visual-instance-operations.mts](../manual/visual-instance-operations.mts) imports
only the public root and acquires two actual host sessions when explicitly called.
It shows create/read/replace/no-op, caller mutation/history, invalid/duplicate/foreign
admission, removal/reuse/stale update, scene disposal and session-ended rejection.
It runs nothing on import, owns no fake texture/backend/receipt, asserts nothing,
submits no frame, and releases actual sessions in finally. **Compile evidence only**.

```powershell
npm run build -- --force
New-Item -ItemType Directory -Force .artifacts/empty-types | Out-Null
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --verbatimModuleSyntax --skipLibCheck false --module NodeNext --target ES2022 --lib ES2022 --typeRoots .artifacts/empty-types --rootDir runtime-render/manual --outDir .artifacts/visual-instance-operations runtime-render/manual/visual-instance-operations.mts runtime-render/manual/visual-instance-membership.mts runtime-render/manual/visual-scene-lifecycle.mts
```

Optional Developer observation: use a trusted checkout server and import map as in
[graphics host](../manual/graphics-lifecycle.html). Import
`/.artifacts/visual-instance-operations/visual-instance-operations.mjs`, call
`observeVisualInstanceOperations({target: canvasA}, {target: canvasB}, console.log)`
with two distinct real positive-size canvases without concurrent host acquisition.
Inspect actual snapshots/IDs/order and classifiers; report host/GPU cleanup failures
separately. **NOT_EXECUTED** here; **FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**.

## Compatibility / exclusions / rollback

Exactly five projects; no Editor/Client/Engine/Server source, L1/L2, manifests,
dependency direction, lockfile or backend change. Three0.186.1/types0.186.0 installed
identity/order contracts were rechecked with the official
[Object3D docs](https://threejs.org/docs/pages/Object3D.html); SR05 invokes no native
API or mapping to native IDs/order. No PNG/atlas bytes added; inherited
TPSHEET_METADATA_OBSERVED / TPSHEET_VISUAL_NOT_VERIFIED is not re-executed.

Rejected: patch/upsert, changing handle on update, moving Map entries, guessed
visual flags, arbitrary nullable property bags, resource releases without rights,
duplicate renderer/cache/math, gameplay or generic bus/history/bulk architecture.
Rollback removes six exports/new state operations/classifier, restores entry values
to SR03/SR04 handles and removes the consumer/docs. No persisted data/resource
migration. v0.8.4 scope requires its separately supplied task.
