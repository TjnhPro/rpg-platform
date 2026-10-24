# ME02 — immutable Scene Map profile

Parent 1e68c32 (exact SHA in git). Editor adds map-profile.ts and eight root names:
createMapProfile, readMapProfile, mapDocumentContext, replaceMapProfile; MapProfile,
MapLayerDefinition, MapProfileSnapshot, MapProfileReadResult. Internal structural
and checked-read helpers are not root exports. No canonical source/schema change.
Profile shape and classifications follow ME01; no bounds/grid math/layer edit UI.

Canonical Document capture rejects accessors before profile fields are read;
Scene strict validation uses public diagnoseDocument, catalog when supplied and
the exact profile space resolver. Ordinary Scene => not-a-map; future Map version
=> unsupported; malformed controlled fields => invalid. No implicit migration.
replaceMapProfile returns a detached candidate retaining source content/scene and
all permitted metadata outside editorMap; it never edits a session or writes.

Finite Node root-API observation: 8x6 empty Map strict=true, codec decoded/supported;
profile width candidate9 retained membership vendor array and Scene extension;
original remained width8. Ordinary Scene not-a-map. Version2, duplicate mapId and
foreign project rejected; accessor rejected with getter invocation count0.
The temporary JSON is observation data, not storage-save proof or a test suite.
Actual check/scope/verify exit0: architecture224, UI14/3, portable TS and Vite.
Existing chunk/DEP0190 warnings; no runtime UI/IO/pixels verified. No blocker.
