# v0.7.10 - Finite explicit revision inspection

Optional manual consumer, not a test suite or automatic gate. Uses only the Render
package root and actual native sessions. Compiled, browser NOT_EXECUTED in this run.
No functional/visual or GPU cleanup claim.

```powershell
npm run build -- --force
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM --rootDir editor/manual --outDir .artifacts/cache-revision-manual editor/manual/cache-invalidation.mts
python -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000/editor/manual/cache-invalidation.html manually.
Select real valid PNG A (the committed png-sample/rgba-2x2.png is available) and a
real different PNG B you are authorized to inspect. Files stay in browser memory;
no server upload. Both read budgets are16MiB and native decode bounds8192/16M pixels.
The host computes SHA256 revisions from the actual selected bytes. Same digest
selection asks for different content rather than claiming an update was observed.

Inspect A outcome, superseded-A admission, B outcome and fresh A observation after
B. Run again with valid A and a real malformed/non-PNG B to inspect failure while A
stays owned. There is no invented second sample or fake decoder/session. Successful
A/B GPU states require actual browser execution. The trace releases rights, disposes
cache/session and reports existing terminal graphics diagnostics. A frame/sprite
is not drawn. Counts are ownership/attempts, not memory bytes or completion proof.

Logs omit filenames/paths, input revisions, raw bytes, provider scopes and unknown
error messages. Classifiers return only known fixed codes; unknown is withheld.
Do not paste raw browser exceptions/source descriptors into safe diagnostics.

Atlas metadata remains a separate canonical parser with its existing revision token.
Use existing atlas-metadata/atlas-geometry manual consumers with authorized original
TPSheet input; optionally pass the new fourth AtlasMetadataLimits argument to lower
sheet/total bytes, pages or frames. Never pass an old atlas with a new token as a
successful new snapshot; FRAME_NOT_FOUND/INVALID_FRAME are separate layers.
No new TPSheet sample/format support or browser runtime evidence in this task.
