# Runtime Render — project-specific agent guidance

**Canonical owner:** Shared presentation engine for Editor and Game Client: scene, sprites, animation, VFX, camera, visual asset presentation. Three.js is the intended renderer; specific scene formats remain subject to MVP evidence.

Read root agent guidance first.

- Phase 1 boundary baseline: [ER01/ER02/ER04](../harness/checkpoints/editor-render-v0.1.0.md). [v0.1.1 ER03/ER06](../harness/checkpoints/editor-render-v0.1.1.md) adds immutable host/session metadata. Current [v0.1.2 ER07](../harness/checkpoints/editor-render-v0.1.2.md) adds created-to-bound lifecycle; bound never means graphics-ready.
- Only `@rpg-platform/runtime-render` is public. Keep backend objects and resource cleanup inside Render; never accept Editor UI/document stores or gameplay authority through future contracts.
- Current [v0.1.3 ER05/ER08](../harness/checkpoints/editor-render-v0.1.3.md): dispose clears the lifecycle's binding reference and terminates operations. Borrowed targets and caller-retained snapshots stay host-owned; no GPU cleanup exists yet.
- [v0.1.4 ER09](../harness/checkpoints/editor-render-v0.1.4.md) adds safe code/stage diagnostics for Render-created target/disposed errors. Preserve native exception behavior; unrecognized host exceptions are not backend failures or success. No raw context/cause in diagnostics.

- Editor and Client MUST reuse the same presentation implementation; Editor-specific gizmos are tool extensions, not a second renderer.
- Presentation identity/placement is not automatically gameplay identity/HP/AI/drop schema.
- Do not import Combat/Skill/Reward Rules from Runtime Engine; receive presentation data via approved boundary.
- Do not decide damage, collision authority, loot or session settlement in rendering callbacks.
- Server may need scene geometry/data, but never require GPU frame rendering to validate game results.
- No UI tests, screenshots-as-tests, added test suites or fake build scripts by default.
