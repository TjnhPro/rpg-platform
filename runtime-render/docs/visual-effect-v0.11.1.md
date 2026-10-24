# VE02 — immutable effect definitions and explicit metadata binding

Canonical owner: runtime-render. These public-root APIs are pure metadata work;
they do not create a live effect, playback, drawable, resource lease or texture.
The supplied VE02 task authorizes this additive definition seam. Phase10 neutral
live playback remains the separate [U1 dependency](../../harness/visual-effect-v0.11.0.md).

## Capture and identity

`createVisualEffectDefinition(VisualEffectDefinitionInput)` captures exactly:

- `effectId`: caller key, 1..512 characters, no whitespace/control characters;
  exact, case-sensitive and never normalized or globally registered.
- `kind:'sprite-sequence'`: one real Phase10 `SpriteTimedClipInput`, containing
  explicit clip/sequence/frame references, one timing source and once/repeat.
  Phase10 validates, normalizes timing, detaches and freezes the clip. No lookup
  by clipId and no eight-way padding. Missing clip/unsupported shape is INVALID_CLIP.
- Phase7 `VisualResourceDescriptor`: exact project/resource identity, null or
  image/png hint, explicit image and atlas-metadata source descriptions. Phase7
  preparation performs lexical validation, not filesystem authorization.
- `sources`: exactly one `{sourceId,sourceIndex,revision}` pin per descriptor
  source, 1..256 entries. IDs/indexes must be unique and indexes in range; order
  need not equal sourceIndex. ID bound512, revision bound2048, path bound2048.
  Revisions are exact nonblank strings without controls; no digest inference.

Frame scope must equal descriptor scope. Leading zeros and ordered duplicates
survive. Frame existence is checked only by resolution, never by capture.
All numeric timing bounds and the 65,536-frame ceiling remain Phase10-owned.
Output is detached, deeply frozen, JSON-safe data with no live handles/symbols.
Definitions sharing source data may copy metadata; neither allocates textures.
Private weak issuance provenance is not an ID/catalog registry or deduplicator.

`VisualEffectDefinition` output contains normalized `SpriteTimedClip` derived
fields. For a JSON roundtrip, explicitly reconstruct capture input with
`clip:{clip:saved.clip.clip,timing:saved.clip.timing,repeat:saved.clip.repeat}`,
then recapture the other fields. Do not cast parsed JSON into an issued definition.
There is no persistence migration, restore API or automatic content registration.

## Binding and readiness

`resolveVisualEffectDefinition(definition, {atlas,expectedRevision,pages})` requires
an issued definition and actual canonical Phase7 parsed atlas. The symbol pins
that particular parser snapshot; portable source pins separately match every
source ID/index/role/path and actual metadata source revision/project provenance.
Image revisions remain expectations: only a future Phase7 live lease can attest
image bytes/revision. Definition resolution does not verify those bytes.

`pages` is 1..64 explicit host-attested `AtlasPagePixels` entries; image IDs are
unique and must belong to the atlas. Every supplied dimension is a positive safe
integer; unit/layout must be the existing image-pixel/bottom-left profile.
Each used page must have an entry. Phase7 `resolveAtlasFrame` determines the page;
`resolveAtlasFrameGeometry` checks exact dimensions/bounds and converts geometry.
No atlas search/fallback, pivot inference, decode, texture view or GPU work.
Repeated keys reuse one geometry within that call; no cross-call asset cache.

Success contains ordered frozen canonical geometries and
`resourceLoading:'NOT_PERFORMED'`. It is an observation of metadata, not resource
readiness or a right to draw. Frame failure rejects the whole binding with the
first failing ordered frameIndex; definition/page-wide failure has null index.
No partial resource or graphics state is published.

## Failure surface and extension boundaries

Capture/invalid admission throws bounded TypeError diagnostics recognized only by
`getVisualEffectDefinitionFailure(error)`: INVALID_STRUCTURE, INVALID_EFFECT_ID,
UNSUPPORTED_KIND, INVALID_CLIP, INVALID_RESOURCE, INVALID_SOURCE_BINDING,
RESOURCE_SCOPE_MISMATCH, FOREIGN_DEFINITION. Unknown fields, accessors, sparse
arrays and incompatible nested metadata are rejected. Nested TypeError/RangeError
is translated to the relevant capture domain; other host exceptions propagate.
Unrecognized diagnostic is not success. Binding malformed structure also throws
INVALID_STRUCTURE; binding data failures return a frozen rejected union.

Binding preserves Phase7 frame/geometry codes and adds SOURCE_BINDING_MISMATCH,
SOURCE_REVISION_MISMATCH, PAGE_BINDING_MISMATCH. Copied atlas is
ATLAS_NOT_SUPPORTED; wrong snapshot ATLAS_REVISION_MISMATCH; missing key
FRAME_NOT_FOUND. No code reports decoded/uploaded/visually ready.

Nine additive roots: the three functions above and VisualEffectDefinitionInput,
VisualEffectDefinition, VisualEffectSourceRevision, VisualEffectDefinitionFailure,
VisualEffectDefinitionBindingInput, VisualEffectDefinitionBindingResult.
Prior root declarations are unchanged. Editor keeps authored references/catalog;
its existing AssetReference resolver rejects subresources and its image adapter
does not supply clip/source revision pins. No speculative Editor adapter added.

Richer media, placement defaults, lifetime, attachment and instance playback need
later explicit tasks/contracts. This version adds no placement fields without a
consumer, format registry, particles, fly behavior, nested graph or gameplay data.
Phase7 rotation:none, trim:null, sourceSize:null remain their actual limitations.
No clock, live cleanup responsibility or foundation API calls are introduced.
