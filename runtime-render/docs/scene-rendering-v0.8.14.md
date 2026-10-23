# Phase 8 Scene Rendering integration and closure audit — v0.8.14 / SR21

**READY_FOR_DEVELOPER_REVIEW**, not ACCEPTED or visually verified.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED**.
Closure adds documentation only; no production feature, public API or runtime run.

Baseline: Phase7 merge `ffb347140fbe6bf432bb8fe33c7057bed9a93941`.
Implementation endpoint: v0.8.13 `ad17feb2aa2902862cd36dd8b03ca6a25a8be9dd`.
[PR #8](https://github.com/TjnhPro/rpg-platform/pull/8), branch
`feat/scene-rendering-v0.8`. See the [15-version/commit/file inventory](phase-inventory-v0.8.14.md),
[emitted public declaration delta](public-api-delta-v0.8.14.md),
[closure gates](../../harness/checkpoints/scene-rendering-v0.8.14.md) and
[exact manual MVP procedure](../manual/scene-mvp.md).

## SR01–SR21 traceability

IMPLEMENTED means source exists and compiles, not runtime acceptance. DESIGN_ONLY
means a documented decision, not executable behavior. NOT_VERIFIED is a separate
acceptance dimension even where implementation exists. Feature allocation follows
the actual supplied checkpoint tasks. Each checkpoint links its exact commit in
the inventory above; source links below refer to the implementation endpoint.
No feature is declared VERIFIED from compilation. SR21 validates the audit packet,
not the seven-instance manual MVP. No mandatory dependency blocker was found by
this source/build audit; remaining observation requirements are explicit below.

| ID | Scope and implementation status | Source/public consumer evidence | Checkpoint | Runtime/visual acceptance |
| --- | --- | --- | --- | --- |
| SR01 | DESIGN_ONLY: architecture and identity/lifetime decisions | [Architecture](scene-rendering-v0.8.0.md), now realized by the implementations below | [0.8.0](../../harness/checkpoints/scene-rendering-v0.8.0.md) | Design audit only |
| SR02 | IMPLEMENTED: one live visual scope per session | [createRenderVisualScene](../src/visual-scene.ts), [root consumer](../manual/visual-scene-lifecycle.mts) | [0.8.1](../../harness/checkpoints/scene-rendering-v0.8.1.md) | NOT_VERIFIED |
| SR03 | IMPLEMENTED: opaque visual identity | [issued handle/ordinal](../src/visual-scene.ts), [consumer](../manual/visual-instance-membership.mts) | [0.8.2](../../harness/checkpoints/scene-rendering-v0.8.2.md) | NOT_VERIFIED |
| SR04 | IMPLEMENTED: scope-local membership/clear | [membership dispatch](../src/visual-scene.ts), same consumer | [0.8.2](../../harness/checkpoints/scene-rendering-v0.8.2.md) | NOT_VERIFIED |
| SR05 | IMPLEMENTED: create/read/update/remove | [exact live capability operations](../src/visual-scene.ts), [consumer](../manual/visual-instance-operations.mts) | [0.8.3](../../harness/checkpoints/scene-rendering-v0.8.3.md) | NOT_VERIFIED |
| SR06 | IMPLEMENTED: resource/frame binding | [prepareBinding/ownBinding](../src/visual-scene.ts), [retention](../src/visual-resource-cache.ts), [consumer](../manual/visual-instance-resource.mts) | [0.8.4](../../harness/checkpoints/scene-rendering-v0.8.4.md) | NOT_VERIFIED |
| SR07 | IMPLEMENTED: explicit transform/anchor | [Phase4 composition](../src/visual-instance-transform.ts), [consumer](../manual/visual-instance-transform.mts) | [0.8.5](../../harness/checkpoints/scene-rendering-v0.8.5.md) | NOT_VERIFIED |
| SR08 | IMPLEMENTED: visibility intent and suspension observation | [visibility](../src/visual-scene.ts), [consumer](../manual/visual-instance-visibility.mts) | [0.8.6](../../harness/checkpoints/scene-rendering-v0.8.6.md) | NOT_VERIFIED |
| SR09 | IMPLEMENTED: scene-local layers | [layer operations](../src/visual-scene.ts), [consumer](../manual/visual-instance-ordering.mts) | [0.8.7](../../harness/checkpoints/scene-rendering-v0.8.7.md) | NOT_VERIFIED |
| SR10 | IMPLEMENTED: explicit within-layer order | [ordered/syncOrdering](../src/visual-scene.ts), same consumer | [0.8.7](../../harness/checkpoints/scene-rendering-v0.8.7.md) | NOT_VERIFIED |
| SR11 | IMPLEMENTED: explicit finite depth policy | [depth-key admission](../src/visual-depth.ts), [consumer](../manual/visual-instance-depth.mts) | [0.8.8](../../harness/checkpoints/scene-rendering-v0.8.8.md) | NOT_VERIFIED |
| SR12 | IMPLEMENTED: declared planar ground-Y policy | [attachment-based depth](../src/visual-depth.ts), same consumer | [0.8.8](../../harness/checkpoints/scene-rendering-v0.8.8.md) | NOT_VERIFIED |
| SR13 | IMPLEMENTED: stable ties/cached ordering; bounded alpha profile | [revision cache/comparator](../src/visual-scene.ts), [material/order](../src/three-visual-draw.ts) | [0.8.8](../../harness/checkpoints/scene-rendering-v0.8.8.md), [0.8.9](../../harness/checkpoints/scene-rendering-v0.8.9.md) | NOT_VERIFIED; no performance or general alpha proof |
| SR14 | IMPLEMENTED: actual scene frame path | [canonical submit](../src/frame-session.ts), [private draw](../src/three-visual-draw.ts), [consumer](../manual/visual-scene-frame.mts) | [0.8.9](../../harness/checkpoints/scene-rendering-v0.8.9.md) | NOT_VERIFIED; no observed frame/pixels |
| SR15 | IMPLEMENTED: independent retained usage/cleanup | [releaseEntry/drain/end](../src/visual-scene.ts), [consumer](../manual/visual-lifetime.mts) | [0.8.10](../../harness/checkpoints/scene-rendering-v0.8.10.md) | NOT_VERIFIED; no GPU-health claim |
| SR16 | IMPLEMENTED: authored-to-preview synchronization | [serial partial-outcome bridge](../../editor/src/scene-preview.ts), [consumer](../../editor/manual/scene-preview.mts) | [0.8.11](../../harness/checkpoints/scene-rendering-v0.8.11.md) | NOT_VERIFIED |
| SR17 | IMPLEMENTED: redacted diagnostics/counts | [classifiers/count snapshots](../src/visual-scene.ts), [diagnostic projection/public root](../src/index.ts), [private branded error](../src/visual-presentation-error.ts) | [0.8.10](../../harness/checkpoints/scene-rendering-v0.8.10.md) | NOT_VERIFIED; unknown is not success |
| SR18 | IMPLEMENTED: Editor integration | [Editor root bridge](../../editor/src/scene-preview.ts), [MVP consumer](../../editor/manual/scene-mvp.mts) | [0.8.11](../../harness/checkpoints/scene-rendering-v0.8.11.md), [0.8.13](../../harness/checkpoints/scene-rendering-v0.8.13.md) | NOT_VERIFIED |
| SR19 | IMPLEMENTED: independent neutral Client integration | [Client browser host](../../game-client/src/manual-scene-host.ts), [MVP consumer](../../game-client/manual/scene-mvp.mts) | [0.8.12](../../harness/checkpoints/scene-rendering-v0.8.12.md) | NOT_VERIFIED |
| SR20 | IMPLEMENTED: reproducible seven-instance manual MVP | [real source provider/composition](../manual/scene-mvp.mts), [typed wiring](../../harness/manual/scene-mvp.mts), [page](../../harness/manual/scene-mvp.html), [provenance](../manual/scene-mvp-assets/README.md) | [0.8.13](../../harness/checkpoints/scene-rendering-v0.8.13.md) | NOT_VERIFIED; browser NOT_EXECUTED |
| SR21 | IMPLEMENTED: documentation/static closure audit | This matrix, complete commit/file inventory and public declaration comparison | [0.8.14](../../harness/checkpoints/scene-rendering-v0.8.14.md) | READY_FOR_DEVELOPER_REVIEW; no MVP acceptance |

## Prior-phase and ownership audit

Exactly five workspace projects and unchanged manifests/compiler/dependency graph:

```text
runtime-engine -> @rpg/core/kernel + @rpg/gameplay (pinned external artifacts)
runtime-render -> three (private backend), no production project dependency
editor -> runtime-engine + runtime-render (public roots)
game-client -> runtime-engine + runtime-render (public roots; no Editor)
game-server -> runtime-engine (no required Render/DOM/GPU)
Harness -> manual composition/tooling only, not a sixth production project
```

Git phase diff shows no Engine/Server, upstream pins, manifests, lockfile, tsconfigs
or workflow change. L1 Core2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775` and L2
Gameplay0.15.2 `acea332aa80f67552192a72b30f81c0bbbfc56bd` remain read-only. No
gameplay formulas, state, movement/authority model, schemas or protocols introduced.

Authored Scene ID/Object ID remain Editor data. Optional neutral correlation is
not Render identity. Scene/session symbols and exact issued handles gate admission;
copies/foreign contexts reject and ID reuse gets a fresh handle/ordinal. Stale remove
returns false; other stale live operations reject. Private THREE.Scene/Object3D and
GPU allocations remain backend-only. These are source-level findings, not executed
adversarial/runtime proof.

Phase4 factories/affine composition, alignment and projection remain canonical.
Phase8 extracted owner-local planeProjectionSteps for reuse rather than copying
projection math into Editor/Client. Ground depth uses transformed local ground
attachment in an explicitly declared source plane, never PNG top-left or screen Y.
Layer priority then layer ordinal, policy depth, explicit order and instance ordinal
form stable ordering. Revision-invalidated decoration/cache avoids repeated context
validation inside the comparator; no benchmark/performance guarantee is inferred.

Phase6 still owns acquired context, viewport sizing/suspension, invalidation tokens,
frame reentrancy admission and submission receipts. Phase8 attaches one frozen
logical frame source; ordinary renderFrame is extended to draw it. No Render RAF,
clock or second renderer. Legacy binding-only initialization remains reference-only.
No layout means no sprite drawable; hidden differs from removed/disposed.

Phase7 remains sole byte/decode/upload/cache/lease/atlas owner. prepareBinding retains
a separate canonical ready waiter before swap, checks session/source revision/frame
geometry/page dimensions, and releases a rejected candidate. Replacing a binding
commits before old cleanup; a cleanup failure does not promise rollback. Instances
expose observations, never their releasable owned right. Cache invalidation/session
loss can revoke a retained right; submission rechecks current backing/liveness.

The existing Three backend now borrows the same-context native allocation through
public ExternalTexture (three0.186.1/types0.186.0), with shared wrapper reference
counts. Geometry/material/mesh are instance-owned; native image deletion stays
with Phase7. The older v0.8.0 unproven material seam is resolved in source by v0.8.9,
not by private Three internals or a second upload/cache. Installed Three source and
official [ExternalTexture](https://threejs.org/docs/pages/ExternalTexture.html),
[Object3D](https://threejs.org/docs/pages/Object3D.html) and
[WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html) were checked.
Online docs are orientation; installed pinned code controls the audit conclusion.

Painter meshes use explicit renderOrder, transparent material, normal blending,
no depth test/write, double side/single pass and fixed clip-plane camera. This is
a bounded planar profile. Opaque and transparent lists remain distinct in Three;
sorting cannot establish general transparency correctness. No translucent 3D
intersection, cross-pass interop, color/alpha/filter-edge or clipping correctness
claim is made. The manual art uses binary alpha and full-height horizontal cells.

Editor sync captures authored membership/catalog and explicit host policy, reuses
the existing description/spatial APIs, then reports per-object partial outcomes.
Missing/unsupported references remain authored; diagnosed updates may retain stale
presentation or partial accepted state. Whole-batch atomic rollback is not promised.
Pending temporary leases release on close; late completion cannot adopt. Preview
never writes DocumentSession, dirty/revision/save or serialized handles. Document
save roundtrip is not part of this phase's executed evidence. Client imports only
Render for this presentation work; Harness alone wires both optional consumers.

## Lifetime, diagnostics and residual evidence

Removal unlinks the exact instance before native cleanup and releases its retained
usage in finally. Clear drains entries but preserves scene/ordinal provenance;
dispose records first terminal cause and drops session callbacks. Canonical session
termination broadcasts before backend teardown. Cleanup independently attempts
instance resources; sticky uncertainty prevents unsafe new visual-scope admission.
Target quarantine remains Phase6-owned; no automatic retry/restore/revival.

Foreign/stale/missing handles, invalid transforms/layer/depth, unavailable/revised
resources and frame/context failure have package-branded safe classifiers. Raw
host exception text/paths/native objects are not copied to diagnostic UI; unknown
errors remain unknown. Counts and historical snapshots are not liveness, successful
native reclamation or proof of no use-after-free. Critical runtime failure evidence
would require a stop/follow-up decision, not a late closure implementation.

Source provenance: v0.8.13 contains five original actual PNGs, generator, three-cell
40300 atlas text and matching SHA-256/length manifest. The fixed provider verifies
allowlisted acquired bytes and rejects source failure; no fallback sprite pretends
loading succeeded. Regeneration/provenance are documented. Atlas text is manually
authored supported parser-profile input, not an exported TPSheet compatibility
sample. Earlier Phase7 finite metadata observations do not validate this demo's
browser decoding/frame extraction or arbitrary exporters. Retain
TPSHEET_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED for this MVP.

## Developer review and release recommendation

Build/static packet is ready for whole-phase Developer review. Keep manual MVP and
release acceptance pending until the [runbook](../manual/scene-mvp.md) is actually
performed at the reviewed SHA. Record browser/version/assets/configuration,
submitted receipts separately from visible pixels, stable handle/order changes,
Monster B/C resource survival after A removal, opposite-host survival after disposal,
pending-close behavior and same-canvas recreate success or canonical rejection.
No browser was executed at closure; no screenshots-as-tests or automated suites.

DEFERRED outside this phase: Camera Controller, animation/VFX playback, hierarchical
scenes/prefabs/ECS, picking/culling/streaming, gameplay/authority/networking and
general 3D transparency. Exporter/trim/rotation/multipage/vertical-packing visual
compatibility and GPU-memory/performance investigation remain future evidence/work,
not silently completed features. No new subsystem was added to raise readiness.

Developer decides accept/reject/follow-up and whether/when to merge or release.
No automatic merge, tag, package publication, release or next-phase implementation.
