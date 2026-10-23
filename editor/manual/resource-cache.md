# Resource cache — finite manual consumer v0.7.9

This is an optional public-root manual consumer. No assertions, runner, browser
automation, benchmark or memory savings claim. From repo root after workspace build:

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM --rootDir editor/manual --outDir .artifacts/cache-manual editor/manual/resource-cache.mts
```

Serve the repository root using the existing manual localhost workflow, open
`editor/manual/resource-cache.html` and explicitly click Run once. Three explicit
64x64 canvases acquire three real sessions through the canonical Render API.
The host authorizes only fixed local png-sample/rgba-2x2.png, bounds the stream at
4096 bytes and hashes actual bytes for expected revision. Committed original CC0
sample:76 bytes,2x2,SHA256
`e9aa41812d69aa8ebbee3fb351fede258f2a159c4a547b3187ee54184dea0b79`.
No source changes or proprietary datasets. A separate bootstrap fetch establishes
revision. The consumer temporarily counts REAL createImageBitmap calls while
delegating unchanged and restores finally. No shim/mock decoder or GPU is used.

Inspect trace manually:

- 100 logical references in session A: independent lease IDs, shared resourceId,
  provider/native decode counts and uploadCalls. Read actual outcomes; failed
  requests cannot establish one successful decode/upload.
- Acquire B after A settles: its separate GPU entry and same retained CPU entry.
- Release first A twice; inspect second A, then release remaining A owners.
- Reacquire A while B owns CPU, then dispose A with a live lease; inspect A
  invalidation, B survival and rejection of another disposed-A acquisition.
- Last B release: zero-entry eligibility and actual texture cleanup observation.
- A gated real source read in C: dispose C before allowing host response; inspect
  invalidated result and no subsequent upload. Provider cannot physically abort IO.
- Finally every lease/cache/session is explicitly released. cleanupFailed must be
  reported if observed; counters are not GPU-memory measurements or display proof.

**This run: compiled, browser entry NOT_EXECUTED.** Node has no native decoder or
real canvas/session. A finite headless public-root observation inspected empty
cache construction/disposal, invalid entry bounds and rejection of a foreign
session before source IO (providerReads0). It did not create 100 usable references,
decode an image or exercise native cleanup. Do not substitute it for the browser
trace above. No canvas pixels/sprite are inspected by this demo.

[Contract and policy](../../runtime-render/docs/visual-loading-v0.7.9.md).
FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED; Developer owns manual acceptance.
