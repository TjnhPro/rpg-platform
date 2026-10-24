# VI12 — v0.16.11

Parent 3868f8f17f3e7327974427332fe4c32ad7847af6; audited VI11 + actual Phase14 controller/catalog and Phase15
Map IO/Viewport/manual host seams. Editor owns feature UI, App slot wiring and
finite manual consumer. No foundation/Map/Project/Asset/Render source edits.
One Visual Properties EditorPanel in existing right Inspector slot. Stable owner
above responsive panels retains canonical session; selection/drafts are transient.
Inputs use focused commands; pending/empty/read-only/stale/error explicit; hidden
objects selectable. One property group shown at a time. No new CSS/theme/stack.
Consumer integration hardens feature token with projectRevision: switching active
Scene away then back without reading cannot resurrect an old token. Existing
exports retained; additive token diagnostic only. No L1/L2 or other project delta.
Preview uses existing Viewport, ScenePreviewBridge, Map layer requests, Render
camera/cache roots. Explicit 32-unit ordinary sprite layout/128,128 camera policy;
no image-size/facing inference. Close bridge on document/context change and release
camera/scene/cache via their public lifecycles. No lifecycle/graphics PASS claim.
Finite tooling reuses createMapFilesystemHost; optional client seeds EXISTING
map-mvp-host --empty transport. No copied filesystem or Project server.
UI sessions open tracked Scene via openMap; existing-file update remains blocked
on create-only host. Manual initial Save before reopen proves the supported path.
Next v0.16.12 after actual gates/evidence below. UI_NOT_VERIFIED.

Consumer audit also moves raw profile/command capture through serializeDocument
before recursive envelope detachment; bounded codec remains the sole authority.
No codec/foundation changes. A finite 1000-level input is rejected by its explicit
RangeError depth limit (first probe expected TypeError and exited1; corrected to
the documented codec contract, rerun exit0). No generated test was added.

Observed gates: check exit0 (256 source files), scope editor --allow-infra exit0
(11 paths), verify editor --with-consumers exit0, including UI_CONTRACT_PASS
(19 sources,3 stylesheets), TypeScript and Vite production build. Existing >500kB
chunk and DEP0190 warnings remain. git diff --check exit0.

Finite manual consumer exit0 on both existing loopback transport (127.0.0.1:51215)
and local existing filesystem host; final local rerun root game-a under
C:\Users\admin\AppData\Local\Temp\rpg-project-manager-br72NE. Two real PNG assets
admitted/saved (236 and1701 bytes). Eight focused commands revision2→10, each +1;
hidden player selectable, clear retains it, stale/nonfinite/foreign/layer rejects
retain revision. Untouched entry exact; active Scene away/back token stale.
Initial Scene save committed/cleaned, Project remained separately dirty then saved.
Existing update blocked CONFLICT_UNDETECTABLE. Close/reopen from real storage:
clean true and exactDocument true, position100,200, facing1.25, layer front,
scale1.5,.8, anchor4,8/pivot3,5/offset2,-1, visible false, asset item; vendor metadata,
object count/order retained. Project B root not authored. Public Render alignment
origin98,191/pivot101,196 observed. UI_NOT_VERIFIED / FRAME_CHANGE_NOT_VERIFIED /
GPU_LIFECYCLE_NOT_OBSERVED. No pixel, browser click or full lifecycle PASS claim.
