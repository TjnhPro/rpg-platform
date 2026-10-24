# AM09 — Render-owned static preview

Editor adds createAssetPreviewController and four readonly root types. One
controller borrows an exclusive preview RenderVisualScene from the existing
viewport session; it never creates/disposes a session/cache or owns frame timing.
Host acquire receives original project root, descriptor, exact image source index
and explicit content revision, and must return a fresh canonical Render lease from
that exact authorized provider/session. Host supplies explicit transform/layout;
Render validates/captures them synchronously before IO. No camera/DPR math, decoder,
texture cache, Three import, authored Scene or Document mutation.

Current selection resolves through Phase2/describeResolvedVisualAsset. Text and
missing image sources stay unsupported. Pending completions have epoch and live
project/catalog checks. Selection changes clear owned instance and pending lease
synchronously through an internal AM08 observer (not a root API). Rendering binds a
retained Render right then releases the acquisition right. Failure quarantines
cleanup uncertainty; dispose is terminal/idempotent and drains late completion.
getSnapshot probes live context/catalog and binding, not just historical ready.
Host MUST dispose before active-project replacement or viewport unmount; Phase13
has no session-change subscription to magically observe arbitrary external closure.
Catalog adoption is detected on snapshot read/await completion. No background poll.

Finite manual browser observation on 2026-10-24 via Vite and existing
mountEditorViewport content hooks, using root package implementations in one realm:
real previously authorized project PNG transferred from the trusted Node host,
236 bytes SHA256 2483022fb684d52f0054bf6baf4dc15d5a867a749a7828f89afbb51c4637cb2f.
The finite transfer is not a deployed browser filesystem bridge. Initial manual
provider incorrectly compared captured scope object identity and was denied; after
using exact providerId/auth-generation fields, Render reported ready, usable Scene
binding at that exact revision, sourceJobs1/uploadCalls1/CPU1/GPU1/leases1. Acquisition
lease released while the Scene retained its own independent right. Viewport recorded
4 submissions, invalidation false, graphics ready. No pixel screenshot/readback was
inspected: VISUAL_NOT_VERIFIED, not a visible-image acceptance claim.

Selecting metadata Item returned unsupported/NON_VISUAL_KIND and CPU/GPU/leases0.
Starting image preview then clearing selection before await finished returned idle,
instances0 and no late binding. Explicit controller/cache disposal, context closure
and host unmount ended graphics disposed with cleanupFailed false and zero entries.
This is finite native browser/API evidence, not a generated test suite or full UI MVP.

First build failed on TS2367 async closure narrowing; corrected and final genuine
check/scope/verify exit0, architecture218/UI11/3 zero errors/manual warnings, TS/Vite.
Existing chunk/DEP0190 warnings remain. Five additive root symbols, AM08 internal
observer only; all canonical Phase2/5/13/Render source unchanged. AM10 must address
the source-backed active Project capability sharing gate before UI wiring.
