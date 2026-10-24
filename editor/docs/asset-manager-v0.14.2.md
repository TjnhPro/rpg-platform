# AM03 — optional exact browser categories

Parent0071f3d481d32f939b3ac8391cc27fed8b5d0d5a; primary owner Editor.
asset-manager-category.ts adds three root names: assetBrowserCategories,
describeAssetBrowserCategory and AssetBrowserCategoryResult. Closed result union
reports valid/category/authored or invalid/INVALID_BROWSER_CATEGORY. Malformed
AssetDefinition still follows its canonical snapshot error contract. Declarations
emitted by genuine build; no AssetDefinition schema/owner edits, dependency or UI.

The six default display filters are immutable value/label records. Optional exact
metadata.editorBrowserCategory is absent -> uncategorized/authored=false without
injection; explicit nonblank string retains case and whitespace verbatim. Built-ins
are lowercase; Player is an extension distinct from player. Invalid explicit type
or all-whitespace string gives invalid, never guessed from resource kind/path.
Read through readAssetDefinitionSnapshot preserves all other portable metadata.

Finite API observation exit0: image+player, text+item, absent image, extension Player,
invalid numeric category. Every source definition unchanged; nested vendor metadata
and exact category roundtripped. check/scope/Editor-with-consumers verify exit0,
architecture211, UI11/3 zero errors/manual warnings; TS/Vite passed. Existing chunk/
DEP0190 warnings remain. API_OBSERVED / IO_NOT_VERIFIED / UI_NOT_VERIFIED /
VISUAL_NOT_VERIFIED. No tests, migration, inference or next capability. Next AM04.
