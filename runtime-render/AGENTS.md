# Runtime Render — project-specific agent guidance

**Canonical owner:** Shared presentation engine for Editor and Game Client: scene, sprites, animation, VFX, camera, visual asset presentation. Three.js is the intended renderer; specific scene formats remain subject to MVP evidence.

Read root agent guidance first.

- [v0.2.10 integration/closure review](../harness/checkpoints/asset-contracts-v0.2.10.md) inventories three Phase 2 additions (17 total root symbols). Metadata preparation remains independent of graphics/session acquisition; no Editor/Engine import, loader, cache or image display is introduced. Earlier checkpoint notes describe their original revision; Developer acceptance remains pending.

- [v0.2.8 AR14](../harness/checkpoints/asset-contracts-v0.2.8.md) introduces VisualResourceDescriptor and prepareVisualResource with the real Editor manual consumer. Render validates/detaches identity, image media hint and ordered source roles/locations, then returns metadata-prepared with resourceLoading NOT_PERFORMED. It accepts portable data independently of Editor; no catalog, IO, decoder, texture, cache or frame/session integration. Location checks are lexical description checks, not filesystem authorization. Phase 1 ownership/lifecycle is unchanged.

- [Phase 2 v0.2.0 AR01/AR02](../harness/checkpoints/asset-contracts-v0.2.0.md): authored asset identity/catalog/reference resolution is Editor-owned. Render owns future presentation resource descriptors and actual loaded resources; never import Editor or create a duplicate catalog. No descriptor API before a real consumer (v0.2.8 task), no GPU loading/decoder/cache in Phase 2; Visual Resource Loading belongs to Phase 07.

- Phase 1 boundary baseline: [ER01/ER02/ER04](../harness/checkpoints/editor-render-v0.1.0.md). [v0.1.1 ER03/ER06](../harness/checkpoints/editor-render-v0.1.1.md) adds immutable host/session metadata. Current [v0.1.2 ER07](../harness/checkpoints/editor-render-v0.1.2.md) adds created-to-bound lifecycle; bound never means graphics-ready.
- Only `@rpg-platform/runtime-render` is public. Keep backend objects and resource cleanup inside Render; never accept Editor UI/document stores or gameplay authority through future contracts.
- [v0.1.3 ER05/ER08](../harness/checkpoints/editor-render-v0.1.3.md): binding-only dispose clears the lifecycle's binding reference and terminates operations. Borrowed targets and caller-retained snapshots stay host-owned. The separate v0.1.7 graphics session additionally attempts backend cleanup.
- [v0.1.4 ER09](../harness/checkpoints/editor-render-v0.1.4.md) adds safe code/stage diagnostics for Render-created target/disposed errors. Preserve native exception behavior; unrecognized host exceptions are not backend failures or success. No raw context/cause in diagnostics.
- [v0.1.6 ER11–ER13](../harness/checkpoints/editor-render-v0.1.6.md) inventories all current public symbols and extension seams. Preserve binding-only initialization and import portability; GPU readiness/acquisition, failure variants, cleanup and shared-target ownership require impact analysis and Developer decisions before a real backend. No plugin registry or new runtime API is introduced.
- [v0.1.7 ER14](../harness/checkpoints/editor-render-v0.1.7.md) adds explicit async graphics acquisition with a lazy Three.js backend and one-frame submission. Existing binding APIs/error union remain unchanged. Graphics uses a same-realm canvas exclusively per package instance; terminal cleanup leaves the host node/context lifetime intact. A submitted receipt is not visual verification; no loop or scene authoring API exists.
- [v0.1.8 ER15](../harness/checkpoints/editor-render-v0.1.8.md) audits the nine-checkpoint integration without changing APIs. Preserve the distinction between bound, graphics-acquired and submitted. Phase acceptance and manual visual review remain Developer-owned; future contract changes still require explicit approval.

- Editor and Client MUST reuse the same presentation implementation; Editor-specific gizmos are tool extensions, not a second renderer.
- Presentation identity/placement is not automatically gameplay identity/HP/AI/drop schema.
- Do not import Combat/Skill/Reward Rules from Runtime Engine; receive presentation data via approved boundary.
- Do not decide damage, collision authority, loot or session settlement in rendering callbacks.
- Server may need scene geometry/data, but never require GPU frame rendering to validate game results.
- No UI tests, screenshots-as-tests, added test suites or fake build scripts by default.
