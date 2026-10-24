# ME05 — layers

Parent c7b9bbf. Editor map-layers.ts adds addMapLayer/updateMapLayer/
reorderMapLayers/removeMapLayer/describeMapLayers; profile reads enforce map-owned
classification-to-layer role references. Keys stable; reorder requires complete
permutation; removal refuses all occupied layers including unrelated objects.
Render requests use its public LayerInput/InstanceOrder; no GPU sorting or source
change. Visibility edits metadata only, not object order/membership.

Finite Node observations: background priority0, tiles priority1/hidden; object array
and content vendor metadata preserved. Duplicate key rejected editorMap.layers;
unknown permutation key MISSING_MAP_LAYER. With canonical captured membership,
occupied removal MAP_LAYER_IN_USE and role change invalid:MAP_LAYER_ROLE_MISMATCH.
An initial deliberately incomplete raw entry was rejected by canonical Scene
profile admission before layer checks. No normalization of loaded data.
check/scope/verify exit0 architecture227, UI14/3, TS/Vite. No UI/IO/pixel evidence.
No upstream delta; next ME06.
