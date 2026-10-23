# v0.8.12 — SR19 Game Client Scene Integration

Outcome: **READY_FOR_NEXT_CHECKPOINT** for scoped code/build/static gates.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**. Developer acceptance remains open.

## Preflight and dependency gate

Input HEAD `ab5cfc265795d01689ccee45b433f1a978056d45`, branch
`feat/scene-rendering-v0.8`; draft PR [#8](https://github.com/TjnhPro/rpg-platform/pull/8)
OPEN with matching head. Fetched main `ffb347140fbe6bf432bb8fe33c7057bed9a93941`.
Tracked input clean; unrelated untracked `.mcp.json` untouched/excluded. Previous
exact-head [push](https://github.com/TjnhPro/rpg-platform/actions/runs/39948053612)
and [PR](https://github.com/TjnhPro/rpg-platform/actions/runs/39948059647) CI success.

Read applicable root/project AGENTS, ARCHITECTURE/FOUNDATION, Harness ownership,
contracts/workflow/verification/failures, current public roots/manifests/compiler
settings and actual Phase6/7/8 implementation and Editor consumers. Route hints
were considered; canonical primary owner is **game-client** for this browser host
and neutral presentation input. Render is the required existing collaborator;
its live state, frame submission, resource pipeline and backend require no change.
Harness comparison tooling composes hosts, without Client importing Editor.
Supplied task authorizes this minimal consumer; no public boundary/API change.

Phase6 real graphics/frame sessions, Phase7 actual cache/acquire/usable lease/
retained binding/release and Phase8 live scene/instance operations exist at input
HEAD. This implementation calls them directly; no metadata readiness substitution.
Engine has no applicable public presentation-intent API needed by the sample;
no gameplay intent or simulation is invented. Editor preview consumer is reused.

Three0.186.1/types0.186.0 and private backend unchanged. Official
[Object3D](https://threejs.org/docs/pages/Object3D.html) and
[WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html) references checked:
native visibility/order/context/render remain backend responsibilities, and sorting
does not establish general transparency correctness. Client introduces no native
Three calls or imports. L1 Core2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775`,
L2 Gameplay0.15.2 `acea332aa80f67552192a72b30f81c0bbbfc56bd` unchanged/read-only.

## File delta and decisions

- `game-client/src/manual-scene-host.ts`: optional compiled browser mount, neutral
  descriptor/source revision/frame input, one canvas/session/scene/cache, local
  instance keys and exact opaque handles. Add/bind/transform/layout, move,
  visibility, explicit order, remove and frame submission use Render root only.
  Host chooses explicit spatial data; Render validates/composes it.
- `game-client/manual/scene.html`: standalone Client-only manual consumer using
  authorized selected PNG bytes and a narrowly scoped Phase7 provider. No asset
  catalog clone, authored Scene format, Editor runtime or duplicated texture manager.
- `harness/manual/scene-hosts.html`: manual composition of existing Editor preview
  and this Client consumer, distinct canvases/providers/caches/sessions, same Render
  module URL and same PNG specification. Strict session-symbol identity comparison;
  no cross-context GPU texture sharing. Pending close/pagehide guards late adoption.
- Client version contract, archived supplied task, manual guide/index and AGENTS;
  Harness CONTRACTS/OWNERSHIP and this independent checkpoint report.

Public root API delta **zero**: Render186 / Editor138 / Client0 exports, existing
signatures intact. Client browser module remains outside its portable root.
Exactly five projects/dependency directions preserved. No Render, Editor, Engine,
Server production change; no package/compiler/workflow/assets/schema change.

One mount/open attempt; actual loaded lease required before instance binding.
One retained host lease permits later Add, so removing the last instance does not
imply eviction. Each instance retains/releases its own usage through Render.
Client scheduler coalesces a browser rAF and reads existing Phase6 invalidation;
no continuous simulation/tick, networking or Render scheduler is introduced.

Partial instance operations remain inspectable after a later step fails; no
transactional success or clear/rebuild claim. Cleanup uncertainty inhibits later
mutation. Close cancels pending frame work and independently attempts scene,
host lease, cache and session disposal. Closed mounts do not adopt late resources.
Failures retain safe diagnostics; no leak-free/GPU-health guarantee.

Rejected: Client->Editor dependency, invented Engine simulation, native backend
access, second renderer/cache, context texture sharing, automatic repair/retry,
game controls/navigation or streaming. Rollback removes optional host/pages/docs;
no stored-data migration or upstream change.

## Observed verification

| Command / inspection | Result |
| --- | --- |
| `node harness/cli.mjs check` | exit0; ARCH_CHECK_PASS, 129 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | exit0; SCOPE_PASS |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | exit0; real Render, Editor, Client builds PASS |
| `npm run build -- --force` | exit0; forced five-project workspace build PASS |
| Strict existing Editor manual consumer compilation, command in Client guide | exit0; public declarations compile without ambient DOM |
| `node --check --input-type=module` for both inline module scripts | exit0; syntax only, not execution |
| TypeScript checker root export inventory | exit0; 186/138/0 |
| Client source/manifest import scan | no Editor, Three or Render-private imports |
| Git whitespace/staged scope inspection | exit0; eleven Client/Harness paths; unrelated .mcp.json excluded |

Initial local Client compilation caught incorrect snapshot property names; corrected
to actual `sessionId`/`invalidated` APIs before the successful gates above. No
unresolved failed/unconfigured build. Existing Harness Windows DEP0190 warning.
No tests/suites/frameworks/coverage/browser automation created or run. Exact SHA
and observed push/PR CI URLs are appended to PR #8 ledger after push.

## Evidence gaps and handoff

[Manual guide](../../game-client/manual/scene.md) gives standalone and two-host
reproduction, genuine PNG inputs, identity/mutation/removal/frame/close observations.
**Browser NOT_EXECUTED**: actual pixels, stable handles after mutations, resource
survival, independent live contexts and asynchronous cleanup remain unobserved.
The pages make these observable; compilation does not prove these acceptance items.
FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED; TPSHEET_NOT_VERIFIED /
TPSHEET_VISUAL_NOT_VERIFIED and existing transparency limits inherited.

No dependency blocker for scoped implementation. No detailed v0.8.13 task supplied;
continue that checkpoint only when its scope is available. No speculative next
version code, main change, merge, tag, release, publish or whole-phase MVP acceptance.
