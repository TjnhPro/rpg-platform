# ME07 — sparse tiles

Parent bd119bd. Two additive root APIs setMapTile/removeMapTile. Explicit Scene
identity guard; exact tiles layer/cell; supported whole-image catalog reference;
canonical Scene add/replace/remove; shared ME04 forward/inverse. Existing tile
replacement ignores the vacant-only newObjectId and retains ID, metadata and order.
Profile admission now rejects missing assets/placement, attachments, noncanonical
centers and ambiguous same-layer occupancy before any operation/load/session edit.
No stored tile index, dense grid, brush, gameplay or renderer changes.

Node public-root observation: tile-1 at112,80; replacement retained exactly two
objects (background+tile), entry vendor=retain and definition custom=7; remove left
bg alone. Rejected OOB MAP_CELL_OUTSIDE, stale Scene STALE_MAP_SCENE, wrong layer
MAP_LAYER_ROLE_MISMATCH, duplicate canonical occupancy invalid:AMBIGUOUS_MAP_TILE.
Resize exclusion still rejected RESIZE_WOULD_EXCLUDE_TILE. Asset negatives from
ME06 use the same shared admission. Session unchanged because these are candidates.
check/scope/verify exit0 architecture230/UI14/3/TS/Vite. No UI/pixels/storage claim.
Next ME08 with actual Phase13 public contracts.
