# ME03 — finite cell extents

Parent fb3c281. Editor map-bounds.ts and profile admission share one quota policy:
safe positive counts <=4096, product<=1048576. No dense allocation. Seven root
additions: mapExtentLimits/createMapExtent/diagnoseMapCell/containsMapCell/
resizeMapExtent and MapExtentCells/MapCell. Profile reads now enforce the same
quota; structural checks reject non-data descriptors without executing getters.
Resize delegates existing tile position classification to canonical Render inverse
and refuses exclusion; no crop/rebase/scale/session mutation, all metadata retained.

Finite Node root API: 8x6 admitted row/column(0,0),(5,7); rejected (6,0),(0,8),
negative and fractional. Zero/4096-squared/unsafe extents rejected. Width9 candidate
retained opaque metadata. Width3 with tile at(112,80) rejected
RESIZE_WOULD_EXCLUDE_TILE, serialized original unchanged=true.
check/scope/verify exit0, architecture225/UI14/3/TS/Vite; final verify rerun after
centralizing quota admission. No UI/IO/pixel claim or generated tests. Canonical
owners unchanged; no blocker. Continue ME04 after commit.
