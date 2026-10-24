# Runtime Render — project-specific agent guidance

**Canonical owner:** Shared presentation engine for Editor and Game Client: scene, sprites, animation, VFX, camera, visual asset presentation. Three.js is the intended renderer; specific scene formats remain subject to MVP evidence.

Read root agent guidance first.

- [v0.10.0 SA01](docs/sprite-animation-v0.10.0.md) is API_DESIGN_ONLY:
  Render owns proposed sequence/8-way mapping/explicit-delta playback and binding.
  Exactly eight slots; Phase4 +x/toward+y canonical orientation. Phase7 retains
  atlas/revision/lease authority, Phase8 instance/layout/depth, Phase6 frames,
  Phase9 camera. No production exports yet. Explicit fixed local draw rectangle,
  no inferred sourcePivot/trim or animation gameplay authority. Future native MVP
  needs verified eight-way assets; build is not animation or pixel acceptance.

- [v0.9.10 CM16/CM17](docs/camera-v0.9.10.md): optional live camera/Scene binding
  uses canonical Phase6 submission and private orthographic backend. Bound draws
  use localToScene once, preserve Phase8 snapshots/depth/resources. Camera edits
  invalidate only; fresh configure after every accepted resize. Receipt application
  is historical submission evidence, not pixels. Legacy no-binding path remains.

- [v0.9.5 CM09/CM10](docs/camera-v0.9.5.md): read current camera CSS mapping only
  with exact latest Phase6 session resize receipt and matching host logical extent.
  Preserve scale, separate accepted buffer/ratio, reject suspended/terminal/stale.
  Historical configured-not-applied result is not a native camera/session binder.

- [v0.9.4 CM07/CM08](docs/camera-v0.9.4.md): configured cameras share the existing
  handle/lifecycle, with additive immutable view snapshots and explicit zoom limits.
  Center/focus zoom commit atomically; use canonical Phase4 inverse/affine/residual
  policy and exact current logical CSS context. No session/GPU binding yet.

- [v0.9.3 CM06](docs/camera-v0.9.3.md): additive issued-handle set-center/pan,
  source-plane units/axes, shared Phase4 admission/affine math and immutable commit
  seam. No live binding/invalidation yet; do not change authored or gameplay positions.

- [v0.9.2 CM05](docs/camera-v0.9.2.md): pure orthographic configuration uses
  explicit per-axis CSS-px/source-unit scale, positive zoom and preserve-scale
  extent policy with center at logical midpoint. No implicit DPR/fit, projection
  calculator, viewport acceptance or change to the v0.9.1 lifecycle contract.

- [v0.9.1 CM02/03/04](docs/camera-v0.9.1.md) adds real pure CPU camera state,
  ephemeral identity and terminal lifecycle. Reuse Phase4 capture; preserve frozen
  observations, no-op revision and host-exception/reentrant-disposal semantics.
  No session binding, occupancy enforcement, GPU application or camera matrix yet.

- [v0.9.0 CM01](docs/camera-v0.9.0.md) is Camera API_DESIGN_ONLY. Existing Phase4
  axis-aligned mapping is not an arbitrary oblique camera; Phase8 already bakes
  per-instance localToClip and uses a fixed private Camera. Future opt-in view
  must avoid double projection and preserve legacy behavior, source depth and
  authored/gameplay truth. CM01 made no runtime API or diagnostics union change.

- [v0.8.10 SR15/SR17](../harness/checkpoints/scene-rendering-v0.8.10.md): use
  getRenderVisualDiagnostic for safe caught-error domain/code data; unknown never
  means success. Scene diagnostics count logical usages and preserve sticky cleanup
  uncertainty after terminal/repeated disposal. Never release scope quarantine
  after failed cleanup. Phase6/7 retain canonical lifetime ownership; no telemetry,
  global error bus or leak-free claim. See [contract](docs/scene-rendering-v0.8.10.md).

- [v0.8.9 SR14](../harness/checkpoints/scene-rendering-v0.8.9.md): explicit local
  sprite layouts opt into actual mesh/frame drawing through the existing frame
  session. Capture one ordered submission under the synchronous edit guard; rank
  actual meshes. Borrow Phase7 allocations via Three ExternalTexture, never reupload
  or delete them. Same clear/status/demand/terminal policy, no scheduler. See
  [contract](docs/scene-rendering-v0.8.9.md) and [manual](manual/visual-scene-frame.md).
  Draw is implemented but FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED remains.

- [v0.8.8 SR11/SR12/SR13](../harness/checkpoints/scene-rendering-v0.8.8.md): opt-in
  layer depth-key/ground-y policies retain explicit-order default. Ground uses
  Phase4 source-plane attachment, exact unit/axes and declared front; missing
  context rejects. Layer group precedes depth, then explicit order/ordinal ties.
  Scene-local revision cache, proposed-transform sort before native commit.
  Alpha profile selected for future draw; DRAW_NOT_IMPLEMENTED remains. See
  [contract](docs/scene-rendering-v0.8.8.md).

- [v0.8.7 SR09/SR10](../harness/checkpoints/scene-rendering-v0.8.7.md): scene-local
  presentation layers and explicit instance order use priority, layer creation
  ordinal, order, instance ordinal. Default layer preserves existing consumers;
  missing/duplicate/invalid/in-use-delete rejects. Hidden layer gates the same
  native node without releasing resources. Candidates are participation metadata,
  not drawable readiness. See the [contract](docs/scene-rendering-v0.8.7.md).

- [v0.8.6 SR08](../harness/checkpoints/scene-rendering-v0.8.6.md): per-instance
  visible defaults true and only gates presentation. Effective flag includes
  canonical Phase 6 viewport suspension without rewriting intent. Hide/show
  preserves identity, transforms and resources; hidden updates keep latest matrix.
  Equal updates do not invalidate. Native Object3D.visible is the existing backend
  gate; DRAW_NOT_IMPLEMENTED remains explicit until real drawable integration.

- [v0.8.5 SR07](../harness/checkpoints/scene-rendering-v0.8.5.md): current instance
  transforms reuse Phase 4 TRS/affine/alignment/projection with explicit units and
  axes. Fixed same-project render-clip-2d mapping feeds non-drawable private nodes
  in the existing backend. Ground pivot=anchor keeps contact under rotate/scale;
  no texture-center inference. Validate before native write/state commit, retain
  identity/resource rights, unlink nodes on cleanup. No native public types,
  camera/hierarchy/draw or behavior/visual PASS inferred from build.

- [v0.8.4 SR06](../harness/checkpoints/scene-rendering-v0.8.4.md): bind through
  the Phase 7 public lease, retain an independent waiter in the existing cache.
  Host lease release cannot revoke instance usage; cache/session revocation can.
  Reuse Phase 7 frame resolution/view admission and explicit revisions/page
  attestation. Validate new usage before commit, release old after commit; unknown
  cleanup failures propagate with committed state. Unlink/drain every owned usage
  on removal/clear/terminal; no second cache, loader, native exposure or draw.

- [v0.8.3 SR05](../harness/checkpoints/scene-rendering-v0.8.3.md): add remains
  creation; replace only current correlation through exact live handle. Read current
  state via getRenderVisualInstanceSnapshot; handle fields remain registration
  history. Update preserves handle/ID/ordinal/order; equal props reuse snapshot.
  Validate before commit, recheck provenance/terminal and nested changes. Known
  admission errors classify safely; no transforms/resources/native state yet.

- [v0.8.2 SR03/SR04](../harness/checkpoints/scene-rendering-v0.8.2.md): Render
  root owns immutable scene-local membership. Caller string live keys differ from
  runtime scene/session symbols and optional neutral authored correlation. Remove
  by exact issued handle; stale handles never remove reused IDs. Ordinals increase
  across clear/remove; terminal clears membership and rejects operations. No native
  instances/resources/sorting; historical records are not live/GPU observations.

- [v0.8.1 SR02](../harness/checkpoints/scene-rendering-v0.8.1.md): empty visual
  scene scope accepts one canonical live graphics session, one active scene per
  session. clear is empty-only; dispose/canonical session end is terminal and
  idempotent with first reason preserved. Snapshots contain symbols/state only.
  Reuse existing terminal subscription; no graphics/instances/resources/frame
  allocation or authored-ID handles. Build/compiled consumer is not browser proof.

- [v0.6.10 RV15/RV11](../harness/checkpoints/render-viewport-v0.6.10.md): canonical
  terminal graphics observations always supply cleanupFailed, independently of a
  null unknown failure. Optional member preserves structural producers; absence
  is unknown. Preserve recognized acquisition codes and both branded classifiers.
  Repeated disposal retains terminal diagnostics/quarantine; never clean another
  session or host canvas/CSS. False is not GPU-memory reclamation evidence.

- [v0.6.9 RV13/RV14](../harness/checkpoints/render-viewport-v0.6.9.md): Render70 adds
  per-session invalidation read/mark APIs. Initial demand and accepted resize/resume
  invalidate; successful frame acknowledges only its captured token. Invalidate
  never requests/submits/schedules or changes authored content. Demand survives
  suspension/terminal state; consult viewport separately. Hosts own rAF/visibility/
  cancellation; no Render clock or loop. Both manual host patterns compiled only.

- [v0.6.8 RV12](../harness/checkpoints/render-viewport-v0.6.8.md): preserve the
  synchronous renderFrame and submitted-only receipt; add optional viewport for
  structural compatibility, always populated by canonical sessions. Frozen active
  full-canvas snapshot is historical submission configuration, never displayed
  pixels/GPU completion. FRAME_IN_PROGRESS rejects nested calls without queue or
  cleanup; FRAME_NOT_SUBMITTED distinguishes backend early-return/no counter
  increment and terminates graphics. Existing suspension/loss/disposal semantics
  remain. No automatic loop, gameplay/animation update or new root symbol. Manual
  semantic receipt consumer compiled only, not browser/visual verified.

- [v0.6.7 RV09–RV11](../harness/checkpoints/render-viewport-v0.6.7.md): Render67
  adds explicit suspendRenderViewport/resumeRenderViewport. Suspended keeps backend,
  last positive buffer extent and reservation; direct frame rejects nonterminal
  VIEWPORT_SUSPENDED/renderFrame. Resume requires fresh positive RV08 metrics before
  enabling frames; resize alone keeps suspension. Host zero CSS/hidden remains UI
  policy, never an automatic dispose, buffer0 or native-loss signal. Full-canvas
  bounds only; no scissor/subregion implementation. Two-target manual compiled,
  not browser/GPU/visual verified. Historical checkpoint notes below retain scope.

- [v0.6.6 RV08](../harness/checkpoints/render-viewport-v0.6.6.md): Render65 adds
  resizeRenderViewport/RenderViewportResizeReceipt; unchanged session interface.
  Apply explicit RV07 plan once at Three ratio1 via setSize(...,false), enforce
  native limits and capture actual extent. Rejected admission preserves state;
  mutation failure uses terminal cleanup/quarantine. Graphics diagnostic adds
  RESIZE_FAILED and resize stage. No CSS/global measurement, frame, camera or
  Scene/Document mutation. Manual demo compiled, not browser/visual verified.

- [v0.6.4 RV06](../harness/checkpoints/render-viewport-v0.6.4.md) adds RenderViewportSnapshot/getRenderViewportSnapshot (59 root symbols). One full-canvas viewport uses the existing session symbol. Immutable observations derive from the canonical graphics lifecycle; private weak handle lookup is not an active viewport manager. Last-configured extent uses drawing-buffer-px, independent of CSS and Phase 4 projection planes. Pending/unavailable/active/terminal are produced; suspended is contract-only until an explicit operation is authorized. No resize, suspend/resume, authored-state persistence or required interface/signature changes. Two-target typed manual consumer is compiled, not browser-verified.

- [v0.6.3 RV05](../harness/checkpoints/render-viewport-v0.6.3.md) adds CONTEXT_LOST to the existing graphics failure code union; 57 exports unchanged. Native loss event/pre/post-frame checks terminate the same session via shared cleanup; remove private listener and dispose Three to prevent internal auto-restoration. Preserve terminal diagnostics and failed-cleanup quarantine. Host alone requests a new session on a usable target; no automatic recovery/upload/retry or forced context loss. Unknown frame and getContext exceptions remain original, with null safe failure observation. Manual DevTools native-extension procedure is unexecuted; build PASS is not context-loss/visual evidence.

- [v0.6.2 RV03/RV04](../harness/checkpoints/render-viewport-v0.6.2.md) adds beginRenderFrameSession/RenderFrameAcquisition/RenderGraphicsSnapshot (57 root symbols). One canonical acquisition backs both entrypoints; observer handle is not a second session and has no render/dispose. Preserve existing async factory signature and binding states. Snapshot ready records acquired state, not continuous GPU health/display. Failed/disposed are terminal observations; repeated dispose preserves failure and existing cleanup/quarantine. Compiled manual browser entry is isolated from root evaluation, not runtime-verified. No resize/suspend/recovery or implicit frame.

- [v0.6.1 RV02](../harness/checkpoints/render-viewport-v0.6.1.md) adds inspectRenderTarget/RenderTargetCapabilities (54 root symbols). Inspect raw target without context acquisition; supported native same-realm canvas dimensions and package-instance reservation are observations, never graphics readiness. Reuse private native brand validation in existing backend. Preserve opaque binding APIs/error unions and existing exclusive WeakSet ownership, including failed-cleanup quarantine. Manual consumer is optional and unverified in browser. RV02 task supersedes v0.6.0 provisional metrics allocation; no resize/pixel-ratio/suspend implementation.

- [v0.6.0 RV01](../harness/checkpoints/render-viewport-v0.6.0.md) audits Render52 and merged Phase 1–5 without source/API changes. Extend existing RenderFrameSession, not a competing graphics lifecycle. Render owns graphics/viewport; host consumers own canvas UI/layout/measurements/frame requests. Preserve bound metadata semantics, submitted-only receipts, terminal cleanup, pure Spatial mappings and authored Document/Scene isolation. Proposed RV02–RV19 allocations and future signatures remain open until their supplied tasks. Phase 6 execution is authorized; this architecture checkpoint is API_DESIGN_ONLY, FEATURE_NOT_VERIFIED and VISUAL_NOT_VERIFIED, not phase acceptance.

- [v0.4.12 SP18](../harness/checkpoints/spatial-contracts-v0.4.12.md) audits the complete Spatial surface without adding API/algorithms. Canonical math stays here; Editor only adapts public inputs. Preserve explicit context, binary64 limits, failure semantics and optional screen mapping. Root remains 52 symbols; no Scene instance/session binding or graphics integration is implied. Stop for Developer review before any separate phase. Earlier notes describe their own revisions.

- [v0.4.8 SP13/SP14](../harness/checkpoints/spatial-contracts-v0.4.8.md) adds explicit viewport/screen mapping (52 root symbols). Viewport local top-left (0,0), right/down, css-px or device-px, positive finite dimensions; source is the declared orthographic plane. Screen needs explicit plane/origin/per-axis scale or remains null. Reuse canonical projection; no implicit DPR/DOM/camera or clipping. Inverse rejects normalized scale ratio <=1e-12/nonfinite reciprocal and checks destination residual <=1e-9*max(1,abs(component)); no universal source accuracy guarantee. TypeError for invalid/mismatched data; RangeError for numerical failures. Prior notes describe their own revisions. Stop before v0.4.9.

- [v0.4.7 SP12](../harness/checkpoints/spatial-contracts-v0.4.7.md) adds ProjectionPlane2D/PlaneProjectionPoint2D/OrthographicPlaneProjection, createOrthographicPlaneProjection/projectPlanePoint2D (44 exports). Explicit per-axis mapping: destinationOrigin + axisSign * positive ratio * (point-sourceOrigin), using existing affine point operations. Match scoped source/unit/axes; unsupported kinds reject. Pure forward mapping only; no perspective/isometric, inverse, clipping, camera or viewport integration. Scene/Asset/facing/anchor contracts unchanged. Stop before v0.4.8.

- [v0.4.6 SP10/SP11](../harness/checkpoints/spatial-contracts-v0.4.6.md) adds immutable VisualAnchor2D/VisualOrientation2D/VisualAlignment2D and their factories/resolver (39 exports). Local-unit anchor/pivot and offset yield unrotated origin = placement + offset - anchor and plane pivot = origin + local pivot through existing planar translations. Facing is independent metadata: numeric +x zero, positive toward +y, [0,2*PI), no wrap/quantization/animation. No image dimensions, implicit scale, rotation application, Scene types or GPU. Stop before v0.4.7.

- [v0.4.5 SP09](../harness/checkpoints/spatial-contracts-v0.4.5.md) adds seven exports (33 total) for portable orthogonal conversion capture and gridCellToScenePosition/scenePositionToGridCell. Match project/space/unit exactly; corner/center alignment and floor policy required. Directed normalized intervals [i,i+1), no epsilon/nearest/clamp. TypeError for invalid/mismatched input; RangeError for index domain, numerical overflow/underflow, unsafe result or failed forward roundtrip/collapsed center. No Editor import, map catalog, Scene traversal or GPU. Stop before v0.4.6.

- [v0.4.4 SP08](../harness/checkpoints/spatial-contracts-v0.4.4.md) adds authored orthogonal grid capture in Editor only (83/26 root symbols). Render receives no grid catalog, authored types or new API. Future conversion requires portable Render-owned input and explicit policies, never an Editor import or duplicate math in Editor. Stop before v0.4.5.

- [v0.4.3 SP06/SP07](../harness/checkpoints/spatial-contracts-v0.4.3.md) adds seven root symbols (26 total): affine capture, point apply, ordered composition and conditional inverse. [A,B] means B*A; retain shear instead of decomposing TRS. Points include translation; no direction API. Inverse rejects normalized determinant magnitude <=1e-12; invalid input throws TypeError and nonfinite arithmetic RangeError. No hierarchy, space lookup or GPU requirement. Stop before v0.4.4. Older notes below describe their checkpoint revisions.

- [v0.4.2 SP05](../harness/checkpoints/spatial-contracts-v0.4.2.md) adds PlanarTransform2D/createPlanarTransform2D (19 root exports). Capture finite explicit translation/rotationRadians/scale; detach/freeze exact nested records. Semantics are S then R then T about numeric zero; positive angle maps +x toward +y. Zero/negative scale is valid data, never proof of invertibility. No THREE matrix, space registry, point application, composition, inverse or acquisition. Stop before v0.4.3.

- [v0.4.1 coordinate spaces](../harness/checkpoints/spatial-contracts-v0.4.1.md) implements authored declarations/points in Editor only. Render remains 17 exports; it does not consume those records yet. Future presentation descriptors must be Render-owned portable contracts supplied explicitly by the Editor adapter, never imports of Editor types. No projection/math or graphics dependency is added to authored capture. Stop before v0.4.2.

- [v0.4.0 Spatial foundation](../harness/checkpoints/spatial-contracts-v0.4.0.md) assigns future presentation transform/projection/viewport math to Render, independently of Editor, gameplay and GPU acquisition. SP01 is API_DESIGN_ONLY; no public symbols added. Future portable operations require explicit spaces/units/context and coherent inverse/failure policy; never import Editor definitions or expose THREE/DOM/GPU types in spatial DTOs. Existing resource metadata/frame APIs do not consume placement. Stop before v0.4.1.

- [v0.3.11 Scene closure](../harness/checkpoints/scene-contracts-v0.3.11.md) confirms the existing 17-symbol Render public surface is unchanged throughout Phase 3. Editor retains authored Scene correlation/placement; only neutral resource metadata crosses prepareVisualResource. Metadata preparation does not allocate Scene instances or display placement/attachments. Future Feature 08 requires its own approved contracts; Developer phase acceptance is pending.

- [v0.3.8 Scene-to-Render handoff](../harness/checkpoints/scene-contracts-v0.3.8.md) reuses the existing VisualResourceDescriptor/prepareVisualResource unchanged. Editor retains Scene/Object correlation and uninterpreted placement outside the descriptor. Render receives resource identity/media hint/sources only, not authored Scene definitions, object lists, labels, layer/attachment or placement records. This metadata handoff introduces no Scene instance, store, session allocation or GPU work; no Editor import or new Scene API is needed.

- [v0.2.10 integration/closure review](../harness/checkpoints/asset-contracts-v0.2.10.md) inventories three Phase 2 additions (17 total root symbols). Metadata preparation remains independent of graphics/session acquisition; no Editor/Engine import, loader, cache or image display is introduced. Earlier checkpoint notes describe their original revision; Developer acceptance remains pending.

- [v0.2.8 AR14](../harness/checkpoints/asset-contracts-v0.2.8.md) introduces VisualResourceDescriptor and prepareVisualResource with the real Editor manual consumer. Render validates/detaches identity, image media hint and ordered source roles/locations, then returns metadata-prepared with resourceLoading NOT_PERFORMED. It accepts portable data independently of Editor; no catalog, IO, decoder, texture, cache or frame/session integration. Location checks are lexical description checks, not filesystem authorization. Phase 1 ownership/lifecycle is unchanged.

- [Phase 2 v0.2.0 AR01/AR02](../harness/checkpoints/asset-contracts-v0.2.0.md): authored asset identity/catalog/reference resolution is Editor-owned. Render owns future presentation resource descriptors and actual loaded resources; never import Editor or create a duplicate catalog. No descriptor API before a real consumer (v0.2.8 task), no GPU loading/decoder/cache in Phase 2; Visual Resource Loading belongs to Phase 07.

- Phase 1 boundary baseline: [ER01/ER02/ER04](../harness/checkpoints/editor-render-v0.1.0.md). [v0.1.1 ER03/ER06](../harness/checkpoints/editor-render-v0.1.1.md) adds immutable host/session metadata. Current [v0.1.2 ER07](../harness/checkpoints/editor-render-v0.1.2.md) adds created-to-bound lifecycle; bound never means graphics-ready.
- Only `@rpg-platform/runtime-render` is public. Keep backend objects and resource cleanup inside Render; never accept Editor UI/document stores or gameplay authority through future contracts.
- [v0.1.3 ER05/ER08](../harness/checkpoints/editor-render-v0.1.3.md): binding-only dispose clears the lifecycle's binding reference and terminates operations. Borrowed targets and caller-retained snapshots stay host-owned. The separate v0.1.7 graphics session additionally attempts backend cleanup.
- [v0.1.4 ER09](../harness/checkpoints/editor-render-v0.1.4.md) adds safe code/stage diagnostics for Render-created target/disposed errors. Preserve native exception behavior; unrecognized host exceptions are not backend failures or success. No raw context/cause in diagnostics.
- [v0.1.6 ER11–ER13](../harness/checkpoints/editor-render-v0.1.6.md) inventories all current public symbols and extension seams. Preserve binding-only initialization and import portability; GPU readiness/acquisition, failure variants, cleanup and shared-target ownership require impact analysis and Developer decisions before a real backend. No plugin registry or new runtime API is introduced.
- [v0.1.7 ER14](../harness/checkpoints/editor-render-v0.1.7.md) adds explicit async graphics acquisition with a lazy Three.js backend and one-frame submission. Existing binding APIs/error union remain unchanged. Graphics uses a same-realm canvas exclusively per package instance; terminal cleanup leaves the host node/context lifetime intact. A submitted receipt is not visual verification; no loop or scene authoring API exists.
- [v0.1.8 ER15](../harness/checkpoints/editor-render-v0.1.8.md) audits the nine-checkpoint integration without changing APIs. Preserve the distinction between bound, graphics-acquired and submitted. Phase acceptance and manual visual review remain Developer-owned; future contract changes still require explicit approval.

- Editor and Client MUST reuse the same presentation implementation; Editor-specific gizmos are tool extensions, not a second renderer.
- Presentation identity/placement is not automatically gameplay identity/HP/AI/drop schema.
- Do not import Combat/Skill/Reward Rules from Runtime Engine; receive presentation data via approved boundary.
- Do not decide damage, collision authority, loot or session settlement in rendering callbacks.
- Server may need scene geometry/data, but never require GPU frame rendering to validate game results.
- No UI tests, screenshots-as-tests, added test suites or fake build scripts by default.
- [v0.6.5 RV07](../harness/checkpoints/render-viewport-v0.6.5.md): Render63 adds
  pure planRenderViewportSize and three portable types. Validation-only candidate,
  floor once with explicit host CSS/ratio/dimension/pixel budgets; reject rather
  than clamp. No resize, CSS/global measurement, GPU capability/memory guarantee,
  suspension or change to actual session snapshots. Host must not apply candidate
  pixels directly to a live canvas. Future application remains Render-owned.

- v0.8.13 SR20: optional seven-instance manual composition; existing public roots
  only, no production API or schema delta. See the
  [checkpoint](../harness/checkpoints/scene-rendering-v0.8.13.md).
  Source PNG/atlas bytes are original; browser/visual acceptance remains open.

- [v0.8.14 SR21 closure](docs/scene-rendering-v0.8.14.md): fifteen-checkpoint
  audit and sixty-addition public declaration inventory; no production closure
  delta. Keep authored identity, live handle, lease and frame receipt distinct.
  READY_FOR_DEVELOPER_REVIEW does not establish visual/functional acceptance.

- [v0.9.6 CM11/CM12](docs/camera-v0.9.6.md): canonical camera projection reuses Phase4 mapping. Explicit null is logical-only CPU context; non-null requires current real Phase6 receipt, never fallback. CSS and optional host screen mapping remain separate from accepted device buffer. No authored/gameplay/depth mutation or GPU application.

- [v0.9.7 CM13](docs/camera-v0.9.7.md): viewport/screen inverse returns only the explicit selected source plane. Require current issued camera view and current logical/accepted context; reuse Phase4 inverse cutoff/residual policy. No inferred elevation, perfect-source recovery, picking or state mutation.

- [v0.9.8 CM14](docs/camera-v0.9.8.md): Render-owned affine ground/elevation composition before existing camera. Explicit presentation basis/origins/units and supplied inverse height; singular rejection via Phase4. No sheared orthographic alias, Scene/depth/resource mutation or native application.

- [v0.9.9 CM15](docs/camera-v0.9.9.md): optional per-request bounds transition uses current view/viewport and target zoom, full visible extent, explicit clamp/reject and oversize reject/center. Atomic center+zoom; old methods unrestricted, no automatic resize teleport or persisted map policy.
