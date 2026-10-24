# Phase16 — Visual Properties Inspector closure

Status: **READY_FOR_DEVELOPER_REVIEW_WITH_LIMITATIONS**.
UI_BUILD_PASS / API_IO_OBSERVED / UI_NOT_VERIFIED.
Baseline `20014d1c415f6ef50755b68d2c4eba1fde67cfd0` (Phase15 merged).
Branch `feat/visual-properties-inspector-v0.16`; VI12 parent of closure `603803e`.
Developer owns feature/visual acceptance, merge and any next phase.

| Version / capability | Commit | Source and evidence |
| --- | --- | --- |
|0 / VI01 architecture|d5518fc|v0.16.0 design, source inventory, allowed scope and metadata contract|
|1 / VI02 profile|c47d296|visual-properties-profile: exact immutable v1, absent/false, Render factories|
|2 / VI03 selection|da78157|visual-inspector-context: issued capability, tracked active Scene, revisions/generation|
|3 / VI04 position|2bd2c75|read/setVisualPosition: existing Scene spatial placement; observed100,200|
|4 / VI05 direction|e32cd24|read/setVisualDirection: Render radians convention; observed1.25|
|5 / VI06 layer|1c6f7b5|read/setVisualLayer: actual Map layer set; observed front, unknown rejected|
|6 / VI07 scale|202dfe4|read/setVisualScale: finite dimensionless; observed1.5,.8, zero/reflection|
|7 / VI08 anchor|087690a|read/setVisualAnchor, describeVisualAlignment: observed anchor4,8/pivot3,5/offset2,-1|
|8 / VI09 visibility|4a09644|read/setVisualVisibility: false retained, hidden player still selectable|
|9 / VI10 binding|eebbc08|read/setVisualBinding: canonical catalog/resolver/visual descriptor; clear/rebind item|
|10 / VI11 document|3868f8f|createVisualDocumentEditor, validateVisualSceneDocument, describeVisualPresentation|
|11 / VI12 UI MVP|603803e|three feature components, App slot, finite actual-file consumer; exact reopen|
|12 / VI13 closure|this commit|this audit + Harness checkpoint; no production change|

Each version has its own `harness/checkpoints/visual-inspector-v0.16.N.md` in its
corresponding commit. Log and changed-file audit found no missing or combined
version. VI12 integration tightened the new feature's projectRevision token
(active Scene away/back cannot resurrect selection) and corrected raw graph
capture to pass through bounded codec before recursive envelope capture. These
are integration corrections in feature source, with no foundation modification.

The first twelve checkpoints record actual check/scope/Editor build results.
Portable capabilities were build/source evidence until the VI12 finite consumer;
their earlier checkpoints do not claim functional or visual observation.

## Scope and public declarations

Production delta is eleven new `editor/src/visual-*.ts`, additive `src/index.ts`,
three `ui/src/features/visual-inspector/*.tsx` and necessary `ui/src/app/App.tsx`
wiring. Supporting files: design, manual workflow, this closure, one optional
manual consumer, thirteen checkpoints and narrow Harness ownership pointers.
No source changes to generic document-*, scene-*, map-*, asset-* or project-*.
No changes to Render/Engine/Client/Server, L1/L2 pins, dependencies/lockfiles,
package/build/TS/CI config, theme, Shell, shared components or UI checker.
Unrelated local `.mcp.json` remains untracked and excluded from delivery.

AST comparison of baseline root and built `editor/dist/index.d.ts`:244→275 named
exports;31 additive, zero removed. New surface:

- Profile: create/readVisualPropertiesProfile, VisualPropertiesProfile, VisualProfileRead.
- Context: createVisualInspectorContext, VisualInspectorBinding/Selection/Snapshot/Context.
- Position: read/setVisualPosition, VisualPositionRead.
- Direction: read/setVisualDirection; layer: read/setVisualLayer, VisualLayerRead.
- Scale: read/setVisualScale; anchor: read/setVisualAnchor, describeVisualAlignment.
- Visibility: read/setVisualVisibility; binding: read/setVisualBinding.
- Document: validateVisualSceneDocument, createVisualDocumentEditor,
  VisualPropertyEdit, VisualDocumentEditor; preview: describeVisualPresentation.

UI type-checks these from the workspace public package root. Finite consumer also
imports the built public root. No Render public declaration or dependency changes.

## Canonical data and command audit

Position remains Scene placement; layerKey and assetReference remain Scene entry
fields. Only `content.objects[i].metadata.editorVisual` owns additional authored
`{schemaVersion:1,orientation?,scale?,anchor?,visible?}`. No defaults persisted on
read; false and absence remain distinct. Unknown fields/version reject editing,
save and preview and retain original text for inspection through UI open failure.
Generic strict Scene validation treats metadata as opaque; the Inspector adds
owned-profile validation instead of claiming that generic validation knows it.

Commands require exact issued selection, ProjectSession/root/DocumentSession,
project + scene + document + object identity, project/document revisions and
generation. Canonical Scene operations produce detached candidates. Only the
owned metadata slot is merged; complete Map/Scene/profile validation precedes
token recheck and exactly one replaceContent. Snapshots are immutable; invalid
commands do not adopt or advance revision. Unrelated entries/order/metadata stay
unchanged. No serialized selection, drafts, resources or second dirty counter.

Facing follows Render +X/toward+Y half-open radians and never rotates an image or
selects an animation frame. Scale uses Render finite dimensionless semantics,
including collapse/reflection; portability rejects negative zero. Anchor/pivot/
offset remain separate numeric local values with explicit space/unit validation;
alignment delegates to Render. Layers come from Map definitions and requests;
layer visibility and Render effective visibility remain separate from object
authored intent. No renderer math or gameplay rule duplication.

## Open/Save and finite actual storage evidence

Read entire document-session/load/save, map-open/save and feature consumers.
openMap uses the issued authorized root and tracked locator, strict Map/Scene
read and project revision recheck. Inspector then checks every owned profile
before retaining session/activating Scene. Save uses validateVisualSceneDocument
then saveMap→saveDocument with the observed storage precondition, no direct IO.
saveDocument captures a one-shot ticket, validates/serializes, requires atomic
publication/conflict protection, acknowledges only committed payload and keeps
newer edits dirty. Conflicted/failed/uncertain receipts retain canonical semantics;
uncertain writes quarantine further coordinator saves. UI invalidates selection
on failed IO; it invents no saved baseline, retry, overwrite or CAS.

VI12 consumer uses the existing createMapFilesystemHost or existing loopback
map-mvp-host --empty transport, not a copied host/mock disk. Actual two PNGs
(236/1701 bytes) admitted through canonical resource observation and published
as Asset Documents; ordinary player-001 plus an untouched object authored in main.
Final local run: temporary root rpg-project-manager-br72NE/game-a; loopback run
also completed at127.0.0.1:51215. See VI12 checkpoint and manual workflow.

Observed eight commands revision2→10, dirty true each; stale/nonfinite/foreign
binding/unknown layer rejected with unchanged revision; hidden selection and
clear-without-delete succeeded; active Scene away/back invalidated the old token.
Initial Scene save committed, Project remained independently dirty then saved.
Close/reopen Project, Asset catalog and Scene from actual storage yielded clean
true and exactDocument true, all seven property groups and vendor metadata
preserved; untouched entry identical, two objects/order retained. Project B root
not authored. Render pure alignment yielded origin98,191 and pivot101,196.
Local save cleanup receipt cleaned; loopback client has no cleanup hook, so its
receipt is not-configured. This is not durability or GPU lifecycle evidence.

Existing-file update was actually blocked `CONFLICT_UNDETECTABLE`: the host is
create-only. Initial publication before reopen is the supported persistence path.
The UI opens existing tracked Scenes, so its subsequent save cannot overwrite
them on this host. Save Scene does not save Assets or Project. Separate Map Editor
and Inspector sessions have independent storage preconditions, no live cross-view
synchronization. Cross-project held dirty Scene is retained until explicit discard.

## Preview and limitations / risk register

One EditorPanel in the existing right Inspector slot, Mantine controls/tokens;
one property group at a time, local invalid drafts only until Apply. Feature owner
stays mounted above responsive panels. Existing Viewport owns graphics/frame host;
Render owns scene/camera/resources; existing ScenePreviewBridge owns instances and
pending leases. Document/catalog/grant replacement releases bridge, camera binding,
camera, scene and cache through public lifecycles. Late async work checks closure.
No second renderer, cache implementation or RAF scheduler.

Explicit host preview policy uses ordinary32×32 scene-unit sprites, camera128,128,
nearest sampling; defaults never enter authored data. Missing binding/placement/
layer/resource reports unavailable/skipped, bridge reports partial outcomes.
These reports do not establish displayed pixels or successful cleanup on hardware.

| Limitation / risk | Evidence and remaining decision |
| --- | --- |
|Existing file persistence unavailable|Observed create-only rejection; future host CAS is separate owner work|
|Browser UI and responsiveness|UI_NOT_VERIFIED; dedicated Developer UI Verification remains required|
|Preview frame and GPU lifetime|FRAME_CHANGE_NOT_VERIFIED / GPU_LIFECYCLE_NOT_OBSERVED; source lifecycle only|
|Facing has no frame mapping|Numeric orientation authored; no eight-way animation capability inferred|
|Unsupported profile/Scene|Inspect-only, no normalization or migration; only current Map profile editable|
|Independent authoring sessions|No cross-view live synchronization; explicit storage preconditions remain|
|Preview reacquisition|Edits remount preview; user must Acquire again; usability review deferred|
|Build warnings|Existing Vite >500kB chunks and Node DEP0190 remain; no config workaround|

## Verification and CI handoff

Closure observed exit0: architecture check (256 sources), scope editor --allow-infra,
verify editor --with-consumers, UI_CONTRACT_PASS (19 sources/3 stylesheets, zero
errors/warnings), UI TypeScript/Vite build, root `npm run build -- --force`
(five-project TypeScript references), baseline protected-path diff and whitespace
audit. No generated tests, runners, Playwright or screenshots.

CI workflow remains `.github/workflows/build.yml`: Foundation build, Node version
file, foundations preparation, clean install, architecture, five-project verify
with consumers and root build. Remote CI necessarily follows creation of this
commit; final exact PR head SHA/run conclusions are recorded in the PR review
packet after push, not invented here or added as a fourteenth version commit.
Acceptance/merge/release/next phase remain Developer decisions.
