# VI12 — Manual Visual Inspector workflow

From the repository root after building:

```powershell
npm run build -- --force
node editor/manual/map-mvp-host.mjs --empty
```

Keep that terminal running. In another terminal, pass its printed loopback URL:

```powershell
node editor/manual/visual-inspector-mvp.mjs http://127.0.0.1:PORT
```

This finite consumer uses the existing Phase15 transport and real filesystem
ports, not a new Project host. It observes the two existing PNGs, publishes their
Asset Documents, authors a tracked Scene `main` containing ordinary `player-001`,
applies every Inspector property group, publishes the initial Scene and Project
separately, then closes/reopens Project, Assets and Scene from storage. It prints
exact readback, metadata retention, revision guards and unsupported CAS status.
Running without a URL uses the existing local `createMapFilesystemHost` instead;
that temporary root has no browser server. Each run needs a fresh empty host/root.

Open the printed host URL. Open Project game-a in Navigator, wait for its catalog,
choose **Visual Inspector** workspace, select `map-document`, **Open Scene**, then
select **Player**. It starts hidden because the saved authored value is false.
Choose a Property, edit its draft and **Apply property**. Select visibility and
apply true to request display; **Acquire**, then **Preview Scene** uses the public
Render bridge. After a Document change the old preview closes; acquire again.
No preview default is written into the Document. Blank numeric drafts reject.

The actual Phase15 fixture originally contains background/tiles, not main/player.
This manual consumer seeds an ordinary existing object through canonical owners
before inspecting it, as planned in VI01. No product object-creation UI is added.
Position is free authored placement; Map tile/background constraints remain intact.

**Save Scene** delegates to the same Map/Document ports after owned-profile
validation. The finite host is create-only. Initial publication is demonstrated
by the consumer; editing an opened existing Scene cannot be published with this
host and reports `CONFLICT_UNDETECTABLE`. No overwrite/CAS fallback exists. Save
Scene does not save Project or Assets. Close/discard explicitly abandons edits.

Map Editor and Visual Inspector hold independent canonical Document sessions when
opened separately. They do not promise cross-view live synchronization. Root and
storage preconditions remain independent; active-Scene/Project/catalog changes
invalidate Inspector selection. A retained dirty Scene from another Project is
read-only until return or explicit close/discard. Closing responsive panels does
not unmount the feature's session owner.

Preview policy is explicit: ordinary sprites use a 32 by 32 scene-unit rectangle,
camera center (128,128), nearest sampling, orientation/anchor/scale defaults from
the host. Authored facing never rotates images or selects animation frames. Layer
visibility is applied by Render layers; object intent stays separate. Bridge
outcomes are reported, and resource/viewport disposal uses existing public APIs.

Observed API/real-file results are recorded in the VI12 checkpoint. UI build is
verified; browser clicks/pixels, responsive usability, frame changes, GPU lifetime
and dedicated visual acceptance remain **UI_NOT_VERIFIED**. No generated tests,
screenshots or browser automation were added.
