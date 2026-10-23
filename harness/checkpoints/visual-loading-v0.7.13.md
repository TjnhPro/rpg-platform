# v0.7.13 — VL19 Minimal Working Visual Resource MVP

Status: **READY_FOR_NEXT_CHECKPOINT / BUILD_PASS**.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED**.
Manual browser observation is open; this is not full MVP/phase acceptance.

## Starting state and scope

Starting HEAD `db4af0699dcced456da4156b927c3a5e7977270f`, branch
`feat/visual-resource-loading-v0.7`, existing draft [PR7](https://github.com/TjnhPro/rpg-platform/pull/7).
Main `33c9da5ac79cfce27043927fe5d7e08e3bd6d02c` unchanged.
Previous exact-head push [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39925928263)
and PR [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39925933728).
Only pre-existing untracked .mcp.json was present; unread/unmodified/excluded.
The supplied [task](../../runtime-render/docs/tasks/visual-loading-v0.7.13.md)
authorizes this checkpoint's additive demonstration path without another review gate.

Read root/project instructions, architecture/foundation, Harness ownership,
contracts/workflow/verification against current source and declarations. Audited
v0.7.0–12 checkpoint/public contracts, Phase6 viewport/frame/cleanup, actual Three
backend, descriptor/source/PNG coordinator/cache/leases, Unity parser/frame geometry,
Editor reference/visual adapter and manual providers, Client root/host, manifests
and lockfile. No missing mandatory dependency, API break or ownership move found.

Canonical owner **runtime-render**: one-image/frame demonstration inside its
existing graphics backend, live texture-right admission and private resources.
Editor and Client collaborate only through optional selected-File host adapters;
Harness composes the manual page/evidence. No L1/L2 API call/change is needed.
Core2.0.0 at04b7239f998c3c688a0dfa3202f11811a9acd775,
Gameplay0.15.2 atacea332aa80f67552192a72b30f81c0bbbfc56bd and
Three0.186.1/types0.186.0 remain locked. Exactly five projects.

Seventeen scoped paths: eight Render source files (atlas-geometry, frame-session,
index, render-texture, three-frame, visual-resource-cache, new demo-quad and
visual-resource-demo); Render manual module/runbook, API doc and supplied task;
Editor/Client manual atlas-mvp modules; Harness manual page and this report;
Editor manual README link. No production Editor/Client source/root export change,
Engine/Server/L1/L2, package/lockfile, checker or CI change. No originals redistributed.

## Implementation and public contract delta

Only additive root symbol **renderVisualResourceDemo(session,texture,geometry?)**:
Render125 ->126, Editor134, Client0. Existing frame API/receipts and all signatures
retained. See [contract](../../runtime-render/docs/visual-loading-v0.7.13.md).
prepareVisualResource remains metadata-only NOT_PERFORMED.

The demo draws one live image/canonical frame to a fixed central rectangle. It
retains no selection/lease, creates no Scene/sprite/animation/VFX system, and uses
the existing Three renderer/context/session guards. Private shader/VAO cleanup
and native-texture mapping remain Render-owned. Cache alias -> backing mapping
never bypasses live alias/session admission or exposes native GPU resources.

Editor Catalog -> AssetReference -> resolver -> visual descriptor -> selected-File
provider -> Render. Client descriptor/provider has no Editor import. Host providers
check scope/resource/source/locator and bounds before reading; hashes identify
actual returned bytes. Page binding is explicit host attestation, not inferred
from labels/dimensions. No arbitrary filesystem/network authorization.

Optional Render manual consumer requests A1/A2/B1 before awaiting outcomes, shares
one provider-bound cache across two sessions and logs independent IDs, provider
reads, cache jobs/hits/entries/uploads, lease/texture and graphics states. Buttons
expose partial/final release, session-A disposal with B observation/draw, exact
replacement SHA256 invalidation/new B holder, and full teardown. Every cleanup
owner is attempted; released/invalidated rights are not reused. Tooling requires
reload for another mount rather than assuming uncertain cleanup is reusable.
Page exit prevents new commands and eventually closes any late opening result.

## Actual observations and limits

Finite Node public-root consumer, no assertions/test runner, exit0:

- Original Wound_7.tpsheet594 bytes reached source-acquired through Editor-authored
  Catalog/reference/descriptor and the new authorized provider. Canonical parser
  returned the original Unity atlas. Frame0050 resolved to top-left x1,y1,60x47 on
  the128x128 page. Missing key returned FRAME_NOT_FOUND without fallback.
- Source hash2a4f8e481fb7934b84431bf47deaece16d28af31c220646cd799cb0effc8f57d.
  Matching original PNG4132 bytes/hash
  564e290a89c9352aa8535e83857f8fc17ae16325d7e073a18ad21bd9f38b1a3d
  was selected/hashed by the host; no successful native decode was observed here.
- Client host-withdrawn image returned SOURCE_NOT_FOUND; handle released.
- A transient20-byte truncated copy of that original PNG reached source-acquired;
  Render PNG admission returned INVALID_PNG, cleanup not-needed; decode/source
  explicitly released. This failure copy is not a replacement success fixture and
  is not committed. No mock native decoder or graphics context was used.
- Browser createImageBitmap unavailable in Node. Browser **NOT_EXECUTED**;
  successful native decode/upload, live sharing/release/isolation/revision,
  submitted frame and actual image display remain **NOT_VERIFIED**.

Original TexturePacker Unity format40300 metadata/provenance and canonical frame
geometry are observed; TPSheet-derived display is UNVERIFIED. PNG native successful
decode is UNVERIFIED this checkpoint. Expected counters in the
[manual runbook](../../runtime-render/manual/visual-resource-mvp.md) are not runtime
observations, performance evidence, memory reclamation or leak-free guarantees.
Developer owns manual functional/visual review and phase acceptance. Browser
observation gap is not an architecture blocker under the supplied task.

## Commands and results

| Command | Actual result |
| --- | --- |
| node harness/cli.mjs check | Exit0 ARCH_CHECK_PASS109 JS/TS sources |
| node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra | Exit0, declared project/infrastructure scope |
| node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers | Exit0 Render/Editor/Client independent BUILD_PASS |
| npm run build -- --force | Exit0 all-five workspace BUILD_PASS |
| Three strict optional NodeNext manual compiles in runbook | Exit0 each; actual package-root declarations |
| Guarded browser-global-free root import / declaration inventory | Exit0;126/134/0; metadata NOT_PERFORMED |
| Finite original/provider/parser/failure consumer | Exit0; observations above |
| node --check on extracted Harness module | Exit0 |
| git diff --cached --check | Exit0 |

No final failed/unconfigured build. Existing Windows DEP0190 warning is non-failing.
No tests, browser automation, runner, coverage or dependencies added/run.
Exact checkpoint commit and both push/PR CI results are recorded in PR7 after
completion. No merge/release/publish or v0.7.14 implementation included.
