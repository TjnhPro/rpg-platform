# v0.5.11 — Unknown Data Preservation & Content Integration (DC17/DC18)

**READY_FOR_DEVELOPER_REVIEW** — one checkpoint; stop before v0.5.12.
Finite manual observations and builds do not establish Developer acceptance,
universal preservation, MIGRATION_PASS or SAFE_SAVE_PASS.

## Baseline, authorization and ownership

- Repository: https://github.com/TjnhPro/rpg-platform
- Existing branch: `feat/editor-document-contracts-v0.5`; draft [PR #5](https://github.com/TjnhPro/rpg-platform/pull/5), base `main`.
- Pre-change HEAD / v0.5.10: `4e9d611014369d66283f4360fb0c892eaa46cb68`.
  Both previous exact-head workflows completed successfully:
  [push](https://github.com/TjnhPro/rpg-platform/actions/runs/39794595135),
  [PR](https://github.com/TjnhPro/rpg-platform/actions/runs/39794603221).
- Accepted Phase 4 baseline: `e46ec24dc662b1bc1588d5ec1c05d4f62739ac3c`.
  Earlier closure refs: P1 `4cec85b5a00e2477f00eee29e2da6025a532e973`,
  P2 `fea9b734b849fa1c6bc953530e1fa425d43cfca8`,
  P3 `5ce0feb4c1967c0dee14919b9c11d56991a46bd0`.
- Developer's standing instruction, recorded in Editor AGENTS.md, authorizes
  supplied tasks without intermediate approval. Delivery of this task authorizes
  this checkpoint; CI is not a substitute for Developer acceptance. No separate
  ACCEPTED verdict is inferred for every previous Phase 5 checkpoint.
- Requested behavior: edit known authored fields without silently losing supported
  unknown extensions; reuse Phase 2–4 content owners through the Document pipeline.
- Canonical primary owner: **Editor**, specifically authored Document retention and
  admission. Existing same-project Scene/Object operations, Asset snapshots and
  Spatial factories validate their own semantics. Host owns storage and resolvers.
- No collaborating production project changes; Runtime Render is inspected/built
  only. No L1/L2 API calls or changes, gameplay, Render state, schema promotion,
  duplicate resolver/mathematics, package/dependency/tool/workflow changes.
- Public delta: one root function `replaceSceneDocumentObject`; one additional
  diagnostic code `UNSUPPORTED_CONTENT_PROFILE`. Editor root exports 133 -> 134;
  Render remains 52. Other comparison/profile helpers stay internal to Editor.
- Exact final SHA and exact-head CI links belong in PR ledger after commit.
  A commit cannot embed its own hash.

Preflight inspected root AGENTS/ARCHITECTURE/FOUNDATION/README, Harness
OWNERSHIP/CONTRACTS/WORKFLOW/VERIFICATION, Editor/Render guidance, manifests,
current public roots/declarations and codec/envelope/diagnostics/session/load/save/
compatibility source. Source, rather than historic checkpoint prose, governs.

Eight changed paths: `editor/src/document-scene-profile.ts`,
`editor/src/document-scene-edit.ts`, `editor/src/document-diagnostics.ts`,
`editor/src/index.ts`, `editor/AGENTS.md`, `harness/CONTRACTS.md`,
`harness/OWNERSHIP.md`, this checkpoint. Exactly five projects remain.

## Pipeline audit and retention policy

| Capability | Baseline | Current checkpoint |
| --- | --- | --- |
| Portable bounded capture/codec | IMPLEMENTED v0.5.2/5 | Reused; original decoded content retained |
| Complete original content in diagnostics | IMPLEMENTED v0.5.6 | Reused; never replace with owner projection |
| Scene construction/replacement | IMPLEMENTED Phase 3/4 | Known-field projection drops Document extension records |
| Lossless supported Scene Document edit | UNAVAILABLE | IMPLEMENTED by explicit adapter |
| Scene strict snapshot admission | Could accept normalizable constructor inputs | Tightened to complete canonical snapshots plus declared metadata slots |
| Asset strict snapshot + portable metadata | IMPLEMENTED Phase 2 | Reused unchanged |
| Coordinate-space exact-field capture | IMPLEMENTED Phase 4 | Reused unchanged |
| Explicit load/save/session/compatibility | IMPLEMENTED v0.5.3–10 | Existing gates consume tightened diagnostics |
| Product filesystem/CAS adapter | UNAVAILABLE | Still unavailable; manual create-only host below |
| Future Engine game-config schema | DOCUMENTED_ONLY | No invented implementation |

The concrete loss point is passing a Document's extended Scene membership through
`createSceneMembership` / `replaceSceneObject`, then replacing the full content:
the canonical owner intentionally projects known fields. Codec and diagnostics
retain the original portable content; they are not the loss point.

Supported Scene Document profile is the complete canonical membership snapshot
with optional portable **metadata records** at exactly these slots:

- `content.metadata`
- `content.scene.metadata`
- `content.objects[i].metadata`
- `content.objects[i].definition.metadata`

These are Document extension slots, not new domain Scene/Object schema fields.
Unknown keys and nested reference-looking records inside metadata remain opaque:
preservation is not semantic validation or resolution. Non-record metadata,
unknown structural keys, extensions within placement/reference/attachment/identity,
or constructor-default/normalization differences block strict admission with
`UNSUPPORTED_CONTENT_PROFILE`. Original data remains available for inspection.

This intentionally tightens compatibility: incomplete construction inputs that
were previously normalizable are no longer strict-writable Scene Documents.
Supply a complete owner snapshot explicitly; unsupported content requires a
separate explicit owner migration/decision. No silent normalization or version bump.
Asset retains its existing metadata profile; Spatial has no new extension slot.

`replaceSceneDocumentObject(document, objectId, replacement, context)`:

1. Captures/bounds the source using existing codec and requires strict Scene
   validation with explicit kind/version/reference/space binding.
2. Captures/bounds replacement and delegates identity/membership semantics to
   existing canonical Scene operations.
3. Requires a complete known-field replacement equal to the canonical owner
   snapshot; extra replacement metadata/unknown fields reject rather than strip.
4. Restores the original selected entry/definition metadata and retains content,
   Scene metadata and every unrelated entry. Optional known fields omitted in a
   replacement explicitly clear, as in the existing owner operation.
5. Revalidates the full candidate through existing content/reference owners and
   returns a detached frozen envelope.

No IO, session adoption, revision/baseline advance, identity rename, schema bump,
metadata edit, arbitrary patch or automatic migration occurs. Trusted resolver
exceptions and codec resource errors propagate. Existing whole-content/session
replacement is still a trusted complete replacement seam; it cannot reconstruct
data a caller already discarded. Portable plain data alone cannot establish that
a metadata record is authored rather than a serialized UI preference. Hosts must
select authored content; structural viewport fields reject, and live handles/
callbacks remain excluded by the codec.

## Observed finite manual evidence

Executed public-root-only inline PowerShell/Node commands below, not committed
test files or a test runner. Node `v24.18.0`; actual local filesystem fixture
`.artifacts/document-content-v0.5.11-CIV5Qv` (ignored, not shipped).
Original `source.json` SHA256:
`4aebdfd6e046b428bd13e3b61c0bf4df4f669d9b8371ac0656df8740475a5946`.

Scene sample: Document `scene-document`, Scene `zone-01`, objects
`monster-1/2/3`, all referencing `monster-visual`; object3 attaches to object1.
All four metadata slots include opaque authored data, including nested
`customVisualProfile`, reference-looking unknown content and string `0012`.
Asset has sourceId `0012` and source `sprites/0012.png`; coordinate space
`ground` has right/down axes and tile units. These are fixture labels only, not
a Monster/gameplay implementation.

| Action | Observed |
| --- | --- |
| Read actual source file through loadDocument | loaded, strict valid; content/Asset/Spatial CHECKED, file existence NOT_CHECKED |
| Feed extended content through existing Scene projection | Metadata loss observed, motivating adapter |
| Rename monster-2 and use owner spatial operation for x=7,y=-4 | All metadata, IDs, order, Asset references, object3 relationship and unrelated objects retained |
| Inspect pure adapter result | Frozen/detached; session snapshot and source file unchanged |
| Explicit session.replaceContent then Save As | revision2 / saved1 / dirty before; committed revision2 / clean after |
| Read actual edited.json | strict valid; same edited content including every supported unknown metadata subtree |
| Check source bytes afterward | SHA256 unchanged; ordinary edit keeps envelope1 / contentVersion null |
| Missing Asset source reference | TARGET_NOT_FOUND; original reference retained; no strict session/edit |
| Unknown placement.depthMode / scalar metadata / viewportPreferences / incomplete snapshot | UNSUPPORTED_CONTENT_PROFILE; inspect content retained |
| Extra replacement metadata, renamed/missing object, unbound context | TypeError before session adoption or IO |
| Replacement introduces missing Asset, attachment target or Space | TypeError from post-validation |
| Existing broken/unknown/mismatched-version file load | diagnostics, no session, original text retained |
| Save same invalid candidates | validation-diagnostics; zero dispatches, original file bytes unchanged, dirty stays true |
| Asset owner factory/read snapshot + whole-content edit + actual save/reload | sourceId 0012, source locator and nested unknown metadata retained; nested schema stays1 |
| Spatial owner factory + whole-content edit + actual save/reload | authored-unit persisted; identities, axes and origin retained |
| Unknown Asset/Space structural keys | UNSUPPORTED_FIELD / INVALID_SPATIAL_SPACE |
| Explicit omitted placement in replacement | Placement removed; source metadata retained |
| Metadata own __proto__/constructor | Retained as data; global prototype unaffected |
| Trusted resolver throws | Same exception identity propagates |
| Unsupported envelope2 actual load | unsupported-schema, no session, raw text/disk retained; direct session creation refused |
| Headless text content | Valid without Scene/Map/canvas |

Content binding in this Scene fixture is **null** (unversioned), not numeric1.
For contentVersion99 vs null, compatibility returns read-only/migration-unavailable,
not an ordered future-content rejection. Bound load/save returns
CONTENT_CONTRACT_MISMATCH and does not dispatch. Existing numeric future-version
policy remains separate; no migration evidence is invented.

Storage host is an inline real Node filesystem adapter using explicit locators,
UTF-8 read, null observed storage identity/revision, `expected:{kind:'absent'}`.
It stages via exclusive open/write/sync/close and publishes via hardlink into an
absent destination. Three actual commits: Scene, Asset, Space. Destination
already-existing writes are outside this host's admission. No existing-file CAS,
read/hash-then-rename claim, cleanup hook, crash/power-loss durability, symlink
security or production filesystem adapter is established. Stage files remain.
Source bytes and failed-candidate destination bytes were observed unchanged.
This is a bounded local observation, not universal safe-save certification.

## Build and static gates

- `node harness/cli.mjs check`: **ARCH_CHECK_PASS**, 69 JS/TS files.
- `node harness/cli.mjs scope --projects editor --allow-infra`: **SCOPE_PASS**,
  eight paths including this report.
- `node harness/cli.mjs verify --projects editor --with-consumers`: **BUILD_PASS**
  Editor; no other workspace project's source currently imports Editor.
- `npm run build -- --force`: **PASS** all five independent projects:
  runtime-engine, runtime-render, editor, game-client, game-server.
- `npm run foundations:prepare`: **FOUNDATIONS_READY**; cached artifacts match pins.
  Core2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775`;
  Gameplay0.15.2 `acea332aa80f67552192a72b30f81c0bbbfc56bd`.
- Strict public-root TypeScript consumer: zero diagnostics, NodeNext/ES2022,
  strict, exactOptionalPropertyTypes, noUncheckedIndexedAccess, skipLibCheck:false,
  lib ES2022 only and types:[]; no DOM/Node ambient requirement in public API.
- Emitted declarations/root symbol inventory: Editor source/dist 134/134;
  Render source/dist 52/52. Export maps unchanged; no cross-project private import.
- `git diff --check`: clean. No tests/test framework/coverage/UI automation added
  or run. Existing Harness child-process DEP0190 warning remains unchanged.
- Exact-head remote workflow results are recorded in PR #5 ledger after push.

Static checks establish configured dependency/boundary rules and compilation,
not complete semantic dependency analysis, gameplay behavior or visual correctness.

## Limits and open decisions

Preservation is exact portable data within declared metadata slots, not byte
formatting preservation of rewritten JSON and not understanding unknown semantics.
References inside opaque metadata are not known typed Asset dependencies.
Unsupported future/structural data stays inspect-only; no read-only UI is supplied.
No Scene projection used alone can preserve Document metadata. Hosts must use the
adapter when editing supported Scene objects, and explicitly adopt its result.
No map/UI, renderer/GPU integration, production IO/recovery, replacement CAS,
general patching, registry, automatic migration or later checkpoint is delivered.
No functional/visual acceptance beyond the listed finite observations.

Design references consulted for principles only:
[VS Code custom editors](https://code.visualstudio.com/api/extension-guides/custom-editors)
(document/view/save separation),
[Unity serialization](https://docs.unity3d.com/Manual/script-serialization.html)
(owner serialization),
[Godot saving](https://docs.godotengine.org/en/stable/tutorials/io/saving_games.html)
(explicit authored data selection),
[Unreal versioning](https://dev.epicgames.com/documentation/en-us/unreal-engine/versioning-of-assets-and-packages-in-unreal-engine)
(incompatibility and data-loss safeguards).
No actual JXQY ProjectDocumentRegistry/DurableFileTransaction source was available;
no implementation or parity claim is made.

## Reproducible manual commands

Run from repository root after building. First command creates a new ignored local
fixture and prints its path/hash and observations. These are manual evidence
transcripts in documentation, not an installed executable suite.

```powershell
@'
import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import * as E from '@rpg-platform/editor';
const dir=await fs.mkdtemp(path.resolve('.artifacts/document-content-v0.5.11-')),file=n=>path.join(dir,n);
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),j=JSON.stringify;
const show=(label,value)=>console.log(label,j(value));
const reject=(label,fn)=>{try{fn();console.log(label,'UNEXPECTED_RETURN');}catch(e){console.log(label,e.name,e.message);}};
const projectId='content-project',asset=E.createAssetDefinition({identity:{projectId,assetId:'monster-visual',sourceId:'0012'},kind:'image',metadata:{customVisualProfile:{vendor:'unrecognized',frames:[1,2,{future:'retain'}]}},sources:[{role:'image',locator:E.createResourceLocator({type:'project-relative',path:'sprites/0012.png'})}]});
const catalog=E.createAssetCatalog({projectId,definitions:[asset]});
const space=E.createCoordinateSpaceDefinition({reference:{projectId,coordinateSpaceId:'ground'},componentCount:2,axes:{x:'right',y:'down'},origin:{x:0,y:0},unit:'tile'});
const base=E.createSceneMembership({scene:E.createSceneDefinition({identity:{projectId,sceneId:'zone-01'}}),objects:['monster-1','monster-2','monster-3'].map((objectId,index)=>({definition:E.createSceneObjectDefinition({objectId,displayName:objectId,classification:'visual-placeholder'}),assetReference:E.createAssetReference({projectId,assetId:asset.identity.assetId}),placement:{coordinateSpaceId:'ground',point:{x:index+1,y:2}},...(index===2?{attachment:{kind:'attachment',target:{sceneId:'zone-01',objectId:'monster-1'}}}:{})}))});
const raw={...base,metadata:{future:{keep:true}},scene:{...base.scene,metadata:{authorTag:'keep'}},objects:base.objects.map((entry,index)=>({...entry,metadata:{customVisualProfile:{revision:'future-7',assetReference:{projectId,assetId:'uninterpreted-metadata-target'},layers:['glow',{vendorFlag:true}],leadingZero:'0012'}},definition:{...entry.definition,metadata:{customVisualProfile:{opaque:index}}}}))};
const source=E.createDocumentEnvelope({schemaVersion:1,identity:{projectId,documentId:'scene-document'},documentKind:'scene',contentSchemaVersion:null,content:raw});
const context={owner:'scene',documentKind:'scene',contentSchemaVersion:null,catalog,resolveCoordinateSpace:r=>r.projectId===projectId&&r.coordinateSpaceId==='ground'?space:undefined};
const originalText=JSON.stringify(source,null,2)+'\n';await fs.writeFile(file('source.json'),originalText,{flag:'wx'});const before=hash(await fs.readFile(file('source.json')));
let commits=0;const port={conflictProtection:'create-only',publication:'atomic-publish',async read(locator){try{return{status:'read',text:await fs.readFile(locator,'utf8'),observation:{identity:null,revision:null}};}catch(e){if(e.code==='ENOENT')return{status:'not-found'};throw e;}},async commit(request){
commits++;const dest=path.resolve(request.locator);if(!dest.startsWith(dir+path.sep)||request.expected.kind!=='absent')return{status:'failed'};
const stage=file('.stage-'+crypto.randomUUID());let h;try{h=await fs.open(stage,'wx');await h.writeFile(request.text,'utf8');await h.sync();}finally{if(h)await h.close();}
try{await fs.link(stage,dest);}catch(e){return{status:e.code==='EEXIST'?'conflicted':'uncertain'};}
return{status:'committed',confirmation:'manual-create-only-link',observation:{identity:null,revision:null}};
}};
const loaded=await E.loadDocument(port,file('source.json'),context);show('source load',{status:loaded.status,validation:loaded.validation.status,checks:loaded.validation.checks});
if(loaded.status!=='loaded')throw Error('Source did not load');
const session=loaded.session,oldSnapshot=j(session.getSnapshot());
const replacement=E.createSceneMembership({scene:base.scene,objects:[{...base.objects[1],definition:{...base.objects[1].definition,displayName:'Renamed Monster'}}]}).objects[0];
console.log('legacy owner projection drops metadata',!Object.hasOwn(E.replaceSceneObject(raw,'monster-2',replacement).objects[0],'metadata'));
const renamed=E.replaceSceneDocumentObject(session.getSnapshot().envelope,'monster-2',replacement,context);
const positioned=E.updateSceneObjectSpatialPlacement(E.createSceneMembership(renamed.content),'monster-2',space,E.createSpatialPoint2D({space:space.reference,point:{x:7,y:-4}}));
const edited=E.replaceSceneDocumentObject(renamed,'monster-2',E.getSceneObject(positioned,'monster-2'),context);
console.log('pure edit leaves session unchanged',oldSnapshot===j(session.getSnapshot()),'original file hash unchanged',before===hash(await fs.readFile(file('source.json'))));
show('schema and identity',{envelope:edited.schemaVersion,content:edited.contentSchemaVersion,document:edited.identity,scene:edited.content.scene.identity,ids:edited.content.objects.map(x=>x.definition.objectId),assets:edited.content.objects.map(x=>x.assetReference.assetId)});
console.log('all metadata preserved',j(raw.metadata)===j(edited.content.metadata)&&j(raw.scene.metadata)===j(edited.content.scene.metadata)&&raw.objects.every((x,i)=>j(x.metadata)===j(edited.content.objects[i].metadata)&&j(x.definition.metadata)===j(edited.content.objects[i].definition.metadata)));
console.log('unrelated objects unchanged',j(raw.objects[0])===j(edited.content.objects[0])&&j(raw.objects[2])===j(edited.content.objects[2]),'frozen metadata',Object.isFrozen(edited.content.objects[1].metadata.customVisualProfile));
session.replaceContent(edited.content);show('before save',{revision:session.getSnapshot().currentRevision,saved:session.getSnapshot().savedRevision,dirty:session.getSnapshot().isDirty,commits});
const saved=await E.saveDocument(session,port,file('edited.json'),{kind:'absent'},context);show('save',{status:saved.status,revision:saved.revision,dirty:saved.snapshot?.isDirty});
const reloaded=await E.loadDocument(port,file('edited.json'),context);show('reload',{status:reloaded.status,validation:reloaded.validation.status,checks:reloaded.validation.checks});const round=reloaded.session.getSnapshot().envelope;
show('edited fields',round.content.objects[1]);console.log('roundtrip content identical',j(round.content)===j(edited.content),'source hash still unchanged',before===hash(await fs.readFile(file('source.json'))));
const diagnostics=doc=>{const r=E.diagnoseDocument(E.serializeDocument(doc),context);return{status:r.status,codes:r.diagnostics.map(d=>d.code),data:r.document};};
const bad=E.createDocumentEnvelope({...source,content:{...raw,objects:raw.objects.map((x,i)=>i===1?{...x,assetReference:{...x.assetReference,assetId:'missing-asset'}}:x)}});
const broken=diagnostics(bad);show('missing reference',{status:broken.status,codes:broken.codes,retained:broken.data.content.objects[1].assetReference});
reject('missing ref edit blocked',()=>E.replaceSceneDocumentObject(bad,'monster-2',replacement,context));
const unknown=E.createDocumentEnvelope({...source,content:{...raw,objects:raw.objects.map((x,i)=>i===1?{...x,placement:{...x.placement,depthMode:'future'}}:x)}});
show('unknown structural field',diagnostics(unknown));
const future=E.createDocumentEnvelope({...source,contentSchemaVersion:99});show('future compatibility',E.inspectDocumentCompatibility(E.serializeDocument(future),context));
const invalidReplacement={...replacement,definition:{...replacement.definition,metadata:{newField:'must not be silently dropped'}}};reject('replacement unknown blocked',()=>E.replaceSceneDocumentObject(source,'monster-2',invalidReplacement,context));
reject('renamed ID blocked',()=>E.replaceSceneDocumentObject(source,'monster-2',{...replacement,definition:{...replacement.definition,objectId:'changed'}},context));
reject('missing object blocked',()=>E.replaceSceneDocumentObject(source,'absent',replacement,context));
reject('unbound references blocked',()=>E.replaceSceneDocumentObject(source,'monster-2',replacement,{owner:'scene',documentKind:'scene',contentSchemaVersion:null}));
for(const [label,doc] of [['broken',bad],['unknown',unknown],['future',future]]){
 await fs.writeFile(file(label+'.json'),E.serializeDocument(doc),{flag:'wx'});const initial=hash(await fs.readFile(file(label+'.json')));
 const result=await E.loadDocument(port,file(label+'.json'),context);show(label+' load',{status:result.status,hasSession:'session'in result,codes:result.validation.diagnostics.map(d=>d.code),rawRetained:result.text===E.serializeDocument(doc)});
 const s=E.createDocumentSession(doc,null);s.open();const calls=commits;const resultSave=await E.saveDocument(s,port,file(label+'.json'),{kind:'absent'},context);show(label+' save',{status:resultSave.status,dispatches:commits-calls,bytesUnchanged:initial===hash(await fs.readFile(file(label+'.json'))),dirty:s.getSnapshot().isDirty});
}
const assetContext={owner:'asset',documentKind:'asset',contentSchemaVersion:1},assetDoc=E.createDocumentEnvelope({schemaVersion:1,identity:{projectId,documentId:'asset-document'},documentKind:'asset',contentSchemaVersion:1,content:asset});
const assetEdited=E.replaceDocumentContent(assetDoc,E.createAssetDefinition({...E.readAssetDefinitionSnapshot(assetDoc.content),kind:'sprite-image'}));
const assetSession=E.createDocumentSession(assetEdited,null);assetSession.open();show('asset save',(await E.saveDocument(assetSession,port,file('asset.json'),{kind:'absent'},assetContext)).status);
const assetLoad=await E.loadDocument(port,file('asset.json'),assetContext);show('asset integration',{status:assetLoad.status,sourceId:assetLoad.validation.document.content.identity.sourceId,metadata:assetLoad.validation.document.content.metadata,sources:assetLoad.validation.document.content.sources,version:assetLoad.validation.document.content.schemaVersion});
const spatialContext={owner:'coordinate-space',documentKind:'space',contentSchemaVersion:null},spaceDoc=E.createDocumentEnvelope({schemaVersion:1,identity:{projectId,documentId:'space-document'},documentKind:'space',contentSchemaVersion:null,content:space});
const spaceEdited=E.replaceDocumentContent(spaceDoc,E.createCoordinateSpaceDefinition({...space,unit:'authored-unit'}));const spatialSession=E.createDocumentSession(spaceEdited,null);spatialSession.open();show('spatial save',(await E.saveDocument(spatialSession,port,file('space.json'),{kind:'absent'},spatialContext)).status);
const spatialLoad=await E.loadDocument(port,file('space.json'),spatialContext);show('spatial integration',{status:spatialLoad.status,content:spatialLoad.validation.document.content});
show('space unknown blocked',E.diagnoseDocument(E.serializeDocument(E.replaceDocumentContent(spaceDoc,{...space,future:true})),spatialContext).diagnostics.map(d=>d.code));
show('asset unknown blocked',E.diagnoseDocument(E.serializeDocument(E.replaceDocumentContent(assetDoc,{...asset,future:true})),assetContext).diagnostics.map(d=>d.code));
const cleared=E.replaceSceneDocumentObject(edited,'monster-2',E.createSceneMembership({scene:base.scene,objects:[{definition:replacement.definition,assetReference:replacement.assetReference}]}).objects[0],context);console.log('explicit optional placement removal',!Object.hasOwn(cleared.content.objects[1],'placement'),'metadata still retained',j(raw.objects[1].metadata)===j(cleared.content.objects[1].metadata));
show('storage evidence',{fixture:path.basename(dir),Node:process.version,expected:{kind:'absent'},observation:{identity:null,revision:null},commits,originalSHA256:before,files:await fs.readdir(dir)});
'@ | node --input-type=module
```

Additional finite observations below used the fixture path printed in this run.
Change that path to the first command's actual output when reproducing.

```powershell
@'
import fs from 'node:fs/promises';import path from 'node:path';import * as E from '@rpg-platform/editor';
const dir=path.resolve('.artifacts/document-content-v0.5.11-CIV5Qv');
const source=E.deserializeDocument(await fs.readFile(path.join(dir,'source.json'),'utf8')).document;
const asset=E.readAssetDefinitionSnapshot(E.deserializeDocument(await fs.readFile(path.join(dir,'asset.json'),'utf8')).document.content);
const space=E.createCoordinateSpaceDefinition(E.deserializeDocument(await fs.readFile(path.join(dir,'space.json'),'utf8')).document.content);
const context={owner:'scene',documentKind:'scene',contentSchemaVersion:null,catalog:E.createAssetCatalog({projectId:asset.identity.projectId,definitions:[asset]}),resolveCoordinateSpace:()=>space};
const known=E.createSceneMembership(source.content),replacement=known.objects[1],j=JSON.stringify;
const diagnose=content=>E.diagnoseDocument(E.serializeDocument(E.replaceDocumentContent(source,content)),context);
const reject=(label,fn)=>{try{fn();console.log(label,'UNEXPECTED_RETURN');}catch(e){console.log(label,e.name);}};
for(const [label,content] of [['metadata scalar',{...source.content,metadata:'future'}],['UI field',{...source.content,viewportPreferences:{zoom:2}}],['incomplete snapshot',{scene:source.content.scene,objects:[{definition:{objectId:'visual'},assetReference:null}]}]])console.log(label,diagnose(content).diagnostics.map(x=>x.code));
const meta=JSON.parse('{"__proto__":{"poison":true},"constructor":{"keep":true},"nested":{"customVisualProfile":[null,"0012"]}}');
const original=E.replaceDocumentContent(source,{...source.content,objects:source.content.objects.map((x,i)=>i===1?{...x,metadata:meta}:x)});
const captured=E.replaceSceneDocumentObject(original,'monster-2',replacement,context);console.log('special metadata retained',j(captured.content.objects[1].metadata)===j(meta),'global prototype unaffected',({}).poison===undefined);
reject('post-validation missing asset',()=>E.replaceSceneDocumentObject(source,'monster-2',{...replacement,assetReference:{...replacement.assetReference,assetId:'missing'}},context));
reject('post-validation missing attachment',()=>E.replaceSceneDocumentObject(source,'monster-2',{...replacement,attachment:{kind:'attachment',target:{sceneId:'zone-01',objectId:'missing'}}},context));
reject('post-validation missing space',()=>E.replaceSceneDocumentObject(source,'monster-2',{...replacement,placement:{coordinateSpaceId:'other',point:{x:0,y:0}}},{...context,resolveCoordinateSpace:r=>r.coordinateSpaceId==='ground'?space:undefined}));
const privateError=Error('private');try{E.replaceSceneDocumentObject(source,'monster-2',replacement,{...context,resolveCoordinateSpace(){throw privateError;}});}catch(e){console.log('trusted resolver exception unchanged',e===privateError);}
const futureText=JSON.stringify({...source,schemaVersion:2});const target=path.join(dir,'future-envelope.json');await fs.writeFile(target,futureText,{flag:'wx'});
const result=await E.loadDocument({async read(locator){return{status:'read',text:await fs.readFile(locator,'utf8'),observation:{identity:null,revision:null}};}},target,context);console.log('future envelope',result.status,'session'in result,'raw preserved',result.text===futureText,'disk preserved',await fs.readFile(target,'utf8')===futureText);reject('future envelope session refused',()=>E.createDocumentSession({...source,schemaVersion:2},null));
const text=E.createDocumentEnvelope({schemaVersion:1,identity:source.identity,documentKind:'notes',contentSchemaVersion:null,content:'No Scene required'});console.log('headless text',E.diagnoseDocument(E.serializeDocument(text),{owner:'text',documentKind:'notes',contentSchemaVersion:null}).status);
'@ | node --input-type=module
```

**STOP:** READY_FOR_DEVELOPER_REVIEW; no v0.5.12, merge, release, tag or publish.
