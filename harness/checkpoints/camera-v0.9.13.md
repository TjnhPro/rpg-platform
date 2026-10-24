# v0.9.13 CM20 — Minimal Working Camera MVP

## Pre-change contract plan

Baseline: `2b15d19d8688ce839b72d463e24d31113d3ff5db` (v0.9.12), branch
`feat/camera-projection-v0.9`, upstream identical. Draft OPEN
[PR #9](https://github.com/TjnhPro/rpg-platform/pull/9), base main/merge-base
`e4464ac8e1c84a1c872f8e7a722885942a268a28`. Fresh fetch found no drift.
Tracked tree clean; preexisting untracked `.mcp.json` stays excluded.

Canonical primary behavior owner: **runtime-render**. Its existing public camera,
Phase4 projection/inverse, Phase6 viewport/session/frame, Phase7 PNG/cache/atlas
and Phase8 live draw/layer/ground-y contracts suffice. Source includes actual
Three frame application of localToScene and borrowed Phase7 textures. No missing
Phase8 dependency, renderer replacement or public contract change is justified.
Lockfile: Three0.186.1, @types/three0.186.0, TypeScript6.0.3. L1/L2 APIs: none.

Collaborators/files planned:

- `editor/src/manual-camera-host.ts`: existing private browser host accepts
  per-object presentation, explicit layers and enough cache entries for three
  source textures; read actual transforms/order/resources and invoke Render root
  zoom/projection/bounds. Authored Scene/Document stay untouched.
- `game-client/src/manual-camera-host.ts`: existing private host supports multiple
  neutral visuals using the same cache/session and observes actual placements,
  order and resources. Existing single-visual caller stays compatible.
- `harness/manual/camera-mvp.{mts,html,md}`: manual composition/runbook, actual
  PNG/atlas provider, two hosts, explicit CSS/screen/DPR, controls and observations.
- `harness/manual/camera-mvp-coordinates.mts`: finite public-root CPU observations
  of the exact worked table, constrained inverses, focus/bounds and negatives;
  no assertions, runner or graphics substitute.
- `editor/docs/tasks/camera-v0.9.13.md`: standalone supplied task; this report.

No root export/signature/schema/dependency changes, Engine/Server/foundation edits,
new project, animation/follow or automated tests. Old exhaustive consumers build;
compare emitted root declarations with baseline and compile ES2022 without DOM.
Failure policy: no placeholder on missing source; native/cleanup failure stays
owner-classified and terminal; recreate explicitly with fresh canvases/hosts.
Manual scenario: one Map, Player and three atlas Monsters in each independent
session, stable ground-y order and immutable authored/neutral/instance transforms
through pan/zoom/resize. CPU evidence and native pixels remain separate.

Gates: architecture check; scope editor,game-client with infrastructure; verify
those consumers; final forced five-project build; strict manual and portable
public-root compilation. Browser absence is VISUAL_NOT_VERIFIED, never MVP_PASS.
Rollback: revert this checkpoint, no history rewrite/merge/tag/release/publication.

## Results

**READY_FOR_NEXT_CHECKPOINT** for the authorized source/build delta.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED** for native MVP acceptance.
The containing commit is this checkpoint's delivery HEAD (resolve with
`git log -1 --format=%H -- harness/checkpoints/camera-v0.9.13.md`). Exact SHA and
completed current-head CI links are recorded in PR9 after push; this report never
substitutes previous-head CI. Developer alone accepts the feature/phase.

Fresh preflight read root AGENTS/ARCHITECTURE/FOUNDATION; Harness CONTRACTS,
OWNERSHIP, WORKFLOW, VERIFICATION, FAILURES; Render/Editor/Client AGENTS; v0.9.12.
Inspected actual Phase4 math and Editor adapters, Phase6 frame/viewport/hosts,
Phase7 cache/source/parser and Phase8 preview/live Scene/Three submission code.
Route returned Render as hint only. No missing upstream or owner/graph ambiguity.

## Implemented scope and compatibility

Eight intended files: the two existing private browser hosts, four new Harness
manual files listed in the pre-change plan, standalone supplied task and report.
No runtime-render source change was necessary. No old report, public root, package,
dependency, foundation pin, Engine, Server or gameplay source changed.

Editor now accepts the existing bridge's per-object presentation callback and
optional explicit Render layer policies. Cache capacity follows authored asset
definitions (three in this sample), replacing the previous two-entry demo budget
which cannot hold three live source textures. Project/inverse, zoom, center and
opt-in bounds operations call Render public root only. Inspection reads actual
Phase8 transforms/resource bindings/order and Phase6 accepted viewport.

Client retains the old single-visual call and additionally accepts an explicit
neutral visual list. One cache/session loads three sources for five instances;
Scene independently retains resource usages before host leases release. Serial
loading and generation checks ignore terminal/late results; all pending host
leases, Scene and cache are drained by existing owner cleanup. Cleanup uncertainty
remains sticky and blocks reacquisition through that mount. A released real lease
is retained as an observation-only negative action, never a valid binding right.
The action logs the public binding classifier and before/after allocation.

Harness alone composes Editor A on-demand and Client B continuous hosts. Real
manifest/hash-checked PNGs and acquired/parsed atlas metadata feed five actual
Phase8 instances each: Map, Player, red/green/violet Monster illustrations.
Background/ground-y ordering is explicit, including a stable y70 tie. Inspect
compares captured live transforms/order, authored Scene/Document/neutral inputs,
resource allocation identities, frame geometry, separate session/camera IDs and
cache counters. Capture rejects unloaded/empty scenes. Explicit A recreation uses
a fresh canvas/mount, preserves B, and requires fresh load/baseline capture.
Missing content never draws a placeholder. Page shutdown aborts source IO and
drains hosts; native failure/recovery remains Phase6 policy.

Public-root emitted declaration inventory versus exact v0.9.12:
Render231->231, Editor138->138, Client0->0; additions0/removals0/changes0.
Private host signatures are absent from package roots. Existing two-host consumer
still compiles, including old no-argument presentation callback/single Client input.
Strict portable root consumer compiles ES2022 without DOM, skipLibCheck false;
all three Node root imports observe window/document undefined. No universal
behavioral compatibility or browser correctness is inferred from that audit.

Rejected alternatives: public Camera API expansion, host projection formulas,
separate renderer/texture cache implementation, metadata-only/dummy fallback,
fake native sessions, gameplay entities/follow/animation and browser test runners.
The small coordinate consumer prints expected/observed values without assertions.
Asset provenance and exact revisions are in the runbook. Atlas source is original
hand-authored40300 rectangular-profile metadata; TPSHEET_NOT_VERIFIED remains.

## Actual verification

| Command / observation | Result |
| --- | --- |
| `node harness/cli.mjs check` | exit0 ARCH_CHECK_PASS,159 JS/TS source files |
| `node harness/cli.mjs scope --projects editor,game-client --allow-infra` | exit0 SCOPE_PASS,9 paths:8 intended plus excluded .mcp.json |
| `node harness/cli.mjs verify --projects editor,game-client --with-consumers` | exit0 BUILD_PASS both projects, genuine referenced builds |
| `npm run build -- --force` | exit0 genuine five-project build |
| Strict DOM manual compile, command in runbook; additionally old camera-hosts.mts | exit0 |
| Strict ES2022-only camera-mvp-coordinates.mts compile | exit0 |
| `node node_modules/typescript/bin/tsc -p .artifacts/closure-portable-tsconfig.json` | exit0 existing public-root consumer |
| `node .artifacts/camera-v0.9.13-public-audit.mjs` | exit0 exact emitted root inventory above |
| Node imports Render/Editor/Client roots | exit0; no window/document |
| Finite emitted `observeCameraMvpCoordinates` manual invocation | exit0, observations below |
| Same page source provider/parser over actual local HTTP | exit0; metadata/PNG bytes and geometry below |
| `node --check .artifacts/camera-mvp-page.mjs` | exit0 extracted module syntax |
| `git diff --check` / staged diff check | exit0 |

An initial local Python one-liner for ignored audit artifacts failed because of
PowerShell quoting; replaced with a literal here-string and reran successfully.
Source inspection corrected the atlas role to the actual `atlas-metadata`
contract before the successful real parser observation. No failed/unconfigured
build remains. Existing Harness DEP0190 warning remains. No automated tests,
runners, CI jobs, snapshots, coverage or exhaustive historical suites were added.

## EXPECTED / OBSERVED / NOT_OBSERVED

**EXPECTED:** right/down center100,50, scale2, zoom1, CSS800x450 yields the table.
Pan/zoom affect pixels and Camera state only; world transforms/authored truth and
ground-y ordering stay unchanged. Separate B remains independent. DPR affects the
accepted device buffer once. Invalid inputs/released rights reject owner admission.

| CPU operation | EXPECTED viewport CSS | OBSERVED |
| --- | --- | --- |
| center100,50 | 400,225 | 400,225 |
| world110,50 | 420,225 | 420,225 |
| world100,60 | 400,245 | 400,245 |
| center105,50; world100,50 | 390,225 | 390,225 |
| reset/zoom2; world110,50 | 440,225 | 440,225 |
| reset/resize640x450; world110,50 | 340,225 | 340,225 |

**OBSERVED CPU:** explicit client origin40,80 roundtrips all worked samples with
residual0, tolerance1e-9 source units. Focus client540,280 selects150,37.5 before/
after zoom2, residual0. Pure Phase6 ratio1/2 plans yield800x450/1600x900 and CSS
projection420,225; plans remain validated-not-applied. Width0, heightNaN, zoom0/NaN
and unknown plane throw TypeError while retaining the exact camera view. Classifier
is unknown/UNKNOWN_FAILURE, cleanupFailed null, not an invented camera error code.
Bounds at zoom1 return VIEW_EXCEEDS_BOUNDS; zoom2 strict move returns
CENTER_OUTSIDE_BOUNDS; explicit clamp yields220,183.75. Fixed h3 inverse returns
ground4,2 from presentation2,-3/CSS402,222, residual0; missing h throws TypeError.
A disposal/recreation yields a fresh Camera ID; B retains exact view/center400,225;
actual CPU authored Scene and Document snapshots remain unchanged. These are
pure public API observations, not a live native Scene/gameplay invariant proof.

**OBSERVED actual sources, without graphics:** the same demo provider over local
HTTP acquired metadata178 bytes and PNG1701/236/424 bytes with exact manifest
SHA256 revisions. Canonical parser/geometry resolved red/green/violet rectangles
x0/32/64,y0,width32,height48 on actual96x48 atlas. Manual page HTTP200. This does
not imply PNG decode/upload/usable native texture or displayed-pixel evidence.

**NOT_OBSERVED:** fresh Computer Use inventory returned apps[]/browsers[]. No
browser was executed. Native pixels, actual live instance/order comparisons,
per-session three-texture sharing, native A/B isolation, accepted DPR/resize,
released resource binding rejection, cleanup/context loss/pending unmount and
fresh native recreation remain unobserved. Exact URL, builds, steps, expected
outputs and separate evidence fields are in [runbook](../manual/camera-mvp.md).
No live Engine/gameplay positions were provided; no fake positions are claimed.
Camera/Scene/frame receipts and cache counts are distinct from display acceptance.

## Handoff

No blocking source prerequisite remains for this authorized delta. v0.9.14 can
proceed only when its standalone task is supplied and fresh preflight is sound.
Carry forward unchanged Phase4/6 contracts, explicit planes/units/heights, native
manual acceptance pending, atlas-profile limits and explicit recreation policy.
No next-version implementation, merge, tag, release, publish or self-acceptance.
