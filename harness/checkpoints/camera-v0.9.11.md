# v0.9.11 — CM18 Camera Diagnostics & Lifecycle Closure

**READY_FOR_NEXT_CHECKPOINT** for the authorized implementation/build scope.
Integrated native behavior remains **FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**.
Developer alone accepts feature/phase completion. No next task implemented.

## Exact baseline and preflight

HEAD/local/fetched remote `894d03547bb6e92e3e97fefeb859a29cb923974b` (v0.9.10),
branch `feat/camera-projection-v0.9`; main/merge-base
`e4464ac8e1c84a1c872f8e7a722885942a268a28`. Same OPEN draft
[PR9](https://github.com/TjnhPro/rpg-platform/pull/9), head matches checkout.
Previous-head completed CI success:
[push39978398979](https://github.com/TjnhPro/rpg-platform/actions/runs/39978398979),
[PR39978407382](https://github.com/TjnhPro/rpg-platform/actions/runs/39978407382).
These links are prerequisite evidence only. This checkpoint's delivery HEAD is its
containing commit; exact SHA and completed exact-head CI recorded in PR after push.
Tracked baseline clean; preexisting untracked `.mcp.json` untouched/excluded.

Read root AGENTS/ARCHITECTURE/FOUNDATION, Harness contracts/ownership/workflow/
verification/failures, Render/Editor/Client guidance and previous checkpoint.
Inspected camera commit/configuration/bounds/ground/inverse/viewport/binding,
Phase4 plane/affine/viewport math, Phase6 session/error/resize/native teardown,
Phase7 session/resource cleanup and Phase8 scene/resource binding/end. Real Phase7/8
capabilities are implemented here; historical task-authorship warning is stale.
Route hint named Render; source confirms **runtime-render** as canonical owner.
Editor/Client only compatibility consumers. No external L1/L2 API calls/change,
no Engine/Server change or dependency/owner transfer.

Pre-change plan: preserve existing admission TypeError/RangeError, bounds results
and Phase6 exhaustive unions; strengthen terminal weak-dispatch/receipt unlink and
listener drain; public-root finite failure/legacy compatibility observations;
strict root/consumer portability + real builds; native evidence honest if unavailable.
No new public classification is needed by a current consumer. Task pre-authorizes
this local additive-compatible work; no breaking or architectural decision required.

Seven intended files, all owner-local except this Harness report:

- `runtime-render/src/camera-frame-link.ts`: private terminal dispatch deletion;
  delete Scene association and clear listeners first, attempt all callbacks and
  rethrow first failure afterwards. No public registry/API or error suppression.
- `runtime-render/src/frame-session.ts`: terminal unlink of camera dispatch and
  latest accepted viewport receipt before existing resource/backend cleanup.
- `runtime-render/manual/camera-diagnostics.mts`: finite public-root logging and
  original-family exhaustive frame diagnostic consumer, no assertions or backend.
- `runtime-render/manual/camera-diagnostics.md`: runnable procedure and native limits.
- `runtime-render/docs/camera-v0.9.11.md`: complete failure/lifetime/compatibility map.
- `runtime-render/docs/tasks/camera-v0.9.11.md`: supplied task, trailing spaces normalized.
- This checkpoint. No historic report, lockfile, CI or unrelated config modified.

## Contract and ownership conclusions

No root API or union delta. Exact emitted declaration audit vs baseline:
Render231->231, Editor138->138, Client0->0; additions0, changed0, removed0.
Neutral root declarations compile under ES2022 without DOM and without skipLibCheck.
Node public root import observed window/document undefined and no Three resolution
(130 resolution calls); no WebGL/DOM instantiation. Static boundary check also finds
no listed forbidden reverse imports; this is not exhaustive architectural proof.

See [failure inventory](../../runtime-render/docs/camera-v0.9.11.md) for unsupported
kind, invalid center/zoom/bounds/dimensions/plane, stale viewport, disposed camera/
session, inverse degeneracy, expired resource and context loss. Pure admission has
no new stable codes. Safe visual classifier reports unknown/UNKNOWN_FAILURE for
unbranded camera TypeError/RangeError, not success. Unknown host errors are not
guessed into frame codes. Bounds policy retains explicit structured rejection.
Backend failure terminates graphics and returns no successful receipt; historical
CPU intent/frame evidence does not claim current applied state.

Scene/session termination detaches binding through existing owners; camera disposal
does not dispose Scene/session/resources. Session dispatch/latest receipt are now
explicitly removed even while a terminal session handle is retained. Private listener
drain attempts all captured callbacks after unlink; existing Scene finally paths
still attempt instance drain/detach. The first thrown value is preserved. Three
clears private camera references; browser owns borrowed canvas/context. Existing
cleanup uncertainty/quarantine retained; no leak-free or GPU reclamation claim.

Compatibility is demonstrated specifically: original Phase4 descriptor operation
still maps12,23 to104,209; real binding-only session still reports SESSION_DISPOSED
at getSnapshot; original Phase6 code-family exhaustive switch compiles unchanged.
No generic compatibility shim, renderer/camera/cache duplication, diagnostics
framework, telemetry or repair/recovery. Declaring unchanged types alone would not
prove runtime compatibility. Camera is presentation intent, not authored placement,
instance local transform/depth or gameplay position.

Locked installed Three0.186.1, @types/three0.186.0, TypeScript6.0.3; no dependency
change. Read-only Core2.0.0 revision04b7239f998c3c688a0dfa3202f11811a9acd775 and
Gameplay0.15.2 revisionacea332aa80f67552192a72b30f81c0bbbfc56bd unchanged.

## Actual gates and observations

| Command / observation | Actual result |
| --- | --- |
| `node harness/cli.mjs check` | exit0 ARCH_CHECK_PASS,155 JS/TS files |
| `node harness/cli.mjs scope --projects runtime-render --allow-infra` | exit0 SCOPE_PASS; final8 paths =7 intended + preexisting .mcp.json |
| `node harness/cli.mjs verify --projects runtime-render --with-consumers` | exit0 BUILD_PASS Render/Editor/Client |
| `npm run build -- --force` | exit0 genuine five-project build |
| strict emitted roots +22 portable manuals ES2022/no DOM | exit0, skipLibCheck false |
| strict manual consumer emit | exit0 |
| exact public declaration audit | exit0 zero old declaration changes/additions/removals |
| finite public-root camera diagnostics consumer | exit0; observations below |
| finite existing public-root Editor owner consumer | exit0; observations below |
| Node import resolution observation | exit0; no Three/DOM graphics load |
| `git diff --check` | exit0 |

Initial new manual consumer had TS1005 due line break before `as` cast; corrected
syntax, then strict compilation passed. No production build failure remains.
Existing Harness DEP0190 warning remains. No tests/suites/assertion matrices,
coverage, runners, new CI jobs or fake graphics. Generated artifacts ignored.

**EXPECTED:** invalid inputs reject with previous exact camera/view/revisions;
underdetermined inverse never invents height; Camera B independent. Phase4/6 old
families retain behavior. Native loss must terminate binding/session and preserve
truthful cleanup diagnostics; native A loss must not invalidate B.

**OBSERVED through public roots in Node:** unsupported perspective, nonfinite
center, zoom0, unknown plane, width0, inverted bounds, missing inverse elevation
and disposed zoom threw TypeError. All sampled A view identities unchanged,
view revision0->0. Separate ill-conditioned camera inverse threw RangeError
"Viewport mapping is numerically non-invertible"; A unchanged (the logged identity
is A, not a native session). Out-of-bounds center/zoom request returned rejected,
CENTER_OUTSIDE_BOUNDS/not-applied with exact A view retained. Safe diagnostics
were unknown/UNKNOWN_FAILURE with cleanupFailed null for these unbranded failures.
Unknown host Error detail was absent from safe output. After A disposal, B retained
exact view and projected160,120. Repeated disposal retained terminal snapshot.
Legacy Phase4 output104,209 exactly; legacy session diagnostic
SESSION_DISPOSED/getSnapshot. Integer projection samples use tolerance1e-12,
observed difference0. No message is established as stable classification contract.

Existing finite owner consumer observed CPU projection160,120 ->128,120 after
pan32 ->96,120 atzoom2; no-op identity true. Actual Editor Scene placement160,120
and actual Document revision1/savedRevision null/isDirty true unchanged before/
after; B160,120 unchanged. Foreign Scene and unknown receipt correctly rejected/
unclassified. This is an in-memory authored/CPU observation, not live native Scene,
stored persistence or gameplay-position verification. No gameplay model supplied.

**NOT_OBSERVED:** native frame/pixels, actual context loss, real stale accepted
viewport, real expired Phase7 lease binding, session A/B native independence,
native listener/cleanup-failure paths or GPU memory reclamation. Computer Use
inventory returned apps[]/browsers[]; no browser executed. Existing real-PNG
[two-session demo](../../runtime-render/manual/camera-scene.md) supplies these
manual paths, not a replacement mock. Resource admission uses existing branded
Phase7/8 failures; resource expiry during rendering uses existing terminal frame
policy. Camera code never owns/revives resource rights. Native cleanup conclusions
above are source audit only. FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED retained.

## Handoff

No blocking source prerequisite found for this scoped checkpoint. v0.9.12 can use
these unchanged contracts after its supplied task and fresh preflight. Native
review remains pending, no self-acceptance/merge/tag/release/publish. Rollback is
revert of this checkpoint, preserving accepted history and five project ownership.
