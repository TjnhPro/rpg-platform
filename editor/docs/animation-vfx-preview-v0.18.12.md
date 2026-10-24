# AP13 UI and finite reproduction

Editor owns the stable AnimationVfxPreviewWorkspace above responsive Shell slots.
App selects one active viewport; Project/Asset/Placement owners remain canonical.
The controller consumes AP02-AP12 and the Render public root. No root exports,
authored writes, stylesheet/theme/Shell or other project changes.

Build from repository root, then run:

```powershell
npm run build -- --force
npm --workspace @rpg-platform/editor run ui:build
node editor/manual/animation-vfx-preview-host.mjs 'D:\python_code\game_dev\jx1_web\jx1-manager-editor\data\asset-sources\monster\ani063' 8790
```

Open http://127.0.0.1:8790. The optional host grants only original Attack1_0 and
NormalStand1_0..7 PNG/TPSheet pairs, read-only. It does not grant arbitrary paths
or Scene storage. Restart the host after UI rebuild (static asset inventory).
Open game-a, select attack or idle in Asset Browser, select Animation & VFX Preview,
Acquire, use the explicit sample declaration and Prepare. Other legitimate assets
need an explicit JSON declaration and a compatible scoped metadata provider.
The sample is a preview declaration, not inferred artist timing/direction metadata.

Play/Pause/Resume/Stop/Restart/Step forward canonical commands. Apply replaces
playback at stopped/zero. VFX accepts only neutral sprite-sequence declarations;
idle supplies eight actual distinct direction sequences and two declared clips.
Selection does not autoplay. There is no seek or authoring/save command.
Temporary anchor/pivot/offset overrides are explicitly labeled inspection data.
Scene mode borrows a current valid Placement document; asset-only host displays
Scene unavailable. Targets come from the canonical preview bridge.

The Developer-approved UI checker seam lists ten exact Phase18 adapters, usable
only by this feature. Imports use emitted modules of those same sources so they
share package-root handle registries; direct TS imports were observed to duplicate
the canonical WeakMaps and reject valid project/asset handles. The checker checks
the fixed source list even before declarations exist on a clean build. No generic
private import permission or Render private access was added.

Finite browser observations (2026-10-24, local Chromium, original source files):

- Neutral sprite bound 0000 at 49.902ms playing; Pause showed 0002 at 3516.602ms.
  A screenshot was inspected: the sample sprite was visible in the shared canvas.
  This verifies one finite frame only, not animation alignment/complete UI acceptance.
- VFX created a real preview-only Render instance, repeat playback at 66.27ms and
  bound frame 0000. Pause at 17899.77ms then Step125 retained exactly that time;
  Stop returned stopped/zero/frame0000. No authored Save was invoked.
- A to B cleared selected asset/declaration/diagnostics and disabled controls;
  B showed no active project. Returning A retained its saved Project owner.
- Selecting idle replaced attack; slot7/idle-once bound0106 with seven frames,
  then completed at1050ms/frame0118. Eight pages came from the original metadata.
- Initial smoke caught/fixed empty-slot release suppressing Acquire notifications,
  duplicate handle registries, and passing a timed result rather than closed timed
  input into the VFX definition factory. These are actual source-backed corrections.

UI_INTERACTION_VERIFIED only for the finite flows above. Full responsive/focus,
hidden-tab/context-loss and in-Scene UI review remain NOT_CHECKED. AP11/API evidence
covers real Scene/world/attachment separately. Artist ground, original size and
trim provenance remain NOT_VERIFIED/NOT_AVAILABLE; one visible sprite is not proof
of VFX pixels, correctness for every frame, or hostile-filesystem durability.
