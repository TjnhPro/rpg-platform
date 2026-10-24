# Ownership decisions — do not classify by similar names

v0.10.0 SA01: **runtime-render** owns proposed sprite definition validation,
eight-way mapping, explicit-delta playback and frame binding. Harness records
design/evidence only. Editor authors references/config, Client owns scheduling,
Engine owns gameplay intent/consequences; Server has no animation requirement.
Phase7 keeps resources, Phase8 instances, Phase6 graphics/frame, Phase9 camera.
[Design](../runtime-render/docs/sprite-animation-v0.10.0.md) changes no runtime,
public contract, dependency graph or owner. No sixth project or extra subsystem.

v0.9.14 CM20 closure: **runtime-render** remains the canonical camera owner.
Harness audits only; no production/API/dependency/owner transfer. Editor owns
authored placements/Document and preview UI; Client owns neutral inputs and host
scheduling; Phase6 owns graphics/resize/frame, Phase7 resource rights/cache, Phase8
live instances/order. Engine alone owns game positions; Server needs no frames.
[Closure review](checkpoints/camera-v0.9.14.md) preserves open native acceptance
and unsupported/deferred modes. Developer alone accepts the phase or merge risk.

v0.9.10 CM16/CM17: **runtime-render** owns optional camera/live Scene binding and
private native application in the existing Phase6/8 frame path. Phase7 retains
all resource lifetime ownership; host owns resize measurement/scheduling. Editor
and Client compile compatibility only. No L1/L2/Engine/Server or owner transfer.
See [checkpoint](checkpoints/camera-v0.9.10.md).

v0.9.5 CM09/CM10: **runtime-render** owns camera/accepted-viewport read adapter.
Phase6 retains native resize and issued-receipt freshness; host retains CSS/ratio
measurement and visibility. Editor/Client compile compatibility; no owner transfer,
camera manager, GPU application or resource mutation. See
[checkpoint](checkpoints/camera-v0.9.5.md).

v0.9.4 CM07/CM08: **runtime-render** owns camera zoom/focus state and composes its
Phase4 projection/inverse/affine APIs. Host selects explicit min/max policy; no
authored/gameplay/instance mutation, implicit browser measurement or new owner.
Editor/Client compile compatibility; Harness records evidence. See
[checkpoint](checkpoints/camera-v0.9.4.md).

v0.9.3 CM06: **runtime-render** owns source-plane center/pan and its state commit
seam, reusing Phase4 validation/affine operations. Editor/Client are compatibility
consumers only; authored/gameplay/instance state is never camera update authority.
Harness records evidence. No owner or dependency transfer. See
[checkpoint](checkpoints/camera-v0.9.3.md).

v0.9.2 CM05: **runtime-render** owns portable orthographic scale/zoom/extent policy.
Reuse canonical Phase4 plane/point capture and existing camera data capture;
Editor/Client are compatibility consumers only. Harness records evidence.
No graphics/resource/gameplay/authored ownership transfer or automatic binder.
See [checkpoint](checkpoints/camera-v0.9.2.md).

v0.9.1 CM02/03/04: **runtime-render** exclusively owns portable camera lifecycle
and reuses its Phase4 canonical plane/point capture. Harness records evidence;
Editor/Client compile existing consumers only. No binding, graphics, gameplay,
authored data or resource ownership transfer. See [checkpoint](checkpoints/camera-v0.9.1.md).

v0.9.0 CM01: **runtime-render** owns the camera semantic/integration design;
Harness records evidence. Editor/Client remain public consumers and host UI/intent
owners; no source change there. Camera view is not authored placement, gameplay
position or instance local transform. Phase4/6/7/8 retain canonical math, graphics,
resource and visual instance ownership. Zero API/dependency/owner transfer.
See [camera map](../runtime-render/docs/camera-v0.9.0.md).

v0.8.10 SR15/SR17: Runtime Render owns scene usage observations, safe error
projection and conservative visual-scope cleanup quarantine. Phase7 remains sole
owner of acquisition/waiters/native allocation release; Phase6 owns graphics
terminal policy. Editor/Client compatibility builds only. No global bus/profiler,
new cache, Engine/Server/L1/L2 or dependency change. See
[checkpoint](checkpoints/scene-rendering-v0.8.10.md).

v0.8.9 SR14: Runtime Render owns live sprite layout, frozen frame snapshot and
owned Three geometry/material/mesh integration. Phase4 math, Phase6 submission/
terminal/frame demand, Phase7 usable resource/atlas/cache allocation lifetime stay
canonical. Editor/Client are compatibility builds only; no authoring/gameplay/
Engine/Server/L1/L2 changes. See [checkpoint](checkpoints/scene-rendering-v0.8.9.md).

v0.8.8 SR11/SR12/SR13: Runtime Render owns opt-in live depth policies, finite
keys, source-plane presentation attachment depth and stable comparator/cache.
Phase4 math/plane validation, Phase6 lifetime/frame demand and Phase7 resource
ownership remain canonical. Editor/Client build-only collaborators; no authored
depth schema, gameplay spatial authority, Engine/Server/L1/L2 or dependency edit.
See [checkpoint](checkpoints/scene-rendering-v0.8.8.md).

v0.8.7 SR09/SR10: Runtime Render owns live scene-local presentation layer
definitions, instance assignments, comparator and native participation/ranks.
Editor authored layer refs/classification stay Editor-owned; no mapping policy
is imposed here. Phase 6 retains session/frame/suspension; Phase 7 retains resource
lifetime. Editor/Client are compatibility builds only. No Engine/Server/L1/L2
or dependency-direction changes. See [checkpoint](checkpoints/scene-rendering-v0.8.7.md).

v0.8.6 SR08: Runtime Render owns transient instance visibility, private node gate
and demand. Phase 6 retains viewport suspension and host-driven scheduling;
Phase 7 retains valid resource rights while hidden. Editor/Client are public
compatibility builds only; no authored dirty/gameplay/Engine/Server/L1/L2 change.
See [checkpoint](checkpoints/scene-rendering-v0.8.6.md).

v0.8.5 SR07: Runtime Render owns live instance transforms and private nodes in
its existing Three backend. Phase 4 remains the canonical math/alignment owner;
Phase 6 owns graphics lifetime/frame demand; Phase 7 keeps resource rights.
Editor/Client are compatibility builds only. No Engine/Server/L1/L2 edit or
dependency reversal. See [checkpoint](checkpoints/scene-rendering-v0.8.5.md).

v0.8.4 SR06: Runtime Render owns per-instance resource binding and independent
usage. Its existing Phase 7 cache retains another ready waiter; source loading,
GPU allocation, shared retirement and atlas interpretation keep their canonical
owners. Editor/Client are compatibility builds only. No dependency direction,
Engine/L1/L2/Server change. See [checkpoint](checkpoints/scene-rendering-v0.8.4.md).

v0.8.3 SR05: Runtime Render owns current correlation state, exact-handle read/
replacement and admission classification in its existing visual scope. Host input
is detached metadata; no authored/Engine/native ownership transfer. Editor/Client
are compatibility builds only. See [checkpoint](checkpoints/scene-rendering-v0.8.3.md).

v0.8.2 SR03/SR04: Runtime Render owns live visual registration identity/membership
inside the canonical visual scope. Neutral correlation is detached metadata, not
an Editor dependency or unique live key. Editor/Client are build-only consumers;
Engine/Server and dependency direction unchanged. See
[checkpoint](checkpoints/scene-rendering-v0.8.2.md).

v0.8.1 SR02: Runtime Render owns empty session-local visual scene lifetime through
its public root. Reuse canonical graphics admission/terminal hooks; one active
scope per session. Host owns graphics acquisition/disposal and borrowed canvas.
No Editor/Client/Engine/Server source or dependency-direction change. See
[checkpoint](checkpoints/scene-rendering-v0.8.1.md).

v0.6.14 RV19: Runtime Render remains the canonical context/viewport/frame owner;
Editor/Client are host consumers. Closure is Harness documentation only, with no
source/dependency/owner changes. [Review packet](checkpoints/render-viewport-v0.6.14.md)
records post-review RV19-COMPAT as ACCEPTED_CONSUMER_MIGRATION and RV19-BROWSER as
VERIFICATION_PENDING, not a confirmed production defect. No renderer rewrite or
ownership change is warranted by either finding. Developer alone accepts Phase6;
no runtime deferral exception, merge or next phase is authorized by this update.

v0.6.13 RV18: Runtime Render owns the canonical two-session graphics contract;
no backend/public changes needed. Editor owns a manual-only composition page;
Editor/Client scope their existing browser entries and choose explicit demo ratios.
No Render-to-host production import or Editor-to-Client package dependency.
Browser proof blocked by unavailable browser; see [matrix](checkpoints/render-viewport-v0.6.13.md).

v0.6.12 RV17: Client owns its independent browser viewport host, CSS/DPR metrics,
continuous callbacks, explicit start/stop and observer/listener teardown. Existing
Render root APIs suffice; no Editor dependency or Render/source ownership change.
See [checkpoint](checkpoints/render-viewport-v0.6.12.md).

v0.6.11 RV16: Editor owns its browser viewport host, canvas/CSS/DPR measurement,
on-demand callback, observers/listeners and pending-acquisition unmount policy.
Render owns actual backend/viewport/cleanup; existing root APIs suffice. No Render
or other project source changes. See [checkpoint](checkpoints/render-viewport-v0.6.11.md).

v0.6.10 RV15/RV11: Render owns safe terminal cleanup observations and quarantine,
including unknown backend failures. Editor/Client read public classifiers/snapshots
and own only host recovery, callbacks/listeners and canvas UI. No new logger,
resource manager or ownership direction. See [audit](checkpoints/render-viewport-v0.6.10.md).

v0.6.9 RV13/RV14: Render owns per-session redraw demand/acknowledgement; Editor and
Client own browser scheduling, visibility and cancellation. Public invalidation
does not mutate authored state or submit a frame. Two optional manual hosts use
the same Render implementation. See [checkpoint](checkpoints/render-viewport-v0.6.9.md).

v0.6.8 RV12: Runtime Render owns synchronous frame admission, nested-call rejection,
backend submission diagnostics and historical viewport receipt on the existing
session. Editor/Client choose when to call; Engine time/updates are independent.
See [checkpoint](checkpoints/render-viewport-v0.6.8.md). Owner graph unchanged.

v0.6.7 RV09–RV11: Runtime Render owns full-buffer region and explicit suspension/
resume admission on canonical sessions. Editor/Client own hidden/zero-layout/frame
policy and call Render; no global visibility bus or document mutation. See
[checkpoint](checkpoints/render-viewport-v0.6.7.md). Existing owner graph unchanged.

v0.6.6 RV08: Runtime Render alone applies explicit viewport resize/DPR requests
on its existing renderer/session. Editor/Client own measurement/layout/frame
policy, call the public root and do not write a live backing buffer directly.
See [checkpoint](checkpoints/render-viewport-v0.6.6.md). No other owner changes.

v0.6.5 RV07: Runtime Render owns pure viewport size admission/rounding via its
public root. Host owns CSS measurement and explicit ratio/budgets; no consumer
backend math or direct live-buffer resize. Validation candidate is not accepted
viewport state. See [checkpoint](checkpoints/render-viewport-v0.6.5.md).

This table is for routing an implementation **after inspecting current source**. It is not a universal RPG feature list.

| Change | Primary owner | Allowed collaborator / note |
| --- | --- | --- |
| Session-bound full-canvas viewport identity and immutable observation | **Runtime Render** | [v0.6.4 RV06](checkpoints/render-viewport-v0.6.4.md): one viewport per canonical graphics session, same symbol; host reads through root API, owns canvas layout/visibility, no authored Scene/Document mutation. Suspended contract slot does not implement suspension |
| Context loss detection, terminal cleanup and recreation admission | **Runtime Render** | [v0.6.3 RV05](checkpoints/render-viewport-v0.6.3.md): native event plus render-operation checks; no backend auto-restoration. Host decides explicit new target/session, owns its own browser listeners and Promise handling; cleanup failure retains quarantine |
| Observable graphics acquisition/release lifecycle | **Runtime Render** | [v0.6.2 RV03/RV04](checkpoints/render-viewport-v0.6.2.md): one canonical session/backend; immutable observations via acquisition handle. Host handles Promise/late-result release; binding-only EditorPreviewHost remains unchanged |
| Browser canvas capability/brand validation and reservation observations | **Runtime Render** | [v0.6.1 RV02](checkpoints/render-viewport-v0.6.1.md): native same-realm target inspection; no GPU-readiness claim. Host retains canvas/CSS/listeners; acquisition and exclusive reservation remain existing session responsibilities |
| Graphics context acquisition, effective viewport state/sizing, frame submission and native cleanup | **Runtime Render** | [v0.6.0 RV01](checkpoints/render-viewport-v0.6.0.md), architecture only: extend existing RenderFrameSession. Editor/Client own target UI/layout, measurement and frame requests; Engine time/authority and Editor Scene/Document state remain independent. Future signatures/policies require their supplied checkpoint tasks |
| Game-specific projectile travel, hit, penetration and lifecycle | Runtime Engine | Render presents output; Editor authors *that game's* config |
| Skill/monster/player/item RULE definition | Runtime Engine | L1/L2 are external public capabilities, not places to move rules |
| Animation, VFX, sprite alignment, camera | Runtime Render | Editor controls/inspects via public API |
| Scene placement, selection, gizmo, authoring undo, workspace state | Editor | Runtime Render supplies shared visual scene operations |
| Authored Document identity/envelope, session lifecycle, dirty/revision, codec and load/save/migration orchestration | **Editor** | [v0.5.0 architecture](checkpoints/document-v0.5.0.md); [v0.5.1 identity/envelope](checkpoints/document-v0.5.1.md); [v0.5.2 DC04/DC05](checkpoints/document-v0.5.2.md) immutable whole-content replacement; [v0.5.3 DC06/DC09](checkpoints/document-v0.5.3.md) session-local lifecycle, explicit caller-memory revert and discard admission. [v0.5.4 DC07/DC08](checkpoints/document-v0.5.4.md) adds session generation, derived dirty and exact-ticket host-confirmation seam; [v0.5.5 DC10](checkpoints/document-v0.5.5.md) adds the pure schema-1 JSON codec over canonical portable capture, with safe decode rejections and explicit resource/numeric/order policy. Codec does not save or mutate session state; [v0.5.6 DC11/DC12](checkpoints/document-v0.5.6.md) orchestrates existing owner validation/reference diagnostics via explicit kind/version/context bindings, preserving original decoded data for inspect and separating strict read from write eligibility. File existence remains NOT_CHECKED; IO/migration remain unavailable. Reuse Asset/Scene/Spatial owner validators; future game-config schema/semantic validation belongs to Runtime Engine. Storage host owns actual IO/commit guarantees; Render and L2 State Archive do not own Editor documents |
| Authored asset identity, source identity, metadata/catalog, reference resolution and diagnostics | **Editor** | [Phase 2 integration review](checkpoints/asset-contracts-v0.2.10.md): immutable authored catalog/resolution/diagnostics are implemented. Render owns the neutral visual descriptor/preparation contract; loaded resources remain future work, never a second authored catalog |
| Authored Scene Definition, Scene/Object IDs, membership, relationships and placement records | **Editor** | [Phase 3 closure audit](checkpoints/scene-contracts-v0.3.11.md): minimal immutable Scene data/operations/diagnostics/projection implemented; authored data is independent of UI, GPU and gameplay. Attachment is nonhierarchical; documents, parenting and spatial semantics remain deferred |
| Authored coordinate-space/unit/grid declarations | **Editor** | [v0.4.1 SP02–SP04](checkpoints/spatial-contracts-v0.4.1.md): project-scoped spaces/points; [v0.4.4 SP08](checkpoints/spatial-contracts-v0.4.4.md): optional immutable orthogonal grid declarations. Existing Scene placement remains independent/optional; no second identity registry, map catalog or Scene schema change |
| Presentation transforms, grid/plane conversion and viewport projection | **Runtime Render** | [v0.4.3](checkpoints/spatial-contracts-v0.4.3.md): affine operations; [v0.4.5 SP09](checkpoints/spatial-contracts-v0.4.5.md): canonical orthogonal grid/scene conversion; [v0.4.8 SP13/SP14](checkpoints/spatial-contracts-v0.4.8.md): explicit viewport/screen mapping and constrained selected-plane inverse. Editor adapts authored data/host metrics to Render-owned portable inputs, no duplicate formulas. No GPU/Editor imports in spatial math; gameplay grid/movement/collision stays Engine-owned |
| Presentation descriptions, visual instances and session-local Render state | **Runtime Render** | Editor projects through Render public APIs; no reverse import or parallel authored Scene catalog. Scene instance allocation belongs to Feature 08; no HP/AI/Drop semantics |
| Monster HP/AI/drop parameters supported by current game | Editor authors Runtime Engine's config | Engine is source of semantics and validation |
| User control or client input integration | Game Client | Runtime Engine owns effects of an accepted game command |
| Session creation, validation policy, settlement, issuing rewards, persistence | Game Server | Uses game Runtime; do not assume tick server or a single validation algorithm |
| Other saved content's resource/identity contract | **Unassigned until actual use case** | Asset and authored Scene identities are assigned above. Document envelopes, serialization/export and game content formats remain separate decisions in Features 05/19. No sixth `shared` package |
| Missing numerical/gameplay foundation API | **BLOCKED / Developer decision** | Do not modify L1/L2 or duplicate their ownership |

## Required reasoning for multi-project changes

v0.5.13 DC19 closure: Editor is the single primary owner; Harness holds audit
evidence only. No production API/source or ownership changes. Review all fourteen
checkpoints and exact public declarations against accepted Phase 4; retain Scene,
Asset and authored Spatial validators and Render-owned presentation math. Actual
storage guarantees and safe artifact cleanup stay host-owned, not inferred from
port types. See [closure report](checkpoints/document-v0.5.13.md). No other project
change, phase acceptance, merge or next-phase authorization is implied.

v0.5.12 DC19 is a documentation/manual-evidence checkpoint owned by Editor.
The public Document workflow composes existing Scene/Object, Asset and Spatial
contracts, with actual IO and exclusive publication owned by the local demo host.
No public contract, production source, Render allocation or ownership change.
See [manual guide](../editor/manual/document-mvp.md) and
[checkpoint](checkpoints/document-v0.5.12.md); stop before v0.5.13.

v0.5.11 DC17/DC18: Editor owns the Document Scene extension profile and explicit
preserving replacement adapter. Canonical Scene/Object/Asset/Spatial owners retain
all semantics, mutation and validation; no parallel schemas or math. Metadata slots
are a Document-only opaque profile, not new Scene domain fields. Storage host owns
publication and handles; Render/session/workspace preferences stay outside authored
content. Existing trusted whole-content replacement does not infer lost data.
See [checkpoint](checkpoints/document-v0.5.11.md). No other project changes.

v0.5.10 DC16: Editor owns explicit compatibility policy and one-step migration
orchestration. Existing content owners supply trusted pure transformations and
canonical validation. Structural preservation is conservative and additive;
semantic compatibility is not inferred from a version number. Storage host keeps
IO/conditional-publication ownership; migration only creates immutable candidates.
No Render, gameplay or other production owner changes. See
[checkpoint](checkpoints/document-v0.5.10.md).

v0.5.9 DC15: Editor owns portable persistence failure classification and bounded
cleanup invocation around its existing write port. Storage host owns handles,
per-request artifacts, actual IO guarantees and safe cleanup decisions. Primary
commit evidence is independent of cleanup success/failure; recovery is unavailable.
No other production owner changes. See [checkpoint](checkpoints/document-v0.5.9.md).

v0.5.8 DC14: Editor owns save admission, exact-ticket orchestration and per-session
in-flight/uncertain guards. Host owns actual atomic preconditions, full-payload
publication, receipts and durability claims; no renderer or gameplay persistence
ownership changes. Reuse codec/diagnostics/session public behavior. Only Editor
and directly relevant Harness docs change. See [checkpoint](checkpoints/document-v0.5.8.md).

v0.5.7 DC13: Editor owns the portable read port and load orchestration through
its root public API. Actual IO, locator authorization/encoding/limits and storage
observations are host-owned. Reuse existing document diagnostics/session capture;
no Render/Engine/Client/Server or L1/L2 changes, no save/conflict guarantees.
See [checkpoint](checkpoints/document-v0.5.7.md). Earlier table notes retain their
checkpoint-specific capability descriptions.

v0.4.10 SP16: Editor owns the authored Scene adapter and caller-held correlation.
Render owns canonical conversion through existing PlaneProjectionPoint2D and root
projection/viewport APIs; no Render source/API delta needed. No second Scene
renderer or reverse import. See [checkpoint](checkpoints/spatial-contracts-v0.4.10.md).

v0.4.9 SP15: Editor owns attaching/replacing authored Scene placement with an
explicit matching coordinate definition/scoped point. Reuse existing coordinate
factories and canonical Scene operation; no second registry, schema change or
Render math/API delta. See [checkpoint](checkpoints/spatial-contracts-v0.4.9.md).

v0.4.8 SP13/SP14: Runtime Render owns explicit viewport/screen mapping and
numerical validation, including constrained inverse to a declared plane. Editor
forwards host measurements through describeViewportMapping; no formulas or global
measurements. No dependency direction, Scene schema or frame lifecycle changes.
See [checkpoint](checkpoints/spatial-contracts-v0.4.8.md).

v0.4.7 SP12: Runtime Render owns pure forward orthographic-plane projection;
Editor adapts explicit authored coordinate definitions and numeric mapping config
through the Render root. No Editor math, Scene store, live camera/viewport state
or reverse import. See [checkpoint](checkpoints/spatial-contracts-v0.4.7.md).

v0.4.6 SP10/SP11: Runtime Render owns local-unit visual anchor/pivot alignment and
angle facing conventions. Editor owns authored placement/config and adapts them
through describeSceneObjectAlignment, with matching project/space/unit/axes.
No Scene/Asset schema change or duplicate math; facing never chooses animation or
changes gameplay aim. See [checkpoint](checkpoints/spatial-contracts-v0.4.6.md).

v0.4.3 SP06/SP07: Runtime Render owns pure planar affine operations; Editor retains
Scene/SC09/placement and may call only the Render root API with explicit numeric
inputs. Caller-ordered composition is not a parent system or authored-data rewrite.
See [checkpoint](checkpoints/spatial-contracts-v0.4.3.md) for numerical/failure policy.

State **(1)** which observable behavior changes, **(2)** who owns that behavior, **(3)** what public contract crosses projects, **(4)** which consumers need adjustments and why, **(5)** what remains unchanged. If two possible owners both make sense, inspect actual implementation and request a decision before irreversible architecture changes.

Examples:
- "Skill bay thẳng" is not an L2 capability merely because another game also has one. Game rules live in that game's Runtime Engine.
- "Thêm ô HP trên Monster Inspector" is Editor UI; HP semantics/value validation derive from current Runtime rules, not universal `RpgMonster`.
- "Quái spawn theo wave, Server chỉ tổng kết" can be fully valid. No imposed realtime game loop on Server.
- "Render collision shape" must be separated from authoritative collision/gameplay semantics; never use a draw callback as the source of damage truth.

## Escalation

Request Developer approval for a changed dependency direction, moved ownership, new public layer/package, modifying L1/L2, unexpected client/server authority model, or public schema break. Do not repair an unclear boundary by adding a generic service automatically.
Phase8 v0.8.11: **editor** owns authored Scene preview synchronization and its
runtime-only map. Runtime Render exclusively owns live instances, transforms,
ordering, retained resource rights and drawing. No Engine/Client/Server change;
no authored schema, public Render dependency direction or GPU ownership transfer.
See [checkpoint](checkpoints/scene-rendering-v0.8.11.md).
v0.8.12 SR19: **game-client** owns neutral sample presentation and browser host
orchestration. Runtime Render remains canonical scene/resource/draw implementation;
Harness manual composition alone wires Editor and Client, without a production
dependency. No Engine/Server change or gameplay/network authority inferred.

v0.8.13 SR20: runtime-render remains canonical scene/resource/presentation owner;
Editor adapts local authored snapshots via its existing bridge, Client adapts neutral
sample inputs. Harness manual wiring alone composes both optional consumers.
No new project, production API, Engine/Server/L1/L2 change or gameplay policy.

v0.8.14 SR21: runtime-render owns the Scene Rendering integration audit; Harness
records checkpoint/verification evidence, Editor/Client are compatibility consumers.
Documentation-only closure, no ownership/dependency/API move or new subsystem.
See [review packet](../runtime-render/docs/scene-rendering-v0.8.14.md). Developer
alone accepts the phase and authorizes merge/release; no next phase is implemented.

v0.9.6 CM11/CM12: runtime-render owns canonical camera-to-viewport/screen projection through Phase4, including explicit logical or accepted Phase6 context. Editor/Client compatibility consumers only; Harness evidence, no owner/dependency move, Engine/Server/L1/L2 unchanged. [Checkpoint](checkpoints/camera-v0.9.6.md).

v0.9.7 CM13: runtime-render owns constrained selected-plane camera inverse through Phase4. Host owns logical/screen measurements; Phase6 owns accepted receipt freshness. Editor/Client are compatibility consumers, Harness records evidence. No owner/dependency transfer or Engine/Server/L1/L2 change. [Checkpoint](checkpoints/camera-v0.9.7.md).

v0.9.8 CM14: runtime-render owns ground/elevation affine camera composition and constrained inverse. Editor/Client build consumers only; Harness evidence only. No Scene/depth/resource owner transfer, Engine/Server/L1/L2 change or native geometry application. [Checkpoint](checkpoints/camera-v0.9.8.md).

v0.9.9 CM15: runtime-render owns optional bounds admission and atomic camera transitions; host supplies fresh scoped bounds/metrics/intent, Phase6 owns receipt freshness. Editor/Client build consumers only, Harness evidence; no map/gameplay/schema/dependency ownership change. [Checkpoint](checkpoints/camera-v0.9.9.md).
