# Visual Object Placement — Phase17 closure

Status: **READY_FOR_DEVELOPER_REVIEW_WITH_LIMITATIONS**. Editor is the sole
production owner. This audit adds documentation only. Developer acceptance,
browser interaction and visual review remain open; no merge/tag/publication or
Phase18 is authorized by this checkpoint.

Baseline: `bf95b5b8db9bfccc03335c4fe90b978c369486c6` (merged Phase16).
Branch: `feat/visual-object-placement-v0.17`. Production-source audit HEAD:
`7038a2ca9189a0c42737db71d55c2a8e99cd6d3d`. The thirteenth commit contains this
closure and VP13 checkpoint only; its exact SHA and CI results belong in the PR
handoff after that commit exists. CI is pending at checkpoint preparation, not
assumed successful.

## Ordered acceptance ledger

The [original manifest](tasks/phase17-visual-object-placement/MANIFEST.md) and all
13 task files were copied byte-for-byte; source/destination SHA256 comparison
matched all 14 files. Each row links its detailed checkpoint and exact task.
Prior checkpoints record genuine gates, fixture corrections and evidence limits.

| Version / commit | Changed files and public surface | Actual observation / acceptance limit |
| --- | --- | --- |
| [0](../../harness/checkpoints/visual-object-placement-v0.17.0.md) / `e6cbf5e` | Design, task copies, ownership pointer | Source inventory confirms Phase14–16 exist; no production API change. |
| [1](../../harness/checkpoints/visual-object-placement-v0.17.1.md) / `358a3cd` | `visual-placement-identity.ts`; `visualPlacementLabels`, `prepareVisualPlacementIdentity` | Five suggested labels retained; duplicate ID/foreign Scene rejected. Labels are not gameplay entities. |
| [2](../../harness/checkpoints/visual-object-placement-v0.17.2.md) / `54aad12` | `visual-placement-context.ts`; binding/context/issued intent | Real owner identities, active tracking, catalog generation and Asset selection checked; selection change invalidates intent. Nonvisual resource/wrong layer reject. |
| [3](../../harness/checkpoints/visual-object-placement-v0.17.3.md) / `306f7f9` | `visual-placement-position.ts`; bounded resolver | Cell1,2 resolves center80,48/start64,32; free255.5,191.5 accepted, x256/NaN rejected. Uses canonical conversion, no camera math. |
| [4](../../harness/checkpoints/visual-object-placement-v0.17.4.md) / `34c88df` | `visual-placement-create.ts`; `placeVisualObject` | PNG-backed npc at48,48; wrong layer/foreign Asset reject, original membership unchanged. Candidate only, no IO. |
| [5](../../harness/checkpoints/visual-object-placement-v0.17.5.md) / `8cc65b0` | Checkpoint only; reuse Phase16 selection | Select/clear do not dirty document; stale/forged/closed selection rejected. No second selection service. |
| [6](../../harness/checkpoints/visual-object-placement-v0.17.6.md) / `cd7554e` | `visual-placement-move.ts`; `moveVisualObject` | Move80,48 preserves rich metadata and hidden visual profile; outside bounds/foreign Scene reject. Corrected temporary fixture retained Map metadata before rerun; no semantic amend. |
| [7](../../harness/checkpoints/visual-object-placement-v0.17.7.md) / `27965ab` | `visual-placement-duplicate.ts`; `duplicateVisualObject` | Fresh clone112,80 keeps frozen hidden/scale profile; original and independent movement preserved. Existing ID/unknown identity-bound metadata reject. |
| [8](../../harness/checkpoints/visual-object-placement-v0.17.8.md) / `4001a76` | `visual-placement-delete.ts`; `deleteVisualObject` | Inbound attachment reports referring ID and rejects; missing object rejects. One removal retains other order/metadata/catalog, no cascade. |
| [9](../../harness/checkpoints/visual-object-placement-v0.17.9.md) / `dbb87da` | `document-scene-placement.ts`, finite manual consumer; insert/facade types | One canonical session and shared Inspector; guarded single adoption. Real initial filesystem Save/Open, exact content and clean baseline; stale token/revision/root/schema/context failures retain source. |
| [10](../../harness/checkpoints/visual-object-placement-v0.17.10.md) / `d0b6398` | `visual-placement-preview.ts`; `syncVisualPlacementPreview` | PNG/spatial descriptors observed; null bridge reports `RENDER_SESSION_NOT_ACQUIRED`. No live Render bridge acquired: `PREVIEW_NOT_OBSERVED`. |
| [11](../../harness/checkpoints/visual-object-placement-v0.17.11.md) / `7038a2c` | Feature workspace, minimal App wiring, manual consumer/guide | UI builds; CLI places Player/Monster sharing PNG, moves/clones/deletes and reopens actual Scene. UI interaction/graphics remain unverified. |
| [12](../../harness/checkpoints/visual-object-placement-v0.17.12.md) / closure commit | This audit and VP13 checkpoint only | Source/diff/declaration/task audit, all-five builds and root forced build observed. Exact final HEAD CI checked separately in PR handoff. |

## Canonical data and safety audit

Identity, display name and classification remain SceneObjectDefinition values;
asset/layer/placement/attachments/order remain SceneMembership values. No alternate
object store, serialized selection or gameplay entity is introduced. IDs are
explicit and Scene-local; `editor-map:` classifications and non-objects layers
are excluded from ordinary placement. VFX is a label only; playback unsupported.

Phase14 remains Asset selection/catalog authority. The context requires the exact
ProjectSession, root binding and AssetManagerProject identities, matching Scene
project and active tracked Document. Intent binds document/project revisions,
catalog generation and current issued Asset selection (including away/back
invalidation). Finite probes rejected foreign root/Scene/Asset, replaced selection,
wrong owner/schema, future Map profile and disposed context. UI Project A/B switch
is source-reviewed, not browser-observed: mismatched held Scene is unavailable,
context is disposed/rebound and explicit return/discard is required. No global
active-project singleton or fallback to another project's same resource path.

Phase15 Map validation/bounds/layers and Phase4 conversion remain authoritative.
Move uses the existing metadata-preserving Scene replacement; insert appends to
the original rich entries, delete filters those entries. Scene/content/definition
and unrelated entry metadata survive. Duplicate explicitly rejects outgoing
attachments, nonempty definition metadata and entry extensions other than typed
`editorVisual`; the original remains intact. It preserves the supported visual
profile via canonical deep capture and requires a fresh ID and explicit position.
Delete rejects known inbound Scene attachments with referring object IDs. Opaque
metadata references are not interpreted or cascaded. Unsupported structural
profiles are rejected by existing strict validation before edits, not normalized
away. A scalar-metadata audit fixture was rejected as `UNSUPPORTED_CONTENT_PROFILE`;
it was not an admitted document or a demonstrated metadata-loss defect.

Phase16 Inspector is shared with placement on the same DocumentSession. Commands
capture inputs, re-read owners/revision/envelope and adopt one validated candidate
only. Selection stays transient; successful delete clears it. Other Inspector
properties reuse the existing editor, while its position action uses bounded move.
No generic Document, Scene, Project, Asset, Map or Inspector foundation was edited.

## Evidence and limits

The finite public-root [filesystem consumer](../manual/visual-object-placement-document.mjs)
exited0. It admitted an actual PNG, placed `player-001` and `monster-001`, moved
revision4→5, duplicated `monster-002`5→6, deleted it6→7. Stale selection/revision,
outside bounds and duplicate ID retained envelope/revision. A sentinel with
definition/entry metadata and unrelated Scene/content metadata survived.
Initial Scene publication committed with cleanup `cleaned`, current/savedRevision7
and clean session. Save Project remained separate. Project+Asset+Scene reopened
from disk with exactly equal serialized Scene content and a clean baseline.
Observed temporary root: `C:/Users/admin/AppData/Local/Temp/rpg-project-manager-JzHLMp/game-a`.

`SCENE_AUTHORING_OBSERVED` and `SCENE_IO_OBSERVED` describe this bounded CLI path.
Existing-file save is blocked `CONFLICT_UNDETECTABLE`: **UNSUPPORTED_CAS**. The
manual Scene-capable host supports create-only publication, not safe replacement
CAS, crash recovery, production storage or Save All. Save Scene is not Save Project
or Save Assets. Independently opened Map/Placement sessions are not synchronized;
close a tool's Scene before authoring the same stored Scene in another tool.

Preview reuses unchanged Phase16 VisualViewport/Viewport and public Render
scene/cache/camera/ScenePreviewBridge lifetimes. The optional adapter borrows a
bridge; it creates no resources or scheduler. UI edits/context changes remount
existing content and require acquisition again. Descriptors and unavailable-bridge
results are not frames. **UI_INTERACTION_NOT_VERIFIED / PREVIEW_NOT_OBSERVED /
VISUAL_NOT_VERIFIED / GPU_NOT_OBSERVED**. Browser/visual review remains Developer-owned.
No generated test suite or browser automation was added or run. Numeric placement
only: no drag/drop, picking, gizmos, undo, gameplay spawning or VFX implementation.
Manual steps and host commands: [MVP guide](visual-object-placement-v0.17.11-mvp.md).

## Gates and delta audit

Observed exit0 at production HEAD `7038a2c`:

- `node harness/cli.mjs check`:267 sources, architecture pass.
- `node harness/cli.mjs scope --projects editor --allow-infra`: pass; unrelated
  untracked `.mcp.json` excluded from commits.
- `node harness/cli.mjs verify --projects runtime-engine,runtime-render,editor,game-client,game-server --with-consumers`:
  all five genuine builds pass; Editor includes UI contract check (20 sources,
  3 stylesheets, zero errors/manual warnings), TypeScript and Vite build.
- `npm run build -- --force`: exit0, full root TypeScript build.
- Baseline-to-HEAD protected-path diff and whitespace check: exit0.

Existing Vite chunk-size and Node DEP0190 harness warnings remain. No failed or
unconfigured project build was reported. Closure changes only Markdown and reruns
architecture/scope/whitespace gates before commit. CI must verify the final PR SHA,
not an earlier capability or an inferred success; PR handoff records actual runs.

AST audit of baseline root declarations vs current emitted `editor/dist/index.d.ts`:
275→295 public symbols, 20 additive, zero removed. Added exports are the twelve
identity/context/position/create/move/duplicate/delete/insert/facade/preview runtime
symbols and eight corresponding public types. Existing export signatures/sources
remain unchanged; no owner contract is replaced. No new external dependencies,
workspace/package, package/lock/CI/harness CLI changes. No changes under
runtime-engine, runtime-render, game-client, game-server, external L1/L2 or Editor
theme/layout. Harness files are tooling, not a sixth project.
