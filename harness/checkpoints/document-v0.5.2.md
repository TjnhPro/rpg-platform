# v0.5.2 — Document State & Content Isolation

DC04 / DC05. **READY_FOR_DEVELOPER_REVIEW**.
Only immutable value replacement and authored-content isolation are in scope;
general lifecycle/persistence remains **FEATURE_NOT_VERIFIED**.

## Exact baseline, authorization and ownership

- Phase 4 integration base: `e46ec24dc662b1bc1588d5ec1c05d4f62739ac3c`.
- Previous Phase 5 checkpoint/source HEAD:
  `390f7520a17fdffe40e387392e1719580a221562` (v0.5.1 DC02/DC03).
- Same `feat/editor-document-contracts-v0.5`, same [PR #5](https://github.com/TjnhPro/rpg-platform/pull/5),
  base main unchanged. One new checkpoint commit; final SHA/CI go in the PR/handoff.
- Developer supplied this next task following the prior handoff, with standing
  authorization to implement without intermediate approval questions. This is
  execution authorization, not an assertion of phase/product acceptance from CI.
- Read root/project guidance, architecture, Foundation, README, Harness
  ownership/contracts/workflow/verification, package roots/manifests/declarations,
  Document, Asset/Scene/Spatial and preview/Render lifecycle source. Harness routing
  suggested Editor; authored-content ownership confirms **Editor** as primary.
- Render is inspected/compiled only. No L1/L2 APIs added or changed; game-specific
  schema interpretation remains Engine L3. No consumer currently imports Editor.
- Six changed paths: editor/src/document-envelope.ts, editor/src/index.ts,
  editor/AGENTS.md, harness/CONTRACTS.md, harness/OWNERSHIP.md and this report.
  No old Asset/Scene/Spatial implementation, other project, dependency, lock, pin,
  manifest or workflow changes; exactly five projects.

## Actual source audit and data partition

| Data/capability | Actual source finding / boundary |
| --- | --- |
| Document identity/envelope | v0.5.1 has exact schema-1 metadata and recursive capture via detachPortableAssetData; no session/internal mutable store |
| AssetDefinition / AssetCatalog | Frozen identity, sources, dependency references, metadata and ordered definitions. Metadata extensions use portable recursive capture. Set used for validation is local, not in returned data |
| SceneMembership / objects | Frozen owner snapshots with local IDs, Asset reference, optional attachment/layer/placement; validation Sets are internal. Existing construction factories project known fields, not arbitrary unknown saved records |
| Spatial definitions/points | Frozen nested reference/axes/origin/point; IDs and numeric values remain authored data. Finite -0 accepted in some older spatial shapes is outside Document's existing portable profile; no implicit normalization added |
| Session metadata | Future adoption/open/closed state, current/saved revision and tokens are not authored payload and remain UNAVAILABLE |
| UI workspace | Tabs, selection, zoom and UI dirty hints are caller/UI-owned; no manager is introduced |
| Preview host / Render lifecycle | Frozen method-bearing facades retain closure state and borrowed target references; readonly/frozen does not make them portable content. Render descriptors also contain symbol identities |
| Graphics/frame backend | Async acquisition owns Three Scene/Camera/WebGLRenderer, borrowed canvas/context and WeakSet guard; methods, GPU/DOM handles and frame symbols stay Render/host-owned. No graphics acquired by this checkpoint |
| Gameplay instance / archive | Game-specific runtime semantics and external L2 archive are separate; no HP/Monster/Skill/Player inference or Editor-owned gameplay validator |

The existing portable helper accepts null/string/boolean, finite numbers excluding
negative zero, dense arrays, and ordinary/null-prototype enumerable data records.
It detaches/freeze-captures recursively. Cycles, functions, symbols, undefined,
bigint, Map/Set/Date/class instances, accessors, hidden properties and custom array
properties reject; there is no JSON-stringify flattening or new deep-clone engine.
Shared input aliases need not remain shared output references; authored key/values
survive, not prototype identity or host capabilities.

Unknown content keys survive only within that portable profile. Unknown envelope/
identity fields and unsupported envelope versions still reject. No future version
is silently projected into a writable current envelope.

Portability is structural, not a semantic UI/gameplay detector. Plain records like
`{zoom:2}` can be portable authored data in some kinds; there is no reserved-word
blacklist or universal schema. Callers explicitly select authored content, retain
workspace/session/runtime state outside it, and use canonical content-owner APIs
for validation. A plain target wrapper without handles cannot be identified as a
host object by its shape alone. This limit is explicit rather than a claimed
automatic protection.

## Minimal implementation and public contract

One additive root export:

```ts
replaceDocumentContent(
  envelope: DocumentEnvelope,
  content: unknown,
): DocumentEnvelope
```

Existing creation already provides isolated capture, so no second snapshot API,
new type, content registry or public error classifier is needed. The new function:

1. Revalidates/captures the complete source through createDocumentEnvelope, so an
   unknown source field/version or invalid old content cannot be silently bypassed.
2. Detaches/freezes the supplied replacement using the same existing helper.
3. Returns a fresh frozen envelope retaining identity, kind and envelope/content
   schema-version **values**. Source and replacement inputs are not mutated.

This deliberately validates old content before replacement; there is no trusted
object-brand fast path. The old snapshot remains usable if any validation/capture
fails. TypeError (possibly an existing internal subclass) rejects invalid input;
native host/proxy exceptions and resource limits retain their existing behavior.

Replacement means the entire supplied content, not merge/patch. It preserves
portable extension keys present in that replacement, but does not restore omitted
old fields. Callers must carry forward intended extensions; lossy owner factory
projection followed by overwrite is not authorized as safe future Save behavior.

No kind/schema-specific semantic validator is added. Canonical Scene/Asset/Spatial
operations prepare valid candidates; future game config still requires real L3
contracts. Even equal content returns a fresh value: reference inequality alone
must not define future dirty/current/saved revision policy. Adoption and revision
tracking belong to future checkpoints; no UI object identity or schema counter
is used as a content revision here.

Editor source/emitted root names: **98/98**, up from 97, with only
replaceDocumentContent added. Render remains **52/52**. New declarations reference
only public Document types/built-ins, no private clone/diagnostic, DOM or Three types.
Package exports remain root-only. Graph unchanged: Engine -> L1/L2; Render ->
private Three; Editor/Client -> Engine+Render; Server -> Engine.

## Reproducible manual API observations

Executed after the genuine Editor build on Node 24.18.0, as ESM stdin from workspace
root (`node --input-type=module`). No test file, runner/assertion library or CI
behavior suite is created. The composite content is a caller-chosen example, not
a new canonical scene/asset/spatial document schema.

```js
import * as E from '@rpg-platform/editor';
const projectId = 'project-01';
const space = E.createCoordinateSpaceDefinition({
  reference: { projectId, coordinateSpaceId: 'space-zone-01' },
  componentCount: 2, axes: { x: 'right', y: 'up' }, origin: { x: 0, y: 0 }, unit: 'tile',
});
const scene = E.createSceneMembership({
  scene: { identity: { projectId, sceneId: 'scene-zone-01' } },
  objects: [{ definition: { objectId: 'visual-01' },
    assetReference: { projectId, assetId: 'asset-image-01' } }],
});
const placed = E.updateSceneObjectSpatialPlacement(scene, 'visual-01', space,
  { space: space.reference, point: { x: 2, y: 3 } });
const asset = E.createAssetDefinition({
  identity: { projectId, assetId: 'asset-image-01' }, kind: 'image',
  metadata: { vendor: { labels: ['source'] } },
});
const extension = { vendor: { labels: ['original'], future: { enabled: true } } };
const authored = { scene: placed, asset, spatial: { definition: space }, extension };
const before = E.createDocumentEnvelope({
  schemaVersion: 1, identity: { projectId, documentId: 'doc-zone-01' },
  documentKind: 'content', contentSchemaVersion: null, content: authored,
});
extension.vendor.labels[0] = 'caller mutation after create';
console.log('after-create-input-mutation', before.content.extension.vendor.labels);
const moved = E.updateSceneObjectSpatialPlacement(placed, 'visual-01', space,
  { space: space.reference, point: { x: 8, y: 9 } });
const replacement = { ...before.content, scene: moved,
  extension: { vendor: { labels: ['edited'], future: before.content.extension.vendor.future } } };
const after = E.replaceDocumentContent(before, replacement);
replacement.extension.vendor.labels[0] = 'caller mutation after replace';
console.log('old/new', before !== after, before.content.extension.vendor.labels,
  after.content.extension.vendor.labels, before.content.scene.objects[0].placement.point,
  after.content.scene.objects[0].placement.point);
console.log('keys-and-references', after.identity, after.content.scene.scene.identity,
  after.content.scene.objects[0].definition.objectId,
  after.content.scene.objects[0].assetReference,
  after.content.spatial.definition.reference, after.content.extension.vendor.future);
console.log('versions', before.schemaVersion, after.schemaVersion,
  before.contentSchemaVersion, after.contentSchemaVersion, after.documentKind);
try { after.content.extension.vendor.labels[0] = 'reverse mutation'; }
catch (e) { console.log('reverse-mutation', e instanceof TypeError); }
console.log('still-isolated', before.content.extension.vendor.labels,
  after.content.extension.vendor.labels, replacement.extension.vendor.labels);
console.log('frozen', Object.isFrozen(after), Object.isFrozen(after.content),
  Object.isFrozen(after.content.scene.objects[0].placement.point),
  Object.isFrozen(after.content.extension.vendor.labels));
const preview = E.createEditorPreviewHost();
const workspace = { tabId: 'tab-01', zoom: 1, selection: ['visual-01'],
  uiDirtyHint: true, document: after, preview };
preview.mount({});
workspace.zoom = 2;
console.log('authored-fields', Object.keys(after), Object.keys(after.content));
console.log('workspace-only', workspace.zoom, preview.getSnapshot().state,
  workspace.document === after);
const text = E.createDocumentEnvelope({
  schemaVersion: 1, identity: { projectId, documentId: 'doc-text-01' },
  documentKind: 'text', contentSchemaVersion: 1, content: 'Chapter one',
});
console.log('text', text.content, E.replaceDocumentContent(text, 'Chapter two').content);
const cycle = {}; cycle.self = cycle;
try { E.replaceDocumentContent(before, cycle); }
catch (e) { console.log('cycle-rejected', e instanceof TypeError, e.message); }
try { E.replaceDocumentContent(before, { onSelect() {} }); }
catch (e) { console.log('callback-rejected', e instanceof TypeError, e.message); }
try { E.replaceDocumentContent(before, new Map([['key', 'value']])); }
catch (e) { console.log('map-rejected', e instanceof TypeError, e.message); }
try { E.replaceDocumentContent(before, new Set(['value'])); }
catch (e) { console.log('set-rejected', e instanceof TypeError, e.message); }
try { E.replaceDocumentContent(before, preview); }
catch (e) { console.log('preview-handle-rejected', e instanceof TypeError, e.message); }
const descriptor = E.createEditorPreviewSession({});
try { E.replaceDocumentContent(before, descriptor); }
catch (e) { console.log('render-descriptor-rejected', e instanceof TypeError, e.message); }
try { E.replaceDocumentContent({ ...before, tabId: 'tab-01' }, 'replacement'); }
catch (e) { console.log('workspace-envelope-rejected', e instanceof TypeError, e.message); }
console.log('after-failures', before.content.extension.vendor.labels, after.content.extension.vendor.labels);
preview.close();
```

| Action / expected boundary | Observed |
| --- | --- |
| Mutate nested caller data after create | Old labels remain ["original"] |
| Replace content using canonical Scene spatial update | Distinct old/new envelopes; placement (2,3) / (8,9), old labels ["original"], new ["edited"] |
| Mutate replacement input | New snapshot stays ["edited"]; caller input changes independently |
| Attempt reverse snapshot write in ESM strict mode | TypeError; both snapshots and caller replacement retain their respective values |
| Nested freeze | Envelope/content/placement point/extension array all report true |
| Authored identity/reference values | project-01, doc-zone-01, scene-zone-01, visual-01, asset-image-01 and space-zone-01 retained; future.enabled remains true |
| Schema values | Envelope 1 -> 1; content null -> null; kind content unchanged |
| UI/preview stays separate | Authored keys are scene/asset/spatial/extension only; caller zoom changes to 2, preview reports mounted and workspace document still references after |
| Text-only replacement | Chapter one -> Chapter two without Scene/Map/coordinates/viewport |
| Cycle/callback/Map/Set replacement | TypeError with Document content path; no flattened result |
| Actual preview facade / Render descriptor as payload | TypeError at getSnapshot function / id symbol respectively |
| Source envelope with tabId | TypeError before replacement, rather than stripping the workspace field |
| Inspect after rejected operations | Old ["original"] / new ["edited"] unchanged |

Preview is binding-only on a plain borrowed target, explicitly closed afterwards.
No HTML canvas/WebGL/Three acquisition or frame submission was executed. No actual
gameplay instance, product UI, session lifecycle or storage IO is exercised.
The observations cover these exact calls only; not general visual/functional
verification, SAFE_SAVE_PASS, MIGRATION_PASS or Developer acceptance.

## Build/static evidence and remaining limits

Observed gates: ARCH_CHECK_PASS **60** JS/TS files, genuine Editor BUILD_PASS via
`verify --projects editor --with-consumers` (no workspace Editor consumers), and
forced full workspace build PASS for all five projects. Strict in-memory public-root
declaration consumer reports **0 diagnostics** with NodeNext/ES2022, types:[], no
DOM and skipLibCheck:false. Source/emitted sets match 98/98 and 52/52; existing
public signatures are unchanged. Scope/whitespace/committed protected-path audit
and exact final-HEAD push+PR CI evidence are recorded with the checkpoint in PR #5.

Required commands: `node harness/cli.mjs check`,
`node harness/cli.mjs scope --projects editor --allow-infra`,
`node harness/cli.mjs verify --projects editor --with-consumers`,
`npm run build -- --force`. Static checks only constrain scanned imports; green
builds do not prove runtime safety. Existing Windows DEP0190 warning is nonblocking.
No test files, suites, runners, browser/UI/E2E or historic exhaustive tests run.

Existing artifact hashes match unchanged pins: Core 2.0.0 /
`04b7239f998c3c688a0dfa3202f11811a9acd775`; Gameplay 0.15.2 /
`acea332aa80f67552192a72b30f81c0bbbfc56bd`. No copied/upstream gameplay code or
new external foundation API.

IMPLEMENTED: immutable construction and explicit whole-content replacement.
DOCUMENTED_ONLY: future session/adoption, revision and write-safety seams.
UNAVAILABLE: lifecycle/session, current/saved revision, dirty tracking, codec,
storage host/IO, Save/Load and migration. These remain **FEATURE_NOT_VERIFIED**.
No blocker remains for this scoped value-boundary change. Semantic profiles,
future revision correlation, host guarantees and migration remain open.

The supplied next task is v0.5.3 — Document Lifecycle Foundation; DC01's provisional
version allocation is not its specification. No .3 implementation, merge, tag,
release or publication. **READY_FOR_DEVELOPER_REVIEW**.
