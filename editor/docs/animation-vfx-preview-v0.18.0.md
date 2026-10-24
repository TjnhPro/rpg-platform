# Animation & VFX Preview architecture

Execution baseline `f528300e03a5efa07b99c47c6907167ce7eb88f3`, merged Phase17.
Editor owns transient inspection, controls, scoped host grants and scheduling;
Render remains the sole atlas, playback, timing, VFX instance, resource/lease,
camera and drawing owner. Engine/Client/Server/L1/L2 are read-only. No schemas,
dependencies or public Render changes. No source FPS/compass/ground inference.

| Source-backed owner | Current source/public contract | Phase18 use |
| --- | --- | --- |
| Project13 | `ProjectManagerWorkspace`, ActiveEditorProject session/root | Borrow stable capability above Shell; never close Project |
| Asset14 | AssetBrowserWorkspace, AssetManagerProject, managed selection observation, resolveAssetReference | Borrow catalog/selection; exact object/scope/generation guard |
| Map15 | create/open/saveMap, mapDocumentContext | Read actual authorized Scene only; no preview Save |
| Inspector16 | validateVisualSceneDocument, describeVisualPresentation, VisualViewport | Reuse profiles and presentation; no mutation |
| Placement17 | VisualObjectPlacementWorkspace and shared Scene session | Existing source confirmed; any optional Scene bridge must retain its document ownership |
| Render7 | createVisualSourceLoad, parseUnityAtlasMetadata, getAtlasMetadataRevision, resolveAtlasFrameGeometry, createVisualResourceCache | Real bounded source reads, canonical provenance and leases |
| Render10 | createSpriteFrameSequence/AnimationClip/TimedClip/EightWaySpriteClip, directional and sequence Playback and VisualBinding APIs | Explicit declarations, no second frame picker/clock |
| Render11 | create/resolveVisualEffectDefinition, createVisualEffectInstance, command/advance/sync/removeVisualEffectInstance | Separate preview-owned effect, canonical lifetime and frame binding |
| Editor6 | Viewport contentFactory(requestFrame), mountEditorViewport | One acquired target; existing host submits frames/resizes |

All prerequisites above are source-present, unlike the task's dated Phase14-only
snapshot. Actual gaps: Asset14 has no persistent clip manifest; provider `host.ts`
admits only role image and attests image/png. Explicit ephemeral clip declarations
are required; AP09 may add the named bounded role/media host seam. There is no
public `requireVisualEffectDefinition` or `validateVisualEffectSources` export:
use actual `resolveVisualEffectDefinition`, not invented/private functions.

Local feature modules in `editor/src/animation-vfx-preview-*` are reusable by the
UI and finite local manual consumers. No package-root export is initially needed:
existing UI already imports Editor-local viewport-host directly. No React/DOM,
host IO implementation or Render handle re-export from portable package root.

Transient states: not-selected/unavailable/unsupported → ready-to-load → loading
→ ready; canonical playback stopped/playing/paused/completed; failed/disposed.
Explicit modes single-sequence, eight-way (eight real declared slots), VFX
sprite-sequence. Transport/frameIndex/elapsed come only from Render snapshots.
Restart uses stop+play for sprite and canonical restart for VFX. Timing/loop edits
replace owned playback at stopped/zero; speed multiplies supplied delta once.

Each Project/root/catalog/selection/provider generation change retires old work.
Revalidate before IO and publication. Release source-load snapshots on cancellation,
unbind before releasing leases, remove owned effects/instances, drain owned cache/
scene then host session; never dispose borrowed owners. Late responses cannot
publish into replacement scopes. Hidden/unavailable viewport pauses, cancels clock
and resets timestamp: explicit Resume, no hidden catch-up. StrictMode gets fresh
handles. Context loss retires activity rather than pretending graphics-ready.

Evidence is separate: address selected ≠ frame resolved ≠ source bytes loaded ≠
Render frame bound ≠ submitted ≠ pixels observed. No preview command edits an
Asset/Scene/Project Document or revision/dirty baseline. SourcePivot is raw source
coordinate data, not verified artist ground. Inspection defaults are labeled.

Ordered commits AP01–AP14: design; context; atlas; explicit clips; sprite commands;
timing/speed; effect admission; effect lifetime; resource+metadata host; alignment;
Scene bridge; visible playback clock; UI; closure. One capability/commit/checkpoint,
one phase PR; genuine check/scope/Editor builds each, full5+forced root at closure.
No generated suites or auto merge/tag/publish/Phase19. UI/visual review is deferred.

Finite acceptance: authorized real PNG/TPSheet + two explicitly declared sprite
clips (directional only with eight legitimate slots), canonical manual transport
and binding; separate real sprite-sequence VFX definition/instance/transport/sync/
cleanup; denied path and late Project A→B source response; read-only Scene target
integration when actual mapping exists. CPU evidence is not GPU/browser evidence.
Missing metadata is HOST_METADATA_UNAVAILABLE; no static-PNG animation fallback.
Deferred: persistent clips/designers, particles/projectiles/combat, gizmos, seek,
automatic scanning/filename inference, authoring schemas and visual test matrices.
