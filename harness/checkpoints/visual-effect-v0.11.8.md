# v0.11.8 VE09 — Resource lifetime and diagnostics

IMPLEMENTED with finite public-root Chrome observations. Developer acceptance
pending; this checkpoint is not Phase11 MVP closure or proof of GPU reclamation.

## Baseline and scope

2026-10-24 Asia/Bangkok, branch feat/visual-effect-playback-v0.11, Draft PR11.
Previous VE08 exact HEAD296d639621c8f087859ed867c563ca07aaf5a06d; phase main base
aceea67f95cb309bdd06f1d6193767bfa06f42ce. Containing commit and exact-head push/PR
CI observations are recorded in PR11 after commit.

Requested behavior: bounded effect work/diagnostics and single owned cleanup path
without revoking shared resource rights. Primary owner runtime-render. Production
edits limited to visual-effect-instance.ts and index.ts; API runbook and Harness
task/checkpoint/contracts/ownership are documentation. Editor/Game Client unchanged
public-contract build consumers. No Engine/Server/L1/L2 edits/calls, dependency,
package, schema, CI or external-repository mutation. Preexisting .mcp.json excluded.

Preflight: root/project AGENTS, ARCHITECTURE, FOUNDATION,
harness/{OWNERSHIP,CONTRACTS,WORKFLOW,VERIFICATION,FAILURES}, VE08 and related
actual source/exported declarations. Route effect resource lifetime diagnostics
gave no reliable hint; source proves Render ownership. This task authorizes the
additive seam; no missing foundational dependency or boundary expansion found.

Audit reused VisualResourceLease/lease snapshots and cache revision/invalidation,
texture release, Phase8 resource retention/releaseEntry/end notification, U1
unbind and playback dispose. Phase7 budgets bound entries, not effect count;
VE09 adds per-scene256 effect admission over canonical membership. No new cache,
pool, clock, decoder, renderer, registry or gameplay semantics.
[Owner contract and full cleanup responsibility table](../../runtime-render/docs/visual-effect-v0.11.8.md).

Nine new Render roots330→339; all previous emitted root declarations unchanged
in all five projects. Editor138 unchanged; Client/Engine/Server0 unchanged.
Strict public-package consumer compilation with ES2022/types[]/no DOM and
skipLibCheck:false passed. Unknown cleanup exceptions in explicit effect
remove/completion now propagate unchanged after all cleanup attempts; broadcast
cleanup remains nonthrowing with sticky uncertainty. Phase7/8 public semantics
and eight-directional animation declarations unchanged. No U1 upstream delta.

## Finite manual observations

Installed Playwright CLI driving headed Chrome, emitted public Render root,
real Three/WebGL2 and canonical resource cache/scene/session on localhost8799.
This is a finite manual scenario, not a suite or test runner. Original sibling
jx1-manager-editor/data/asset-sources/monster/ani063 sources, unchanged:

| File | Bytes | SHA256 |
| --- | --- | --- |
| Attack1_0.tpsheet | 888 | fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7 |
| Attack1_0.png | 12270 | f31783508fe55cc39a421b9f3505503a831d7727605c1f2278e4a690585d3cd2 |

Original frames0000/0002,8fps, explicit authored frame-local anchor/pivot12,50,
ratio1:1, world right/down. Same genuine monster pixels reused as VFX capability
evidence; no claim of artist-authored aura or production Player integration.

| Input / expected | Observed |
| --- | --- |
| Two effects share one session atlas; remove first | peer usable, host lease usable; repeated remove false; same resourceId on diagnostic observations; frame submitted |
| Bind once clip then explicit250ms advance | completedNow true; repeat remove false, peer/lease still usable |
| Delete ordinary visual attachment target | attached effect terminal removed; same terminal snapshot identity on reread; repeat remove false; peer usable |
| Admit255 extra effects in second scene (one already live), attempt257th | active256/inFlight0; ACTIVE_EFFECT_LIMIT; count remains256; remove batch returns count1 |
| Wrong atlas symbol / authored key | ATLAS_REVISION_MISMATCH / ALIGNMENT_FRAME_MISMATCH result records |
| NaN world point | TypeError classified effect-coordinate/INVALID_COORDINATE; no English parsing |
| Host gates actual original PNG read, bind while pending then remove effect, allow real bytes to settle | FRAME_NOT_READY; lease eventually usable; retired sync throws INSTANCE_REMOVED and no rebind; host repeated release leaves released, temporary cache CPU/GPU/leases0 |
| Provider unexpectedly throws original sentinel with SCENE_DISPOSED words | lease result rejects exact same object; unknown/UNKNOWN_FAILURE; host finally removes effect and releases lease/cache; peer usable |
| Safe snapshot with admitted512-character membership key | snapshot/identity frozen; only bounded DTO keys and symbols; same resourceId; no texture/native/DOM capability |
| Stop peer | retained usage usable, membership remains, as intended; restart/frame sync succeeds |
| Real WEBGL_lose_context on second canvas | effect session-ended; disposed scene instances/usages0; releaseAttempts1 before/after repeated remove/session dispose/lease release; lease invalidated |
| Other session after context loss | peer usable, real frame submitted; observed remaining original sprite pixels on first canvas after restart/sync/removal submission |
| Clear remaining scene twice | terminal membership-ended, usages0; releaseAttempts5→6→6; repeat release/cache/session dispose leaves CPU/GPU/leases0 and cleanupFailed false |
| Creation after session disposal | effect-instance/SESSION_UNAVAILABLE |

Ignored local evidence: .artifacts/ve09/{browser.mjs,server.mjs,observe.js,
observation.txt,context-loss.txt,final-cleanup.txt,remaining-peer.png,
public-consumer.mts,public-audit.mjs}, .artifacts/ve09-public-audit.json.
The earlier shared-peer.png predates final post-removal submission and is not
used as evidence of current drawable pixels. remaining-peer.png was inspected.
Console's sole initial error is missing favicon; no product renderer error.

Not observed: real unsupported encoded media/rotated/trimmed asset, injected
native cleanup exception, native GPU memory reclamation, GC collectability,
multi-page live resource changes, context restoration, full Editor/Client VFX
flows or production Player/skill effect integration. Those remain
FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED; no suite, fake asset or native-error
monkeypatch was introduced. Source media/decode failure distinctions are audited
owner result contracts, not claimed executed cases.

## Gates and handoff

- node harness/cli.mjs check — exit0, ARCH_CHECK_PASS176 JS/TS.
- node harness/cli.mjs scope --projects runtime-render --allow-infra — exit0.
- node harness/cli.mjs verify --projects runtime-render --with-consumers — exit0;
  genuine Render, Editor and Game Client builds passed. No unconfigured build.
- Strict emitted-root no-DOM consumer and declaration comparison — exit0.
- git diff --check — exit0.

Harness Node DEP0190 remains a nonfatal existing shell invocation warning.
No exhaustive/historical/unit/integration/E2E/browser test suite was run/added.
Remote push/PR architecture, verify and full-build jobs must match the checkpoint
SHA before claiming CI success; results are recorded in PR11.

Next task is v0.11.9 Editor VFX Preview Integration, not supplied at this point.
No future capability, merge, tag, release or publication performed.
