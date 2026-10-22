# Foundation contract boundaries — deliberately minimal

This describes the *interactions to audit*, not finalized types or APIs. Do not create interfaces just to satisfy this document before a real MVP needs them.

Phase 1 v0.1.0: [Editor–Render ER01/ER02/ER04 checkpoint](checkpoints/editor-render-v0.1.0.md)
records the source audit, ownership and documented public boundary as API_DESIGN_ONLY.
It introduces no runtime API symbols; future scene/preview interactions below remain unimplemented.

Phase 1 v0.1.1: [ER03/ER06 host/session checkpoint](checkpoints/editor-render-v0.1.1.md)
adds immutable session descriptors and borrowed host bindings through the Render root.
This metadata operation does not initialize a renderer or validate a graphics target.

Phase 1 v0.1.2: [ER07 initialization/lifecycle checkpoint](checkpoints/editor-render-v0.1.2.md)
adds an explicit created-to-bound session transition with immutable observations.
Binding accepts an opaque reference only; it does not acquire a graphics backend.

Phase 1 v0.1.3: [ER05/ER08 state ownership/disposal](checkpoints/editor-render-v0.1.3.md)
adds terminal disposal and releases the lifecycle's internal binding reference.
It never destroys the borrowed target or revokes caller-retained observations.

1. **Workspace/project discovery**: five identifiable projects, build entrypoint, explicit dependency direction and public import surfaces. Keep package naming editable until real manifests exist.
2. **Editor ↔ Render**: an authoring host can create/select/inspect/move a presentation object and save/reload scene/content without a duplicate renderer. The specific scene format/coordinate system belongs to the relevant MVP.
3. **Editor ↔ Runtime**: Editor can discover or be supplied the active game's supported content/config contract and run its validation/preview through public Runtime APIs. No universal Skill/Player/Monster contract is imposed.
4. **Runtime ↔ Render**: shared output is presentation-oriented state/events/adapters; rendering must not own gameplay decisions. Exact event naming, topology and update rate remain game-driven.
5. **Content consumption**: Editor-authored content has an identity/reference/version/validation story sufficient for the selected game, and can be consumed without the Editor being installed. Do not prescribe JSON/INI/database or client/server partition prematurely.
6. **Client/Server**: each can consume applicable Runtime/config data according to the chosen game model. Do not enforce a realtime protocol, persistent monster simulation, identical active state or authoritative rendering.
7. **External foundation usage**: `@rpg/core/kernel` and `@rpg/gameplay` are consumed only through approved public APIs; missing capabilities cause a recorded blocker.

## Unresolved until demonstrated

- Scene identity/coordinates and whether text-only content needs a visual scene.
- Which project owns the persisted content schema/serializer (may differ by content type); **assign one canonical owner when used**.
- Rule/config discovery shape (descriptors, type contracts, explicit editors, mixed approaches).
- State/event update model, client/server data projections, authority/verifier, persistence.
- Physical L3/L4 split and package/repository boundaries after working games.

## Three data classes that must not be conflated

Authored content/config != Editor local workspace state != Runtime mutable instance state. If an interface crosses two, specify which it carries and why.
