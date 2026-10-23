# v0.8.13 — SR20 Minimal Working Scene Rendering MVP

Outcome: **READY_FOR_NEXT_CHECKPOINT** for scoped implementation/build/static gates.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**. Manual MVP acceptance remains open.

## Preflight and dependency gate

Input HEAD `a8bdc4e7c21ea1468e0e46de2c1a4f3e887d2bb1`, branch
`feat/scene-rendering-v0.8`, draft PR [#8](https://github.com/TjnhPro/rpg-platform/pull/8)
OPEN at matching head. Input tracked files clean; unrelated untracked `.mcp.json`
untouched/excluded. Previous exact-head
[push](https://github.com/TjnhPro/rpg-platform/actions/runs/39949587984) and
[PR](https://github.com/TjnhPro/rpg-platform/actions/runs/39949593306) CI successful.

Applicable root/project AGENTS, ARCHITECTURE/FOUNDATION, Harness ownership,
contracts/workflow/verification/failures and actual public APIs/implementation were
inspected. Canonical primary owner is **runtime-render** for visual behavior.
Editor collaborates via its existing authored preview bridge; Client adapts neutral
sample presentation. Harness tooling composes optional consumers without creating
a production dependency. Supplied SR20 scope authorizes these consumers/content;
public boundary and signature delta is zero.

Real Phase6 graphics/frame sessions, Phase7 source/PNG/cache/upload/usable leases
and Phase8 instance/transform/layout/visibility/order/bind/frame/cleanup exist at
input HEAD. The sample calls them directly, without mock readiness or a second
implementation. Existing Editor preview owns authored-to-live mapping. Three
0.186.1/types0.186.0 unchanged; official Object3D/WebGLRenderer references reviewed
for visibility/order/transparent sorting limits. No new native Three calls.
L1 Core2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775` and L2 Gameplay0.15.2
`acea332aa80f67552192a72b30f81c0bbbfc56bd` remain unchanged/read-only, unused here.

## Scope, data and decisions

- Render manual resource adapter: fixed allowlisted bounded source provider with
  manifest SHA-256 checks, real atlas source acquisition/parse/revision/geometry,
  separate cache/session/scene per host, explicit spatial/layer policy and observable
  actual leases/resources/draw candidates. No permanent host seed lease.
- Five original committed PNG inputs, real three-cell atlas text, generator and
  dimension/byte/hash manifest with provenance. These are source content, not
  ignored compilation output. No third-party game extraction or load-error fallback.
- Editor manual adapter: local AssetCatalog and seven authored memberships,
  existing createScenePreviewBridge sync, ground placement/visibility/removal,
  exact handle observations. No DocumentSession, dirty/revision/save effects.
- Client manual adapter: seven neutral instances using Render root only, usable
  acquire/bind then temporary release, in-place transforms/visibility and scoped
  remove. No Editor dependency, game loop or gameplay policy.
- Typed Harness wiring/page: independent controls/canvases, same Render import-map
  root, symbol identity labels, sharing observations, pending-close guards and
  same-canvas explicit recreation. Harness is tooling, not a sixth project.
- Independent version contract, supplied task archive (trailing whitespace normalized), manual runbook,
  index/ownership guidance and this report.

Public roots unchanged: **Render186 / Editor138 / Client0**. No production source,
package/lock/compiler/workflow/schema/Engine/Server/upstream change. Exactly five
projects retained. Roles in the sample name illustrations, not new gameplay types.

The composition is courtyard, Player, three monsters from one Phase7 atlas, item,
static VFX-placeholder. Background/actors/overlay priorities are -10/0/10; actors
use declared right/down ground-y front-down ordering. Expected opaque Player/red
monster overlap changes at y142 versus y162. Buttons expose hide/show Monster B,
remove A while B/C retain independent usage, move same Player handle, release all,
recreate and independent opposite-host draw. Expectations are not observed pixels.

Temporary leases are released after bind by Client or the existing Editor bridge;
instances retain usage. Cache diagnostics expose operation counts only, never
invented decode counts/speed. Close aborts source IO, closes consumer first, then
independently attempts scene/all leases/metadata/cache/session release. Closed
mounts reject late adoption; a pending graphics result is disposed. Phase6 decides
same-canvas reacquisition/quarantine. Partial operations/cleanup uncertainty remain
visible; no transactional success or automatic recovery claim.

Rejected: third-party unlicensed art, fake TPSheet, metadata-only readiness,
fallback textures, Client->Editor, private native renderer access, duplicate
cache/math, animation/camera/gameplay features, automatic browser tests. Rollback
removes optional consumers/content/docs; no persisted-data migration.

## Observed verification

| Command / inspection | Result |
| --- | --- |
| `node harness/cli.mjs check` | exit0; ARCH_CHECK_PASS, 133 JS/TS sources |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | exit0; SCOPE_PASS |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | exit0; genuine Render/Editor/Client builds PASS |
| `npm run build -- --force` | exit0; forced five-project workspace build PASS |
| Strict four-module manual consumer compile, exact command in runbook | exit0; real package-root declarations and typed Harness wiring |
| Public root inventory/source diff | 186/138/0; zero production/API changes |
| Client import inspection | Render root only; no Editor/Three/private source imports |
| Manifest integrity and Git scope/whitespace inspection | source hash/byte sizes match; unrelated .mcp.json excluded |

No unresolved failed/unconfigured builds. Existing Harness Windows DEP0190 warning
remains. No unit/integration/UI/E2E/Playwright/visual tests, runners, coverage or
browser automation added/run. CI exact SHA and push/PR run URLs are recorded in
PR #8 after push; this scoped commit cannot contain its own SHA.

## Evidence gaps and handoff

[Runbook](../../runtime-render/manual/scene-mvp.md) provides exact local URL,
commands, expected pixels/order/overlap, controls, source provenance and evidence
limits. **Browser NOT_EXECUTED**: seven visible images, stable mutation identity,
atlas survival, independent context disposal and same-canvas recreation remain
unobserved. Runnable/compiled/submitted/visually-observed are distinct. No frame
was submitted during verification; runtime controls print FRAME_SUBMITTED only
after actual submission. Build/static PASS does not establish SR20 visual acceptance.

Hand-authored real `.atlas.txt` exercises the existing rectangular 40300 profile;
not an exported TPSheet compatibility sample. **TPSHEET_NOT_VERIFIED /
TPSHEET_VISUAL_NOT_VERIFIED** remain. Full-height atlas cells do not prove vertical
packing, rotation, trim, multipage, filtering or general transparency correctness.
No GPU health, memory reclamation or leak-free claim.

No dependency blocker for scoped implementation. v0.8.14 detailed scope is not
supplied in this task; no speculative closure work. Phase8 acceptance stays open
for Developer; no automatic main edit, merge, tag, release or publish.
