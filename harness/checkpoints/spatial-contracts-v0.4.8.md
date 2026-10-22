# v0.4.8 — Viewport/Screen Mapping & Spatial Validation (SP13/SP14)

READY_FOR_DEVELOPER_REVIEW. Finite public-root data/numeric observations below are
MANUALLY_OBSERVED; general numerical/functional/visual correctness FEATURE_NOT_VERIFIED.
Stop before v0.4.9. Final checkpoint SHA and exact-head CI are recorded in PR/handoff
outside this self-referencing commit.

## Preflight

Source HEAD / previous implemented v0.4.7:
bb34adf1626732db6179e179ded717c8162d21fd. Continuing under Developer's explicit
instruction to implement tasks without prior review requests; green builds are not
historical Developer acceptance. Phase 1–3 exact accepted baselines remain in SP01,
ending at 5ce0feb4c1967c0dee14919b9c11d56991a46bd0. Initial local/remote/PR heads
matched on feat/editor-render-spatial-contracts-v0.4, clean worktree, same Draft
[PR #4](https://github.com/TjnhPro/rpg-platform/pull/4), base main.

Read task, root/project guidance, architecture/ownership/contracts, Foundation,
README, workflow/verification, actual source/roots/manifests/emitted declarations.
Editor 86 / Render 44 prior symbols. Audited selected-plane projection, existing
affine inverse policy and frame session/private backend: target is borrowed and
graphics acquisition explicit, not a public viewport measurement API. Backend has
an empty clear-frame camera, no integration required. No source/API contradiction.
Route CLI supplied no reliable hint; owner selected from behavior/source evidence.

Primary owner Runtime Render: pure portable conversion and numeric validation.
Editor: host metric adapter through Render root only. Editor/game-client consumers
rebuilt. No L1/L2 capability needed; installed Core 2.0.0 / Gameplay 0.15.2 and
frozen pins/dependency directions unchanged. Eleven paths: Render and Editor
src/{viewport-mapping.ts,index.ts}, both project AGENTS.md, ARCHITECTURE.md,
README.md, harness/{OWNERSHIP.md,CONTRACTS.md} and this report. No Engine/Client/
Server source, package/lockfile/dependency/workflow or sixth project change.

## API and policy

Render adds eight symbols (44 -> 52): ScreenMapping2D, ViewportMetrics2D,
ViewportMapping2D, createViewportMapping2D, projectPointToViewport2D,
viewportPointToPlane2D, viewportPointToScreen2D, screenPointToViewport2D.
Editor adds describeViewportMapping (86 -> 87). No removals/signature changes.

Mapping combines existing orthographic projection with explicit viewport metrics.
Destination plane matches project/space/unit/axes exactly. Viewport local top-left
is (0,0), +x right/+y down, width/height positive finite, unit css-px or device-px.
Dimensions describe extent, never silently change projection scale/aspect/fit.
Correspondence destinationOrigin controls where the selected source origin lands
in the local viewport. Off-viewport and fractional points remain valid; no clipping,
pixel rounding, picking or bounds diagnostic is implied.

Screen context is null or explicit plane + origin + positive per-axis
screenUnitsPerViewportUnit. screen = origin + scale*viewport. Screen axes also
right/down and units css-px/device-px. Caller chooses the reference screen and
accounts for borders, page/window offsets, zoom or device scaling. This is not
automatically browser clientX/screenX or a physical-monitor coordinate guarantee.
No separate DPR field: explicit scale already describes the chosen conversion.
CSS/device mismatch rejects unless caller performs the declared conversion.

Research accessed 2026-10-22: [CSSOM View work-in-progress draft](https://drafts.csswg.org/cssom-view/#dom-window-devicepixelratio)
defines devicePixelRatio using CSS/device pixel sizes; [coordinate definitions](https://drafts.csswg.org/cssom-view/#dom-mouseevent-clientx)
distinguish viewport-relative client coordinates and screen-relative coordinates.
Platform decision: host supplies measured context; no window/document/DPR reads
or inference from the Phase 1 borrowed canvas. No external implementation copied.

Inverse is only for this selected 2D orthographic plane, not an unconstrained 3D
world point. Reuse canonical projection with swapped planes/origins and reciprocal
ratios. Descriptor rejects min(ratio)/max(ratio)<=1e-12 (same normalized diagonal
determinant cutoff as existing affine inverse), zero/nonfinite reciprocal; checks
apply to both plane and optional screen mapping. Inverse reprojects candidate and
requires each destination residual <=1e-9*max(1,abs(input component)), else rejects.
This residual is not proof of source accuracy/recovery of bits already lost by
binary64 cancellation/underflow. General source roundtrip bounds remain unproven.

Exact finite own-key plain/null-prototype records detach/freeze deeply. Invalid,
mismatched, missing context/unsupported projection/depth throws TypeError. Numeric
non-invertibility, nonfinite intermediate/output and failed residual throw RangeError.
Native exceptions follow existing spatial API style, not a new diagnostic framework;
getRenderFailure remains lifecycle-specific. Unknown host errors propagate unchanged.

## Reproduce manual observations

One-off Node stdin via node --input-type=module after build, no saved script/tests:

```js
import * as E from '@rpg-platform/editor';
import * as R from '@rpg-platform/runtime-render';
const make=(id,axes,unit)=>E.createCoordinateSpaceDefinition({reference:{projectId:'sample',coordinateSpaceId:id},componentCount:2,axes,unit,origin:{x:999,y:888}});
const scene=make('scene-plane',{x:'right',y:'up'},'metre');
const view=make('local-viewport',{x:'right',y:'down'},'css-px');
const projection=E.describeOrthographicPlaneProjection(scene,view,{sourceOrigin:{x:10,y:-4},destinationOrigin:{x:100,y:200},destinationUnitsPerSourceUnit:{x:20,y:10}});
const raw={plane:projection.destination,width:800,height:600,screen:{plane:{projectId:'sample',coordinateSpaceId:'screen-device',unit:'device-px',axes:{x:'right',y:'down'}},origin:{x:300,y:150},screenUnitsPerViewportUnit:{x:2,y:2}}};
const mapping=E.describeViewportMapping(projection,raw);
const authored=E.createSpatialPoint2D({space:scene.reference,point:{x:12,y:3}});
const vp=R.projectPointToViewport2D(mapping,{plane:projection.source,point:authored.point});
const screen=R.viewportPointToScreen2D(mapping,vp);
const back=R.viewportPointToPlane2D(mapping,R.screenPointToViewport2D(mapping,screen));
console.log(vp,screen,back);
```

| Action/substitution | Independently expected | Observed |
| --- | --- | --- |
| Scene (12,3), origins/ratios above | viewport (100+2*20,200-7*10)=(140,130) css-px | exact, full viewport plane retained |
| Explicit screen origin (300,150), scale2 | (580,410) device-px | exact, full screen plane retained |
| Screen -> viewport -> source plane | (140,130) -> (12,3), within 1e-9 relative policy | exact sample residual (0,0) |
| Viewport local (0,0) -> screen | (300,150) | exact |
| Scene (-100,100), beyond viewport | (-2100,-840), no clamp | exact |
| Mutate raw.width=1/raw.screen.origin.x=999 | captured width800/origin300, detached frozen data | retained; result point frozen; mapping/authored JSON unchanged |
| Viewport inverse with wrong unit device-px / space other | TypeError | plane/unit/axes mismatch |
| width0 / heightInfinity | TypeError | positive finite dimensions required |
| Missing projection source plane / kind perspective / point with z | TypeError, no depth/identity fallback | rejected |
| NaN point / zero ratio | TypeError | finite point / positive ratios required |
| Ratios (1e-13,1) / (MIN_VALUE,MIN_VALUE) | RangeError | numerically non-invertible |
| Source x MAX_VALUE under sample mapping | RangeError | nonfinite affine output |
| sourceOrigin(1e20,1e20), destinationOrigin(0,0), ratios1, inverse viewport(1,1) | RangeError: cancellation loses unit residual | destination roundtrip tolerance exceeded |
| screen:null | viewport conversion still works; screen conversion TypeError | source(12,3); explicit screen context required |
| Throwing metrics host getter | original error unchanged | caught error === marker true |

Also manually reused Phase 3 Scene sample/zone visual placement scene-plane(12,3)
and Phase 2 sample/image catalog reference/source assets/visual.png, metadata {}.
Existing describeSceneObjectVisual supplies placement/resource descriptor; explicit
caller plane context gives viewport(140,130), prepareVisualResource returns
metadata-prepared. Membership/catalog JSON unchanged; text object placement null,
empty Scene objects0; window/document/WebGLRenderingContext undefined. This is
ad hoc public API composition, not a new Scene spatial adapter (v0.4.9 deferred).
No graphics session or image content loaded, no frame/visual assertion.

## Verification and stop

| Command/evidence | Result |
| --- | --- |
| node harness/cli.mjs check | ARCH_CHECK_PASS, 57 JS/TS files |
| node harness/cli.mjs scope --projects editor,runtime-render --allow-infra | SCOPE_PASS, eleven scoped paths |
| node harness/cli.mjs verify --projects editor,runtime-render --with-consumers | BUILD_PASS Render, Editor, game-client |
| npm run build -- --force | BUILD_PASS all five projects |
| Source/emitted root inventories | Editor 87/87, Render 52/52; no prior exports removed |
| Strict in-memory public-root declaration consumer | zero diagnostics, all nine additions, ES2022/NodeNext/no DOM, skipLibCheck:false |
| git diff --check | PASS |

Final build/declaration/static evidence repeated at checkpoint HEAD; CI links/SHA
in PR/handoff. Windows Harness DEP0190 warning nonblocking. No unconfigured/failed
build remains. No tests/runners/CI steps created or run. Text-only content stays
spatially optional; gameplay spatial truth remains Engine-owned and Server requires
no DOM/GPU. Camera controls/resizing, rotation/shear/depth/perspective, visual product
review and broad numerical accuracy remain open. No blocking ownership decision.
No v0.4.9, merge, tag, release, publication or package version bump.
