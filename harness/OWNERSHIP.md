# Ownership decisions — do not classify by similar names

This table is for routing an implementation **after inspecting current source**. It is not a universal RPG feature list.

| Change | Primary owner | Allowed collaborator / note |
| --- | --- | --- |
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
