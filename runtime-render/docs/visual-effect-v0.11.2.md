# v0.11.2 — Effect Instance Lifecycle (VE03)

Canonical owner: runtime-render. This checkpoint creates logical effect instances
inside the existing Phase8 Visual Scene. It does not draw, advance playback,
attach to targets, expire effects or load resources.

## Public root additions

Types: `VisualEffectInstance`, `VisualEffectInstanceInput`,
`VisualEffectInstanceSnapshot`, `VisualEffectInstanceFailure`.

Functions: `createVisualEffectInstance`, `getVisualEffectInstanceSnapshot`,
`listVisualEffectInstances`, `getVisualEffectInstance`,
`removeVisualEffectInstance`, `getVisualEffectInstanceFailure`.

```ts
import {
  createVisualEffectInstance, getVisualEffectInstanceSnapshot,
  listVisualEffectInstances, getVisualEffectInstance, removeVisualEffectInstance,
  type RenderFrameSession, type RenderVisualScene, type VisualEffectDefinition,
} from '@rpg-platform/runtime-render';

export function inspectLifecycle(session: RenderFrameSession,
  scene: RenderVisualScene, definition: VisualEffectDefinition) {
  const a = createVisualEffectInstance(session, scene,
    { definition, visualInstanceId: 'preview-a' });
  const b = createVisualEffectInstance(session, scene,
    { definition, visualInstanceId: 'preview-b' });
  const before = getVisualEffectInstanceSnapshot(a);
  const sameHandle = getVisualEffectInstance(scene, a.id) === a;
  const live = listVisualEffectInstances(scene); // frozen array, two handles
  const removed = removeVisualEffectInstance(scene, a); // true
  const repeated = removeVisualEffectInstance(scene, a); // false
  return { before, sameHandle, live, removed, repeated,
    after: getVisualEffectInstanceSnapshot(a), // removed
    other: getVisualEffectInstanceSnapshot(b) }; // still created
}
```

The host creates its canonical session/scene via Phase6/8 and captures the
definition via VE02 first. No Editor dependency. Separate Editor/Client sessions
use the same Render implementation, with independent effect identities.

## Admission and identity

Input is a closed plain record containing an issued VE02 `definition` and an
explicit `visualInstanceId` string. Enumerable data properties only; no accessors
or extra fields. The scene must be issued, active and editable; the session must
be canonical, usable and exactly the scene's session. The key is nonempty,
at most 512 characters, without whitespace/control characters, and not already
used by any Phase8 visual membership in that scene. All these validations precede
allocation of the owned playback. Phase8 admission rechecks its own live scope.

The opaque issued handle has a fresh symbol `id`. It differs from the authored
effectId, gameplay identity, authored objectId and the string visual membership
key. Exact handle provenance and exact owning scene matter, including for repeat
remove. Copying/serializing a handle does not transfer capability. Definitions
must be issued; portable JSON data must be explicitly recaptured through VE02.
The snapshot's projectId comes from the definition; Phase8 scenes themselves do
not establish an authored project identity, so no inferred project match exists.

## Lifecycle and cleanup

| Operation | Outcome |
| --- | --- |
| Successful create | `created`, reason null; one empty Phase8 membership, one stopped canonical Phase10 single-sequence playback |
| Explicit remove | `removed`, reason `removed`, returns true |
| Repeat remove in exact owning scene | false; no second cleanup, including after scene/session disposal |
| Direct Phase8 removal or scene.clear() | `removed`, reason `membership-ended`; clear leaves scene usable |
| scene.dispose() | `removed`, reason `scene-disposed`; terminal scene rejects admission/list/lookup |
| Session disposal/context loss | `removed`, reason `session-ended`; canonical Phase6/8 terminal lifecycle applies |
| Snapshot read after removal | Frozen historical data; no live scene, playback or resource exposed |
| Re-add same visual key | Fresh effect/visual identities; old handle stays terminal |

There are no playback commands in VE03. Terminal effects cannot be reused as
admission input. Live lookup returns only current membership; removed IDs return
undefined in an active scene. Snapshot reads validate active membership through
the owner-local Phase8 seam. A list is a frozen point-in-time array of handles,
not a promise that its handles will remain live.

The ownership chain is effect orchestration → Phase10 owned playback and Phase8
owned membership → Phase8 retained Phase7 resource usage when eventually bound.
VE03 owns and disposes its playback exactly once and removes its metadata entry.
The Phase8 end subscription also catches removal/clear/dispose initiated outside
VFX. It unsubscribes and disposes playback without recursively removing membership
already being released. Phase8 remains responsible for its resource cleanup;
VFX never releases a borrowed lease, scene or session. No binding/lease/texture
is acquired by this checkpoint and no frame is submitted.

There is no VFX scene registry: live enumeration traverses Phase8 membership;
WeakMaps only establish issued-handle provenance and visual-to-effect correlation.
Terminal records retain detached symbols/strings/flags and a weak owner reference,
not the live scene/definition/playback. Terminal state is published before cleanup.
Creation rollback attempts both playback disposal and membership removal; an
installed subscription is unlinked too. Cleanup attempts continue after failure.
`cleanupFailed` is sticky logical uncertainty, not a native memory receipt.

This checkpoint starts no async work or source load and exposes no late-result
commit path. An existing removed handle cannot recreate membership. A future
resource-binding capability must retain these terminal guards; VE03 does not
claim verification of a future load race.

## Failures and compatibility

`getVisualEffectInstanceFailure(error)` recognizes owner-issued errors and returns
a frozen `{ code, cleanupFailed }`, otherwise undefined. Codes cover invalid
structure/definition/ID, duplicate ID, foreign scene/session/instance, session
context mismatch, disposed scene, unavailable session and cleanup failure.
Canonical Phase8 edit failures or unexpected host/native errors can propagate
without VFX rebranding. Explicit remove with uncertain cleanup throws
`CLEANUP_FAILED` after terminal publication; retry does not repeat cleanup.
Scene-owned native cleanup uncertainty remains in Phase8 diagnostics.

Additive delta: Render292 → 302 root names, with no changed/removed previous root
declarations. VE02 gains only an owner-local issuance guard; the public definition
contract and Phase10 eight-way/neutral contracts are unchanged. No Phase6/7/8
public seam was changed. No Runtime Engine, L1/L2, authored schema, package pin,
dependency, renderer, clock or project added.

See [checkpoint evidence](../../harness/checkpoints/visual-effect-v0.11.2.md).
Logical lifecycle was manually observed in real browser sessions. VFX output is
**VISUAL_NOT_VERIFIED / NOT_DRAWN**, and full VFX behavior is FEATURE_NOT_VERIFIED.
