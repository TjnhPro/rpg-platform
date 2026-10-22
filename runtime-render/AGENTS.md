# Runtime Render — project-specific agent guidance

**Canonical owner:** Shared presentation engine for Editor and Game Client: scene, sprites, animation, VFX, camera, visual asset presentation. Three.js is the intended renderer; specific scene formats remain subject to MVP evidence.

Read root agent guidance first.

- Editor and Client MUST reuse the same presentation implementation; Editor-specific gizmos are tool extensions, not a second renderer.
- Presentation identity/placement is not automatically gameplay identity/HP/AI/drop schema.
- Do not import Combat/Skill/Reward Rules from Runtime Engine; receive presentation data via approved boundary.
- Do not decide damage, collision authority, loot or session settlement in rendering callbacks.
- Server may need scene geometry/data, but never require GPU frame rendering to validate game results.
- No UI tests, screenshots-as-tests, added test suites or fake build scripts by default.
