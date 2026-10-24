# U1 — approved Phase10 single-sequence live seam

**U1 IMPLEMENTED. Neutral playback/binding dependency delivered.**
This is a separate approved upstream contract checkpoint, not VE03 effect lifecycle.
Phase11/MVP product acceptance remains Developer-owned.

## Authorization, baseline and ownership

Developer explicitly approved additive single-sequence live playback and binding,
reuse of canonical timing/lifecycle/binding, preservation of eight-way semantics,
no second engine/clock/renderer and no Engine/L1/L2/gameplay changes. Work stays on
`feat/visual-effect-playback-v0.11`, PR11. Prior VE02 HEAD:
`77b0191f4d0e574d8eb430a0663bfb281e536ba2`; phase/main base:
`aceea67f95cb309bdd06f1d6193767bfa06f42ce`. Date2026-10-24 Asia/Bangkok.
The containing commit SHA and exact-head push/PR CI live in the PR ledger.

Canonical primary owner **runtime-render**, existing Phase10 timing/playback/
binding source and index only, plus Render/Harness documentation. Editor and
Game Client are unchanged build consumers. Engine/Server, external L1/L2, gameplay
contracts, dependency/pin/package/CI configuration are unchanged. No foundation
calls, schema change, sixth project, asset catalog or VFX-private transport.
Preflight used current root/project guidance, architecture, ownership/contracts,
VE01/VE02 and actual owner source/public declarations; routing hints do not decide
the owner. Authorization resolves the previously documented U1 approval gate.

## Implementation and public compatibility

[Upstream contract delta](../../runtime-render/docs/sprite-animation-u1.md):
12 additive roots, Render280 →292; Editor138, Client/Engine/Server0 unchanged.
Compiler-generated declaration audit against exact VE02 found zero removed or
changed old root declarations across all five projects. New strict emitted-root
consumer creates neutral playback directly from VE02 definition.clip and compiles
neutral sync/binding/result APIs without DOM or deep imports.

One common private transport retains actual eight-way or timed-clip metadata;
one sampler and transition path, mode-specific issued readers. Neutral direction
is null, not0 or eight identical slots. Canonical timed clips are shared by weak
provenance; structural data is recaptured and derived fields checked. Both binding
factories share one generic lifecycle, occupancy, frame admission/transaction and
cleanup implementation. Existing eight-way declarations/unions remain unchanged.

## Observed public-root CPU behavior

Read original ani063/Attack1_0.tpsheet,888 bytes, SHA256
`fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7` through
Phase7, then release source. Exact frames0012/0000/0012 at125ms intervals.
Ignored `.artifacts/u1/observations.json` preserves input/output, not a test suite.

- Starts stopped0/direction:null. Play then125ms selects0000 at index1.
- Pause plus1000ms holds elapsed125; resume plus1000ms clamps once at375ms,
  index2/0012/completedNow:true; another advance does not emit completion again.
- Replay resets0. Infinity delta and setDirection reject without state mutation.
- Second handle stays stopped0; copied clip mutation does not alter captured frame.
  Forged/cross-kind handles, duplicate clip IDs and incorrect durationMs reject.
- Stop0; dispose/repeated dispose retain terminal readback; later advance rejects.
  Repeat1000ms keeps logical1000, sampled250, index2 with no completion.
- Manual legacy trace at baseline versus current: equal after excluding fresh
  symbol ID. Steps cover initial/play/125/pause/500/setDirection5/resume/1000/
  replay/stop/dispose/repeated dispose. Baseline modules were emitted from exact
  Git source with TypeScript, not a rewritten transport. This finite observation
  does not establish exhaustive behavioral equivalence for every input.

## Real browser binding and pixels

Manual Chrome session via installed playwright CLI skill; no Playwright test
runner, generated test file or fake asset. Optional ignored local host adapts the
prior SA08 observation to a real two-frame neutral clip0000/0002. Original PNG:
12270 bytes, SHA256
`f31783508fe55cc39a421b9f3505503a831d7727605c1f2278e4a690585d3cd2`.
Public emitted Render root is served with actual Three.js backend. Explicit
host-authored numeric anchors; no artist-ground correctness claim.

- Before lease ready: FRAME_NOT_READY. Then usable borrowed lease admitted frame0000,
  existing Phase6 submission succeeded; original sprite pixels seen in screenshot.
- Explicit125ms → frame0002; sync bound same instance and submitted. Before/after
  screenshots visually inspected: distinct original sprite frames, same placement.
  No repeat upload per frame: provider reads remained2, cache GPU entries2 for
  two independent sessions. This is a finite resource observation, not a profiler.
- Wrong atlas symbol → ATLAS_REVISION_MISMATCH; previous0002 and placement retained.
  Occupied instance rejects another binding. Replacement holds last frame until sync,
  then admits replacement0000. Unbind twice clears own usage; closed sync returns
  BINDING_DISPOSED, borrowed playback still playing and both host leases usable.
- Rebind succeeds; instance removal closes binding. Playback and both host leases
  remain usable; ending sessionA preserves sessionB's lease. Explicit host disposal
  and lease release end both sessions/cache; final cache state disposed.
- Browser console had only an irrelevant favicon404; no runtime exception observed.
  Browser closed, local server stopped, CLI output/screenshots moved into ignored
  `.artifacts/u1`; no active product host or borrowed resource intentionally retained.

Local evidence: browser-initial.txt, browser-advance.txt, browser-lifecycle.txt,
u1-before.png/u1-after.png. These show animation/binding only, not a VFX instance,
attachment, effect lifetime, real one-shot effect artwork or final Phase11 MVP.
No claim of native GPU memory reclamation or universal artist-origin correctness.

## Actual gates

| Command / observation | Result |
| --- | --- |
| `node harness/cli.mjs check` | Exit0 ARCH_CHECK_PASS175 sources |
| `node harness/cli.mjs scope --projects runtime-render --allow-infra` | Exit0 SCOPE_PASS |
| `node harness/cli.mjs verify --projects runtime-render --with-consumers` | Final exit0, genuine BUILD_PASS Render/Editor/Client |
| `node .artifacts/u1/public-audit.mjs` | Exit0;280→292, no old root declaration changes |
| `npx tsc -p .artifacts/u1/tsconfig.json` | Exit0, strict emitted-root ES2022, types[], skipLibCheck:false, no DOM |
| `node .artifacts/u1/observe.mjs` | Exit0, real-source observations above |
| Manual Chrome public-root binding session | Source/pixels/admission/release observations above; closed |
| `git diff --cached --check` | Exit0 |

First build attempt failed on TypeScript reduce inference over the union of
sequence collections; explicit readonly SpriteFrameSequence[] return annotation
fixed it. Final consumer builds all passed; no failed/unconfigured build remains.
Existing Harness DEP0190 warning is nonfatal. No automated tests, historical
exhaustive suites, runners, coverage or CI test matrices added/run. Engine/Server
local builds not rerun; exact-head CI independently builds all five projects.

## Next Phase11 handoff

VE03 can now consume the real neutral handle/binding rather than pad directions or
implement a timer. The VE01 ledger's U1 dependency is satisfied at this checkpoint;
historical VE01/VE02 reports retain baseline-specific evidence. No review pause is
required for subsequent supplied tasks. Next numbered capability is v0.11.2 effect
instance lifecycle; its detailed task has not been supplied in this conversation,
so this upstream commit does not silently substitute the architecture ledger for
that checkpoint's acceptance contract. No merge/release/tag/publish is authorized.
