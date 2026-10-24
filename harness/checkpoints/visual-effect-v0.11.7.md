# v0.11.7 VE08 — VFX Frame & Visual Scene Integration

IMPLEMENTED: selected effect frame → canonical source/atlas validation → U1
binding → existing Phase8 drawable. Finite original-source pixels observed;
full VFX FEATURE_NOT_VERIFIED and remaining VISUAL_NOT_VERIFIED cases below.
Developer acceptance remains pending.

## Baseline, ownership and delta

Date: 2026-10-24 Asia/Bangkok. Branch feat/visual-effect-playback-v0.11, Draft PR11.
Main phase base aceea67f95cb309bdd06f1d6193767bfa06f42ce. Previous VE07 exact HEAD
a1936223c8b92e735e52b98b07fa34d62758c8a8. Containing checkpoint SHA and exact-head
push/PR CI results are recorded in PR11 after commit.

Requested behavior: render canonical selected VFX frames with existing placement,
ordering, camera, invalidation and resource lifetime. Canonical primary owner:
runtime-render. Production edits: visual-effect-instance.ts, shared internal source
validation in visual-effect-definition.ts, root exports and API documentation.
Harness stores task/checkpoint/contract/ownership evidence. Editor/Game Client
unchanged public-contract build consumers. No Engine/Server/L1/L2, authored schema,
dependency/pin/package/CI or external repository edit. No external foundation calls.
Preexisting untracked .mcp.json and ignored artifacts remain excluded.

Delta preflight read root/project AGENTS, ARCHITECTURE, FOUNDATION,
harness/{OWNERSHIP,CONTRACTS,WORKFLOW,VERIFICATION,FAILURES}, prior checkpoint and
current related source/public declarations. Route found no reliable keyword hint;
source establishes Render ownership. Supplied task authorizes this additive seam.
No boundary expansion, missing upstream capability or breaking API required.

Actual dependencies: VE02 source pins/parser provenance; Phase7 resolveAtlasFrame,
resolveAtlasFrameGeometry and createAtlasTextureView through U1/Phase8; Phase10
createSpriteSequenceVisualBinding and the effect's existing playback; Phase8
commitVisualInstanceFrame, resource retention and ordering; Phase9 canonical camera
scene binding and Phase6 demand/submission. No duplicate algorithms or clock.
Only selected geometry resolves during live sync. Internal source validation is
shared with VE02, preserving its full-definition resolver and failure precedence.

Three additive roots, Render327→330: syncVisualEffectFrame,
VisualEffectFrameInput, VisualEffectFrameResult. All prior root declarations
unchanged across five projects; Editor138, Client/Engine/Server0 unchanged.
Strict emitted-root consumer: ES2022/types[]/skipLibCheck:false/no DOM. No Phase10
upstream contract delta. [API/runbook](../../runtime-render/docs/visual-effect-v0.11.7.md)
defines input, selected-versus-committed frame, host sync order and cleanup.

## Finite manual observation — actual pixels

Headed Chrome via installed Playwright CLI, emitted public Render root and actual
Three.js, localhost8798. Two canonical scene/session targets, each320×240, CSS480×360.
Original sources from sibling jx1-manager-editor/data/asset-sources/monster/ani063:

| Source | Bytes | SHA256 |
| --- | --- | --- |
| Attack1_0.tpsheet | 888 | fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7 |
| Attack1_0.png | 12270 | f31783508fe55cc39a421b9f3505503a831d7727605c1f2278e4a690585d3cd2 |

Real source load/parser, real decoded original PNG through canonical cache, no
fake asset or mock. The original monster sprite is deliberately reused as the
manual Effect Instance's image; it is not claimed to be an artist-authored aura.
Selected original addresses0000/0002 at8fps repeat. Explicit frame-local ground
anchor/pivot(12,50), ratio(1,1), right/down world plane; artist-foot/untrimmed layout
is not verified. Actor ordinary Visual Instance uses U1 independently. Effect has
one-level attachment offset(45,0), same actors layer, orders7/8, depth-key9/world-unit.

| Input / expected | Observed |
| --- | --- |
| Initial selected0000 | bound original rectangle(78,1,32,56), visible nonrectangular sprite/transparent surround on canonical canvas |
| Explicit125ms advances to0002 on actor + both effects; sync then submit | distinct original pose visible on all three drawables; exact effect ID, visual handle and resourceId unchanged |
| Frame update resources | CPU entries1/GPU2, leases5, reads2 (metadata+image), uploads2 before/after; one upload per session, not per frame |
| Separate session resource isolation | resourceId inequality true; second session has its own GPU page |
| Advance only | stored world placements unchanged; scene placement from target140,180 plus explicit offset gives effect attachment185,180 |
| Move target to160,170, attachment/frame sync | effect attachment205,170; actor and effect remain spaced45 world units, bound frames retained |
| Bound camera pan(20,-10), zoom1.5 | both actor/effect visibly enlarged and translated together, camera submitted snapshot present, exact stored world records unchanged; other session unchanged |
| Supported ordering/depth | effect stays actors/order8/depth9, actor order7; frame/attachment/camera do not rewrite policy |
| Wrong atlas revision / wrong expected image pin | ATLAS_REVISION_MISMATCH / SOURCE_REVISION_MISMATCH, prior resourceId/frame/transform/layout retained |
| Missing authored alignment / wrong page width129 | FRAME_ORIGIN_UNAVAILABLE / PAGE_DIMENSION_MISMATCH, prior valid state retained |
| Other session lease | canonical CONTEXT_MISMATCH exception, prior valid state retained |
| Real original0000 followed by nonexistent selected key | initial bound; next FRAME_NOT_FOUND, selected missing remains logical125ms while committed0000/resourceId remain exact prior valid state |
| Release host lease then sync | FRAME_NOT_READY, prior retained drawable frame usable; canonical submission still submitted |
| Remove actor target | attached effect removed, scene instances/boundUsages0, cleanupFailed false; other-session effect still created |
| Dispose sessions/host leases/cache | CPU/GPU/leases0, both scene usages0, cleanupFailed false; terminal frame sync reports SESSION_ENDED |

Screenshots manually inspected: ignored .artifacts/ve08/final-frame-0000.png,
final-frame-0002.png, final-follow-camera.png. On the available browser width the
two canvases wrap vertically despite the host's left/right label. Final raw rows:
.artifacts/ve08/final-observations-cli.txt; initial observations kept separately.
Browser console only favicon404; owned browser/server closed. Initial manual host
passed a size plan instead of resize metrics/limits and omitted screen:null; fixed.
A manual move initially passed a readback with extra derived fields; corrected to
the exact transform input. Resource snapshot object identity was initially compared
incorrectly (readback allocates); final observations compare resourceId/frame and
canonical transform/layout instead. Production was unaffected by those host errors.
After internal source-validation extraction, the final build/browser sequence was
repeated; final screenshots/rows refer to that final implementation.

Not observed: artist-approved aura on a production Player class, an end-user Editor/
Client flow, actual multi-page transitions, overlapping-alpha depth reversal cases,
layout/depth native failures, context-loss during native commit or GPU/heap profiler
reclamation. Original alpha surround and pose changes are finite visual evidence,
not complete transparent sorting or MVP acceptance. Authored/gameplay nonmutation
is source-scope evidence, not a running Engine scenario. No continuous loop or
automated behavioral suite was added/run.

## Gates and next handoff

| Command / audit | Actual result |
| --- | --- |
| node harness/cli.mjs check | Exit0 ARCH_CHECK_PASS176 sources |
| node harness/cli.mjs scope --projects runtime-render --allow-infra | Exit0 Render + Harness scope |
| node harness/cli.mjs verify --projects runtime-render --with-consumers | Exit0 BUILD_PASS Render, Editor, Game Client |
| node .artifacts/ve08/public-audit.mjs | Exit0 three additions, zero old root changes |
| npx tsc -p .artifacts/ve08/tsconfig.json | Exit0 strict emitted-root consumer, no DOM |
| git diff --cached --check | Exit0 |

No failed/unconfigured final local builds. Existing Harness DEP0190 warning is
nonfatal. CI receipts at exact SHA are recorded in PR11. No unit/integration/
browser/Playwright/E2E/snapshot/visual-regression suite, runner, coverage, fake
assets or CI matrix added/run. CLI drove finite manual observations only.
Next: v0.11.8 VFX Resource Lifetime & Diagnostics. Detailed task not yet supplied;
no next capability implemented. No routine review pause, merge/tag/publish or
Developer phase acceptance inferred.
