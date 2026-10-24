# v0.11.11 — VE12 Minimal Working Visual Effect MVP audit

2026-10-24 Asia/Bangkok. **PARTIAL / VISUAL_NOT_VERIFIED; not MVP_PASS.**
Branch `feat/visual-effect-playback-v0.11`, Draft PR11. Prior checkpoint HEAD
`a3892113647ba123670c53350840b72ae376583b`; phase main base
`aceea67f95cb309bdd06f1d6193767bfa06f42ce`. The containing commit identifies this
audit; exact-head remote CI is recorded on PR11. No merge/tag/release.

## Ownership and actual prerequisites

Runtime Render remains the canonical behavior owner. Editor and Client consume
its public root; Harness owns this evidence. This checkpoint changes Harness
documentation/evidence only, with zero production, dependency or public API delta.
No L1/L2 API is needed or modified. No architecture extension is requested.
Route returned no reliable keyword hint; source ownership decides scope.

Actual Render source/root and emitted declarations provide Phase7 source loading,
atlas resolution, cache/leases; Phase8 session-scoped visual membership/resource
binding/layers/depth; Phase9 camera; Phase10 single-sequence playback and binding
(approved U1). Existing Phase11 effect creation, timed-repeat, placement,
attachment and frame synchronization compose those capabilities. They are not
absent dependencies. All five public declaration inventories match prior HEAD:
Render339, Editor138, Client/Engine/Server0; no additions/removals/changes.

`advanceVisualEffectInstance` admits min(delta, duration-elapsed) while playing;
pause uses the canonical playback no-op, completion retires through canonical
membership cleanup. This is **source audit**, not live effect-duration evidence.
Existing Editor/Client browser hosts cover once/repeat preview and intents. They
do not themselves provide a completed combined VE12 Impact/Aura/Ground scene.
No second player, clock, renderer, fake graphics session or sample asset was added.

## Asset audit and blocker

Real local source pair: sibling
`jx1-manager-editor/data/asset-sources/monster/ani063/Attack1_0.{png,tpsheet}`.
Read-only shell inspection and canonical metadata parsing succeeded:

| File | SHA256 |
| --- | --- |
| PNG,128x256 | f31783508fe55cc39a421b9f3505503a831d7727605c1f2278e4a690585d3cd2 |
| TPSheet | fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7 |

Manual descriptor `ve12/attack`, source IDs metadata/index0 and image/index1,
page p0/Attack1_0.png. Explicit ordered track0000,0002 at125ms/frame; no inferred
artist FPS/direction. Canonical top-left rectangles are (78,1,32,56) and
(71,59,31,55), half-open; rotation none, trim/sourceSize null. Page layout is
texturepacker-unity-bottom-left. Sample anchor/pivot12,50 is an explicit
frame-local inspection choice, not verified artist ground contact. These are
monster frames, not verified Impact/Aura/Ground artwork.

The previous checkpoint's actual browser chooser rejected that sibling path:
`outside allowed roots`; only this workspace was allowed. It was not retried or
circumvented here through a media route, copy or alternate browser transfer.
The committed scene-mvp-assets PNGs are procedural samples, not a verified VFX
track; the sprite-animation manifest lists external source references, not local
PNG bytes. Committed evidence screenshots are not source textures. Thus no
eligible in-workspace real VFX atlas was found for this required pixel proof.

Minimum unblock: a real authorized atlas pair accessible to the browser, with
explicit track/frame-origin evidence (or a legitimate user browser file grant).
Then mount and observe the combined scene through existing Render APIs. No
architecture decision or new gameplay contract is needed. VE12 cannot be called
complete and VE13 closure must not treat this audit as a passed MVP.

## Finite public-root observations

Executed a finite Node manual consumer of `@rpg-platform/runtime-render`; no DOM,
GPU, mocks, runner or automatic test suite. Committed raw receipt:
[CPU observations](evidence/visual-effect-v0.11.11/cpu-observed.json).
Local reproduction source is `.artifacts/ve12/observe.mjs` (ignored tooling).
PNG was inspected for identity/dimensions only, never uploaded or drawn.

| INPUT | EXPECTED | OBSERVED |
| --- | --- | --- |
| Canonical parse + resolve exact pair and two addresses | Real metadata frames resolve | resolved; resourceLoading NOT_PERFORMED |
| Two independent neutral playbacks; play then125ms each | Select0002 | Both frame1/0002 at125ms |
| Pause repeat; advance once125ms and repeat1000ms | Once completes, repeat freezes | Once completed250ms; repeat paused125ms/0002 |
| Resume repeat +125ms | Repeat wraps independently | Playing elapsed250ms, frame0/0000; once unchanged |
| Stop repeat then play same clip | Reset then restart | stopped0 then playing0/0000 |

These observations prove only CPU sequence selection/transport, not effect
instance retirement, admitted duration, real distinct pixels or GPU cleanup.

## Required browser repro and unobserved cases

Existing Client repro: build Client, compile
`game-client/manual/vfx.tsconfig.json`, run `node game-client/manual/vfx-host.mjs`,
open localhost8782, select original pair, Mount. Existing Editor repro: compile
`editor/manual/vfx-preview.tsconfig.json`, run its vfx-preview-host.mjs with an
authorized asset directory and open localhost8780. Existing Editor media reader
must not be used to evade the denied browser grant. Client runbook documents
neutral intents, Step125, target removal and terminal Close.

After asset access is legitimately available, a finite manual public-root scene
must perform the following. This is a repro specification, **not executed evidence**:

| INPUT | EXPECTED | OBSERVED / limitation |
| --- | --- | --- |
| One Phase6 session/Phase8 scene, Player + second visual, Phase9 camera, real Phase7 leases | Actual sprites in scene | NOT OBSERVED in VE12 |
| World Impact play,0/125/250ms with explicit two real frames | Two pixel states then no drawable | CPU selection only; disappearance VISUAL_NOT_VERIFIED |
| Attached repeat Aura offset35,0; move Player110,170 to140,180; delete target | Follows then remove-effect cleanup | NOT OBSERVED |
| Fixed Ground timed-repeat duration3000; advance1000; pause+1000; resume+1999;+1;+500 | Elapsed1000 stays paused,2999 live,3000 terminal; no late revival | NOT OBSERVED; integer admitted-time tolerance0ms; no wall-clock deadline claim |
| Pause Ground while Aura advances; stop/restart Aura | Independent state and budget | Sequence transport observed only; effect lifetimes NOT OBSERVED |
| Move Player; pan/zoom camera; inspect anchor, world position, layers/depth | World/authored positions preserved; correct alignment/order | NOT OBSERVED |
| Share atlas leases; retire Impact while Aura lives | No upload each frame or premature release | NOT OBSERVED |
| Remove target; dispose scene/session; resolve delayed acquisition | No orphan drawable or revived lease | NOT OBSERVED |
| Independent Editor/Client sessions; close one | Other session texture remains usable | NOT OBSERVED |

Capture actual INPUT/EXPECTED/OBSERVED receipts and human pixel inspection for
each case after unblock. A submitted frame never substitutes for visible pixels.
No claim about native GPU reclamation, gameplay integration or Developer acceptance.

## Actual automatic gates

- `node harness/cli.mjs check`: exit0, ARCH_CHECK_PASS183 sources.
- `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers`:
  exit0, all three genuine builds pass, none unconfigured.
- `npm run build -- --force`: exit0, all five workspace project references built.
- Strict Editor and Client manual public consumers: both tsc exit0, skipLibCheck false.
- Five-root emitted declaration audit: exit0; no delta from prior checkpoint.
- Scope with runtime-render and infra, staged whitespace audit: recorded before commit.

Existing Harness DEP0190 warning remains nonfatal. No historic suites or tests run.
This checkpoint preserves the requested audit and exact blocker, not a metadata
substitute claimed as the implemented MVP. Next v0.11.12 requires its task and
must preserve these unresolved visual/functional gaps.
