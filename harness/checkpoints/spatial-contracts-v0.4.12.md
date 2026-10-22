# v0.4.12 — Spatial Foundation Integration & MVP Closure

SP18. **READY_FOR_DEVELOPER_REVIEW**; general behavior **FEATURE_NOT_VERIFIED**.
Audit only. No new capability, production code, public API or automated tests.
Stop here: no Feature 05, merge, tag, release or package publication.

## Preflight and evidence boundaries

Source HEAD / preceding checkpoint: `16da99a9f58385f5ee7cdcac4d2ab869ccc264a5`.
Branch: `feat/editor-render-spatial-contracts-v0.4`; same open draft
[PR #4](https://github.com/TjnhPro/rpg-platform/pull/4), base `main`.
Exact accepted Phase 3 baseline: `5ce0feb4c1967c0dee14919b9c11d56991a46bd0`;
accepted Phase 1/2 baselines respectively
`4cec85b5a00e2477f00eee29e2da6025a532e973` and
`fea9b734b849fa1c6bc953530e1fa425d43cfca8`.
Continue under Developer's explicit instruction to implement and review at the
end. This authorization does not infer individual checkpoint acceptance from CI.
Phase 4 acceptance remains open; no historical approval is manufactured here.

Canonical primary owner of this change: Harness closure evidence. Editor and
Runtime Render collaborate only through their existing owner guidance. Scope:
this report, ARCHITECTURE.md, README.md, both owner AGENTS.md and the concrete
OWNERSHIP.md mismatch below. Expected and actual API delta: zero. No consumer
edits required; Render, Editor and game-client are rebuilt with consumers, plus
all five projects in a forced workspace build. No L1/L2 API call added.

Read root/project instructions, architecture, Foundation, README, ownership,
contracts, workflow, verification, actual sources, indexes, manifests and emitted
declarations. Audit used actual code rather than historical deferred-work prose.
Final checkpoint SHA and exact-head push/PR CI links are recorded outside this
self-referencing commit in PR #4 and the final handoff.

## All checkpoint ledger

Each row's report is `spatial-contracts-v<version>.md` beside this file. Counts
are root compiler symbols (types + values), not runtime object counts. Historical
build observations below come from each checkpoint report; they were not rerun
by checking out every old commit. Final current builds are separately recorded.
R/E/C means Render, Editor, game-client consumer builds; W means all-five forced
workspace build. Every row remains subject to final Developer acceptance.

| Version | Exact checkpoint SHA | Public delta / totals E,R | Canonical owner | Observed builds | Decision / blocker |
| --- | --- | --- | --- | --- | --- |
| 0.4.0 | 6fa55ebb3606a135ead25f9f23a583fd4feebc0d | 0; 74,17 | Harness architecture | R/E/C | Proposed boundary; no implementation blocker |
| 0.4.1 | c131d15c7c3ebe5ff6208cc55138ec32cc34c28a | E+7; 81,17 | Editor spaces | R/E/C,W | Scoped 2D authored values; no registry |
| 0.4.2 | c42a26b5487e6173bb8c80a3e1ea8465c812bcd0 | R+2; 81,19 | Render TRS | R/E/C,W | Capture only, S then R then T |
| 0.4.3 | 30c5012e0b1c256cea5628a870f4c876f0ce8dc5 | R+7; 81,26 | Render affine | R/E/C,W | Ordered composition, conditional inverse |
| 0.4.4 | 9fc76be0a5de8d4e78a7ec77b105b3b205a2ed76 | E+2; 83,26 | Editor grid | R/E/C,W | Optional orthogonal config |
| 0.4.5 | 346d245bc8fd336755f79418bfd8e58b2f6fa051 | E+1,R+7; 84,33 | Render conversion; Editor adapter | R/E/C,W | Explicit alignment/floor/domain policy |
| 0.4.6 | 66d8b6617dedb1427c4d9df67beee393362bcaca | E+1,R+6; 85,39 | Render alignment/facing; Editor adapter | R/E/C,W | Local-unit alignment; facing metadata only |
| 0.4.7 | bb34adf1626732db6179e179ded717c8162d21fd | E+1,R+5; 86,44 | Render projection; Editor adapter | R/E/C,W | Selected orthographic plane only |
| 0.4.8 | 109613a0e0ba58cbc615676e08ef94694126eeb1 | E+1,R+8; 87,52 | Render viewport; Editor adapter | R/E/C,W | Explicit host metrics, constrained inverse |
| 0.4.9 | ce4971d3425c4c72f24ca1243a7ec95db5ad05f5 | E+1; 88,52 | Editor placement | R/E/C,W | Reuses existing focused Scene operation |
| 0.4.10 | 3ccf181bb61d29de3f35c164052647406fea428c | E+2; 90,52 | Editor spatial handoff | R/E/C,W | Existing Render request; correlation caller-side |
| 0.4.11 | 16da99a9f58385f5ee7cdcac4d2ab869ccc264a5 | 0; 90,52 | Editor + Render manual consumer | R/E/C,W | Finite headless MVP observed; visuals open |
| 0.4.12 | This checkpoint; exact SHA in PR/handoff | 0; 90,52 | Harness audit | R/E/C,W | Ready for review; acceptance/visuals open |

## Whole-PR and public contract audit

At source HEAD, Phase 3 baseline..HEAD: 34 files, 3353 insertions, 1 deletion.
Fourteen new production modules; existing production files changed only at the
two additive public indexes. All prior module implementations, types and schemas
are byte-unchanged. Closure adds this report and updates five guidance/docs files;
the full PR remains confined to Editor, Render and directly relevant Markdown.
No manifest, lockfile, dependency direction, workflow, Engine, Client or Server
delta. No sixth project, test suite, runner, coverage or CI runtime gate.

TypeScript compiler resolved every one of the 90 Editor and 52 Render root
symbols to source owners and emitted declarations. Callable signatures and
type/interface declarations were compared with emitted `.d.ts`; retained baseline
symbols are unchanged. Two existing optional default parameters (`mediaType` in
describeSceneObjectVisual/describeResolvedVisualAsset) print an extra `| undefined`
in declaration-based compiler display; both spellings accept the same optional
argument. This is existing compiler presentation, not a Phase 4 contract delta.
Source/emitted root name sets match; no removed symbols. Strict in-memory
package-root consumer compiles with NodeNext, ES2022, `types: []`, no DOM library,
`skipLibCheck: false`, zero diagnostics. No files/scripts/tests saved for this check.

The following is the complete additive symbol inventory. Signatures and DTO fields
are in the linked source modules and their compiler-emitted matching declarations;
the preceding 74 Editor / 17 Render symbols stay as accepted in Phase 3.

| Owner module under src/ | Added public symbols |
| --- | --- |
| [Editor coordinate-space](../../editor/src/coordinate-space.ts) | CoordinateSpaceReference, CoordinateSpaceDefinition, CoordinatePair2D, SpatialPoint2D, createCoordinateSpaceReference, createCoordinateSpaceDefinition, createSpatialPoint2D |
| [Editor orthogonal-grid](../../editor/src/orthogonal-grid.ts) | OrthogonalGridDefinition, createOrthogonalGridDefinition |
| [Editor grid-conversion](../../editor/src/grid-conversion.ts) | describeGridConversion |
| [Editor scene-visual-alignment](../../editor/src/scene-visual-alignment.ts) | describeSceneObjectAlignment |
| [Editor plane-projection](../../editor/src/plane-projection.ts) | describeOrthographicPlaneProjection |
| [Editor viewport-mapping](../../editor/src/viewport-mapping.ts) | describeViewportMapping |
| [Editor scene-spatial-placement](../../editor/src/scene-spatial-placement.ts) | updateSceneObjectSpatialPlacement |
| [Editor scene-spatial-point](../../editor/src/scene-spatial-point.ts) | describeSceneObjectSpatialPoint, SceneObjectSpatialDescription |
| [Render planar-transform](../../runtime-render/src/planar-transform.ts) | PlanarTransform2D, createPlanarTransform2D |
| [Render planar-affine](../../runtime-render/src/planar-affine.ts) | PlanarPoint2D, AffineTransform2D, PlanarInverseResult, toAffineTransform2D, applyPlanarPoint2D, composePlanarTransforms2D, invertPlanarTransform2D |
| [Render grid-conversion](../../runtime-render/src/grid-conversion.ts) | GridConversionSpace, OrthogonalGridConversion, GridCell2D, GridScenePosition2D, createOrthogonalGridConversion, gridCellToScenePosition, scenePositionToGridCell |
| [Render visual-alignment](../../runtime-render/src/visual-alignment.ts) | VisualAnchor2D, VisualOrientation2D, VisualAlignment2D, createVisualAnchor2D, createVisualOrientation2D, resolveVisualAlignment2D |
| [Render plane-projection](../../runtime-render/src/plane-projection.ts) | ProjectionPlane2D, PlaneProjectionPoint2D, OrthographicPlaneProjection, createOrthographicPlaneProjection, projectPlanePoint2D |
| [Render viewport-mapping](../../runtime-render/src/viewport-mapping.ts) | ScreenMapping2D, ViewportMetrics2D, ViewportMapping2D, createViewportMapping2D, projectPointToViewport2D, viewportPointToPlane2D, viewportPointToScreen2D, screenPointToViewport2D |

## Canonical algorithms, state and dependencies

Editor captures authored space/grid, validates exact scoped references, then its
adapters call Render's public root. Placement update delegates to the existing
Scene operation. Scene point handoff captures one object, keeps authored correlation
outside the Render request and needs no Asset. No duplicate conversion formulas.
Render affine operations supply alignment and plane projection; viewport forwards
through canonical projection, with a diagonal reciprocal mapping and destination
residual check. This restricted inverse is not a second general affine engine.
Repeated small exact-record/finite validators and structurally similar authored
and portable DTOs serve distinct owner boundaries; no shadow registry/catalog or
duplicate gameplay algorithm was found. No shared package is justified by this audit.

Authored IDs/optional placement are immutable content. Space/grid definitions and
anchor/facing/projection config are explicitly caller-held, not inserted into the
Scene schema. Workspace selection, tabs, gizmos and document lifecycle are absent.
Render session IDs remain ephemeral symbols; no authored identity becomes a session
or visual instance. Pure numeric snapshots allocate no GPU resources. Phase 1's
separate empty-frame path does not consume Scene placement. Gameplay spatial state,
collision, movement and range remain unimplemented Engine concerns.

Actual unchanged graph (all public export maps expose only `.` built ESM/types):

```text
runtime-engine -> @rpg/core/kernel, @rpg/gameplay
runtime-render -> three (private backend; pure operations need no acquisition)
editor         -> runtime-engine, runtime-render
game-client    -> runtime-engine, runtime-render
game-server    -> runtime-engine
```

No direct Editor Three.js/private Render import, Render-to-Editor/Engine import,
or new/illegal L1/L2 import. Engine retains its existing calculateStats and
createGameplayRuntime imports. Installed artifact files were hashed locally with
SHA-512 and matched the unchanged pins; upstream repos were not edited or fetched
for a fresh upstream audit in this closure.

| External | Version / exact revision | Observed artifact SHA-512 (base64) |
| --- | --- | --- |
| Core | 2.0.0 / 04b7239f998c3c688a0dfa3202f11811a9acd775 | Iys3TTgb8tynmRgwYKAk/3suJVf/PtOi9TJyqXc3N3K2MJjRa++lWNZAWm60vmHyP8i4bKt5cbccnx78F0KkQQ== |
| Gameplay | 0.15.2 / acea332aa80f67552192a72b30f81c0bbbfc56bd | 8QeN9B3MLVzdfKyMW0hvcOwJJjb31+dlTxfk+6V/rgsYJnimMO/HjQcHmg064CzPs2qu0I1nVV9lp9vjUMS3xg== |

Concrete documentation mismatch corrected: OWNERSHIP.md's current routing row
said viewport projection was deferred despite v0.4.8 implementation and the later
paragraph in the same file. It now links SP13/SP14. Older checkpoint notes retain
their historical revision scope; no architecture change was needed.

## Manual proof review and numerical limits

Reproduced the documented [v0.4.11 Node stdin example](spatial-contracts-v0.4.11.md)
against the built public roots during this audit, with the same observed output.
No assertion suite, script file, browser or runtime CI step was introduced.

| Explicit input / expectation | Observed | Status |
| --- | --- | --- |
| Grid origin (10,-4), cell 4x2, positive-x/negative-y, row1/column2 center -> (20,-7), floor inverse -> same cell | Same values/context | MANUALLY_OBSERVED |
| Move Player from (12,-5) to (20,-7); retain authored IDs, references and unrelated object data | Old snapshot/catalog unchanged; candidate frozen; three Monster placeholders retained | MANUALLY_OBSERVED |
| Anchor (1,2), pivot (2,3), offset (.5,-.5) -> origin (19.5,-9.5), pivot (21.5,-6.5); facing 0 vs PI/2 independent | Same geometry, explicit different facing metadata | MANUALLY_OBSERVED |
| TRS + ordered composition -> (3,6); inverse -> (1,2) within illustrative 1e-12 | (.9999999999999996,2); quarter-turn residual 4.44e-16 | MANUALLY_OBSERVED, finite example only |
| Scene (20,-7) -> CSS viewport (300,230) -> explicit device screen (900,610) -> same source | Exact example roundtrip; three Monster requests retain independent correlations | MANUALLY_OBSERVED |
| Singular scale (0,1); foreign space; optional no-placement text object | non-invertible/SINGULAR_OR_ILL_CONDITIONED; TypeError; unavailable/NO_PLACEMENT | MANUALLY_OBSERVED |
| Four resource descriptions | metadata-prepared; no files loaded; window/document/WebGL absent | MANUALLY_OBSERVED |
| Actual images, Scene render, visual positions, real display DPR changes, UI/gameplay | No graphics invocation or product interaction in proof | NOT_VERIFIED |

TypeError rejects invalid/unsupported/mismatched structured inputs; RangeError
reports numerical/domain failures; unknown host exceptions propagate. Missing
Scene object throws; optional placement absence is unavailable, not an identity
mapping. Earlier .5–.8 reports record finite unsupported/overflow/precision cases;
these are historical manual observations, not exhaustive current re-execution.
Only orthogonal grid and axis-aligned orthographic-plane mapping are supported.

All arithmetic is binary64. General affine inverse rejects zero or normalized
determinant magnitude <=1e-12; success has no source accuracy bound. Grid uses
safe indices, explicit directed half-open floor cells and rejects unrepresentable
forward roundtrips/collapsed centers. Projection can round/underflow despite finite
results. Viewport inverse rejects normalized scale ratio <=1e-12 or invalid
reciprocal, and checks destination residual <=1e-9*max(1,abs(component)); that does
not recover source bits already lost. No universal precision, stability or visual
correctness claim is justified. Application-specific tolerances remain future decisions.

## Future contract stress review — no implementation

| Scenario | Current contract evidence / limit | Open decision |
| --- | --- | --- |
| Text without coordinates | Scene placement optional; NO_PLACEMENT needs no valid space or GPU | No forced spatial UI |
| Orthogonal 2D | Explicit grid direction/domain/alignment/floor plus scoped plane mapping | Map bounds, occupancy and tiles are future Map work |
| 2.5D anchors / multiple directions | Local-unit anchor/pivot and continuous facing do not alter authored IDs | No depth, height, animation selection or directional frame renderer; separate evidence required |
| Future isometric | Unsupported orientation/kind rejects; IDs independent of mapping | New projection contract requires separate approval; no promise current mapping handles shear/depth |
| Multiple Scene spaces | Explicit project+space references reject mismatch per operation | Same-ID definition revisions/consistency are caller responsibility; no global conversion graph |
| Viewport / DPR change | Host supplies fresh immutable metrics, explicit units/origin/per-axis scale | No DOM measurement, DPR watcher, automatic resize, camera fit or frame binding |
| Headless Server | Server imports Engine only; pure public consumer compiles without DOM and example runs headlessly | No Server changes or GPU validation requirement |
| Game-specific position/range | No authoritative state or screen-to-command integration | Engine must define movement/collision/spawn semantics in its own approved scope |

Phase 8 Scene Rendering still owns future visual-instance allocation/submission;
Phase 9 Camera owns live camera behavior; Phase 14 Map and Phase 15 Selection/Gizmo
own their later tools. Current plain numeric conversion provides none of those
subsystems. No gameplay movement, picking, hierarchy or hidden transform store.

## Current build/static verification and disposition

| Command / inspection | Observed result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS, 59 JS/TS source files; static boundary evidence only |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS, six closure Markdown paths |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS runtime-render, editor, game-client |
| npm run build -- --force | BUILD_PASS all five: Engine, Render, Editor, Client, Server |
| Root source/emitted exports and strict public consumer | Editor90/90, Render52/52; zero consumer diagnostics |
| Actual artifact hashing / baseline protected-path diff | Both hashes match; no protected-path delta |
| git diff --check | PASS |

Static/build/declaration gates repeated on the final checkpoint HEAD; exact SHA
and independent push/PR CI are in PR/handoff. No failed or unconfigured builds.
Existing Windows Harness DEP0190 is nonblocking. Build success establishes
compilation/import compatibility, not functionality or numerical correctness.

No implementation blocker identified within this closure scope. Developer review
must accept/reject Phase 4 contracts, numerical policies and limited headless MVP
evidence. Visual/general behavior remains FEATURE_NOT_VERIFIED. No next phase or
release action is authorized by READY_FOR_DEVELOPER_REVIEW.
