# Finite in-flight PNG consumer — v0.7.8

Optional public Render-root consumer, not part of CI or a test suite. No assertions,
expected comparisons, runner, browser automation, benchmark or performance claim.
After workspace build, from repository root:

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM --rootDir editor/manual --outDir .artifacts/inflight-manual editor/manual/inflight-png.mts
node editor/manual/inflight-png-node.mjs
```

The fixed read-only host opens ONLY committed png-sample/rgba-2x2.png, bounds read
at4096 bytes, checks unchanged size/mtime/ctime, and computes actual SHA256 revision.
Original CC0 sample:76 bytes,2x2, SHA256
`e9aa41812d69aa8ebbee3fb351fede258f2a159c4a547b3187ee54184dea0b79`.
No original source modified. Separate bootstrap read establishes expected revision.
Each provider success performs another genuine bounded file read; counters label
provider dispatches separately from total file reads.

Finite trace observed on Node24.18.0:

- Three matching waiters ->one provider read/one actual sample read for that job.
  First waiter released immediately; two others still reach decode admission and
  both report DECODER_UNAVAILABLE. This proves source flow/failure fanout, not a
  successful bitmap or one native decode. No fake decoder installed on Node.
- Same key after settlement performs another read (counter1->2); no settled cache.
- Different maxPixels/revision ->three reads on one provider, other provider ->one
  independent read. Wrong expected revision ->REVISION_MISMATCH before decode.
- Two matching waiters observe the exact same explicit host Error rejection, with
  failed/failure:null snapshots. Retry dispatches another read, counter2, and reaches
  native-decoder-unavailable admission. Retry is not a claimed decode success.
- All owners released ->waiter settles released before gated host finishes. A new
  same-key request and matching waiter share replacement work; late old rejection
  leaves replacement intact. Provider reads2 across abandoned+replacement jobs.
- Scope disposed while source pending ->released outcome; late successful host read
  completes without a new decoded owner.10 actual file reads in the entire finite
  trace, including one separate bootstrap and one late canceled host read.

For a browser with real createImageBitmap, compile as above, serve repository root
using the existing manual HTTP workflow and open editor/manual/inflight-png.html.
Click its explicit Run button once. Host authorizes only the fixed local PNG URL,
bounds response stream and hashes the actual bytes. Consumer temporarily counts
calls to the REAL native decoder while delegating unchanged, then restores it in
finally. The first matching trio's completion trace should be manually inspected
alongside distinct waiter IDs, release of one image, survivor state and last close.
No shim, fake bitmap or native backend replacement is used.

In this run Computer Use inventory returned apps[]/browsers[] and Node has no
native decoder. Browser entry is supplied but NOT_EXECUTED. Successful shared native
decode, independently uploadable aliases, late bitmap close/close failure and GPU
session-disposal timing remain NOT_OBSERVED. This is an explicit evidence gap,
not FUNCTION_PASS. The demo displays trace only, never a sprite/GPU frame.

Host integration is explicit: release the pending waiter on host/session disposal;
use scope.dispose for all pending work at shutdown; release settled images/owners
separately. Upload only through existing Render uploadPngTexture and catch failures
from a disposed session. Scope itself accepts no session and schedules no upload.
See [contract](../../runtime-render/docs/visual-loading-v0.7.8.md).
FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED remain.
