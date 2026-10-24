# AM07 — readonly Inspector

Editor adds inspectManagedAsset/AssetInspectorResult. An explicit nullable reference
is resolved against the current bound catalog through Phase2 diagnostics; no caller
definition is trusted as the selected object. Projection exposes the immutable
canonical definition (identity/sourceId/kind/full metadata/ordered sources/direct
dependencies), category result and direct dependency diagnostics. No traversal,
editing, IO, root capability, host path, GPU handle or computed gameplay fields.
Authored extension strings remain data, never interpreted as capabilities.

States: not-selected, resolved, removed (missing target, not a deletion-history
claim), foreign-project, unresolved (kind/subresource), invalid-reference and
invalid-metadata (including invalid browser category). Every state explicitly has
fileExistence NOT_CHECKED. Unknown host exceptions from canonical owners propagate.

Finite manual API CLI exit0: image hero retained sourceId0001, nested unknown
vendor array and image source; text Item retained metadata/no sources; null,
missing, foreign, wrong-kind and numeric category yielded their classified states.
No physical file or visual/UI claim. check/scope/verify exit0; architecture216,
UI11/3 zero errors/manual warnings; genuine TS/Vite pass, existing chunk/DEP0190
warnings. Two additive root symbols, no canonical owner edits or generated tests.
