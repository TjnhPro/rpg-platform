# VI11 — v0.16.10

Parent eebbc080e1e4f1354ff3e1025ec74fd30aea5ea6; audited VI10 and canonical Scene replacement, Map save and
PreviewBridge signatures. Editor visual-document-edit/visual-preview + additive
root; strengthens feature selection to require active tracked Scene like saveMap.
No generic Document/Map/Asset/Project/Render source change. No L1/L2 use.
One discriminated property command: bounded codec capture, canonical known-field
operation, original metadata merge limited to editorVisual, complete Map + owned
profile validation, token recheck, ONE replaceContent. Failures preserve revision.
All profiles must be supported before edit/save/preview; unknown unrelated metadata
retained. Host supplies preview defaults, source revision/layout/order/projection;
only authored present properties override. Facing never rotates/selects frames.
Host closes bridge on document/context replacement (including clear binding) to
avoid retaining old rendered content. Applied/diagnosed/removed remain outcomes,
not pixel assertions. Save/Open reuse openMap/saveMap unchanged, preceded by owned
profile validation. Save Scene is independent. Create-only hosts cannot overwrite;
conflict/failed/uncertain use existing persistence diagnostics, invalidate selection.
No fake CAS, retry or new save coordinator. UI/IO_NOT_VERIFIED at this checkpoint.
Next v0.16.11; actual gates below.

Observed exit 0: check, scope editor --allow-infra, verify editor --with-consumers; UI checker clean. Existing chunk/DEP0190 warnings.
