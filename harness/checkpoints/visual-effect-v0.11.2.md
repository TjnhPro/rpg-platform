# v0.11.2 VE03 — Effect Instance Lifecycle

**IMPLEMENTED: logical admission, identity, membership and terminal removal.**
Finite manual lifecycle observations below; full VFX FEATURE_NOT_VERIFIED,
VISUAL_NOT_VERIFIED / NOT_DRAWN. Developer acceptance remains pending.

## Baseline, preflight and scope

Date: 2026-10-24 Asia/Bangkok. Branch `feat/visual-effect-playback-v0.11`, PR11.
Main phase base `aceea67f95cb309bdd06f1d6193767bfa06f42ce`; previous exact U1 HEAD
`df28c2a059121b77eab01e59c710c4d0c7a4290c`. The containing checkpoint commit SHA
and exact-head push/PR CI links are recorded in the PR ledger after commit.

Requested behavior: independent ephemeral effects owned by canonical Render
scene/session. Primary owner **runtime-render**: new visual-effect-instance.ts,
root exports, private VE02 issuance guard and API documentation. Harness records
task/checkpoint/contracts/ownership. Editor/Game Client are unchanged compatibility
build consumers. Engine/Server/L1/L2, authored Scene/Object definitions, dependency
pins, package configuration and CI are untouched. No external foundation calls.
Preexisting untracked `.mcp.json` and local ignored artifacts are excluded.

Preflight inspected root AGENTS/ARCHITECTURE/FOUNDATION, Render AGENTS,
Harness OWNERSHIP/CONTRACTS/WORKFLOW/VERIFICATION/FAILURES, previous checkpoint and
actual source/public declarations. Route hints do not establish ownership. This
supplied task and VE01 authorize this minimum additive Render seam. No boundary
move or breaking API is required; U1 is implemented and its CI passed at exact HEAD.

Phase8 prerequisite exists in visual-scene.ts: createRenderVisualScene,
add/get/list/removeRenderVisualInstance, getRenderVisualSceneDiagnostics,
clear/dispose and canonical session identity. Existing owner-local
onVisualInstanceEnd/readVisualInstanceFrameState cover independent membership
removal, scene draining and session end without a new public Phase8 contract.
Phase10 U1 supplies createSpriteSequencePlayback/commandSpriteSequencePlayback;
VE02 supplies issued immutable definition.clip. Actual implementation overrides
the task's historical note that these foundations were unconfirmed.

## Delivered contract

[API and ownership contract](../../runtime-render/docs/visual-effect-v0.11.2.md)
defines ten additive roots, opaque symbol IDs, exact provenance, independent
stopped playback, Phase8 metadata membership, idempotent removal, detached frozen
snapshots, clear/dispose, terminal subscriptions and rollback. Live enumeration
comes from Phase8; no parallel VFX scene registry, global singleton, renderer,
resource cache or clock. No transport, advance, attachment, pooling, expiration
or visual binding is added ahead of the next tasks.

Compiler-generated declaration comparison against U1: Render292 → 302,
ten additions; zero changed/removed previous root declarations across all five
projects. Editor138, Client/Engine/Server0 remain unchanged. Only prior Render
implementation change is the private definition issuance guard; existing
directional and neutral animation implementations are untouched.

## Actual manual observations

Local ignored `.artifacts/ve03/browser.mjs` imported emitted Render root using
the existing real Three.js browser session implementation. Chrome used three
real canvases/sessions and canonical scenes. No mock/fixture/fake asset, test
runner, assertion suite or generated production host was added. Reference input
was the existing original ani063/Attack1_0 atlas, keys0012/0000/0012, one issued
definition `spark`, fps8/once. Metadata pin reused the prior real-source SHA256
`fe5c87c2e5cba46b43482080f15f5ed607450bb7e15cc72dff3f515c8969efc7`;
no source was read or resolved here and the image revision stayed an unverified
expectation. The observation validates lifecycle, not asset readiness.

| Input / expectation | Observed |
| --- | --- |
| Two instances a/b, one definition | Different symbol IDs, same effectId; exact lookup; list2; Phase8 instances2/boundUsages0/releaseAttempts0 |
| Remove a twice, inspect b and prior snapshot | true then false; a removed, b created/list1; old snapshot remained frozen created; old live ID absent |
| Foreign scene / copied handle | FOREIGN_SCENE / FOREIGN_INSTANCE; no effect mutation |
| Different real session / noncanonical session/scene | CONTEXT_MISMATCH / FOREIGN_SESSION / FOREIGN_SCENE |
| Copied definition / duplicate visual key / old handle as input | INVALID_DEFINITION / DUPLICATE_ID / INVALID_STRUCTURE; remaining membership count1, boundUsages0, cleanupFailed false |
| Re-add visual key a | Fresh effect ID; old handle stayed removed |
| Remove underlying Phase8 membership | Effect terminal membership-ended |
| scene.clear() then create | Old effects terminal membership-ended/list0; scene active and new create succeeds |
| scene.dispose() | Effect terminal scene-disposed; new admission SCENE_DISPOSED; repeat remove false |
| session.dispose() | Effect terminal session-ended; ended session admission SESSION_UNAVAILABLE |
| Actual WEBGL_lose_context on third canvas | isContextLost true; effect removed/session-ended; scene disposed/session-ended; repeat remove false |

Manual host initially used a nonexistent diagnostics method; corrected to the
actual public getRenderVisualSceneDiagnostics before rerunning the observations.
An attempted disposed graphics-session snapshot threw its existing
SessionDisposedError; effect/scene terminal snapshots remained readable as above.
Browser console had only the unrelated favicon404. Local raw CLI record is
`.artifacts/ve03/observations-cli.txt`; browser and local server were closed.

No renderFrame, playback advance, source IO, image decode, texture lease or VFX
binding calls were made. Phase8 diagnostics independently showed boundUsages0.
Stopped playback disposal and allocation-free prevalidation/rollback are also
source-audited; native allocation reclamation/failure injection and pending-load
races were not independently observed. VE03 has no async operation to complete
late; future binding must preserve the terminal gate. No pixels are claimed.

## Required gates and handoff

| Command / audit | Actual result |
| --- | --- |
| `node harness/cli.mjs check` | Exit0 ARCH_CHECK_PASS;176 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render --allow-infra` | Exit0 scoped Render + Harness |
| `node harness/cli.mjs verify --projects runtime-render --with-consumers` | Exit0 BUILD_PASS Render, Editor, Game Client |
| `node .artifacts/ve03/public-audit.mjs` | Exit0; ten additions, zero old declaration changes/removals |
| `npx tsc -p .artifacts/ve03/tsconfig.json` | Exit0 strict emitted public-root consumer, ES2022/types[]/skipLibCheck:false/no DOM |
| `git diff --cached --check` | Exit0 |

No failed/unconfigured final local builds. Existing Harness DEP0190 warning is
nonfatal. Local Engine/Server builds were not rerun for this narrow Render
checkpoint; exact-head CI separately covers all five projects and full workspace
build. No historical exhaustive tests or unit/integration/browser/Playwright/E2E/
snapshot/visual regression suite created or run; browser CLI was used only for
the finite manual public-root observation above.

Next specified capability is v0.11.3 playback controls. Its detailed task has not
been supplied and its behavior is not implemented here. No routine review pause,
merge/tag/release/publish or phase/MVP acceptance is inferred from this checkpoint.
