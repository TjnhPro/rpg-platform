# v0.5.8 — Safe Save & Revision Conflict Protection

DC14. **READY_FOR_DEVELOPER_REVIEW**. Finite real create-only save/load evidence;
no broad SAFE_SAVE_PASS, phase acceptance or migration claim. Stop before v0.5.9.

## Exact baseline, authorization and preflight

- Accepted Phase 4 baseline: `e46ec24dc662b1bc1588d5ec1c05d4f62739ac3c`.
- Previous v0.5.7 checkpoint/local/origin/PR:
  `4a59d42443ec6043752e54c0263598a2eb0ddc29`, initially clean.
- Continue `feat/editor-document-contracts-v0.5`, same
  [draft PR #5](https://github.com/TjnhPro/rpg-platform/pull/5), base main.
- Developer supplied this next task under standing instruction to implement and
  verify without intermediate approval questions. Authorization covers this
  version only. It does not turn prior CI into product acceptance.
- Read current root AGENTS/ARCHITECTURE/FOUNDATION/README; Harness OWNERSHIP,
  CONTRACTS, WORKFLOW, VERIFICATION; Editor/Render AGENTS, manifests, source,
  public index and emitted declarations. Route hint suggests Editor; actual
  behavior confirms **Editor — save orchestration and revision conflict policy**.
- One checkpoint commit; final self-referential SHA and exact-head CI recorded
  in the PR ledger/handoff after commit, not fabricated inside this report.

## Owners, scope and current capability audit

Exact six paths: editor/src/document-save.ts; editor/src/index.ts; editor/AGENTS.md;
harness/CONTRACTS.md; harness/OWNERSHIP.md; harness/checkpoints/document-v0.5.8.md.

Editor is canonical primary owner. Host collaborator owns authorized locator,
byte encoding/limits, storage preconditions/publication, actual IO and receipts.
Existing Editor session, codec, diagnostics and content-owner validators are reused.
Runtime Render/Engine/Client/Server and L1/L2 require no changes or new calls.
No workspace imports Editor, so --with-consumers selects Editor; all five projects
are built through workspace orchestration. No manifests, locks, pins, workflow
or prior content-owner implementation changed. Exactly five projects.

IMPLEMENTED before this checkpoint: immutable envelope/content, lifecycle and
revision/dirty/saved baseline; one-shot session tickets/host evidence; bounded
JSON codec; explicit strict-versus-inspect diagnostics; read port/load with raw
preservation and nullable storage observations. IMPLEMENTED here: save admission,
conditional write port and exact-ticket acknowledgement with fail-closed guards.

UNAVAILABLE / not implied: built-in production filesystem/browser write adapter,
existing-file CAS provider in this environment, distributed locks, crash recovery,
autosave, migration, UI or persistence engine. No real JXQY
ProjectDocumentRegistry/DurableFileTransaction source is available.

## API delta and transaction decisions

Six additive Editor root symbols: saveDocument, DocumentWritePrecondition,
DocumentWriteRequest, DocumentCommitReceipt, DocumentWritePort, DocumentSaveResult.
Editor source/emitted **125/125** (previous119); Render unchanged **52/52**.
Existing session/load/codec/domain signatures and root-only package exports remain.

`saveDocument(session, port, locator, expected, context?)`:
1. Require explicit nonempty exact host locator, valid detached/frozen precondition,
   open session, no same-session in-flight or uncertain previous coordinator write.
2. Require atomic precondition enforcement AND atomic full-payload publication
   promises. Unknown baseline or unsupported revision comparison returns
   CONFLICT_UNDETECTABLE; missing publication promise returns
   ATOMIC_PUBLICATION_UNAVAILABLE. Both refuse before write IO.
3. Capture one immutable session ticket, serialize through the existing codec,
   validate the serialized snapshot through diagnoseDocument and canonical owners.
   No strict result => diagnostics without IO. Codec profile rejection =>
   serialization-rejected. Unexpected resolver errors propagate with guard/ticket
   cleanup. A trusted callback closing the session stops dispatch.
4. Send frozen locator/text/session-generation/expected data to host commit.
   Only committed receipt with valid confirmation/nullable observation may call
   the existing exact-ticket completeSave. Original ticket envelope is saved;
   diagnostic owner projections never strip fields.
5. Capture committed receipt as detached portable data (accessors/nonportable
   handles are rejected without invoking them). Conflicted/failed do not advance
   baseline. uncertain, invalid receipt, or thrown/rejected commit means unknown
   outcome, never definite failure/success; quarantine this session from further
   coordinator writes. No unlock/retry/recovery policy implemented here.

Precondition absent means no existing target at atomic publication, not a prior
exists() check. Revision precondition supplies opaque host-observed identity
(nullable) and nonempty token; only compare-and-swap hosts can use it. The host
must bind that token to this locator/read and compare against all writers while
publishing, including any relevant identity/ABA semantics. No fabricated ETag,
mtime-as-CAS, numeric generation conversion or unconditional overwrite fallback.

Host capability promises are trusted integration contracts, not independently
verified by portable Editor. Atomic publication means no partial target visible;
it does not establish power-loss durability. failed promises unchanged destination
and no pending write; otherwise host must report uncertain. Diagnostics still has
writeEligibility NOT_ESTABLISHED: strict validation alone is not write authority;
the explicit save call/host/precondition supplies the remaining admission.

Successful revision2 receipt after edit3 advances savedRevision2 only; current3
stays dirty. Same-session overlapping calls return busy, not queued. Guards are
WeakSets scoped to this module instance, not distributed locks or a document
registry. Separate sessions/locators rely on real host protection. Hosts must not
bypass ordering through trusted low-level session methods. Existing older-ticket
acknowledgement policy still prevents saved baseline rollback.

Closing a session during IO cannot cancel or undo a host commit. If host confirms
commit afterward, result is committed with acknowledgement=session-closed and the
terminal snapshot is untouched (no saved baseline advance/reopen). Retired tickets
with no confirmed acknowledgement use the existing session failed seam only to
drop a one-shot capability; this is not a claim of known storage failure.
Recovery and uncertain-write reconciliation are next-version decisions.

## Real host selection and guarantees

Selected manual host: Windows local filesystem through Node v24.18.0. Each
authorized target is inside one fresh ignored .artifacts fixture directory.
Adapter writes a unique same-directory staged file with exclusive wx, awaits full
UTF-8 payload, sync and close, then publishes using fs.link(staged,target).
EEXIST is conflict, never truncation/replacement. Preparation error before link is
failed; an unclassified link error is uncertain. The fixture adapter keeps staged
hardlinks for inspection and never modifies them after publication. It is ad hoc
manual host evidence, not an exported production adapter or cleanup system.

Host advertises create-only + atomic-publish, using the local filesystem hardlink
creation primitive to expose already-written bytes without replacing an existing
name. Observed EEXIST leaves old bytes unchanged. No file-replacement CAS promise;
a revision precondition against this adapter is refused before commit. Same ID at
different explicit locators stays the same authored ID; no Save As UI/path policy.

No rename is used and no read/hash-then-rename sequence is mislabeled CAS.
sync invocation was observed, not a power-cut experiment or directory metadata
durability proof. No crash, arbitrary filesystem, symlink attacker, remote host,
permission-denied or hardware guarantee is claimed. Host production authorization,
token acquisition, encoding/limits and durability remain explicit integration work.

Reference principles consulted without copied implementation:
- [Node filesystem](https://nodejs.org/docs/latest-v24.x/api/fs.html):
  direct exclusive operations avoid exists/access precheck races; link creates a
  new link; sync is OS/device-specific and does not establish all durability.
- [VS Code custom editors](https://code.visualstudio.com/api/extension-guides/custom-editors):
  document lifecycle and host save responsibilities are explicit.
- [Godot persistence](https://docs.godotengine.org/en/stable/tutorials/io/saving_games.html),
  [Unity serialization](https://docs.unity3d.com/Manual/script-serialization.html),
  [Unreal versioning](https://dev.epicgames.com/documentation/en-us/unreal-engine/versioning-of-assets-and-packages-in-unreal-engine):
  authored representation and version policy remain separate; no copied gameplay
  persistence architecture, schema migration or compatibility inference.

## Manual observations and boundaries

Ad hoc stdin invocation through package-root API; no test files, runner or
automatic behavioral suite. Final fixture:
`.artifacts/document-save-v0.5.8-aWmiKh` (ignored).

| Action | Observed |
| --- | --- |
| real save revision2 -> read/load | committed; saved/current2 and clean; reload same ID/kind/version/content, fresh session revisions1/1 clean |
| capture2, edit3, release delayed host | stored content revision2; saved2/current3, dirty=true |
| second concurrent same-session save | blocked/busy; no second dispatch or file |
| externally-created destination after intended absent baseline | real EEXIST -> conflicted; old bytes retained, baseline unchanged |
| unknown token / revision with create-only / unavailable conflict support | CONFLICT_UNDETECTABLE, no write calls |
| missing atomic-publication promise | ATOMIC_PUBLICATION_UNAVAILABLE, no write calls |
| no context / invalid text payload | canonical diagnostics, no write calls |
| existing Asset metadata extension | real save/reload preserves future.retained=yes |
| missing Asset reference in supplied catalog | TARGET_NOT_FOUND, no file/write |
| missing parent in staging path | real ENOENT before publication -> failed; no saved baseline advance |
| real successful file publication followed by thrown lost ack | uncertain, file decodes on disk; session remains unsaved/dirty; repeat blocked |
| close during pending real save | committed/session-closed; terminal session remains unchanged |
| low-level t3 acknowledgement then t2 | savedRevision remains3; host-attestation seam observation only, not disk IO |
| explicit uncertain/malformed receipt examples | uncertain, no false saved state; contract-only injected outcomes, not real IO failures |

All admission rejection examples together produced **0** host commit calls.
Actual host commit calls **7**; no automated test-count target is implied.
Real conflict target before/after SHA256 both:
`393d91d6c0ab0886b5f1a27d43d2d69a9641d82f21eb148f0c32d1eefbb6e327`.
The new saved targets were absent before publication and contain the exact
serialized content observed after reload. Storage observation identity/revision
is explicitly null; session revisions are not written as storage tokens.
document/OffscreenCanvas are undefined; no GPU/Render initialization.

Unsupported envelope versions remain rejected by the existing load/codec path
without live session; unsupported content-owner versions/unchecked/missing
references cannot satisfy strict save admission. No downgrade or automatic repair.
Only supported metadata extension preservation has finite real save evidence;
this is not arbitrary future-schema overwrite authorization.

### Reproducible manual stdin procedure

Run after build from workspace root via PowerShell here-string piped to
`node --input-type=module`. Stages isolated new fixtures and uses real local IO.
Injected receipt examples are explicitly labeled above. No executable test file
or CI hook is added.

```js
import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import{TextDecoder}from'node:util';import * as E from '@rpg-platform/editor';
await fs.mkdir('.artifacts',{recursive:true});const dir=await fs.mkdtemp(path.resolve('.artifacts/document-save-v0.5.8-'));
const binding={owner:'text',documentKind:'notes',contentSchemaVersion:1},absent={kind:'absent'};
const envelope=E.createDocumentEnvelope({schemaVersion:1,identity:{projectId:'manual-project',documentId:'stable-document'},documentKind:'notes',contentSchemaVersion:1,content:'initial'});
const make=()=>{const s=E.createDocumentSession(envelope,null);s.open();return s;};
const loc=name=>path.join(dir,name),hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
let writes=0;const io=[];
const port={conflictProtection:'create-only',publication:'atomic-publish',async commit(request){
 writes++;const destination=path.resolve(request.locator);
 if(!destination.startsWith(dir+path.sep)||request.expected.kind!=='absent'||Buffer.byteLength(request.text)>4194304)return{status:'failed'};
 const temp=path.join(path.dirname(destination),'.staged-'+crypto.randomUUID());let handle;
 try{handle=await fs.open(temp,'wx');await handle.writeFile(request.text,'utf8');await handle.sync();await handle.close();handle=undefined;}
 catch(error){if(handle)await handle.close();io.push({stage:'prepare',code:error.code});return{status:'failed'};}
 try{await fs.link(temp,destination);}
 catch(error){io.push({stage:'publish',code:error.code});return{status:error.code==='EEXIST'?'conflicted':'uncertain'};}
 // Keep isolated temporary hardlinks for manual evidence; never modify them.
 return{status:'committed',confirmation:'node-local-create-only-link',observation:{identity:null,revision:null}};
}};
const reader={async read(locator){try{const bytes=await fs.readFile(locator);return{status:'read',text:new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes),observation:{identity:null,revision:null}};}
 catch(error){return error.code==='ENOENT'?{status:'not-found'}:{status:'read-failed',reason:'io-error'}}}};
const show=(name,result,s)=>console.log(name,JSON.stringify({result,snapshot:s?.getSnapshot()}));
const saved=make();saved.replaceContent('saved exact revision2');show('save',await E.saveDocument(saved,port,loc('saved.json'),absent,binding),saved);
const loaded=await E.loadDocument(reader,loc('saved.json'),binding);show('reload',loaded.status==='loaded'?{status:loaded.status,snapshot:loaded.session.getSnapshot()}:loaded);
let entered,release;const started=new Promise(r=>entered=r),gate=new Promise(r=>release=r);
const delayed={...port,async commit(request){console.log('immutable request',Object.isFrozen(request),Object.isFrozen(request.expected),request.revision);entered();await gate;return port.commit(request);}};
const late=make();late.replaceContent('revision2');const pending=E.saveDocument(late,delayed,loc('late.json'),absent,binding);await started;late.replaceContent('revision3');
show('concurrent same session',await E.saveDocument(late,port,loc('must-not-write.json'),absent,binding),late);release();show('late ack',await pending,late);console.log('late file content',E.deserializeDocument(await fs.readFile(loc('late.json'),'utf8')).document?.content);
await fs.writeFile(loc('external.json'),'external bytes must survive',{flag:'wx'});const before=hash(await fs.readFile(loc('external.json')));
const external=make();external.replaceContent('must not overwrite');show('external baseline mismatch',await E.saveDocument(external,port,loc('external.json'),absent,binding),external);
console.log('external before/after',before,hash(await fs.readFile(loc('external.json'))));
const writesBefore=writes;
show('unknown baseline',await E.saveDocument(external,port,loc('external.json'),{kind:'unknown'},binding),external);
show('revision unsupported',await E.saveDocument(external,port,loc('external.json'),{kind:'revision',identity:null,revision:'opaque-observed-token'},binding));
show('unavailable host',await E.saveDocument(external,{...port,conflictProtection:'unavailable'},loc('external.json'),absent,binding));
show('unsafe publication',await E.saveDocument(external,{...port,publication:'unavailable'},loc('external.json'),absent,binding));
show('missing context',await E.saveDocument(external,port,loc('no-context.json'),absent));
const invalid=make();invalid.replaceContent({future:'retain'});show('invalid payload',await E.saveDocument(invalid,port,loc('invalid.json'),absent,binding));
console.log('blocked admission port calls',writes-writesBefore);
const failure=make();show('real prepare IO failure',await E.saveDocument(failure,port,loc('missing-parent/failed.json'),absent,binding),failure);
const lost=make();lost.replaceContent('committed but acknowledgement lost');
const lostPort={...port,async commit(request){const receipt=await port.commit(request);if(receipt.status==='committed')throw new Error('lost acknowledgement');return receipt;}};
show('real commit lost ack',await E.saveDocument(lost,lostPort,loc('uncertain.json'),absent,binding),lost);
console.log('uncertain bytes present',E.deserializeDocument(await fs.readFile(loc('uncertain.json'),'utf8')).status);
show('uncertain retry',await E.saveDocument(lost,port,loc('retry-must-not-write.json'),absent,binding));
const asset=E.createAssetDefinition({identity:{projectId:'manual-project',assetId:'data-asset'},kind:'data',metadata:{future:{retained:'yes'}}});
const assetEnv=E.createDocumentEnvelope({...envelope,documentKind:'asset',contentSchemaVersion:1,content:asset});
const assetSession=E.createDocumentSession(assetEnv,null);assetSession.open();const assetBinding={owner:'asset',documentKind:'asset',contentSchemaVersion:1};
show('asset unknown metadata',await E.saveDocument(assetSession,port,loc('asset.json'),absent,assetBinding));
const assetReload=await E.loadDocument(reader,loc('asset.json'),assetBinding);console.log('metadata retained',assetReload.validation?.document?.content.metadata);
const missing={...asset,dependencies:[{projectId:'manual-project',assetId:'missing',expectedKind:null,subresourceId:null}]};
const missingSession=E.createDocumentSession({...assetEnv,content:missing},null);missingSession.open();
show('missing reference',await E.saveDocument(missingSession,port,loc('missing-ref.json'),absent,{...assetBinding,catalog:E.createAssetCatalog({projectId:'manual-project',definitions:[asset]})}));
const receiptSession=make();show('explicit uncertain receipt',await E.saveDocument(receiptSession,{conflictProtection:'create-only',publication:'atomic-publish',async commit(){return{status:'uncertain'}}},loc('no-io.json'),absent,binding),receiptSession);
const malformedSession=make();show('malformed receipt',await E.saveDocument(malformedSession,{conflictProtection:'create-only',publication:'atomic-publish',async commit(){return{status:'committed',confirmation:''}}},loc('malformed-no-io.json'),absent,binding),malformedSession);
let closedRelease,closedEnter;const closedGate=new Promise(r=>closedRelease=r),closedStart=new Promise(r=>closedEnter=r);
const closedSession=make();const closing=E.saveDocument(closedSession,{...port,async commit(request){closedEnter();await closedGate;return port.commit(request);}},loc('closed.json'),absent,binding);await closedStart;closedSession.close('discard');closedRelease();show('close during write',await closing,closedSession);
const low=make();low.replaceContent('low2');const t2=low.prepareSave();low.replaceContent('low3');const t3=low.prepareSave();low.completeSave(t3,{status:'committed',evidence:{kind:'storage-commit',confirmation:'manual-seam-only'}});low.completeSave(t2,{status:'committed',evidence:{kind:'storage-commit',confirmation:'manual-seam-only'}});console.log('older seam ack savedRevision',low.getSnapshot().savedRevision);
console.log('IO',io,'host calls',writes,'Node',process.version,'fixture',path.basename(dir));
console.log('files',await fs.readdir(dir),'gpu globals',typeof globalThis.document,typeof globalThis.OffscreenCanvas);
```

### Observed output

```text
save {"result":{"status":"committed","revision":2,"observation":{"identity":null,"revision":null},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"saved exact revision2"},"revertBaseline":null,"currentRevision":2,"savedRevision":2,"savedEnvelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"saved exact revision2"},"isDirty":false},"acknowledgement":"applied"},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"saved exact revision2"},"revertBaseline":null,"currentRevision":2,"savedRevision":2,"savedEnvelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"saved exact revision2"},"isDirty":false}}
reload {"result":{"status":"loaded","snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"saved exact revision2"},"revertBaseline":null,"currentRevision":1,"savedRevision":1,"savedEnvelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"saved exact revision2"},"isDirty":false}}}
immutable request true true 2
concurrent same session {"result":{"status":"blocked","reason":"busy"},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"revision3"},"revertBaseline":null,"currentRevision":3,"savedRevision":null,"savedEnvelope":null,"isDirty":true}}
late ack {"result":{"status":"committed","revision":2,"observation":{"identity":null,"revision":null},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"revision3"},"revertBaseline":null,"currentRevision":3,"savedRevision":2,"savedEnvelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"revision2"},"isDirty":true},"acknowledgement":"applied"},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"revision3"},"revertBaseline":null,"currentRevision":3,"savedRevision":2,"savedEnvelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"revision2"},"isDirty":true}}
late file content revision2
external baseline mismatch {"result":{"status":"conflicted","revision":2},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"must not overwrite"},"revertBaseline":null,"currentRevision":2,"savedRevision":null,"savedEnvelope":null,"isDirty":true}}
external before/after 393d91d6c0ab0886b5f1a27d43d2d69a9641d82f21eb148f0c32d1eefbb6e327 393d91d6c0ab0886b5f1a27d43d2d69a9641d82f21eb148f0c32d1eefbb6e327
unknown baseline {"result":{"status":"blocked","reason":"CONFLICT_UNDETECTABLE"},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"must not overwrite"},"revertBaseline":null,"currentRevision":2,"savedRevision":null,"savedEnvelope":null,"isDirty":true}}
revision unsupported {"result":{"status":"blocked","reason":"CONFLICT_UNDETECTABLE"}}
unavailable host {"result":{"status":"blocked","reason":"CONFLICT_UNDETECTABLE"}}
unsafe publication {"result":{"status":"blocked","reason":"ATOMIC_PUBLICATION_UNAVAILABLE"}}
missing context {"result":{"status":"validation-diagnostics","validation":{"status":"not-checked","document":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"must not overwrite"},"diagnostics":[{"group":"context","code":"CONTENT_NOT_CHECKED","severity":"warning","path":"document.content","reference":{},"details":{}}],"checks":{"content":"NOT_CHECKED","assetReferences":"NOT_CHECKED","spatialReferences":"NOT_CHECKED","fileExistence":"NOT_CHECKED"},"readEligibility":{"inspect":true,"strict":false},"writeEligibility":"NOT_ESTABLISHED"}}}
invalid payload {"result":{"status":"validation-diagnostics","validation":{"status":"invalid","document":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":{"future":"retain"}},"diagnostics":[{"group":"payload","code":"INVALID_TEXT_CONTENT","severity":"error","path":"document.content","reference":{},"details":{}}],"checks":{"content":"CHECKED","assetReferences":"NOT_APPLICABLE","spatialReferences":"NOT_APPLICABLE","fileExistence":"NOT_CHECKED"},"readEligibility":{"inspect":true,"strict":false},"writeEligibility":"NOT_ESTABLISHED"}}}
blocked admission port calls 0
real prepare IO failure {"result":{"status":"failed","revision":1},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"initial"},"revertBaseline":null,"currentRevision":1,"savedRevision":null,"savedEnvelope":null,"isDirty":true}}
real commit lost ack {"result":{"status":"uncertain","revision":2},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"committed but acknowledgement lost"},"revertBaseline":null,"currentRevision":2,"savedRevision":null,"savedEnvelope":null,"isDirty":true}}
uncertain bytes present decoded
uncertain retry {"result":{"status":"blocked","reason":"previous-write-uncertain"}}
asset unknown metadata {"result":{"status":"committed","revision":1,"observation":{"identity":null,"revision":null},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"asset","contentSchemaVersion":1,"content":{"schemaVersion":1,"identity":{"projectId":"manual-project","assetId":"data-asset","sourceId":null},"kind":"data","metadata":{"future":{"retained":"yes"}},"sources":[],"dependencies":[]}},"revertBaseline":null,"currentRevision":1,"savedRevision":1,"savedEnvelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"asset","contentSchemaVersion":1,"content":{"schemaVersion":1,"identity":{"projectId":"manual-project","assetId":"data-asset","sourceId":null},"kind":"data","metadata":{"future":{"retained":"yes"}},"sources":[],"dependencies":[]}},"isDirty":false},"acknowledgement":"applied"}}
metadata retained { future: { retained: 'yes' } }
missing reference {"result":{"status":"validation-diagnostics","validation":{"status":"unresolved","document":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"asset","contentSchemaVersion":1,"content":{"schemaVersion":1,"identity":{"projectId":"manual-project","assetId":"data-asset","sourceId":null},"kind":"data","metadata":{"future":{"retained":"yes"}},"sources":[],"dependencies":[{"projectId":"manual-project","assetId":"missing","expectedKind":null,"subresourceId":null}]}},"diagnostics":[{"group":"reference","code":"TARGET_NOT_FOUND","severity":"error","path":"document.content.dependencies[0].assetId","reference":{"projectId":"manual-project","assetId":"missing"},"details":{"lookupScope":"SUPPLIED_PROJECT_CATALOG"}}],"checks":{"content":"CHECKED","assetReferences":"CHECKED","spatialReferences":"NOT_APPLICABLE","fileExistence":"NOT_CHECKED"},"readEligibility":{"inspect":true,"strict":false},"writeEligibility":"NOT_ESTABLISHED"}}}
explicit uncertain receipt {"result":{"status":"uncertain","revision":1},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"initial"},"revertBaseline":null,"currentRevision":1,"savedRevision":null,"savedEnvelope":null,"isDirty":true}}
malformed receipt {"result":{"status":"uncertain","revision":1},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"initial"},"revertBaseline":null,"currentRevision":1,"savedRevision":null,"savedEnvelope":null,"isDirty":true}}
close during write {"result":{"status":"committed","revision":1,"observation":{"identity":null,"revision":null},"snapshot":{"state":"closed","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"initial"},"revertBaseline":null,"currentRevision":1,"savedRevision":null,"savedEnvelope":null,"isDirty":true},"acknowledgement":"session-closed"},"snapshot":{"state":"closed","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"initial"},"revertBaseline":null,"currentRevision":1,"savedRevision":null,"savedEnvelope":null,"isDirty":true}}
older seam ack savedRevision 3
IO [
  { stage: 'publish', code: 'EEXIST' },
  { stage: 'prepare', code: 'ENOENT' }
] host calls 7 Node v24.18.0 fixture document-save-v0.5.8-aWmiKh
files [
  '.staged-1a3acb74-10e3-426d-a816-43e7d010db48',
  '.staged-54d3cd61-86f5-411d-aaf3-c3799a34087e',
  '.staged-56d119b0-2d47-4521-8301-fb1fa2d38335',
  '.staged-8c185da5-7ed6-440c-8e58-ccc05e9dcb22',
  '.staged-ae17d2d5-7f23-4ecd-8625-60b6cd7b946c',
  '.staged-dcf1141c-e163-4162-89bc-63303e45ac22',
  'asset.json',
  'closed.json',
  'external.json',
  'late.json',
  'saved.json',
  'uncertain.json'
] gpu globals undefined undefined
```

## Build/static/public-contract gates

- `node harness/cli.mjs check`: ARCH_CHECK_PASS, **65** JS/TS source files.
  Static scan only; not proof of dynamic IO, conflict guarantees or product behavior.
- `node harness/cli.mjs scope --projects editor --allow-infra`: SCOPE_PASS,
  six modified/untracked paths within declared Editor + infrastructure.
- `node harness/cli.mjs verify --projects editor --with-consumers`: BUILD_PASS.
  No current Editor consumers to add. Dependency project builds compile genuinely.
- `npm run build -- --force`: PASS for runtime-engine, runtime-render, editor,
  game-client and game-server. No dummy build/unconfigured project.
- Emitted .d.ts inspected; strict ES2022/NodeNext public-root TypeScript consumer,
  types:[], no DOM, skipLibCheck:false, all six new types/functions plus existing
  Scene/Asset/Spatial/Document/load contracts: **0 diagnostics**.
- Root source/emitted names agree Editor125/Render52. No previous exports removed.
- L1 Core2.0.0 / 04b7239f998c3c688a0dfa3202f11811a9acd775 and L2 Gameplay0.15.2 /
  acea332aa80f67552192a72b30f81c0bbbfc56bd unchanged. Artifact SHA512 match both pins.
- No test/testcase/framework/runner/coverage/UI/browser/E2E changes or executions.
- Existing Harness Node DEP0190 warning remains; commands exit successfully.
- Exact final checkpoint SHA, local/origin/PR agreement and push/PR CI are recorded
  in PR ledger/handoff after commit. No merging, tagging, release or publishing.

## Open decisions / not verified

Real existing-file replacement CAS is **NOT_VERIFIED / unavailable in selected
host**; unsupported overwrites are blocked. Portable port supports a future host
with real atomic compare-and-publish; declaration compilation is not IO evidence.
No crash/power-loss preservation, distributed correctness, remote/browser adapter,
permission/ACL, hardware durability, visual/gameplay or recovery verification.
Unknown/malformed outcomes stay uncertain; v0.5.9 recovery is not implemented.

**READY_FOR_DEVELOPER_REVIEW**; stop before v0.5.9.
