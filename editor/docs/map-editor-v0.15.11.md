# ME12 — Finite Map MVP

Parent c4bec4b. Only Editor manual tooling changes; no production API/UI change.
Map filesystem host adds exactly one allowlisted A PNG over existing finite host.
map-mvp.mjs orchestrates real ProjectSession, registered AssetManager refs,
Document save/load and map operations; map-mvp-host.mjs supplies loopback static
UI plus capability/root-bound transport to those existing ports. It does not
introduce a product storage stack, renderer or bypass Document save guarantees.
[Executable instructions](../manual/map-mvp.md).

Observed `node editor/manual/map-mvp.mjs` exit0 with fresh actual temporary roots:

- PNG item/background:1701 bytes, SHA256
  940cb2adf171150f6828d72c59f2534f412218145646fea02fd4a96390ef582f.
- PNG player/tile:236 bytes, SHA256
  2483022fb684d52f0054bf6baf4dc15d5a867a749a7828f89afbb51c4637cb2f.
- Both registered through registerExistingAssetResource and Asset Documents
  committed individually. Explicit map background ref=item, tile ref=player.
- Scene game-a/map-01, document map-document:8×6,32×32 scene-unit, origin0,0,
  axes right/down, layers background then tiles (both visible). Only tile(3,2)
  at canonical point112,80; background at0,0. No other tile positions persisted.
- Map commit revision3, acknowledgement applied, cleanup cleaned, clean session.
  Project remained dirty until separate manifest commit. Physical Map1649 bytes.
- Closed sessions; reopened Project from disk; loaded Asset Documents and rebuilt
  canonical catalog; opened tracked Map clean. Serialized envelope identical,
  including membership/Scene/entry/definition opaque vendor metadata and stable
  tile ID after replacement. Not a local-state-only roundtrip.
- column8 rejected MAP_CELL_OUTSIDE; canonical selected B authored image reference
  rejected MAP_IMAGE_PROJECT_OR_SUBRESOURCE. Revision unchanged for both. B image
  physical existence intentionally not claimed.
- Actual inspection-only ordinary/future files opened as not-a-map:NOT_A_MAP /
  unsupported:UNSUPPORTED_MAP_VERSION; Project revision unchanged.

Observed finite HTTP transport against live map-mvp-host:static200; both genuine
PNG signatures/bytes available; A Map read200 with exact Scene identity; B resource
denied, traversal403 PATH_DENIED, missing capability403 CAPABILITY_DENIED. These
are transport observations, not browser controls or pixels. Original courtyard
and traveler PNGs copied unchanged from existing Render manual assets.

The initial manual recipe correctly exposed STALE_PROJECT_CONTEXT when tracking
each asset before finishing registration. Fixed tooling to gather refs and defer
manifest adoption; production owner freshness checks unchanged. No workaround.

Root `npm run build -- --force`, harness check(241 sources), scope, verify editor
with consumers (includes ui:check16/3 zero errors and ui:build TS/Vite) exit0.
BUILD_PASS / STORAGE_REOPEN_OBSERVED. UI_FUNCTIONAL_NOT_VERIFIED /
VISUAL_NOT_VERIFIED:browser unavailable at ME11; no clicks or native pixel claim.
Finite create-only guarantees only; existing-file CAS, power loss, hostile-account
topology races and cross-file atomicity remain unsupported/unverified. No tests,
new dependencies, other production owners or release. Next ME13 audit only.
