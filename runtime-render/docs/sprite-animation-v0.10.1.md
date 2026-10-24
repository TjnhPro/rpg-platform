# SA02 — immutable sequence and clip metadata

Actual additive Render root exports:

```ts
interface SpriteFrameSequence { readonly frames: readonly VisualFrameReference[] }
interface SpriteAnimationClip {
  readonly clipId: string;
  readonly sequence: SpriteFrameSequence;
}
createSpriteFrameSequence(input: SpriteFrameSequence): SpriteFrameSequence;
createSpriteAnimationClip(input: SpriteAnimationClip): SpriteAnimationClip;
```

The sequence factory accepts a closed `{frames}` record containing an explicitly
ordered nonempty array. It captures every reference through Phase7
createVisualFrameReference, preserving exact case and leading zeros. It never
generates keys, sorts, infers directions or looks up bytes. Duplicate addresses
are allowed as intentional holds: Phase7 prohibits duplicate keys in an atlas
definition, not repeated references to the same unique frame.

All entries must share exact projectId/resourceId and specify a non-null,
nonblank subresourceId. Maximum sequence length is65,536, matching the current
Unity atlas parser frame ceiling. Repeats consume entries too. Project/resource
and clip IDs are1..512 UTF-16 code units, without whitespace/control characters;
subresource keys retain exact content, up to2,048 units (Phase7 line ceiling),
nonblank and without control characters. These are admission ceilings, not proof
that any particular key can be parsed/resolved. No identifier is coerced/trimmed.

Plain Object.prototype/null-prototype records with exactly the declared enumerable
own data fields are accepted. Arrays must be ordinary dense arrays of own
enumerable data entries, without extra/symbol fields. Holes, inherited entries,
accessors, null/invalid fields, foreign resources/projects and unknown fields
reject. Known invalid data throws constant bounded TypeError messages without
echoing authored input. Proxy/host traps are not sandboxed; unknown exceptions
propagate. Capture never mutates caller data and exposes no partially built value.
Every output record, array and nested frame is detached and frozen.

SpriteAnimationClip is the basic non-directional metadata capture required here,
distinct from the proposed future EightWaySpriteClip. Its opaque clipId is local
to a caller-chosen set, without imposing set storage/registry or global uniqueness.
Two clips may use the same sequence and ID in different caller scopes. Set-local
uniqueness belongs to future set capture. The clip factory recaptures its sequence,
so neither mutable inputs nor caller-supplied frozen wrappers become trusted
capabilities. No timing/mode, eight-way table, playback or live resource field is
prematurely added. SA01's timing/eight-way proposals remain unimplemented.

## Structural validity, exact atlas revision, visual proof

Sequence and clip capture establish **metadata validity only**, not FRAME_RESOLVED.
They carry no parsed atlas, revision symbol, source bytes, texture, session or
allocation handle. This keeps authored definitions portable/JSON-compatible.

Before any later live use, the host supplies the canonical parsed atlas and its
current getAtlasMetadataRevision(atlas).id to resolveAtlasFrame for each reference.
That Phase7 call checks project/resource, exact key and parser-issued revision.
Only its resolved result establishes frame resolution at that snapshot; missing
keys may capture successfully and then resolve as FRAME_NOT_FOUND. Old atlas
with new token rejects; matching old atlas/token is history, not freshness proof.
JSON/copies of an atlas are not parser-issued provenance. Later binding must
also validate geometry/page identity and usable source/session rights separately.
Clip IDs do not identify an atlas revision and must never substitute for its token.

FRAME_RESOLVED still proves neither PNG decode nor GPU upload/submission/pixels.
Phase7 owns parser/trim/sourcePivot semantics; Phase8 owns instances/layout;
Phase6 owns submissions and Phase9 camera. SA02 invokes none of those live paths.
Editor/Client consume the same Render root; no source consumer edits, L1/L2 use
or gameplay authority is introduced. No image/decode, Three allocation, clock,
direction quantizer, parser extension or test suite exists in this checkpoint.

See [checkpoint and finite manual observations](../../harness/checkpoints/sprite-animation-v0.10.1.md).
Next supplied task may add timing as its own additive surface; no progression
method or acceptance of future work is implied by this metadata capture.
