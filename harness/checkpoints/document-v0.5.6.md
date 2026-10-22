# v0.5.6 — Document Validation & Reference Diagnostics

DC11/DC12. **READY_FOR_DEVELOPER_REVIEW**. No phase/product acceptance.
Finite manual authored-data observations only; persistence and visual behavior
remain **FEATURE_NOT_VERIFIED**. Stop before v0.5.7.

## Exact baseline, authorization and preflight

- Accepted Phase 4 integration: `e46ec24dc662b1bc1588d5ec1c05d4f62739ac3c`.
- Previous source/checkpoint v0.5.5:
  `a46176eb94bb78b02e55583e35ed649fc9e989e5`; initially clean local/origin/PR.
- Same `feat/editor-document-contracts-v0.5`, same [draft PR #5](https://github.com/TjnhPro/rpg-platform/pull/5),
  base main unchanged. One checkpoint commit; final SHA/exact-head push and PR CI
  recorded in PR ledger/handoff outside this self-referential commit.
- Developer supplied this next task with standing instruction to execute/verify
  without intermediate review questions. This authorizes v0.5.6 only; CI does not
  imply acceptance of prior/current product behavior.
- Read root AGENTS/architecture/FOUNDATION/README, Harness ownership/contracts/
  workflow/verification, Editor/Render AGENTS, real manifests/source/index/
  declarations. Route hint suggests Editor; canonical primary owner is **Editor —
  document validation orchestration**, using existing content owners.
- Exact six paths: editor/src/document-diagnostics.ts, editor/src/index.ts,
  editor/AGENTS.md, harness/CONTRACTS.md, harness/OWNERSHIP.md, this report.
  No Render/Engine/Client/Server, old content-owner implementation, manifest,
  lock, pin or workflow changes. No additional project.
- No workspace consumer imports Editor. verify --with-consumers selects Editor;
  forced workspace build also compiles all five projects.
- External L1/L2 APIs/dependencies unchanged; no missing foundation capability
  is replaced or implemented. No real JXQY registry/transaction source found.

## Audit: existing versus new behavior

IMPLEMENTED before this change: exact envelope/portable capture, immutable content
replacement, lifecycle/revision/dirty/host-confirmed saved seam, bounded JSON codec;
Phase 2 authored catalog/resolver/diagnostics and versioned Asset snapshot reader;
Phase 3 Scene structural/local-attachment/Asset diagnostics; Phase 4 coordinate
capture and Scene/space correlation adapter. Document orchestration was
DOCUMENTED_ONLY / UNAVAILABLE. This checkpoint implements only DC11/DC12.

Existing limitations determine orchestration, not a new parallel validator:

- Scene diagnostics returns the canonical first structural error, then every
  checkable local attachment/Asset reference in declaration order. It does not
  treat repeated Asset use as duplicate definitions. No hierarchy/parent semantics.
- Asset construction diagnostics is not a lossless versioned reader; the Asset
  adapter therefore calls readAssetDefinitionSnapshot, preserving its supported
  field/version checks and existing typed error channel. Direct dependencies use
  diagnoseAssetReference. No transitive graph traversal/source file probing.
- Scene factories project known fields; use their temporary capture for validation
  only. Return the ORIGINAL decoded document so unknown fields/references survive.
- Spatial capture/adapters expose TypeError rather than structured codes. Validate
  portable resolver data before canonical adapter call; report a safe coarse
  INVALID_SPATIAL_SPACE, never parse exception messages or duplicate spatial math.
- Existing Scene relationship is attachment within one Scene. The task's missing
  parent-object case is demonstrated with that actual owner contract. Cross-Scene
  attachment remains unsupported, not a claim that a physical Scene file is missing.
- Domain owners validate payload semantics, document orchestration only correlates
  project IDs and explicit kind/version binding. Document ID never equals content ID.

Reference principles consulted, with no implementation copied:

- [VS Code custom editors](https://code.visualstudio.com/api/extension-guides/custom-editors):
  view/admission and document lifecycle remain separate.
- [Unity serialization](https://docs.unity3d.com/Manual/script-serialization.html):
  supported representation does not validate arbitrary live objects.
- [Godot saving](https://docs.godotengine.org/en/stable/tutorials/io/saving_games.html):
  authored data selection/serialization is distinct from physical storage.
- [Unreal asset versioning](https://dev.epicgames.com/documentation/en-us/unreal-engine/versioning-of-assets-and-packages-in-unreal-engine):
  compatibility/version policy must avoid destructive loss of references.

## Additive public contract

Five new root symbols: diagnoseDocument, DocumentDiagnosticCode,
DocumentDiagnostic, DocumentValidationContext, DocumentValidationResult.
Editor **109 -> 114** source/emitted; Render unchanged **52**. Existing export
maps remain root-only; old factory/codec/session signatures unchanged.

```ts
diagnoseDocument(text: string, context?: DocumentValidationContext): DocumentValidationResult
// Host binding: { documentKind, contentSchemaVersion, owner: ... }
// owner scene: optional factory catalog + synchronous in-memory space resolver
// owner asset: optional factory catalog for direct dependencies
// owner coordinate-space: existing exact CoordinateSpaceDefinition
// owner text: string-only, no Scene/Asset/GPU requirements
```

The JSON boundary deliberately reuses bounded deserializeDocument rather than
creating another untrusted envelope/payload validator. In-memory callers may
serialize their authored envelope first. Context is a trusted typed host binding,
not untrusted plugin data: it must use the exact kind/version chosen by the host.
No automatic discovery, registration/global registry or invented universal kind
names. Future game-config schemas remain Engine-owned, not a generic adapter here.

| Domain | Policy |
| --- | --- |
| Decode | Existing codec errors retain safe codes; malformed/invalid envelope has no document fallback. Unsupported version gets schema group |
| Binding | No context -> CONTENT_NOT_CHECKED warning. Kind/version mismatch -> CONTENT_CONTRACT_MISMATCH, no domain interpretation |
| Document correlation | Validated content project must match document project; IDs stay distinct and never rewritten |
| Diagnostics | Frozen group/code/severity/path/reference/details; only portable primitive hints, no raw messages/backend handles |
| Order | Decode/binding first; first canonical structural error stops references; otherwise project, Scene owner declaration-order attachment/Asset pass, context warnings, spatial pass; Asset dependencies declaration order |
| Status | Non-reference errors -> invalid; reference errors alone -> unresolved; warnings alone -> not-checked; otherwise valid |
| Coverage | CHECKED means attempted, not successful. No declared references -> NOT_APPLICABLE only for a bound supported owner. Unknown/unreachable content -> NOT_CHECKED |
| Inspect policy | Any decoded envelope retained for inspect, including invalid/unresolved/unknown content; this does not open/adopt a session |
| Strict policy | Eligible only when status valid under the declared checks; no general unknown-field/schema/physical-resource compatibility claim |
| Write eligibility | Always NOT_ESTABLISHED, including valid results; this is not a save precondition engine or write capability |
| Physical files | Always fileExistence:NOT_CHECKED. Catalog locator strings never prove disk existence or image readability |
| Preserve source | Return original decoded capture; no candidate projection, fix/drop/rebind/repair/migration, revision/save/dirty transitions |
| Resolver | Synchronous explicit in-memory callback; undefined means missing in supplied context. Returned invalid/mismatched definition -> spatial error; unknown callback/host exceptions propagate |

Read policy is advisory, selected by the host consuming the two eligibility flags;
no new load/session/UI workflow is implemented. A future write host must establish
its own validation policy, storage guarantees and conflict/unknown-data handling.
Resolver/catalog context is trusted and must be stable and memory-only. Decoder
bounds untrusted text; arbitrary host resolver graphs/side effects cannot be
bounded or authenticated by this orchestrator. Spatial errors are coarse at the
content/placement path because its owner has no finer typed error channel.

## Reproducible manual public-root observations

Executed ad hoc after genuine builds from repository root. These are manual
observations, not files/scripts/runners/suites committed or added to CI.

```powershell
@'
import * as E from '@rpg-platform/editor';
const projectId='project-01';
const asset=E.createAssetDefinition({identity:{projectId,assetId:'asset-0012',sourceId:'0012'},kind:'image',
  metadata:{vendor:{future:['retained']}},sources:[{role:'image',locator:{type:'project-relative',path:'not-probed.png'}}]});
const catalog=E.createAssetCatalog({projectId,definitions:[asset]});
const space=E.createCoordinateSpaceDefinition({reference:{projectId,coordinateSpaceId:'space-01'},
  componentCount:2,axes:{x:'right',y:'up'},origin:{x:0,y:0},unit:'tile'});
const member=id=>({definition:{objectId:id},assetReference:{projectId,assetId:'asset-0012'},
  placement:{coordinateSpaceId:'space-01',point:{x:2,y:3}}});
const scene=E.createSceneMembership({scene:{identity:{projectId,sceneId:'scene-01'}},objects:[member('object-01'),member('object-02')]});
const make=(content,kind='scene',version=null)=>E.createDocumentEnvelope({schemaVersion:1,
  identity:{projectId,documentId:'doc-0012'},documentKind:kind,contentSchemaVersion:version,content});
const ctx={owner:'scene',documentKind:'scene',contentSchemaVersion:null,catalog,
  resolveCoordinateSpace:reference=>space};
const report=(label,r)=>console.log(label,JSON.stringify({status:r.status,checks:r.checks,read:r.readEligibility,
  write:r.writeEligibility,diagnostics:r.diagnostics}));
const source=make(scene),serialized=E.serializeDocument(source);
report('shared-asset',E.diagnoseDocument(serialized,ctx));
const broken=make({...scene,unknown:JSON.parse('{"__proto__":{"future":true},"vendor":{"v":["0012"]}}'),
  objects:[{...scene.objects[0],attachment:{kind:'attachment',target:{sceneId:'scene-01',objectId:'missing-object'}},
    assetReference:{projectId,assetId:'missing-asset'}},scene.objects[1]]});
const brokenText=E.serializeDocument(broken),before=E.serializeDocument(broken);
const invalid=E.diagnoseDocument(brokenText,{...ctx,resolveCoordinateSpace:()=>({...space,reference:{projectId,coordinateSpaceId:'wrong-space'}})});
report('missing-and-invalid-space',invalid);
console.log('preserved',before===E.serializeDocument(broken),brokenText===E.serializeDocument(invalid.document),
  invalid.document.content.objects.length,invalid.document.content.objects[0].attachment.target.objectId,
  invalid.document.content.objects[0].assetReference.assetId,invalid.document.content.unknown.vendor.v[0],
  Object.hasOwn(invalid.document.content.unknown,'__proto__'),({}).future===undefined);
console.log('frozen',Object.isFrozen(invalid),Object.isFrozen(invalid.document.content.unknown.vendor.v),
  Object.isFrozen(invalid.diagnostics[0].reference),Object.isFrozen(invalid.checks));
report('missing-space',E.diagnoseDocument(serialized,{...ctx,resolveCoordinateSpace:()=>undefined}));
report('no-reference-context',E.diagnoseDocument(serialized,{owner:'scene',documentKind:'scene',contentSchemaVersion:null}));
report('no-owner',E.diagnoseDocument(serialized));
report('version-mismatch',E.diagnoseDocument(serialized,{...ctx,contentSchemaVersion:2}));
report('kind-mismatch',E.diagnoseDocument(serialized,{...ctx,documentKind:'other'}));
report('malformed',E.diagnoseDocument('{',ctx));
report('future-envelope',E.diagnoseDocument(serialized.replace('"schemaVersion":1','"schemaVersion":2'),ctx));
report('invalid-envelope',E.diagnoseDocument('{}',ctx));
report('invalid-scene',E.diagnoseDocument(E.serializeDocument(make({...scene,objects:[scene.objects[0],scene.objects[0]]})),ctx));
const cross=make({...scene,scene:{identity:{projectId:'foreign',sceneId:'scene-01'}},objects:[]});
report('document-project-mismatch',E.diagnoseDocument(E.serializeDocument(cross),ctx));
const related=E.createAssetDefinition({...asset,dependencies:[{projectId,assetId:'missing-dependency'}]});
const ac={owner:'asset',documentKind:'asset',contentSchemaVersion:1,catalog};
report('asset-dependency',E.diagnoseDocument(E.serializeDocument(make(related,'asset',1)),ac));
report('asset-no-catalog',E.diagnoseDocument(E.serializeDocument(make(related,'asset',1)),{...ac,catalog:undefined}));
report('asset-future-shape',E.diagnoseDocument(E.serializeDocument(make({...asset,schemaVersion:2},'asset',1)),ac));
report('asset-extension',E.diagnoseDocument(E.serializeDocument(make(asset,'asset',1)),ac));
report('cross-scene-attachment',E.diagnoseDocument(E.serializeDocument(make({...scene,objects:[{...scene.objects[0],attachment:{kind:'attachment',target:{sceneId:'other-scene',objectId:'other-object'}}}]})),ctx));
report('invalid-host-space',E.diagnoseDocument(serialized,{...ctx,resolveCoordinateSpace:()=>({...space,axes:{x:'sideways',y:'up'}})}));
const sc={owner:'coordinate-space',documentKind:'space',contentSchemaVersion:null};
report('space',E.diagnoseDocument(E.serializeDocument(make(space,'space')),sc));
report('invalid-space',E.diagnoseDocument(E.serializeDocument(make({...space,axes:{x:'sideways',y:'up'}},'space')),sc));
report('invalid-placement',E.diagnoseDocument(E.serializeDocument(make({...scene,objects:[{...scene.objects[0],
  placement:{coordinateSpaceId:'space-01',point:{x:'bad',y:0}}}]})),ctx));
const textDoc=make('Chapter 0012','text'),tc={owner:'text',documentKind:'text',contentSchemaVersion:null};
report('text-only',E.diagnoseDocument(E.serializeDocument(textDoc),tc));
report('invalid-text',E.diagnoseDocument(E.serializeDocument(make({},'text')),tc));
const session=E.createDocumentSession(source,null);session.open();const snap=session.getSnapshot();
E.diagnoseDocument(E.serializeDocument(snap.envelope),ctx);
console.log('session-unchanged',JSON.stringify(snap)===JSON.stringify(session.getSnapshot()),snap.currentRevision,snap.savedRevision,snap.isDirty);
const unknown=new TypeError('private host detail');try{E.diagnoseDocument(serialized,{...ctx,resolveCoordinateSpace(){throw unknown;}});}
catch(e){console.log('host-error-propagated',e===unknown);}
console.log('stable-order',JSON.stringify(invalid.diagnostics)===JSON.stringify(E.diagnoseDocument(brokenText,
  {...ctx,resolveCoordinateSpace:()=>({...space,reference:{projectId,coordinateSpaceId:'wrong-space'}})}).diagnostics));
'@ | node --input-type=module
```

Observed (Node 24.18.0 / npm 12.2.0):

```text
shared-asset {"status":"valid","checks":{"content":"CHECKED","assetReferences":"CHECKED","spatialReferences":"CHECKED","fileExistence":"NOT_CHECKED"},"read":{"inspect":true,"strict":true},"write":"NOT_ESTABLISHED","diagnostics":[]}
missing-and-invalid-space {"status":"invalid","checks":{"content":"CHECKED","assetReferences":"CHECKED","spatialReferences":"CHECKED","fileExistence":"NOT_CHECKED"},"read":{"inspect":true,"strict":false},"write":"NOT_ESTABLISHED","diagnostics":[{"group":"reference","code":"OBJECT_TARGET_NOT_FOUND","severity":"error","path":"document.content.objects[0].attachment.target.objectId","reference":{"projectId":"project-01","sceneId":"scene-01","objectId":"object-01","assetId":"missing-asset","relatedObjectId":"missing-object"},"details":{"lookupScope":"SUPPLIED_SCENE_MEMBERSHIP"}},{"group":"reference","code":"TARGET_NOT_FOUND","severity":"error","path":"document.content.objects[0].assetReference.assetId","reference":{"projectId":"project-01","sceneId":"scene-01","objectId":"object-01","assetId":"missing-asset","relatedObjectId":"missing-object"},"details":{"lookupScope":"SUPPLIED_PROJECT_CATALOG"}},{"group":"spatial","code":"INVALID_SPATIAL_SPACE","severity":"error","path":"document.content.objects[0].placement","reference":{"projectId":"project-01","sceneId":"scene-01","objectId":"object-01","coordinateSpaceId":"space-01"},"details":{}},{"group":"spatial","code":"INVALID_SPATIAL_SPACE","severity":"error","path":"document.content.objects[1].placement","reference":{"projectId":"project-01","sceneId":"scene-01","objectId":"object-02","coordinateSpaceId":"space-01"},"details":{}}]}
preserved true true 2 missing-object missing-asset 0012 true true
frozen true true true true
missing-space {"status":"unresolved","checks":{"content":"CHECKED","assetReferences":"CHECKED","spatialReferences":"CHECKED","fileExistence":"NOT_CHECKED"},"read":{"inspect":true,"strict":false},"write":"NOT_ESTABLISHED","diagnostics":[{"group":"reference","code":"SPACE_TARGET_NOT_FOUND","severity":"error","path":"document.content.objects[0].placement.coordinateSpaceId","reference":{"projectId":"project-01","sceneId":"scene-01","objectId":"object-01","coordinateSpaceId":"space-01"},"details":{}},{"group":"reference","code":"SPACE_TARGET_NOT_FOUND","severity":"error","path":"document.content.objects[1].placement.coordinateSpaceId","reference":{"projectId":"project-01","sceneId":"scene-01","objectId":"object-02","coordinateSpaceId":"space-01"},"details":{}}]}
no-reference-context {"status":"not-checked","checks":{"content":"CHECKED","assetReferences":"NOT_CHECKED","spatialReferences":"NOT_CHECKED","fileExistence":"NOT_CHECKED"},"read":{"inspect":true,"strict":false},"write":"NOT_ESTABLISHED","diagnostics":[{"group":"context","code":"ASSET_REFERENCES_NOT_CHECKED","severity":"warning","path":"document.content.objects","reference":{},"details":{}},{"group":"context","code":"SPATIAL_REFERENCES_NOT_CHECKED","severity":"warning","path":"document.content.objects","reference":{},"details":{}}]}
no-owner {"status":"not-checked","checks":{"content":"NOT_CHECKED","assetReferences":"NOT_CHECKED","spatialReferences":"NOT_CHECKED","fileExistence":"NOT_CHECKED"},"read":{"inspect":true,"strict":false},"write":"NOT_ESTABLISHED","diagnostics":[{"group":"context","code":"CONTENT_NOT_CHECKED","severity":"warning","path":"document.content","reference":{},"details":{}}]}
version-mismatch {"status":"invalid","checks":{"content":"NOT_CHECKED","assetReferences":"NOT_CHECKED","spatialReferences":"NOT_CHECKED","fileExistence":"NOT_CHECKED"},"read":{"inspect":true,"strict":false},"write":"NOT_ESTABLISHED","diagnostics":[{"group":"schema","code":"CONTENT_CONTRACT_MISMATCH","severity":"error","path":"document.contentSchemaVersion","reference":{},"details":{"expectedKind":"scene","expectedContentSchemaVersion":2}}]}
kind-mismatch {"status":"invalid","checks":{"content":"NOT_CHECKED","assetReferences":"NOT_CHECKED","spatialReferences":"NOT_CHECKED","fileExistence":"NOT_CHECKED"},"read":{"inspect":true,"strict":false},"write":"NOT_ESTABLISHED","diagnostics":[{"group":"schema","code":"CONTENT_CONTRACT_MISMATCH","severity":"error","path":"document.documentKind","reference":{},"details":{"expectedKind":"other","expectedContentSchemaVersion":null}}]}
malformed {"status":"invalid","checks":{"content":"NOT_CHECKED","assetReferences":"NOT_CHECKED","spatialReferences":"NOT_CHECKED","fileExistence":"NOT_CHECKED"},"read":{"inspect":false,"strict":false},"write":"NOT_ESTABLISHED","diagnostics":[{"group":"envelope","code":"INVALID_JSON","severity":"error","path":"document","reference":{},"details":{}}]}
future-envelope {"status":"invalid","checks":{"content":"NOT_CHECKED","assetReferences":"NOT_CHECKED","spatialReferences":"NOT_CHECKED","fileExistence":"NOT_CHECKED"},"read":{"inspect":false,"strict":false},"write":"NOT_ESTABLISHED","diagnostics":[{"group":"schema","code":"UNSUPPORTED_SCHEMA","severity":"error","path":"document.schemaVersion","reference":{},"details":{}}]}
invalid-envelope {"status":"invalid","checks":{"content":"NOT_CHECKED","assetReferences":"NOT_CHECKED","spatialReferences":"NOT_CHECKED","fileExistence":"NOT_CHECKED"},"read":{"inspect":false,"strict":false},"write":"NOT_ESTABLISHED","diagnostics":[{"group":"envelope","code":"INVALID_ENVELOPE","severity":"error","path":"document","reference":{},"details":{}}]}
invalid-scene {"status":"invalid","checks":{"content":"CHECKED","assetReferences":"NOT_CHECKED","spatialReferences":"NOT_CHECKED","fileExistence":"NOT_CHECKED"},"read":{"inspect":true,"strict":false},"write":"NOT_ESTABLISHED","diagnostics":[{"group":"payload","code":"DUPLICATE_OBJECT_ID","severity":"error","path":"document.content.objects[1].definition.objectId","reference":{"projectId":"project-01","sceneId":"scene-01","objectId":"object-01","assetId":"asset-0012","relatedObjectId":null},"details":{"constraint":"SCENE_LOCAL_UNIQUE"}}]}
document-project-mismatch {"status":"invalid","checks":{"content":"CHECKED","assetReferences":"NOT_APPLICABLE","spatialReferences":"NOT_APPLICABLE","fileExistence":"NOT_CHECKED"},"read":{"inspect":true,"strict":false},"write":"NOT_ESTABLISHED","diagnostics":[{"group":"payload","code":"DOCUMENT_PROJECT_MISMATCH","severity":"error","path":"document.content.scene.identity.projectId","reference":{"projectId":"foreign"},"details":{"expectedProjectId":"project-01"}}]}
asset-dependency {"status":"unresolved","checks":{"content":"CHECKED","assetReferences":"CHECKED","spatialReferences":"NOT_APPLICABLE","fileExistence":"NOT_CHECKED"},"read":{"inspect":true,"strict":false},"write":"NOT_ESTABLISHED","diagnostics":[{"group":"reference","code":"TARGET_NOT_FOUND","severity":"error","path":"document.content.dependencies[0].assetId","reference":{"projectId":"project-01","assetId":"missing-dependency"},"details":{"lookupScope":"SUPPLIED_PROJECT_CATALOG"}}]}
asset-no-catalog {"status":"not-checked","checks":{"content":"CHECKED","assetReferences":"NOT_CHECKED","spatialReferences":"NOT_APPLICABLE","fileExistence":"NOT_CHECKED"},"read":{"inspect":true,"strict":false},"write":"NOT_ESTABLISHED","diagnostics":[{"group":"context","code":"ASSET_REFERENCES_NOT_CHECKED","severity":"warning","path":"document.content.dependencies","reference":{},"details":{}}]}
asset-future-shape {"status":"invalid","checks":{"content":"CHECKED","assetReferences":"NOT_CHECKED","spatialReferences":"NOT_APPLICABLE","fileExistence":"NOT_CHECKED"},"read":{"inspect":true,"strict":false},"write":"NOT_ESTABLISHED","diagnostics":[{"group":"schema","code":"UNSUPPORTED_SCHEMA_VERSION","severity":"error","path":"document.content.schemaVersion","reference":{},"details":{"constraint":"SCHEMA_VERSION_1"}}]}
asset-extension {"status":"valid","checks":{"content":"CHECKED","assetReferences":"NOT_APPLICABLE","spatialReferences":"NOT_APPLICABLE","fileExistence":"NOT_CHECKED"},"read":{"inspect":true,"strict":true},"write":"NOT_ESTABLISHED","diagnostics":[]}
cross-scene-attachment {"status":"invalid","checks":{"content":"CHECKED","assetReferences":"NOT_CHECKED","spatialReferences":"NOT_CHECKED","fileExistence":"NOT_CHECKED"},"read":{"inspect":true,"strict":false},"write":"NOT_ESTABLISHED","diagnostics":[{"group":"payload","code":"CROSS_SCENE_ATTACHMENT","severity":"error","path":"document.content.objects[0].attachment.target.sceneId","reference":{"projectId":"project-01","sceneId":"scene-01","objectId":"object-01","assetId":"asset-0012","relatedObjectId":"other-object"},"details":{"constraint":"SAME_SCENE"}}]}
invalid-host-space {"status":"invalid","checks":{"content":"CHECKED","assetReferences":"CHECKED","spatialReferences":"CHECKED","fileExistence":"NOT_CHECKED"},"read":{"inspect":true,"strict":false},"write":"NOT_ESTABLISHED","diagnostics":[{"group":"spatial","code":"INVALID_SPATIAL_SPACE","severity":"error","path":"document.content.objects[0].placement","reference":{"projectId":"project-01","sceneId":"scene-01","objectId":"object-01","coordinateSpaceId":"space-01"},"details":{}},{"group":"spatial","code":"INVALID_SPATIAL_SPACE","severity":"error","path":"document.content.objects[1].placement","reference":{"projectId":"project-01","sceneId":"scene-01","objectId":"object-02","coordinateSpaceId":"space-01"},"details":{}}]}
space {"status":"valid","checks":{"content":"CHECKED","assetReferences":"NOT_APPLICABLE","spatialReferences":"NOT_APPLICABLE","fileExistence":"NOT_CHECKED"},"read":{"inspect":true,"strict":true},"write":"NOT_ESTABLISHED","diagnostics":[]}
invalid-space {"status":"invalid","checks":{"content":"CHECKED","assetReferences":"NOT_APPLICABLE","spatialReferences":"NOT_APPLICABLE","fileExistence":"NOT_CHECKED"},"read":{"inspect":true,"strict":false},"write":"NOT_ESTABLISHED","diagnostics":[{"group":"spatial","code":"INVALID_SPATIAL_SPACE","severity":"error","path":"document.content","reference":{"projectId":"project-01","coordinateSpaceId":"space-01"},"details":{}}]}
invalid-placement {"status":"invalid","checks":{"content":"CHECKED","assetReferences":"NOT_CHECKED","spatialReferences":"NOT_CHECKED","fileExistence":"NOT_CHECKED"},"read":{"inspect":true,"strict":false},"write":"NOT_ESTABLISHED","diagnostics":[{"group":"payload","code":"INVALID_PLACEMENT","severity":"error","path":"document.content.objects[0].placement.point.x","reference":{"projectId":"project-01","sceneId":"scene-01","objectId":"object-01","assetId":"asset-0012","relatedObjectId":null},"details":{"constraint":"FINITE_NUMBER"}}]}
text-only {"status":"valid","checks":{"content":"CHECKED","assetReferences":"NOT_APPLICABLE","spatialReferences":"NOT_APPLICABLE","fileExistence":"NOT_CHECKED"},"read":{"inspect":true,"strict":true},"write":"NOT_ESTABLISHED","diagnostics":[]}
invalid-text {"status":"invalid","checks":{"content":"CHECKED","assetReferences":"NOT_APPLICABLE","spatialReferences":"NOT_APPLICABLE","fileExistence":"NOT_CHECKED"},"read":{"inspect":true,"strict":false},"write":"NOT_ESTABLISHED","diagnostics":[{"group":"payload","code":"INVALID_TEXT_CONTENT","severity":"error","path":"document.content","reference":{},"details":{}}]}
session-unchanged true 1 null true
host-error-propagated true
stable-order true
```

Shared Asset references are valid; missing Object/Asset references are diagnosed
without deleting either object or unknown prototype-key data. Space mismatch,
missing space, invalid axes and invalid placement have distinct owner/context
outcomes. Input JSON and reserialized returned authored snapshot are equal for
the demonstration; no repair or hidden schema upgrade occurs. Session remains
revision1/saved=null/dirty=true. Text requires neither Scene nor graphics.

No disk path is probed: not-probed.png is an illustrative locator, not a physical
asset claim. No file bytes, storage adapter, actual open/save or graphical product
behavior are observed. Returning inspection data is not UI acceptance.

## Static/build/declaration gates

Run again at the final checkpoint SHA; exact-head CI linked in PR ledger:

```powershell
node harness/cli.mjs check
node harness/cli.mjs scope --projects editor --allow-infra
node harness/cli.mjs verify --projects editor --with-consumers
npm run build -- --force
```

- ARCH_CHECK_PASS: **63 JS/TS** files.
- SCOPE_PASS before commit: six Editor/direct Harness paths; final commit diff
  audited for the same paths. No old checkpoint files changed.
- Editor with consumers BUILD_PASS. Forced full workspace BUILD_PASS:
  runtime-engine, runtime-render, editor, game-client, game-server.
- TypeScript source/emitted public symbol counts match **114/114**, **52/52**.
  Strict in-memory NodeNext/ES2022 package-root consumer compiles new diagnostics/
  context/result/code plus prior codec/session/Asset/Scene/Spatial/Render APIs,
  lib.es2022 only, types:[], skipLibCheck:false: **zero diagnostics**.
- Historical source-index counts remeasured at recorded commits:
  Phase1 Editor8/Render14, Phase2 43/17, Phase3 74/17, Phase4 90/52.
- Core2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775` and Gameplay0.15.2
  `acea332aa80f67552192a72b30f81c0bbbfc56bd` unchanged; SHA512 artifact
  hashes match pins. No private foundation or Render imports.
- Existing Windows DEP0190 tooling warning is not a build failure. Static regex
  boundary scanning is not proof of arbitrary runtime or visual correctness.
- No automated test files/runners/frameworks/coverage, UI/browser/E2E suites or
  historic exhaustive tests created/run. CI remains build/static only.

Audit observed:

```text
P1 4cec85b5a00e2477f00eee29e2da6025a532e973 editor:8 runtime-render:14
P2 fea9b734b849fa1c6bc953530e1fa425d43cfca8 editor:43 runtime-render:17
P3 5ce0feb4c1967c0dee14919b9c11d56991a46bd0 editor:74 runtime-render:17
P4 e46ec24dc662b1bc1588d5ec1c05d4f62739ac3c editor:90 runtime-render:52
editor source/emitted 114 114 differences [] [] additionsSinceDC10 [
  'diagnoseDocument',
  'DocumentDiagnosticCode',
  'DocumentDiagnostic',
  'DocumentValidationContext',
  'DocumentValidationResult'
]
runtime-render source/emitted 52 52 differences [] [] additionsSinceDC10 []
PIN @rpg/core 2.0.0 04b7239f998c3c688a0dfa3202f11811a9acd775 hashMatch true
PIN @rpg/gameplay 0.15.2 acea332aa80f67552192a72b30f81c0bbbfc56bd hashMatch true
PUBLIC ROOT NO DOM CONSUMER diagnostics 0
```

## Limits and next boundary

**READY_FOR_DEVELOPER_REVIEW**, not ACCEPTED. No blocker within DC11/DC12.
This is one bounded portable envelope with an explicit supported owner, not a bulk
project scanner, generic validator plugin platform, repair pipeline or global
reference resolver. Unknown fields remain preserved without inferred semantics.
No hierarchy, physical-file validation, IO/storage adapter, safe-save claim,
migration, Runtime game config implementation or graphics behavior. Those remain
**FEATURE_NOT_VERIFIED / unavailable here**. No v0.5.7, merge, tag or release.
