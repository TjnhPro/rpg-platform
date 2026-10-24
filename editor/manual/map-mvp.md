# Finite Map demonstration

From repository root after dependency installation:

```powershell
npm run build -- --force
npm run ui:build --workspace editor
node editor/manual/map-mvp-host.mjs
```

Open the printed `MAP_UI` URL. This creates fresh temporary A/B roots every run,
registers two original PNGs through the existing Asset Manager, saves their Asset
Documents, the Map and finally the Project manifest, then reads everything back.
The source files are existing original Render manual `courtyard.png` (1701 bytes)
and `traveler.png` (236 bytes), copied without changes into A. No Render source
is changed. Finite host naming uses asset `item` for the background and `player`
for the tile; these IDs carry no game semantics. No B file existence is claimed.

In Navigator select game-a, Open Project. Select Map Editor in Workspace; choose
map-01 / map-document in Tracked Scene Document, Open Map. It should show saved,
8×6 cells,32×32 scene-unit, origin0,0 and two layers. Acquire the existing viewport
graphics capability, then Preview Map. Review the courtyard background and traveler
tile at cell(3,2). Native pixels and these clicks have NOT been observed by the
agent in this environment. A successful prepared-data/transport run is not proof
of Render output or UI interaction.

Use Asset Browser workspace to select an image, return to Map to use that selection.
Set Tile layer=tiles; row2,column3 places/replaces. Column8 or row6 must show edit
rejection. Toggle layers/order and preview again after acquisition. Project B must
show no A Map/catalog or source access; A's held Map stays retained and requires
explicit close/discard before a different Map. The ordinary/future tracked examples
are inspection-only and must reject Open Map. Check narrow responsive panels too.

For the full UI Create/Save sequence start `node editor/manual/map-mvp-host.mjs
--empty` instead (one command line). Create Project A; in Asset Browser explicitly
register `item` from `sprites/background.png` and `player` from `sprites/player.png`.
Save Asset Documents and track them, but defer Save Project. Create Map with the
shown finite values; select each asset in Asset Browser and bind background/tile
in Map controls. Save Map first, Save Project separately. Close/discard Map and
Open the tracked Map. A fresh host permits one creation per allowed file only.

Existing-file updates intentionally report conflict/blocked; there is no CAS or
overwrite fallback. Reload a fresh host to repeat creation. Each file has its own
receipt; no cross-file transaction, power-loss durability or hostile-account
filesystem race guarantee. This demo is loopback/same-origin and allowlisted.
Do not use it as a general file server.

Node/file observation alone: `node editor/manual/map-mvp.mjs`. This prints genuine
per-file receipts, rebuilt catalog/map, equality and finite rejected cases. No
runner, assertions, browser automation, tests or acceptance claim is introduced.
