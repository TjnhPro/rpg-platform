# ME04 — grid and origin

Parent afb5a4c. Editor map-grid.ts adds mapCellToPlacement,
mapPlacementToCell and replaceMapGrid through canonical Phase4/Render APIs.
No arithmetic implementation, screen mapping, camera state or duplicate positions.
Inverse floor requires exact forward-center agreement. Occupied map rebasing is
explicitly unsupported. Candidates preserve all supported metadata slots.

Finite Node public-root observation with the saved 8x6 profile: column3,row2
produced (112,80), inverse returned column3,row2. Foreign space rejected
MAP_SPACE_MISMATCH; (113,80) rejected NONCANONICAL_TILE_CENTER; (272,80)
rejected MAP_CELL_OUTSIDE. Grid conversion takes no camera state.
check/scope/verify exit0; architecture226, UI14 sources/3 styles, TypeScript/Vite.
Existing chunk-size and Windows DEP0190 warnings remain. No UI, IO or visual
verification. No upstream contract delta. Continue ME05 after this commit.
