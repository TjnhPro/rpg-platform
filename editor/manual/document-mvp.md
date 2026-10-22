# Manual Document MVP — v0.5.12 (DC19)

Run from workspace root on Node24.18.0 / npm12.2.0 after installation:

```powershell
npm run foundations:prepare
npm run build -- --force
```

Then paste the finite sequence below in PowerShell. It prints observations and
creates a fresh ignored `.artifacts/document-mvp-v0.5.12-*` directory on each run.
It is a manual example, not an automated suite or a CI task. No executable demo,
test file, runner or assertion framework is installed.

Only `@rpg-platform/editor` root APIs are used. Node built-ins belong to the local
demo host. No Renderer/session/target/GPU is created to read a Document. Importing
the Editor root still transitively loads its existing Engine/Render modules;
this does not claim independent installability without those dependencies.

## Data and host choices

The sample uses existing Scene/Object/Asset/Spatial shapes: one Player label,
three Monster labels sharing the same Asset, and a VFX label attached to Player.
These are visual placeholders, not gameplay entities. This is planar ground data
for 2.5D authoring; there is no depth, camera, rendered scene or sprite proof.
Phase4 direction is presentation metadata, not a canonical Scene field.
Sample-owned facing intent is kept inside an opaque `customVisualProfile`
extension with explicit angle convention; diagnostics validate portability, not
its semantics. No new direction/content schema or math is introduced.

Supported metadata at content, Scene, entry and definition is retained by
`replaceSceneDocumentObject`. Do not replace full extended content with a known
Scene projection. Ordinary edits keep envelope1 and unversioned content null.

The concrete host is the same bounded local **create-only** approach demonstrated
in v0.5.8–11: write/sync/close an exclusive stage, then publish through an exclusive
filesystem hardlink. Existing destinations conflict without replacement.
Read uses strict UTF-8 decoding with an explicit post-read byte cap; returned storage
identity/revision are null. `expected:{kind:'absent'}` is independent of session
revision. No revision/CAS token is fabricated. Original and stage files remain.

This manual host has no product adapter registration, cleanup, existing-file
replacement CAS, automatic retry, uncertain-write reconciliation or guarantee of
crash/power-loss durability. It uses a fresh trusted local directory and lexical
direct-child checks, not adversarial symlink security. If hardlinks are unavailable,
report the observed failure/uncertainty; do not substitute in-memory persistence.
Physical sprite sources are deliberately not created or loaded. Logical Asset
resolution can be CHECKED while file existence remains NOT_CHECKED.

A controlled Promise delays delivery of an actual successful disk receipt. It
does not fake a commit: the file exists with revision2's payload before editing
revision3 and releasing acknowledgement. Existing-file collision is also exercised
against the real saved file; original bytes and dirty/session state are compared.

## Paste into PowerShell

```powershell
@'
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import * as E from '@rpg-platform/editor';

const dir = await fs.mkdtemp(path.resolve('.artifacts/document-mvp-v0.5.12-'));
const file = name => path.join(dir, name);
const json = JSON.stringify;
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const show = (label, value) => console.log(label, json(value));
const state = session => {
  const s = session.getSnapshot();
  return { state:s.state, revision:s.currentRevision, saved:s.savedRevision, dirty:s.isDirty };
};
const codes = result => result.diagnostics.map(d => d.code);
const projectId = 'document-mvp-project';
const asset = E.createAssetDefinition({
  identity:{projectId, assetId:'visual-0012', sourceId:'0012'}, kind:'image',
  metadata:{customVisualProfile:{vendor:'opaque', frames:['0012', {keep:true}]}},
  sources:[{role:'image', locator:E.createResourceLocator({type:'project-relative', path:'sprites/0012.png'})}],
});
const catalog = E.createAssetCatalog({projectId, definitions:[asset]});
const space = E.createCoordinateSpaceDefinition({
  reference:{projectId, coordinateSpaceId:'ground'}, componentCount:2,
  axes:{x:'right', y:'down'}, origin:{x:0,y:0}, unit:'tile',
});
const context = {owner:'scene', documentKind:'scene', contentSchemaVersion:null, catalog,
  resolveCoordinateSpace:r => r.projectId === projectId && r.coordinateSpaceId === 'ground' ? space : undefined};
const ids = ['player-visual','monster-1','monster-2','monster-3','vfx-visual'];
const known = E.createSceneMembership({
  scene:E.createSceneDefinition({identity:{projectId, sceneId:'zone-01'}}),
  objects:ids.map((objectId, i) => ({
    definition:E.createSceneObjectDefinition({objectId, displayName:objectId, classification:'visual-placeholder'}),
    assetReference:E.createAssetReference({projectId, assetId:asset.identity.assetId}),
    placement:{coordinateSpaceId:'ground', point:{x:i+1,y:2}},
    layerKey:i === 4 ? 'effect' : 'ground-actors',
    ...(i === 4 ? {attachment:{kind:'attachment', target:{sceneId:'zone-01',objectId:'player-visual'}}} : {}),
  })),
});
// Direction is sample-owned authored intent in an opaque extension. No Scene
// direction schema, rendering interpretation or gameplay entity is introduced.
const content = {...known, metadata:{customVisualProfile:{future:'retain'}},
  scene:{...known.scene, metadata:{authorNote:'keep'}},
  objects:known.objects.map((o,i) => ({...o,
    metadata:{customVisualProfile:{
      facing:{angleRadians:Math.PI/2, zeroAxis:'positive-x', positiveRotation:'toward-positive-y'},
      leadingZero:'0012', nested:{uninterpretedReference:{assetId:'future-metadata-target'}}}},
    definition:{...o.definition, metadata:{customVisualProfile:{authorIndex:i}}},
  })),
};
const envelope = E.createDocumentEnvelope({
  schemaVersion:1, identity:{projectId,documentId:'zone-document'},
  documentKind:'scene', contentSchemaVersion:null, content,
});
// Sidecar fixtures supply catalog/space context, not a new Document dependency format.
await fs.writeFile(file('catalog-asset.json'),json(asset),{flag:'wx'});
await fs.writeFile(file('coordinate-space.json'),json(space),{flag:'wx'});
const beforeText = E.serializeDocument(envelope);
await fs.writeFile(file('before.json'),beforeText,{flag:'wx'});
const beforeHash = hash(await fs.readFile(file('before.json')));
let attempts = 0, commits = 0;
const port = {
  conflictProtection:'create-only', publication:'atomic-publish',
  async read(locator) {
    const dest = path.resolve(locator);
    if (path.dirname(dest) !== dir) throw new TypeError('Manual host locator outside fixture');
    try {
      const bytes = await fs.readFile(dest);
      if (bytes.length > 1048576) return {status:'read-failed',reason:'unavailable'};
      return {status:'read', text:new TextDecoder('utf-8',{fatal:true}).decode(bytes),
        observation:{identity:null,revision:null}};
    } catch (e) {
      if (e.code === 'ENOENT') return {status:'not-found'};
      throw e;
    }
  },
  async commit(request) {
    attempts++;
    const dest = path.resolve(request.locator);
    if (path.dirname(dest) !== dir || request.expected.kind !== 'absent') return {status:'failed'};
    const stage = file('.stage-'+crypto.randomUUID());
    let handle;
    try {
      handle = await fs.open(stage,'wx');
      await handle.writeFile(request.text,'utf8');
      await handle.sync();
    } catch {
      return {status:'failed',reason:'io-error'};
    } finally {
      if (handle) await handle.close();
    }
    try { await fs.link(stage,dest); }
    catch (e) { return {status:e.code === 'EEXIST' ? 'conflicted' : 'uncertain'}; }
    commits++;
    return {status:'committed',confirmation:'manual-exclusive-link',
      observation:{identity:null,revision:null}};
  },
};
// Stages deliberately remain; no cleanup, CAS, overwrite or durability claim.
const session = E.createDocumentSession(envelope,null);
show('created',state(session)); session.open(); show('opened',state(session));
const untouched = json(session.getSnapshot());
const ui = {selectedObjectId:null,zoom:1};
ui.selectedObjectId = 'monster-2'; ui.zoom = 2;
session.replaceContent(session.getSnapshot().envelope.content);
show('UI and same-reference no-op',{unchanged:untouched === json(session.getSnapshot()),ui});
const edit = (doc, displayName, point) => {
  const projected = E.createSceneMembership(doc.content);
  const moved = E.updateSceneObjectSpatialPlacement(projected,'monster-2',space,
    E.createSpatialPoint2D({space:space.reference,point}));
  const object = E.getSceneObject(moved,'monster-2');
  return E.replaceSceneDocumentObject(doc,'monster-2',{
    ...object,definition:E.createSceneObjectDefinition({...object.definition,displayName}),
  },context);
};
const edited = edit(session.getSnapshot().envelope,'Monster edited',{x:7,y:-4});
session.replaceContent(edited.content); show('edited',state(session));
show('old snapshot',envelope);
show('new snapshot',session.getSnapshot().envelope);
const validation = E.diagnoseDocument(E.serializeDocument(edited),context);
show('validate',{status:validation.status,codes:codes(validation),checks:validation.checks});
show('before-image preserved',{unchanged:beforeHash === hash(await fs.readFile(file('before.json')))});
const save = await E.saveDocument(session,port,file('scene.json'),{kind:'absent'},context);
show('save',{status:save.status,revision:save.revision,state:state(session),observation:save.observation});
if (save.status !== 'committed') throw Error('Manual Save did not commit; inspect output');
const savedBytes = await fs.readFile(file('scene.json'));
show('disk evidence',{locator:file('scene.json'),bytes:savedBytes.length,sha256:hash(savedBytes),
  exactPayload:savedBytes.toString('utf8') === E.serializeDocument(edited)});
session.close('discard'); show('closed',state(session));
const loaded = await E.loadDocument(port,file('scene.json'),context);
show('load',{status:loaded.status,validation:loaded.validation.status,checks:loaded.validation.checks});
if (loaded.status !== 'loaded') throw Error('Manual Load did not create a session');
const reopened = loaded.session, restored = reopened.getSnapshot().envelope;
show('restored',{state:state(reopened),sameEnvelope:json(restored) === json(edited),
  documentId:restored.identity.documentId,sceneId:restored.content.scene.identity.sceneId,
  objects:restored.content.objects.map(o=>({id:o.definition.objectId,ref:o.assetReference,
    placement:o.placement,attachment:o.attachment??null,facing:o.metadata.customVisualProfile.facing})),
  allOpaqueData:json(restored.content) === json(edited.content),sourceId:asset.identity.sourceId});
// Existing-file collision is enforced by fs.link, without pre-reading destination.
reopened.replaceContent(edit(restored,'Conflicting edit',{x:8,y:9}).content);
const conflictSnapshot = json(reopened.getSnapshot());
const conflict = await E.saveDocument(reopened,port,file('scene.json'),{kind:'absent'},context);
show('external conflict',{status:conflict.status,reason:conflict.failure?.code,
  sessionUnchanged:conflictSnapshot === json(reopened.getSnapshot()),state:state(reopened),
  bytesUnchanged:hash(savedBytes) === hash(await fs.readFile(file('scene.json')))});
const countersBeforeRestore = {attempts,commits};
reopened.revertToSaved();
show('restore saved snapshot',{state:state(reopened),sameAsLoaded:json(reopened.getSnapshot().envelope) === json(restored),
  noIO:json(countersBeforeRestore) === json({attempts,commits})});
// Broken reference remains authored; validation prevents dispatch, not automatic deletion.
const brokenContent = {...restored.content,objects:restored.content.objects.map((o,i)=>i === 2 ?
  {...o,assetReference:E.createAssetReference({projectId,assetId:'missing-asset'})}:o)};
const brokenSession = E.createDocumentSession(E.replaceDocumentContent(restored,brokenContent),null);
brokenSession.open();
const brokenBefore = json(brokenSession.getSnapshot()),attemptsBefore = attempts;
const brokenSave = await E.saveDocument(brokenSession,port,file('broken.json'),{kind:'absent'},context);
show('missing reference',{status:brokenSave.status,codes:codes(brokenSave.validation),
  retained:brokenSave.validation.document.content.objects[2].assetReference,
  noDispatch:attempts === attemptsBefore,sessionUnchanged:brokenBefore === json(brokenSession.getSnapshot()),
  dirty:brokenSession.getSnapshot().isDirty});
// Actual revision2 disk publication, then delay delivery of that real receipt.
const late = E.createDocumentSession(envelope,null);late.open();
late.replaceContent(edited.content);
let publishedResolve, releaseResolve;
const published = new Promise(resolve=>{publishedResolve=resolve;});
const release = new Promise(resolve=>{releaseResolve=resolve;});
const delayedPort = {...port,async commit(request) {
  let receipt;
  try { receipt = await port.commit(request); }
  catch { receipt = {status:'uncertain'}; }
  publishedResolve(receipt); await release; return receipt;
}};
const pending = E.saveDocument(late,delayedPort,file('late.json'),{kind:'absent'},context);
const publishedReceipt = await published;
try {
  if (publishedReceipt.status !== 'committed') throw Error('Late example did not publish');
  late.replaceContent(edit(late.getSnapshot().envelope,'Revision three',{x:11,y:12}).content);
  show('published before ack',{receipt:publishedReceipt.status,state:state(late),
    diskIsRev2:(await fs.readFile(file('late.json'),'utf8')) === E.serializeDocument(edited)});
} finally { releaseResolve(); }
const lateResult = await pending;
show('late acknowledgement',{status:lateResult.status,acknowledged:lateResult.revision,state:state(late),
  savedIsRev2:json(late.getSnapshot().savedEnvelope) === json(edited),
  currentName:late.getSnapshot().envelope.content.objects[2].definition.displayName});
// Reuse real historical v0.2.2 Asset shape (before sources/dependencies).
// Profiles1->2 are DEMO Document-content bindings, not published Asset schema2.
const {sources,dependencies,...oldAsset} = asset;
const legacy = E.createDocumentEnvelope({schemaVersion:1,identity:{projectId,documentId:'legacy-asset-document'},
  documentKind:'asset',contentSchemaVersion:1,content:oldAsset});
const legacyText = E.serializeDocument(legacy);
await fs.writeFile(file('older-asset.json'),legacyText,{flag:'wx'});
const legacyHash = hash(await fs.readFile(file('older-asset.json')));
const target = {owner:'asset',documentKind:'asset',contentSchemaVersion:2};
const step = {name:'demo-historical-asset-add-empty-collections',documentKind:'asset',
  sourceContentSchemaVersion:1,targetContentSchemaVersion:2,
  transform:content=>E.createAssetDefinition(content)};
const sessionBeforeMigration = json(reopened.getSnapshot()),commitsBeforeMigration = commits;
const compatibility = E.inspectDocumentCompatibility(legacyText,target,step);
const migration = E.migrateDocument(legacyText,target,step);
show('explicit migration',{inspection:compatibility.status,reason:compatibility.reason,
  result:migration.status,candidate:migration.candidate,
  unknownRetained:migration.status === 'migrated' && json(migration.candidate.content.metadata) === json(asset.metadata),
  sourceUnchanged:legacyHash === hash(await fs.readFile(file('older-asset.json'))),
  noSave:commits === commitsBeforeMigration,sessionUnchanged:sessionBeforeMigration === json(reopened.getSnapshot())});
const futureText = json({...legacy,contentSchemaVersion:99});
const future = E.inspectDocumentCompatibility(futureText,target,step);
show('future content',{status:future.status,reason:future.reason});
await fs.writeFile(file('future-envelope.json'),json({...edited,schemaVersion:2}),{flag:'wx'});
const futureLoad = await E.loadDocument(port,file('future-envelope.json'),context);
show('future envelope',{status:futureLoad.status,hasSession:'session' in futureLoad});
show('headless text',E.diagnoseDocument(E.serializeDocument(E.createDocumentEnvelope({
  schemaVersion:1,identity:{projectId,documentId:'text-document'},documentKind:'text',
  contentSchemaVersion:null,content:'No scene or canvas needed',
})),{owner:'text',documentKind:'text',contentSchemaVersion:null}).status);
show('host evidence',{dir,node:process.version,expected:{kind:'absent'},observation:{identity:null,revision:null},
  attempts,commits,files:await fs.readdir(dir),beforeSHA256:beforeHash});
'@ | node --input-type=module
```

## Independent process reopen (read-only)

Set the directory below to the path printed by the first command. This second
Node process reconstructs owner context from the fixture sidecars and loads only
disk bytes; no previous Document/session instance is available. The sidecars are
manual fixture inputs, not a production content package. No write port is supplied.

```powershell
$env:RPG_DOCUMENT_MVP_DIR = '.artifacts/document-mvp-v0.5.12-DfxXxC'
@'
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import * as E from '@rpg-platform/editor';
const dir = path.resolve(process.env.RPG_DOCUMENT_MVP_DIR);
const read = name => fs.readFile(path.join(dir,name));
const asset = E.readAssetDefinitionSnapshot(JSON.parse((await read('catalog-asset.json')).toString('utf8')));
const space = E.createCoordinateSpaceDefinition(JSON.parse((await read('coordinate-space.json')).toString('utf8')));
const catalog = E.createAssetCatalog({projectId:asset.identity.projectId,definitions:[asset]});
const context = {owner:'scene',documentKind:'scene',contentSchemaVersion:null,catalog,
  resolveCoordinateSpace:r=>r.projectId === space.reference.projectId &&
    r.coordinateSpaceId === space.reference.coordinateSpaceId ? space : undefined};
const port = {async read(locator) {
  const dest = path.resolve(locator);
  if (path.dirname(dest) !== dir) throw new TypeError('Read outside fixture');
  const bytes = await fs.readFile(dest);
  if (bytes.length > 1048576) return {status:'read-failed',reason:'unavailable'};
  return {status:'read',text:new TextDecoder('utf-8',{fatal:true}).decode(bytes),
    observation:{identity:null,revision:null}};
}};
const result = await E.loadDocument(port,path.join(dir,'scene.json'),context);
if (result.status !== 'loaded') throw Error('Independent reopen failed');
const s = result.session.getSnapshot(),doc = s.envelope;
let spriteFile;
try { await fs.access(path.join(dir,asset.sources[0].locator.path));spriteFile='present'; }
catch (e) { if (e.code !== 'ENOENT') throw e;spriteFile='absent in fixture'; }
console.log(JSON.stringify({freshProcess:true,status:result.status,checks:result.validation.checks,
  revision:s.currentRevision,saved:s.savedRevision,dirty:s.isDirty,
  identity:doc.identity,scene:doc.content.scene.identity,
  editedObject:doc.content.objects[2],vfxAttachment:doc.content.objects[4].attachment,
  sourceId:asset.identity.sourceId,spriteFile,
  sha256:crypto.createHash('sha256').update(await read('scene.json')).digest('hex')}));
'@ | node --input-type=module
```

## Read the observations

| Stage | Expected observation |
| --- | --- |
| Create/open | revision1, saved null, dirty true |
| UI selection/zoom + same-reference replace | unchanged authored session |
| Edit label/placement | revision2, saved null, dirty true; old envelope retained |
| Validate | valid; content/Asset/Spatial CHECKED; physical file NOT_CHECKED |
| Save | real committed receipt; revision2 saved2, dirty false; exact disk payload |
| Close/reload | old closed; fresh open session revision1/saved1 clean; same envelope |
| Collision | conflicted, file bytes and session unchanged; unsaved edit remains dirty |
| revertToSaved | revision3/saved1, clean, loaded content restored without IO |
| Missing Asset | TARGET_NOT_FOUND retained, no dispatch/state change; dirty true |
| Delayed acknowledgement | actual disk rev2, current3/saved2, dirty true |
| Explicit older Asset migration | read-only/migration-needed -> candidate; no save/source/session change |
| Unsupported future | content99 rejected; envelope2 no loaded session |
| Text | valid with no Scene/Map/canvas |

The migration shape comes from actual Phase2 v0.2.2 Asset history before
sources/dependencies existed. Demo Document-content profiles1 ->2 are explicit
bindings; nested Asset schema and envelope remain1. The original file is retained.
No automatic adoption, overwrite or published migration registry is implied.

Full observed transcript, exact baseline, hashes, commands, build/CI evidence and
limits: [v0.5.12 checkpoint](../../harness/checkpoints/document-v0.5.12.md).
Stop before v0.5.13; this demo does not establish phase acceptance or visual review.
