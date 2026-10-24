# ME06 — background

Parent c4c78bd. Editor map-background.ts adds setMapBackground,
clearMapBackground/describeMapBackgroundLayout; internal map-edit.ts merges
canonical Scene operations with surviving entry/definition/Scene/content metadata.
Profile admission checks one background, exact grid-origin placement, role, no
attachment, same-project whole-image catalog resolution and single image source.
No IO or inferred source identity. Project-root authority remains host-owned.

Finite public-root Node observation: background bg at grid origin, same-project
sprites/player.png reference; explicit world layout256x192 scene-unit for8x6.
Foreign project rejected MAP_IMAGE_PROJECT_OR_SUBRESOURCE, item rejected
MAP_IMAGE_UNSUPPORTED; clear retained extension.keep=true. Existing finite Phase14
filesystem host independently copied/read the real sprites/player.png bytes
through its authorized root; no texture upload/pixels claimed here.

Initial build caught use of non-root captureSpriteLayout; removed that import.
Descriptor is typed by public RenderVisualSpriteLayout, finite extents validated
in Editor; actual Render admission remains Render-owned. Final check/scope/verify
exit0 architecture229/UI14/3/TS/Vite. No canonical source/Render change.
VISUAL_NOT_VERIFIED. Next ME07.
