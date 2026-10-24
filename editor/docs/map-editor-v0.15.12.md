# ME13 — Map Editor integration audit

READY_FOR_DEVELOPER_REVIEW. Architecture/build and finite file/API evidence are
complete; FEATURE_NOT_VERIFIED / UI_FUNCTIONAL_NOT_VERIFIED / VISUAL_NOT_VERIFIED
at product level. No native browser surface was available. Developer alone accepts
the phase. No merge, tag, release, publication or next-phase implementation.

Baseline main0d8c4ea8e63ec284259ce05e2619010199f545e9; phase branch
feat/map-scene-editor-v0.15. Closure parent2a161da. This checkpoint changes only
documentation and a Harness ledger pointer. Exact closure commit is the unique
addition of harness/checkpoints/map-editor-v0.15.12.md in git history.

## Ordered checkpoint inventory

All previous reports and their actual commits/source were inspected. Every named
capability has its own ordered commit; no version is omitted or combined.

| Version | Capability | Commit | Evidence |
| --- | --- | --- | --- |
| v0.15.0 | ME01 architecture, source contracts | 1e68c32 | design-only decision ledger |
| v0.15.1 | ME02 Scene metadata Map profile | fb3c281 | profile/opaque metadata/unsupported admission |
| v0.15.2 | ME03 dimensions/bounds | afb5a4c | quotas, half-open cells, resize exclusion |
| v0.15.3 | ME04 grid/origin | c7b9bbf |112,80 roundtrip, off-center/foreign rejection |
| v0.15.4 | ME05 layers/order | c4c78bd | Render requests, occupied-layer rejection |
| v0.15.5 | ME06 background | bd119bd | image refs, explicit extent, preservation |
| v0.15.6 | ME07 sparse tiles | 41f28a2 | stable replace/remove, collision/OOB rejection |
| v0.15.7 | ME08 Create | 4ee2cd1 | real Project/root, unsaved detached session |
| v0.15.8 | ME09 Open | 132f42c | actual file read, complete strict Scene context |
| v0.15.9 | ME10 Save | c35eefe | real commit/reopen, conflict/late/uncertain evidence |
| v0.15.10 | ME11 UI | c4bec4b | Shell/Panel/Mantine, public Render path; compile only |
| v0.15.11 | ME12 finite MVP | 2a161da | two real PNGs, disk roundtrip, negative API/HTTP cases |
| v0.15.12 | ME13 closure | this checkpoint | source/declaration/scope/build audit only |

Each version has matching editor/docs/map-editor-v0.15.N.md and
harness/checkpoints/map-editor-v0.15.N.md. Earlier reports are historical evidence
at their revision; later checks do not retroactively claim browser execution.

## Scope and canonical contracts

Baseline-to-closure delta is49 files: Editor map-only source/manual/docs, three UI
sources, Harness checkpoints/ownership pointer. Exactly11 new portable map modules;
existing Editor portable source changes only11 additive root-export lines. Existing
Scene/Asset/Document/Project/spatial files, Theme/Panel/Shell/checker and styles
are unchanged. Existing App consumes existing controller capabilities; no Phase13
delta was required. Untracked .mcp.json is pre-existing, excluded from commits.

`git diff --quiet 0d8c4ea -- runtime-engine runtime-render game-client game-server
package.json package-lock.json tsconfig.json .github .node-version` exit0.
No L1/L2 changes, pinned-dependency/dependency-graph edits, TS flag changes, CI edits
or tests. No sixth project, gameplay rule, second renderer or persistence owner.

One Map is the existing SceneIdentity and one Scene Document. editorMap v1 is the
sole profile; no alternate identity/registry/tile list. Unknown metadata outside
the controlled profile survives candidates and disk roundtrip. Bounds are safe
cell counts, zero-based/half-open; grid/unit/axes/indexing explicit. Canonical
Render forward-center/inverse agreement rejects off-center and duplicate tiles.
Occupied-grid rebase is unsupported. Layers are stable authored keys with Render
priority/order requests; background is optional/single; tile positions are sparse.

Open/Save provide owner=scene, kind/version, catalog and the exact profile space
resolver to canonical Document diagnostics. Real saved Map strict-load/reopen
succeeds; no unsupported-profile or missing-context waiver. Root/Project/tracked
document/Scene/catalog bindings are checked. Save Map only dispatches that Scene
Document; tracking/active Scene adoption and manifest save are separate operations.
No late result is adopted into another Project. Preview closes/revokes on UI
dependency changes and consumes only public Render roots; no GPU acceptance claim.

## Additive root and emitted declaration audit

TypeScript AST inventory: named exports207→244,37 additions, zero removed.
Emitted editor/dist/index.d.ts has244 matching names; none missing.25 runtime
values and12 types added; internal helpers are not root APIs. Existing exports
retain their declarations because their modules and prior index lines are unchanged.

| Group | Added root values | Added types |
| --- | --- | --- |
| Profile | createMapProfile,readMapProfile,mapDocumentContext,replaceMapProfile | MapProfile,MapLayerDefinition,MapProfileSnapshot,MapProfileReadResult |
| Bounds | mapExtentLimits,createMapExtent,diagnoseMapCell,containsMapCell,resizeMapExtent | MapExtentCells,MapCell |
| Grid | mapCellToPlacement,mapPlacementToCell,replaceMapGrid | none |
| Layers | addMapLayer,updateMapLayer,reorderMapLayers,removeMapLayer,describeMapLayers | none |
| Background | setMapBackground,clearMapBackground,describeMapBackgroundLayout | none |
| Tiles | setMapTile,removeMapTile | none |
| Create/Open/Save | createMap,openMap,saveMap | CreateMapOptions,CreateMapResult,OpenMapOptions,OpenMapResult,SaveMapOptions,SaveMapResult |

## Actual gates and finite evidence

At closure parent2a161da: root `npm run build -- --force` exit0 (five-project TS
build); harness check exit0 (241 JS/TS sources); scope editor+infra exit0; verify
editor --with-consumers exit0. The genuine Editor build includes ui:check exit0
(16 sources,3 authored stylesheets,zero errors/manual warnings), strict UI TS and
Vite ui:build exit0. No unconfigured or failed final build. Existing Vite bundle
size and Windows Node DEP0190 warnings remain. Documentation/pointer-only closure
does not change build inputs. Final branch/PR CI is reported separately after push;
no remote CI existed for this phase at pre-push audit.

ME12 real filesystem evidence: game-a/map-01; map-document;8×6;32×32 scene-unit;
origin0,0;right/down;two ordered visible layers; two distinct real PNG refs; one tile
at(3,2)→112,80. Map commit/clean then separate Project commit; close and disk-reopen
Project/assets/Map yielded identical serialized envelope with opaque metadata.
OOB/foreign refs rejected without revision change; ordinary/future Open rejected
without Project change. HTTP source/Map reads worked, B/traversal/capability denied.
ME10 additionally observed conflict preservation, true late receipt savedRevision
behind currentRevision, and genuine lost acknowledgement quarantine.

STORAGE_REOPEN_OBSERVED is bounded to the finite create-only host. It does not
prove existing-file CAS, crash/power-loss durability, hostile same-account topology
races or cross-file atomicity. No browser clicks, responsive behavior, decoded
texture output, camera orientation, layer appearance, disposal under native loss
or pixel correspondence were independently observed. Use the executable
[manual instructions](../manual/map-mvp.md) for Developer acceptance.

Deferred: painting/brush/palette/undo, pointer placement, pan/zoom UI, atlas tiles,
multiple map tabs, map-object authoring, occupied-grid migration/cropping, Tiled
import/export, streaming/procedural generation, gameplay collision/spawns, server
authority, general storage/CAS host and any next phase. No missing public upstream
API was found for this deliberately small authorized implementation.
