# Asset Manager finite MVP — v0.14.10 / AM11

Owner: Editor. Execution parent: `78626b7794b1fcde4d82f2cbd481bb185086454d`.
Project Manager retains root/session/Create/Open/Save ownership in its stable
Workspace above responsive Shell slots (Developer-approved Phase13 delta).
Asset Browser uses that capability and notifies the same owner after explicit
manifest tracking. No portable Project/Document/Asset/Render contract changed.

## Run and review manually

From repository root, build `node harness/cli.mjs verify --projects editor --with-consumers`,
then run `node editor/manual/asset-manager-host.mjs`. Open the printed loopback URL.
This optional host serves the actual built Editor and two fresh physical roots.
It copies the existing `runtime-render/manual/scene-mvp-assets/traveler.png` into
A's `sprites/player.png`; it does not generate a replacement picture.

1. Select game-a in Project Manager and Create. Leave its manifest unsaved.
2. In Asset Browser select category player, enter ID player and path
   sprites/player.png; Register existing resource. This only registers in memory.
3. Enter ID item and Register metadata Item. Its kind is text, with no image source.
4. Save asset documents. Inspect each receipt. Only after both commits, Project
   Manager reports its manifest modified; use its separate Save command.
5. Use Project Manager Open to replace the clean A session with actual persisted
   readback. Both asset Documents must load before the rebuilt catalog is adopted.
6. Search player/item, filter player/item and inspect identity, kind, source,
   metadata and reference. Other standard categories are empty. Clear the filter
   to see both. Select player, Acquire the existing viewport, then Preview selected
   asset. Inspect actual PNG pixels manually. Select item and request preview:
   unsupported must remain explicit. Release the viewport.
7. Select game-b, Create: empty results, no selection or A preview. Switch back
   to A: its own persisted catalog reloads. Closing Navigator must retain Project
   ownership; Inspector must still refer to the same active project.

The host permits only project.json, player.asset.json and item.asset.json in each
authorized root, plus A's exact PNG for reads. Other IDs may be valid portable
registrations but this finite host cannot persist their paths. Save assets before
the first manifest Save. Existing-file replacement/CAS is unsupported. Partial
commits have no cross-file rollback or automatic retry. Switching projects drops
unsaved Browser registrations; save Documents and then the manifest first.

## Real storage observation

`node editor/manual/asset-manager-mvp.mjs` ran exit 0 against fresh physical roots
`C:\Users\admin\AppData\Local\Temp\rpg-project-manager-q3ycRL`.
This optional finite script calls public APIs and actual filesystem ports; it is
not a test runner or browser acceptance.

- Actual PNG: 236 bytes, SHA256
  `2483022fb684d52f0054bf6baf4dc15d5a867a749a7828f89afbb51c4637cb2f`.
  Observation was admitted for exact A binding
  `9c3b42e8-b240-4e95-b2bd-71400b61fa8f` and sprites/player.png.
- player.asset.json and item.asset.json each committed through their own Phase5
  DocumentSession/saveDocument; cleanup was cleaned. Manifest savedRevision was
  still null before its separate saveProject committed revision 2, acknowledgement
  applied, cleanup cleaned.
- A reopened from project.json, both tracked Documents loaded, catalog rebuilt.
  Player retained image kind, player category, sourceId 0001 and opaque vendor
  metadata; Item retained text kind, item category and custom rarity metadata.
  TRAVELER + image search returned 1; item category returned 1. Inspector resolved
  with no reference diagnostics and honestly reported fileExistence NOT_CHECKED.
- B was a different physical root: 0 results, not-selected; A reference rejected
  PROJECT_MISMATCH. ../game-a/player.asset.json read was permission-denied.
- Duplicate asset publication conflicted; exact old bytes unchanged. Existing
  manifest update was blocked CONFLICT_UNDETECTABLE. Final A listing contained
  item.asset.json, player.asset.json, project.json and sprites; B was empty;
  no temporary asset files remained. Sessions/managers were explicitly closed.

## Source and build evidence

UI composition adds scoped same-origin resource authorization and a Render
VisualSourceProvider. Provider bytes/revision come from actual bounded host reads;
Render retains decode/cache/GPU/Scene authority. Grants abort on capability change.
Late registration/save results cannot update a different active capability.
No Node filesystem import enters portable Editor code or the browser bundle.
Host assumes trusted ancestor topology and excludes symlink targets; it is not
a hostile same-account filesystem sandbox. Create-only hardlinks do not claim
crash durability or atomicity across Documents and manifest.

Architecture check inspected 223 sources; UI policy inspected 14 sources/3 styles,
zero errors. Scope and Editor verification passed, including ui:check, portable
TypeScript and actual TypeScript/Vite UI build. Existing large-chunk and DEP0190
warnings remain. No generated tests or runners were added.

STORAGE_REOPEN_OBSERVED / PROJECT_ISOLATION_OBSERVED describe the finite CLI trace.
UI_NOT_VERIFIED / VISUAL_NOT_VERIFIED remain for this new host and full user flow.
Earlier AM09 Render API/resource observations are separate and do not prove PNG
pixels or AM11 controls. Manual Developer review must finish steps 1–7; builds
and storage readback do not accept the entire MVP. AM12 carries these gaps forward.
