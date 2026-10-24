# CM02/CM03/CM04 — portable camera identity, state and lifecycle

`runtime-render` owns the real CPU camera API. The [manual consumer](../manual/camera-lifecycle.md)
uses only `@rpg-platform/runtime-render`, without DOM, GPU, Editor or Engine.
This checkpoint implements state, not projection or graphics binding.

## Public contract

Five additive root names: `createRenderCamera`, `RenderCamera`,
`RenderCameraInput`, `RenderCameraUpdate`, `RenderCameraSnapshot`.
Existing Render186 / Editor138 / Client0 declarations are unchanged; Render now191.
Closed diagnostics unions and dependencies are unchanged.

- Create accepts exactly `{ kind: 'orthographic', source, center }`. Source uses
  the canonical Phase4 `ProjectionPlane2D`; center uses finite `PlanarPoint2D`.
  Internal canonical capture is reused, without another plane validator or math.
- Each creation issues a unique non-global symbol. Identity lasts for this handle,
  including its terminal observations; it is not an authored, gameplay, session or
  persistent identifier. JSON omits symbols; serialization cannot recreate a handle.
  A snapshot/ID is observation, not mutation authority.
- Read returns a detached, deeply frozen snapshot. Initial center/source are copied;
  input mutation cannot change them. Handle methods are frozen closure capabilities,
  not routed through caller `this`, ID lookup or a global current camera.
- Update accepts exactly `{ center }`; kind and exact project/space/unit/axes remain
  fixed for the identity. Accepted changed center increments revision from0 to1 etc.
  Exact component equality (`===`, including +0/-0) returns the identical snapshot
  with unchanged revision. Revision exhaustion rejects RangeError before commit.
- Dispose creates terminal state once, preserving ID/config/revision. Repeat disposal
  returns the same terminal snapshot. Historical snapshots stay readable, never live
  mutable views. Update on a disposed handle throws TypeError before inspecting input.

Snapshot `binding: 'unbound'` and `application: 'not-applied'` explicitly describe CPU
commit, never GPU application, frame submission or visible output. No meaningless
dimensions, zoom, matrices, follow, pan or future config bag is accepted. Create and
update require exact plain enumerable own data fields at their outer record; extra
fields/accessors reject. Phase4 owns nested capture rules. Malformed records,
nonfinite values, unsupported kind and illegal state reject TypeError. Unknown host
exceptions propagate unchanged. No failure is caught as success or mapped into an
existing closed diagnostics union.

All capture happens before committing. After host proxy/accessor evaluation, update
checks current liveness again and uses the current snapshot. Reentrant disposal
cannot be overwritten by a previously captured active snapshot. Nested updates,
if any, complete before the outer commit; no asynchronous work/queue is introduced.
No native resource exists to detach or release at this milestone.

## Binding seam — DESIGN ONLY

The task explicitly permits pure state without graphics binding. Therefore this API
has no session parameter, attach operation or claim to enforce session occupancy.
One active camera per live session remains the MVP binding constraint, not a current
capability. Multiple independent unbound cameras are intentional.

A later opt-in binding must be issued by the canonical Phase6 session, admit only a
genuine active owner capability, reserve one active camera slot per session and reject
cross-session operations. Session loss/dispose must revoke that binding before any
host/backend evaluation; historical pure snapshots cannot resurrect the binding.
Whether a detached pure camera can later bind again needs its own task contract.
No host-created fake renderer/session may satisfy this seam.

Keep binding/applied observations separate from this pure snapshot; widening its
literal `unbound`/`not-applied` fields would change an existing public contract.
Future parameters/configuration need additive APIs with explicit admission rules;
do not reinterpret source labels, center, revisions or Phase4/6 semantics silently.
Phase8's current per-instance localToClip/fixed-camera path remains unchanged;
future camera projection must avoid applying that mapping twice.

## Scope and evidence limits

No live Scene, authored placement, gameplay position, resource lease, accepted viewport
or GPU state is read or changed. Unknown-but-well-formed plane labels are explicit
context, not a registry query. Wrong shape/empty labels/invalid axes reject; authored
existence cannot be proven without an actual future consumer contract. Dimensions,
zoom and expired resources are outside this API; unexpected fields reject instead of
being ignored. No projection/inverse accuracy or 2.5D mapping is claimed.

CPU observations are recorded in the [checkpoint](../../harness/checkpoints/camera-v0.9.1.md).
Session isolation/occupancy, frame invalidation, GPU application and pixels remain
NOT_OBSERVED. Integrated feature and visual acceptance stay FEATURE_NOT_VERIFIED /
VISUAL_NOT_VERIFIED. The manual consumer is not an automated test suite.
