# v0.11.7 VE08 — VFX Frame & Visual Scene Integration

Runtime Render adds three public roots: `syncVisualEffectFrame`,
`VisualEffectFrameInput`, `VisualEffectFrameResult` (Render327→330). Previous root
declarations are unchanged. The function uses the effect's private U1 playback
and existing Phase8 membership; no borrowed playback is exposed or replaced.

## Host protocol

1. Create the effect and set explicit VE06 world placement. Supply stable layer,
   order/depth through existing Phase8 APIs on its exact scene membership.
2. Apply explicit effect/actor transport commands and host deltaMs through Phase10.
3. If attached, sync VE07 after actor transform/visibility changes.
4. Call `syncVisualEffectFrame(effect, input)` with the current page capability and
   verified alignment for the **currently selected** frame. Check its result.
5. Submit through the existing session, using the host's scheduling policy.

Input aliases the existing `SpriteAnimationVisualFrameInput`: borrowed resource
lease, expected image revision, canonical atlas + revision symbol, exact page
pixels, positive per-axis planeUnitsPerPixel and explicit authored frame alignment.
No alignment is inferred from image center, atlas sourcePivot, missing trim or
unavailable original-image layout. Native sourcePivot stays numeric metadata.
The authored localOffset must convert exactly to the existing effect ground
offset; U1 rejects GROUND_ANCHOR_MISMATCH rather than silently moving an aura.
Anchor/pivot and layout may change with the selected frame; placement, local
identity TRS, source-plane context and supported ordering remain intact.

## Admission and commit

Each sync reuses VE02's internal definition/source validation: exact resource
identity, ordered source IDs/indexes/locators, canonical metadata provenance and
pinned metadata byte revisions. The selected imageSourceId must name an image
source pin with the supplied expectedSourceRevision. This is an expectation,
not a substitute for Phase7's live lease admission. Validation is shared with
the existing resolveVisualEffectDefinition; its all-frames API is unchanged.
Sync validates only selected geometry, allowing the host to supply the selected
page on each transition. It does not require the entire sequence on one page.

A lazy `createSpriteSequenceVisualBinding` uses the existing single U1 binding
lifecycle. That owner resolves selected atlas geometry and alignment, then
commits frame, layout, anchor and retained usage through the Phase8 transaction.
Phase8/createAtlasTextureView check canonical lease/session/image/revision/page
dimensions and existing UV conversion. Input capture, scene revision and playback
identity guards prevent accepting stale admission. No duplicate UV/geometry math,
texture cache, image decoder, THREE object DTO or alternate renderer is added.

Success returns the canonical U1 `bound` result with playback, retained resource
snapshot and resolved alignment. It invalidates Phase6 demand through Phase8;
it never advances time, submits or schedules. Same effect/drawable identity is
retained. Binding retains its own usage from the supplied lease; replacing frames
releases the old usage using existing Phase8 ownership, without another upload
when the same usable page is retained. Host leases remain borrowed.

Definition/source failures return frozen `rejected` codes, as do U1's geometry,
alignment and FRAME_NOT_READY results. Canonical Phase8/6 errors propagate with
their existing diagnostics; removed effects reject through effect lifecycle.
Rejected admission preserves the last committed valid presentation. Native
mutation faults retain Phase8 terminal/cleanup behavior, not rollback guarantees.
Malformed records throw. A rejected sync does not claim a successful draw.

Playback selection and committed drawable frame are separate observations: a
host may already have advanced to an unavailable frame. Rejection keeps the old
drawable; it does not rewind that explicit advance. Query current Phase8 resource
readback for displayed metadata and inspect sync result before reporting readiness.
The old playback snapshot's resourceReadiness NOT_CHECKED remains unchanged.

Effect removal/completion/target loss unbinds its U1 binding, disposes owned
playback and retires membership. Phase8/6 termination closes binding occupancy;
shared resources and other sessions retain their independent rights. No automatic
retry, pending queue, resource loading, frame timer or new public disposal API.

## Camera, layers and alpha

VE08 does not force any foreground layer or rewrite actor depth. Caller-supplied
Phase8 explicit/depth/ground policies remain authoritative. A canonical Phase9
scene camera applies localToScene uniformly to actor and effect at submission;
camera pan/zoom does not rewrite world placement. Existing native transparent
material/depth/alpha sorting limits remain: no guarantee for intersecting
transparent surfaces, volumetric ordering, particles or post-processing. No new
blend/shader/render pass is introduced.

See [checkpoint](../../harness/checkpoints/visual-effect-v0.11.7.md) for actual
original-asset pixels, rejection/cleanup observations, build and compatibility
evidence. A sprite rendered as a manual effect is not artist-approved aura
alignment, production Player integration or full VFX MVP acceptance.
