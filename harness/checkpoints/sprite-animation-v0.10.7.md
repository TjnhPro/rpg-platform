# v0.10.7 SA08 — Visual Instance frame binding

**IMPLEMENTED_LIVE_BINDING / FINITE_BROWSER_PIXEL_OBSERVATIONS.**
This is not Phase10 MVP_PASS or Developer/product acceptance.

## Delta preflight and scope

Previous checkpoint/base: `428554a919968157fc78ace2254aa1accf26f2be` (SA07).
Main baseline: `78dc4a9d14288df33ca46b3af4d23d09ceef9b82`. Same branch
feat/sprite-directional-animation-v0.10 and open Draft
[PR10](https://github.com/TjnhPro/rpg-platform/pull/10). The containing commit's
full SHA and actual exact-head CI are recorded in that PR ledger after push.
Preexisting untracked .mcp.json is excluded.

Delta-focused preflight inspected root/Render/consumer AGENTS, architecture,
foundation, Harness ownership/contracts/workflow/verification/failures and SA07
source/emitted APIs. Actual Phase8 visual-scene resource retention, transaction,
transform/layout/order/lifetime and Phase6 frame/invalidation plus Phase7 atlas
geometry/view/cache/session lifecycle were inspected. Phase8/9 are present in
this checkout, rather than presumed from the task's historical baseline note.

Canonical primary owner: runtime-render. Editor/Client are unchanged public
compilation consumers. No external L1/L2 APIs needed or imported. The supplied
task authorizes this additive binding seam. No Engine/Server, dependencies,
schema, packages, foundation, build/CI configuration or new production project.
Scope: new Render adapter/root exports, owner-local Phase8 atomic transaction and
instance-end subscription, API/task docs, this checkpoint and guidance.

## Contract delta

Four additive root symbols (factory plus three portable types), zero removed or
changed old exports. The [API document](../../runtime-render/docs/sprite-animation-v0.10.7.md)
defines exact admission, borrowed versus retained rights, typed rejection versus
canonical thrown diagnostics, pending behavior, repeat sync, replacement/unbind
and native/cleanup failure limitations. The internal Phase8 transaction/lifecycle
helpers are not exported from the public root.

One existing playback/instance; no renderer/Scene/cache/clock duplicate. Current
Phase7 geometry/view and SA07 alignment feed Phase8 resource+transform+layout
commit together. Compatible means an existing identity-local-TRS transform with
the same converted authored ground offset. Other local TRS is explicitly rejected,
not silently reinterpreted. Placement, attachment, order/depth/visibility survive.
Host advances and draws; successful sync invalidates canonical Phase6 demand.

## Actual verification

| Command / audit | Observed result |
| --- | --- |
| node harness/cli.mjs check | exit0, ARCH_CHECK_PASS165 JS/TS sources |
| node harness/cli.mjs scope --projects runtime-render --allow-infra | exit0, SCOPE_PASS; only scoped files committed |
| node harness/cli.mjs verify --projects runtime-render --with-consumers | exit0, genuine Render/Editor/Client BUILD_PASS; no failed/unconfigured builds |
| npx tsc -p .artifacts/sprite-animation-v0.10.7-tsconfig.json | exit0, strict ES2022/NodeNext public-root consumer, types:[], no DOM |
| node .artifacts/sprite-animation-v0.10.7-public-audit.mjs | exit0; emitted Render267->271 (+4), Editor138/Client0 unchanged; zero old exports removed/changed |
| git diff --check | exit0 |

No automated tests, runners, matrices or dependencies added/run. Existing Harness
Node DEP0190 warning is nonfatal. Exact-head CI follows commit in PR ledger;
previous SA07 workflows are not evidence for this checkpoint.

## Finite manual browser observations

Local disposable HTTP host and Playwright CLI operated actual Chrome, two actual
640x480 graphics targets displayed at320x240 CSS pixels, using emitted Render
public root only. These are explicit manual operations and screenshots, no test
suite/assertion matrix. Source read-only from sibling
../jx1-manager-editor/data/asset-sources/monster/ani063/Attack1_0.{tpsheet,png}.
Metadata888 bytes SHA256
`fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7`;
PNG12270 bytes SHA256
`f31783508fe55cc39a421b9f3505503a831d7727605c1f2278e4a690585d3cd2`,128x256.
Real Phase7 provider/parser/cache, PNG decode and per-session GPU upload. No
fabricated assets, crop/upload-per-frame, sibling edits or source redistribution.

Explicit host clip uses original frames0000/0002 at125ms repeat. Eight slots
explicitly repeat that sequence solely to construct valid playback, not to claim
eight distinct artwork directions. Explicit numeric anchors(12,50)/(13,49),
pivot(12,50), offset0, ratios1, right/down plane, placement(160,180). These are
host-authored numerical examples, not artist/anatomical-foot verification.

| INPUT | EXPECTED | OBSERVED |
| --- | --- | --- |
| sync before page becomes usable | No placeholder or draw success | FRAME_NOT_READY |
| Usable original page, frame0000; host renderFrame | Existing instance gets real frame | bound, subresource0000, submitted; screenshot visibly shows original sprite |
| Explicit advance125 then sync/draw | Different frame, same instance/world | subresource0002; actor-0 ordinal0 unchanged, placement/attachment(160,180); visible changed posture in screenshot |
| Differing frame dimensions/anchors | Adjust origin/layout only | origins(148,130)->(147,131); layouts32x56->31x55; actors/order7, depth9, visibility true unchanged |
| Frame change | Reuse original page right, invalidate without scheduling | provider reads2, sourceJobs1, uploadCalls2, cpuEntries1/gpuEntries2 unchanged across update; demand true before explicit draw, false afterward |
| Wrong revision, null authored origin, other-session lease | No partial overwrite | ATLAS_REVISION_MISMATCH, FRAME_ORIGIN_UNAVAILABLE, branded CONTEXT_MISMATCH; previous frame0002, transform/layout/snapshot identity unchanged; demand false |
| Release host lease then attempt sync | Reject new admission, retain existing instance usage | FRAME_NOT_READY; previous0002 still bound, leases3->2 |
| Second session/independent playback with its own lease | Separate GPU rights and selected frames | different session symbols, GPU entries2; first0002/second0000, both canvases visibly show sprites; no additional upload |
| replacePlayback, explicit advance125, sync on session2 | Retain instance, select replacement frame | second0002; first unbind twice leaves second0002 and its leases usable; gpuEntries1/leases2, borrowed first playback still playing |
| Dispose replacement playback; end session | Explicit terminal rejection, no resurrection | PLAYBACK_DISPOSED then BINDING_DISPOSED |
| Drain host leases/scenes/sessions/cache | Owned logical usage ends | disposed cache, cpuEntries0/gpuEntries0/leases0, cleanupFailed:false |

Screenshots inspected locally: .artifacts/sa08-frame0000.png,
sa08-frame0002.png and sa08-two-sessions.png. They are local observation artifacts,
not committed portable evidence. Console had only favicon.ico404, no runtime
warning. One manual cleanup invocation initially used a nonexistent disposal
function; it threw without disposal, then canonical playback dispose command was
used and cleanup observations above were obtained.

NOT_OBSERVED: native context-loss event/injected cleanup failure, extreme numeric
inputs, arbitrary local TRS, camera-bound animation, artistic ground contact,
eight real artwork facings, mounted Editor/Client animation flow, GPU-memory
reclamation or gameplay. Native texture objects are deliberately inaccessible;
session-scoped cache diagnostics, cross-session rejection and two drawn targets
are observed rather than direct native-handle inspection. Frame submission alone
is not pixel evidence; the separate inspected screenshots supply finite pixels.

## Handoff

No current SA08 dependency blocker. v0.10.8 multi-instance isolation remains a
separate supplied task; no speculative next implementation. Phase10 visual MVP,
complete eight-way content and Developer acceptance remain open. No merge/tag/
publish/release. Rollback is this additive checkpoint commit, with no persisted
document/schema migration.
