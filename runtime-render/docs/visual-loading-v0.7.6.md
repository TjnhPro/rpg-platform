# v0.7.6 — VL09 Frame identity and resolution

Runtime Render owns exact frame interpretation and lookup. Editor owns authored
AssetReference/catalog/Scene content and passes neutral logical resource identity
and an optional opaque address. Client consumes the same Render root. No L1/L2,
Engine or Server behavior, dependencies, schemas or import directions change.
The supplied task authorizes this additive API; prior checkpoint is
`5d6b25eed7c72ad9a12411f33ca7e7a41dac5901`, with exact-head push/PR CI success.

## Public delta and usage

Six additions, Render99 ->105, Editor134/Client0 unchanged:

- `createVisualFrameReference`, `VisualFrameReference`: closed plain data record
  `{ projectId, resourceId, subresourceId }`, detached/frozen. Explicit nonempty
  whitespace-free identity; address is null or nonblank text retained verbatim.
  Null never chooses a default frame. No authored Asset Definition is copied.
- `getAtlasMetadataRevision`, `AtlasMetadataRevision`: canonical parsed snapshot
  token and immutable acquired metadata source IDs, provider scopes and revisions.
- `resolveAtlasFrame`, `AtlasFrameResolution`: synchronous explicit snapshot lookup
  with a required expected-current revision symbol and typed frame-stage result.

```typescript
import { createVisualFrameReference, getAtlasMetadataRevision,
  resolveAtlasFrame } from '@rpg-platform/runtime-render';
// parsed.atlas is an actual parseUnityAtlasMetadata success, currentRevision is
// retained by the host alongside its current atlas slot (not recomputed from an old slot).
const reference = createVisualFrameReference({ projectId: 'atlas-manual',
  resourceId: 'selected-sheets', subresourceId: '0050' });
const revision = getAtlasMetadataRevision(parsed.atlas);
if (revision !== null) {
  const result = resolveAtlasFrame(reference, parsed.atlas, revision.id);
  // Inspect result.status before using page/frame/imageSource.
}
```

These are portable ES2022 declarations; no DOM, Three/native texture/UV class or
Editor dependency. No existing signature, exported type member or atlas data shape
changes. `prepareVisualResource` stays metadata-only/NOT_PERFORMED. Source/decode/
texture failures retain their existing namespaces and behavior; frame diagnostics
use `stage: 'frame'` and never guess a source/GPU error from a missing key.

## Lookup scope and diagnostics

Scope is the exact case-sensitive `(projectId, resourceId, frame.key)` tuple in
one compatible atlas snapshot, independent of source or frame array order. The
verified `unity-tpsheet-40300-rect` profile already rejects globally duplicate frame
keys across pages at parse time. No page-prefix/escaping grammar is invented:
`page-0/0050` is an exact opaque key, never shorthand for key0050/page-0. Leading
zeroes, separators, whitespace and Unicode are never normalized. Future formats
with page-local duplicate keys require an explicitly reviewed qualification
contract; do not broaden this parser or silently pick the first match.

Unresolved priority after reference/token validation:

1. `ATLAS_NOT_AVAILABLE`: explicit null atlas.
2. `ATLAS_NOT_SUPPORTED`: no current package-instance parser provenance or unsupported
   format (plain copies, JSON roundtrips and other producers do not become loaded atlases).
3. `ATLAS_REVISION_MISMATCH`: expected-current symbol differs from snapshot token.
4. `RESOURCE_MISMATCH`: project/resource differs.
5. `SUBRESOURCE_NOT_SPECIFIED`: explicit null address.
6. `FRAME_NOT_FOUND`: no exact key.
7. `AMBIGUOUS_FRAME`: defensive rejection if multiple matches, never first-wins.
   Current canonical parser makes this unreachable; it is not observed support for
   ambiguous TPSheet data. Missing page/image binding defensively returns ATLAS_NOT_SUPPORTED.

Malformed reference/omitted non-symbol revision token throws TypeError; unknown
host exceptions propagate. Successful result includes captured reference, exact
snapshot provenance, detached/frozen page/frame/native rectangle/pivot and explicit
image source metadata. It includes no bytes, GPU handle, decoder or provider closure.
The reference, atlas, input table and Scene/catalog are never mutated; all results
are immutable observations. Linear scans are bounded by parser admission limits;
no performance claim, global asset registry, memoized resolver or resource cache.

## Revision responsibility and limits

Each successful parse gets a fresh symbol, even for identical bytes or a different
page/source binding of the same logical asset. A private WeakMap records snapshot
provenance without changing v0.7.5 JSON data or retaining otherwise unreachable
atlases. Metadata source revision/scope comes from actual acquired source snapshots;
no extra provider reads occur. Source release does not invalidate already detached
metadata. This does not extend source authorization or grant IO access.

The host owns its current atlas slot/token. Replace both after a successful reload;
keep logical references unchanged and resolve again. Passing the old atlas with
the new current token (or the reverse) rejects rather than returning a stale frame.
Passing old atlas and old token intentionally reads history: Render cannot detect
external file changes, authorization revocation or a host that never updates its
current slot. Prior results remain historical and must not be reused as current
after token replacement. There is no implicit watcher, invalidation, reload or cache.
Tokens are ephemeral same-package-instance symbols, not persistence identifiers or
content hashes. Serialized metadata requires reacquisition/reparse for resolution.

Only metadata byte revisions are observed here. The referenced PNG was not acquired
by this parser, so its revision, dimensions, decode/GPU usability and agreement with
the sheet are not guaranteed. The token pins the whole parsed metadata snapshot,
not a complete GPU resource version. UV/trim/rotation operations remain v0.7.7.

## Editor compatibility and evidence

Phase2 `createAssetReference` still accepts opaque authored text and
`resolveAssetReference` still reports SUBRESOURCE_NOT_SUPPORTED. A host first
resolves the base asset with no subresource, obtains authorized sources/atlas, then
explicitly projects authored projectId/assetId/subresourceId into Render's neutral
projectId/resourceId/subresourceId request. expectedKind validation remains the base
catalog resolver's responsibility; never pass or reinterpret it as frame metadata.
No production Editor adapter or change to authored Scene/catalog contracts is made.

[Finite consumer](../../editor/manual/frame-resolution.md) uses the exact originals
and hashes/provenance from [v0.7.5](visual-loading-v0.7.5.md). Two holders resolve
different keys from one logical atlas without additional reads. A clearly labelled
in-memory valid key rename supplies a real different metadata revision for token
mismatch/current-key-removal observations; it does not alter or replace originals.
No dataset copy, new exporter, image decode/draw or automated tests.

Status: FRAME_LOOKUP_OBSERVED / TPSHEET_METADATA_OBSERVED for finite local data.
FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED / TPSHEET_VISUAL_NOT_VERIFIED for complete
behavior/pixels. No animation sequence/direction/timer, SpriteClip, runtime visual
instance, geometry, caching/leases, network or gameplay. Developer owns acceptance.
