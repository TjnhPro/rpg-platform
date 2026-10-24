# v0.9.0 — CM01 Camera Architecture & Contract Foundation

**API_DESIGN_ONLY / READY_FOR_NEXT_CHECKPOINT** after recorded build gates.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**. No live Camera API is introduced.

## Baseline and scope

Source baseline: main `e4464ac8e1c84a1c872f8e7a722885942a268a28`, merged
[Phase8 PR #8](https://github.com/TjnhPro/rpg-platform/pull/8).
The Developer authorized the merge and then supplied Phase9 CM01. This establishes
the integration baseline, not retrospective visual acceptance of Phase8.
Its [closure](../../harness/checkpoints/scene-rendering-v0.8.14.md) still records
unobserved runtime/pixel behavior. All source links below refer to files whose
production content is unchanged from that baseline.

Canonical primary owner: **runtime-render**. Harness records ownership/contracts;
Editor and Client are compatibility consumers only. Seven documentation paths;
zero production/public export/union/schema/dependency/compiler/workflow changes.
No external L1/L2 APIs are needed for camera work. Five projects remain.
See [exact-baseline public inventory](camera-api-inventory-v0.9.0.md).

## Actual capability and integration inventory

| Actual public API/type | Owner / current support | Camera integration point, not current capability |
| --- | --- | --- |
| `ProjectionPlane2D`, `PlaneProjectionPoint2D` | Render [plane-projection](../src/plane-projection.ts); exact project/space/unit/axes, no registry lookup | Required explicit source context; matching labels do not infer a gameplay world |
| `OrthographicPlaneProjection`, `createOrthographicPlaneProjection`, `projectPlanePoint2D` | Render; axis-aligned forward mapping, positive per-axis ratios and origin correspondence | Reuse capture/axis validation; no rotation/shear/elevation in this descriptor |
| `AffineTransform2D`, `composePlanarTransforms2D`, `applyPlanarPoint2D`, `invertPlanarTransform2D` | Render [planar-affine](../src/planar-affine.ts); full planar affine, conditional inverse | View rotation/basis can compose these primitives; no alternate spatial math in consumers |
| `ViewportMetrics2D`, `ScreenMapping2D`, `ViewportMapping2D`, `createViewportMapping2D` | Render [viewport-mapping](../src/viewport-mapping.ts); pure explicit viewport capture | Width/height alone never imply aspect, fit or a live camera |
| `projectPointToViewport2D`, `viewportPointToPlane2D` | Render; forward and selected-plane constrained inverse | Preserve existing axis-aligned semantics; arbitrary oblique inverse unsupported by these functions |
| `viewportPointToScreen2D`, `screenPointToViewport2D` | Render; explicit screen plane/origin/positive ratios, nullable screen context | Host supplies measured client/screen conversion; no DOM/global/DPR inference |
| `createRenderFrameSession`, `beginRenderFrameSession`, `RenderFrameSession` | Render [frame-session](../src/frame-session.ts); canonical acquisition, demand-driven synchronous submit | Live camera must attach to this session, not acquire another renderer |
| `getRenderViewportSnapshot`, `resizeRenderViewport`, `RenderViewportResizeReceipt` | Render; full-canvas accepted buffer, requested CSS metrics/effective ratios in resize receipt | Last viewport snapshot alone cannot recover logical CSS extent or screen origin |
| `invalidateRenderFrame`, `getRenderFrameInvalidationSnapshot`, suspend/resume APIs | Render; redraw demand, host-controlled suspension; no internal RAF | Accepted camera change should mark existing demand; never schedule a frame itself |
| `createVisualResourceCache`, `VisualResourceLease`, PNG/texture/atlas root APIs | Render Phase7 [cache](../src/visual-resource-cache.ts), [texture](../src/render-texture.ts), [atlas](../src/atlas-frame.ts) | Implemented usable leases, real source/decode/upload/frame rights; camera borrows no new texture ownership |
| `createRenderVisualScene`, instance transform/resource/layout/visibility/order operations | Render Phase8 [scene](../src/visual-scene.ts) | Real scene/frame integration exists; not just metadata. Resource rights remain revalidated at submission |
| `RenderVisualInstanceTransformSnapshot.localToScene/localToClip` | Render [transform](../src/visual-instance-transform.ts) | Existing per-instance projection ends at `render-clip-2d`, clip-unit, right/up; not a session camera |
| `createScenePreviewBridge` | Editor [preview](../../editor/src/scene-preview.ts); serial partial-result orchestration | Future UI calls Render camera API; preview mapping and authored state remain Editor-owned |
| Optional Client host | Client [host](../../game-client/src/manual-scene-host.ts); Render root only | Intent/input and host scheduling; no Editor import or camera math |
| Camera description, live binding, revision, pan/zoom operations | **UNSUPPORTED / DESIGN_ONLY** at baseline | No public camera identity/state or automatic resize-to-camera synchronization exists |
| 2.5D affine ground basis/elevation/known-height inverse | **UNSUPPORTED / DESIGN_ONLY** as a camera capability | Planar affine primitives exist; no arbitrary 3D reconstruction or oblique descriptor is supplied |

All supported rows mean source-backed and compile-consumable, not runtime/visual
verification. PNG/atlas loading and Phase8 draw have actual implementations; CM01
does not strengthen their earlier browser evidence or TPSheet compatibility claims.

## Existing numerical boundaries to preserve

`projectPlanePoint2D`: per axis `destinationOrigin + axisSign * ratio *
(point - sourceOrigin)`. Axis sign is derived from declared axes. Source/destination
planes carry exact scoped keys and units; correspondence origins are not registry
offsets. Descriptor records have exact keys, finite components and positive ratios.
No arbitrary rotation/shear, height, clipping, NDC, fit or automatic unit conversion.

`createViewportMapping2D` requires positive finite dimensions, destination equal to
viewport plane, right/down axes and css-px or device-px. Screen conversion requires
its own explicit origin/plane/scale; null means unavailable. Off-viewport points
remain valid. No clamp, hit-test or rounding policy is implied.

Viewport inverse rejects min(ratio)/max(ratio) <= 1e-12 or nonfinite/zero reciprocal.
After inverse it checks a destination forward residual <=
`1e-9 * max(1, abs(input component))`. This is not a source error bound or recovery
of information already lost by binary64 cancellation/underflow. Affine inverse
normalizes its linear block by the maximum absolute coefficient and rejects zero
scale or absolute normalized determinant <= 1e-12 with `non-invertible`; nonfinite
result arithmetic throws RangeError. Invalid/mismatched spatial data throws
TypeError, numerical limits RangeError, unknown accessor exceptions propagate.

## Position ownership and dependency direction

| Position/state | Canonical owner | Legitimate flow / invariant |
| --- | --- | --- |
| Authored Scene placement/space | Editor | Captured authored data -> neutral Render request; camera never edits placement or Document dirty/revision/save |
| Gameplay position/movement/follow policy | Runtime Engine | Game-specific intent -> selected Client presentation; no Render-to-Engine write or copied gameplay rules |
| Visual instance local transform/anchor/attachment | Runtime Render Phase4/8 | Neutral placement -> immutable localToScene; identity/resource/depth remain independent of camera |
| Camera center/view/projection | Runtime Render Phase9 design | Host intent -> Render validation/math/state; Editor/Client own controls, not a second camera implementation |
| Viewport logical CSS and host screen measurements | Editor/Client host supplies; Render captures mapping | Host -> public root; accepted buffer stays Phase6-owned; screen conversion is optional explicit context |
| Drawing buffer/native matrices | Runtime Render Phase6/private backend | Render alone applies accepted metrics and native writes; no public Three/DOM/WebGL DTOs |

```text
Editor authored placement -> neutral presentation request
                                           |
Engine gameplay position -> Client intent -> Render visual instance (localToScene)
                                           |
                            Render camera view/projection [DESIGN_ONLY]
                                           |
                               viewport logical CSS mapping
                                           |
                     Phase6 accepted buffer / existing frame backend

Explicit host screen context <-> viewport <-> selected source plane
```

This is a target camera dataflow, not code shipped by CM01. Current Phase8 instead
composes each instance's supplied projection to localToClip, installs it on a
private Object3D, and draws through the same fixed identity Three Camera at z=0.
[three-frame](../src/three-frame.ts) and [draw](../src/three-visual-draw.ts) own
the only backend. No camera selection/manager exists in Editor/Client. Their
[projection](../../editor/src/plane-projection.ts) and
[viewport](../../editor/src/viewport-mapping.ts) adapters delegate to Render.
Static/source inspection found no cross-project projection implementation to move.

## Camera concepts and chosen semantic direction — DESIGN_ONLY

These are design requirements for later supplied checkpoints, **not exported
types or reserved signatures**. Consumer/invariant comes before any future API.

| Concept | Proposed consumer / invariant |
| --- | --- |
| Camera description | Editor workspace or Client intent; portable detached numeric config, valid without GPU/session and optional for text/headless content |
| Live binding | Same consumers; opaque issued identity attached to one canonical session, not a Scene/Object/Asset/Entity/session ID alias; no raw Three target |
| View transform | Render-owned world/selected-plane -> camera-local affine; pan/rotation are view changes, never localToScene edits |
| Projection result | Detached source/view/viewport-context result tagged by the revision used; historical observation, no displayed/GPU-ready claim |

- Source is an explicit `ProjectionPlane2D`, including projectId,
  coordinateSpaceId, exact unit and x right/left, y up/down. No global world plane.
- Center is a finite point in that same source plane/unit. A source point equal
  to center maps to logical viewport center `(width/2,height/2)`.
- Orientation is a finite radians view-axis orientation in the declared source
  numeric axes: +x zero, positive toward +y. World-to-view applies the inverse
  view rotation before destination-axis conversion; not gameplay facing or a
  texture/frame selector. The axis-aligned Phase4 descriptor remains unchanged.
- Positive finite x/y projection ratios mean CSS pixels per declared source unit
  at zoom1. Positive finite dimensionless zoom multiplies both ratios; zero,
  negative, NaN/Infinity reject before state/native mutation, never clamp.
- MVP aspect policy: preserve these declared ratios as logical extent changes;
  center is stable and visible span changes. No implicit fit/stretch, map bounds,
  letterboxing or design-resolution selection. Unequal explicit ratios are caller
  policy, not an aspect correction inferred by Render.
- Viewport logical unit for camera design is css-px, top-left0, right/down,
  finite positive logical width/height. Zero/hidden host state uses existing
  suspension, not a zero-sized camera or graphics disposal. Phase4 still accepts
  explicit device-px mappings; do not silently narrow that existing API.
- Buffer dimensions are the Phase6 accepted extent. Use effective accepted
  buffer/CSS ratios once when deriving native presentation. No second requested
  DPR multiplication; never infer CSS or screen origin from buffer attributes.
- Screen mapping remains optional and host supplied, including scroll/client
  origin and per-axis scale; no default origin0, global document or DOMRect DTO.
- Future snapshots need a camera-scoped revision of accepted view configuration
  plus the logical/accepted viewport context used. Reject/stale update does not
  advance it; changed accepted camera/viewport input does; equal input can reuse
  a snapshot. Numeric representation/overflow and exact signatures are deferred
  to their own tasks; no global clock/revision registry or new Phase6 promise.

## 2.5D direction — explicit basis and selected-height inverse only

Design model: ground coordinates `(u,v)` in a named plane map through declared
finite basis vectors `Bu,Bv` plus an origin; elevation adds a separately declared
`h * E` in the same destination units/axes. Height unit, elevation origin and
direction E must be explicit. Never infer height from sprite pixel height or
screen Y, or treat the local sprite pivot as authoritative gameplay position.

For a known height, subtract its declared elevation contribution, then invert
the 2x2 ground basis through existing Render affine primitives subject to their
conditioning/finite limits. A selected parallel plane may supply that known
height. Unknown height/plane has no unique inverse and must report unavailable
or reject, not return a guessed world point. Singular/ill-conditioned basis
rejects; no identity fallback, raycast or general 3D inverse promised.

This design is not implemented by `OrthographicPlaneProjection`: its diagonal
axis mapping cannot describe arbitrary oblique/isometric basis. Future additive
Render contracts must capture basis/unit/axes and selected-plane context before
exposing this operation; do not add an oblique tag to existing exact records or
repurpose their axis-aligned inverse. Elevation presentation must not change
Phase8 ground attachment/depth sorting or Engine world truth.

## Compatibility and failure matrix

| Risk | Compatible seam / required future decision | Breaking/prohibited shortcut |
| --- | --- | --- |
| Phase4 exact DTO records and constrained inverse | New explicit camera types/functions can reuse canonical affine and capture operations | Extra required fields/kinds or silently rotated interpretation of existing projection |
| Phase6 closed `RenderFrameFailure` code/stage unions | Separate camera admission classifier is preferable; keep original graphics failures and cleanup flags | Adding code/stage/domain variants breaks exhaustive consumers even if described as additive; requires explicit migration approval |
| Phase8 `localToClip` already includes projection | Preserve legacy no-camera path; opt-in session camera must derive from localToScene in the existing backend once | Applying a view camera to already projected nodes, inverting arbitrary old clip matrices, or rewriting instance placement for pan |
| Phase8 per-instance projections/planes may differ | Opt-in binding must require coherent selected source context or explicitly reject before commit; exact admission shape deferred | Silently coercing heterogeneous instances or requiring a camera for existing consumers |
| Viewport acceptance/invalidation | Existing accepted resize + captured logical metrics feed one camera view; mark canonical demand on accepted changes, snapshot consistent inputs for frame | Mutating host canvas from camera helper, stale candidate used as acceptance, internal RAF or camera update treated as gameplay tick |
| Session end/context loss | Future live binding ends through canonical terminal integration; stale/foreign handles reject; retained pure description may survive | Parallel session/resource lifecycle, implicit restore/reacquisition, camera disposing host canvas or another session |
| Resource/atlas lifetime | Phase7 owns leases; camera neither reacquires nor releases instance resources; Phase8 validates submitted usage | Upload/cache clone, expired rights used because a camera snapshot says valid |
| Phase8 sorting/transparency | Source attachment/explicit keys and stable ties stay canonical; view transforms do not recompute keys | Projected-Y depth replacement or claims of general alpha correctness |
| Editor/Client/Document | Same Render implementation; host workspace camera intent only; snapshot authored content before/after future manual exercise | Saving live handles or pan/zoom dirtying content/gameplay state |

Pure camera admission should reject invalid inputs before accepted state/native
mutation, preserving original exceptions when unknown. Backend mutation failure
uses existing terminal cleanup/quarantine rather than a success receipt or retry.
No failure union is changed at CM01. Official Three [Camera documentation](https://threejs.org/docs/pages/Camera.html)
distinguishes view inverse and projection matrices; [OrthographicCamera](https://threejs.org/docs/pages/OrthographicCamera.html)
requires projection updates after property changes. Checked installed three0.186.1,
@types/three0.186.0 and TypeScript6.0.3 govern integration; no dependency update or
choice to expose a native camera is made here.

## Narrow MVP and evidence handoff

Target one active orthographic camera per graphics session, independent across
Editor/Client canvases, implemented only by shared Render. Reuse Phase7/8 original
map/background, one Player image and three Monster frame instances. No animation,
follow smoothing, camera hierarchy/controller, perspective/cinematics/split screen,
picking, ECS, culling, streaming, networking or gameplay implementation.

| Scenario | EXPECTED / source-backed current behavior | OBSERVED at CM01 |
| --- | --- | --- |
| Invalid dimensions, mismatched plane | Existing pure viewport/plane APIs reject TypeError; numeric inverse limits reject RangeError | Source inspected and declarations compiled; runtime NOT_OBSERVED |
| Invalid camera zoom/orientation | Future camera admission rejects nonfinite/invalid input before commit | No such API yet; DESIGN_ONLY, NOT_OBSERVED |
| Unknown selected ground plane/height | Future inverse rejects/unavailable, never guesses | DESIGN_ONLY; no 2.5D camera inverse executed |
| Expired/foreign resource | Existing Phase7/8 binding/submission validates live rights/context/revision | Source inspected; GPU scenario NOT_OBSERVED |
| Camera A update/dispose leaves B unchanged | Future issued camera/session ownership; separate snapshots/contexts | No live camera binding; NOT_OBSERVED |
| Pan/zoom preserves authored/gameplay/instance/depth state | Future public-root manual consumer compares immutable before/after state while pixels change | No live scene mutation or demo run in CM01; NOT_OBSERVED |

Existing public-root manual consumers are compiled, not executed as tests.
No new fake camera consumer/no-op demo is useful before an actual API exists.
Future manual procedure: acquire independent A/B, load real Phase7 leases and
Phase8 instances, capture authored JSON/gameplay input/instance IDs/depth, change
A view, compare unchanged values and B snapshot, observe actual projected pixels,
reject invalid requests and exercise terminal cleanup. Selected-plane numerical
observations must record actual inputs/residuals against declared tolerance;
there is no numerical or visual PASS in this design-only checkpoint.

No critical dependency blocker established for CM01. v0.9.1 requires its supplied
incremental task; no future signatures or implementation are authorized by this
design map alone. Developer retains phase acceptance, merge and release decisions.
