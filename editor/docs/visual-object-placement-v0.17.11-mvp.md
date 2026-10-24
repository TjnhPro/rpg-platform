# Visual Object Placement MVP

Editor owns ordinary Scene authoring. Placement and the embedded Phase16 Inspector
share one issued selection context and one DocumentSession. Canonical Asset Browser,
Project/Map/Document APIs and the existing VisualViewport are consumed unchanged.
The legacy Map workspace remains its own explicit open/close tool; this phase does
not add a global document registry or synchronize independent open sessions.

From the repository root, build and run the existing Scene-capable host:

```powershell
node harness/cli.mjs verify --projects editor --with-consumers
node editor/manual/map-mvp-host.mjs --empty
```

Open the `MAP_UI` URL printed by the host. This is finite local filesystem tooling,
not a production storage service. New temp roots contain sample PNGs. Use `game-a`.

1. Create Project. In Asset Browser, register explicit asset ID `player`, source
   `sprites/player.png`, then save Asset Documents/tracking before creating Scene.
   Catalog rebinding reloads tracked documents; unsaved asset drafts are not a disk baseline.
2. Choose **Visual Placement & Inspector**. Enter Scene/Document/space IDs and use
   the authorized `map.scene.json` locator. Confirm dimensions/cell sizes, Create
   Scene. New Scene has background/tiles/objects layers. The Project catalog rebinds;
   return to Asset Browser and explicitly select `player`, then return to Placement.
3. Choose `objects`, classification `player`, unique ID `player-001`, Scene X/Y or
   explicit column/row and center/start alignment. Place. Repeat with classification
   `monster`, ID `monster-001` (the same PNG is a resource, not gameplay identity).
4. Select `monster-001` from Scene objects, enter new bounded point, Move. Enter
   `monster-002`, Duplicate. The clone is selected; Delete it explicitly. No Asset
   deletion occurs. Hidden objects remain selectable. Embedded Inspector properties
   edit the same document; its position action uses the bounded Placement move.
5. Save Scene **before its first publication**, then Save Project separately in the
   Navigator. Close/discard Scene. Select tracked Scene and Open Scene for readback.
   Repeat Save after editing an existing file to see unsupported host update status.
   This host cannot update existing documents; `CONFLICT_UNDETECTABLE` is expected.
6. Acquire the existing viewport, then Preview Scene. Edits/context changes remount
   the existing preview and require acquisition again. Renderer/cache/camera/bridge
   lifecycle stays with the existing Phase16 viewport. No click placement, picking,
   drag/gizmo or VFX playback. Preview outcomes are not proof of displayed pixels.

Close any independent Map workspace session explicitly before switching authoring
tools on the same stored Scene. Their snapshots are not automatically synchronized;
existing-file writes cannot silently overwrite via this create-only host. Inactive
Project's retained Scene needs explicit return or discard. Responsive panel visibility
does not own session lifetime; page unload warns for an unsaved held Scene.

Optional finite CLI observation, not a generated suite or automatic gate:

```powershell
node editor/manual/visual-object-placement-document.mjs
```

This admits the real sample PNG; places Player/Monster, moves, clones/deletes, checks
rejection without adoption and retained metadata, then saves/reopens through actual
filesystem ports. Browser UI interaction, GPU frames and pixels remain unverified.
Duplicate supports typed `editorVisual` only; unknown object/definition metadata or
outgoing attachments reject because their clone ownership has not been established.
