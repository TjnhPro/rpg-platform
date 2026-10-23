# Editor visual resource host — v0.7.11 / VL17

Optional manual consumer owned by Editor, using package roots only. Render remains
the sole source-load/decode/texture/cache implementation. No public API extension,
Scene renderer, second parser, asset browser, test runner or automated assertions.

From the repository root after building the workspace:

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM --rootDir editor/manual --outDir .artifacts/editor-resource-manual editor/manual/editor-visual-resource.mts
python -m http.server 8000 --bind 127.0.0.1
```

Serve only a trusted local checkout and open
`http://127.0.0.1:8000/editor/manual/editor-visual-resource.html` manually.
The import map resolves the built package roots and installed foundations; Editor
does not import Three. The server command is a developer tool, not product storage.

The authored sample uses existing Asset catalog/reference, Scene identity and
Document envelope/session factories. Its `manual:visual-resource` content groups
those values solely for inspection, without declaring a new persisted content
schema. The document is explicitly unsaved (revision1, dirty=true). No save/load
receipt is fabricated. Preview state, caches, provider and leases stay outside it.

Open resolves the reference, calls `describeResolvedVisualAsset`, then the unchanged
metadata-only `prepareVisualResource`; neither operation reads bytes. A real native
graphics session and Render cache lease perform PNG acquisition/decode/upload.
The fixed allowlist authorizes only this project's image source at index0 and the
committed original CC0 76-byte 2x2 PNG. Bytes are streamed with a 4096-byte ceiling,
hashed for the observed revision and admitted by Render's decode limits (dimension4,
pixels16). Expected SHA256:
`e9aa41812d69aa8ebbee3fb351fede258f2a159c4a547b3187ee54184dea0b79`.
No arbitrary authored locator becomes fetch permission. Missing-source mode maps
only an explicit fixed unavailable URL; permission-denied mode performs no read.

Manual inspection steps (read actual trace, not projected success):

- Open PNG: inspect `resource-outcome`, actual source/decode/texture failure or
  usable state and cache counters. No sprite is drawn or displayed by this demo.
- Replace PNG and close: inspect lease -> cache -> graphics release order and
  terminal cleanup flags. Cleanup uncertainty quarantines replacement.
- Missing asset: inspect canonical unresolved reason before graphics acquisition.
  Missing source and denied permission: inspect Render's source failure diagnostic.
  Compare authored sameEnvelope/content/dirty/revision fields before and after.
- Hold source read: open, wait for `authorized-source-read-entered`, close or
  replace/unmount, then deliver held reads. Inspect the terminal state and absence
  of new adoption; replacing graphics waits for any earlier acquisition to drain,
  independently of pending provider IO. Hold is an explicit scheduling control,
  never a fake decoder/context/result.
- Unmount during graphics acquisition; any eventual session is disposed. Unmount
  is terminal for that host. Page exit also unmounts and releases held reads;
  browser shutdown itself supplies no cleanup receipt.

Provider IO cannot be physically cancelled by these APIs; revoked leases prevent
late adoption while host reads may finish. Every open has a separate provider
scope/cache; cross-preview reuse is deliberately not introduced. Cleanup flags are
observations, never GPU-memory or leak-free proof. Unknown exceptions are withheld,
never reclassified from their messages.

This checkpoint selects PNG, the currently supported Editor image adapter. No
atlas parsing or frame resolution is duplicated here, and no `.tpsheet` sample is
invented. Invalid-atlas preview preservation is **NOT_EXECUTED**; Editor atlas
authoring/adapter support and phase-level visual acceptance remain future evidence.

**Current evidence:** strict compile and finite headless metadata observation only;
browser **NOT_EXECUTED**, native acquire/decode/upload/release **NOT_VERIFIED**.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED / TPSHEET_NOT_VERIFIED**.
Developer owns functional/manual acceptance.
