# v0.11.6 VE07 — Visual Instance Attachment

Runtime Render adds six public roots: `attachVisualEffectInstance`,
`syncVisualEffectAttachment`, `detachVisualEffectInstance`,
`getVisualEffectAttachmentSnapshot`, `VisualEffectAttachmentInput` and
`VisualEffectAttachmentSnapshot`. Render321→327; prior declarations unchanged.
No Phase10 upstream delta or L1/L2 calls are required.

## Admission and placement

First configure the effect using VE06 explicit world placement. Attach accepts
an exact plain data record `{target, localOffset: {x, y}, inheritance:
'translation-only'}`. Target is an issued ordinary Phase8 Visual Instance in the
same live scene/session, with an explicit transform. Self attachment, effect
targets, dead/foreign handles, absent transforms and incompatible plane/project/
unit/axes are rejected. Finite negative offsets are supported. No entity IDs,
Player classes, authored-store access, unit conversion or parent graph is used.

The effect retains its anchor/pivot, identity local TRS, orientation and projection.
Its placement follows the target's canonical **applied attachment point**, using
Phase4/8 transform capture. The supplied offset replaces the effect anchor's
localOffset, in the existing source-plane axes/unit. Effect attachment therefore
equals target attachment + offset. Target rotation/scale are not inherited onto
the effect; they may influence the target's applied attachment point. There is no
second transform cache or alternate matrix implementation. Canonical binary64
rounding and overflow rules remain in force.

World and attached modes are exclusive. The VE06 setter rejects while attached.
Attach may replace a valid target, preserving own visibility. Input capture and
canonical arithmetic validation precede writes; rejected input preserves the last
valid binding. Reentrant effect transitions are rejected. Host mutations during
input reflection are not rolled back; a changed scene revision rejects capture.
Native presentation failures retain Phase8 terminal/cleanup semantics, with no
transactional rollback guarantee across native calls.

## Host synchronization and visibility

After target transform/layer/viewport/visibility changes, the host calls
`syncVisualEffectAttachment(effect)` **before graphics submission**. This reads
canonical Phase8 state and updates the existing effect through Phase8 setters,
which invalidate through the existing Phase6 policy. A no-op retains transform
identity. No timer, polling scheduler, automatic frame submission or playback
advance is installed. Readback alone does not sync. Hosts must not bypass the
effect policy by directly rewriting its Phase8 transform/visibility while bound.

Effective effect visibility is own-visible AND target-effective-visible, further
subject to the effect's own Phase8 layer/viewport policy. Stop sets own-visible
false; play/restart sets it true. Pause/resume leave it unchanged. Hiding a target
never pauses either transport or changes gameplay state. Target animation and
effect animation remain independent Phase10 playbacks.

## Detach and retirement

Detach first syncs the current target, freezes the resulting canonical world
transform, restores independent own visibility and unsubscribes the target end
hook. Anchor offset remains in that frozen transform. A live world-mode detach
is idempotent. Incompatible target coordinate context rejects before unlinking,
preserving the valid binding and last transform. Removed effects reject mutation.

Target removal invokes remove-effect through canonical VE03/Phase8 cleanup.
Scene clear/dispose and session end do not attempt duplicate removal of already
drained membership. Every terminal path clears the binding/listener and disposes
owned playback; retained resources remain Phase8-owned. Shared consumers keep
their own rights. Reusing a visual key cannot reattach the retired effect.

Snapshots are frozen and expose instance, mode(world/attached/removed), target,
offset, inheritance, visibility policy and the canonical transform. After removal
target/offset/policy are null; the VE06 last-observed transform is historical,
not live membership. See [checkpoint](../../harness/checkpoints/visual-effect-v0.11.6.md)
for finite manual evidence and unobserved acceptance boundaries. No pixels or
complete VFX MVP are claimed.
