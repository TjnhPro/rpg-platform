# v0.5.9 — Persistence Failure & Recovery Contracts (DC15)

**READY_FOR_DEVELOPER_REVIEW** — one checkpoint; stop before v0.5.10.
Build/CI do not establish Developer acceptance or universal safe persistence.

## Exact baseline and authorized scope

- Repository: https://github.com/TjnhPro/rpg-platform
- Branch: `feat/editor-document-contracts-v0.5`; existing draft [PR #5](https://github.com/TjnhPro/rpg-platform/pull/5), base `main`.
- Pre-change HEAD / previous v0.5.8 checkpoint: `e230e9510dd2b05badae5c880608e05d843bc6bf`.
- Accepted Phase 4 base: `e46ec24dc662b1bc1588d5ec1c05d4f62739ac3c`.
- Earlier closure refs audited: P1 `4cec85b5a00e2477f00eee29e2da6025a532e973`,
  P2 `fea9b734b849fa1c6bc953530e1fa425d43cfca8`,
  P3 `5ce0feb4c1967c0dee14919b9c11d56991a46bd0`.
- Developer's standing instruction to implement supplied tasks without intermediate
  review approval, recorded in Editor AGENTS.md, and delivery of this task authorize
  execution. This is not an inferred approval from CI or a claim that every prior
  checkpoint has a separate recorded ACCEPTED verdict.
- Canonical primary owner: **Editor** persistence diagnostics and orchestration.
  Host owns IO, publication/conditional-write guarantees, handles and artifact safety.
  No collaborating production project needs modification. No external L1/L2 API delta.
- Preflight scope: existing load/save + one same-owner diagnostic module + root
  exports; Editor guidance and directly relevant Harness contracts/ownership/report.
  Consumer search finds no current workspace imports of Editor.
  Existing status consumers retain discriminants; constructed result fixtures would
  need the newly required failure/cleanup fields. Host cleanup and failed reason are
  optional; old write ports remain supported.
- Intended/actual changed paths (eight): `editor/src/{document-load,document-save,document-persistence,index}.ts`,
  `editor/AGENTS.md`, `harness/{CONTRACTS,OWNERSHIP}.md`,
  `harness/checkpoints/document-v0.5.9.md`.
- Commands: Harness check, scope --projects editor --allow-infra, verify --projects
  editor --with-consumers; genuine forced workspace build and emitted/public-root
  no-DOM compile. No tests, runners, automated suite or browser checks.

Final SHA cannot be embedded in its own commit. Exact checkpoint SHA, origin/PR
agreement and push/PR CI run evidence are added to the existing PR ledger after push.

## Current-source audit and capability ledger

Read root/project guidance, architecture/Foundation/readme, Harness ownership,
contracts/workflow/verification, manifests, current load/save/session/codec/diagnostic
surfaces, root source exports and emitted declarations. Historical notes saying a
prior version has no save/recovery remain revision-specific, not current authority.

| Capability | Before this checkpoint | This checkpoint |
| --- | --- | --- |
| Strict read/load, rejection captures | IMPLEMENTED v0.5.7, host IO port | Retained; typed persistence failures added |
| Exact-ticket conditional save + uncertain-session guard | IMPLEMENTED v0.5.8 | Retained; richer outcomes and cleanup invocation |
| Product filesystem/browser adapter | UNAVAILABLE | Still unavailable; local manual host below only |
| Host artifact/handle management | Host responsibility; prior manual host retained stages | Optional cleanup contract implemented; manual host closes handles and retains payloads |
| Filesystem create-only publication | Demonstrated isolated Node hardlink host | Same bounded host mechanism demonstrated |
| Existing-target CAS/atomic replace | DOCUMENTED_ONLY portable capability, unavailable in selected host | Still unavailable; unsupported revision write blocked |
| Rollback, recovery/reconciliation/unlock | UNAVAILABLE | Explicit RECOVERY_NOT_AVAILABLE / COMMIT_UNCERTAIN |
| Crash/power-loss durability, permission revocation | NOT_VERIFIED | NOT_VERIFIED |

Phase 1 Render frame failure codes safely separate root failure and cleanupFailed,
quarantine failed ownership and do not expose raw backend errors. Phase 2 Asset
diagnostics use typed stable codes from canonical owner validation and let unknown
host exceptions propagate. This change follows those principles; it does not copy
Render branding or reinterpret unknown read exceptions as authored corruption.

Exception/partial-work audit:

| Point | Actual handling / artifact ownership |
| --- | --- |
| Before dispatch: invalid locator/precondition, ticket/session misuse | Existing programmer exceptions; no write dispatch |
| Serialization rejection or non-strict validation | Blocked/diagnostics; ticket retired, authored data untouched, no cleanup IO |
| Unexpected trusted resolver/read exception or malformed read contract | Still throws; no empty-document fallback |
| Stage open/write/sync/close | Host must await outstanding work and release handles; partial stages remain host-owned |
| Commit throws before, during or after publish | Coordinator cannot distinguish; uncertain, no baseline advance, quarantine |
| Host claims failed/conflicted | Host guarantees unchanged target/no pending write; typed reason never inferred from message |
| Missing/malformed/nonportable receipt or unknown failed reason | Uncertain; does not invent a commit receipt |
| Post-commit cleanup throws/malformed/failed | Secondary CLEANUP_FAILED; primary failure/conflict/commit remains intact |
| Edit/close while cleanup pending | Busy guard held; exact ticket acknowledges older revision or reports session-closed |

Existing v0.5.8 manual host had a catch that could throw on handle.close and mask
the preparation error. The portable coordinator already conservatively classified
that as uncertain; it could not safely diagnose a known failed write. The manual
host below records stage/close separately, never masks primary errors with cleanup,
and does not claim a close failure means IO is safely finished.

## Public contract delta

Editor root **125 -> 128** symbols; Render **52 -> 52**. No symbols removed.
New root types only:

- `DocumentPersistenceFailure`: frozen safe code, recovery fixed to
  RECOVERY_NOT_AVAILABLE, advisory nextAction (no dispatch or overwrite permission).
- `DocumentCleanupReceipt`: cleaned / retained / failed from trusted host.
- `DocumentCleanupResult`: not-configured / cleaned / retained / failed + diagnostic.

Existing `DocumentCommitReceipt` failed branch optionally refines reason to
permission-denied / io-error / interrupted-write. Existing `DocumentWritePort`
optionally supplies `cleanup(request, normalizedPrimaryStatus)`.
It receives the same frozen request at most once, after commit settles; it must
settle promptly, release handles before commit settles, and use host-owned
per-request artifacts. No timeout, cancellation, registry or retry loop added.

| Failure source | Code / follow-up advice |
| --- | --- |
| Missing target on read | NOT_FOUND / inspect-storage |
| Expected denied IO | IO_DENIED / inspect-storage on read, explicit-retry advice on known failed write |
| Other expected read failure | READ_FAILED / inspect-storage |
| Rejected JSON/envelope/profile | PARSE_FAILED / correct-input; canonical detailed decode diagnostic retained |
| Unsupported document schema | UNSUPPORTED_SCHEMA / correct-input; no downgrade/migration |
| Non-strict owner/reference validation, rejected serialization | VALIDATION_REJECTED / correct-input |
| Conditional publish conflict | EXTERNAL_CONFLICT / review-precondition |
| Known failed write, absent/io-error reason | WRITE_FAILED / explicit-retry |
| Known interrupted write with unchanged target/no pending IO | WRITE_INTERRUPTED / explicit-retry |
| Unknown/thrown/malformed commit, prior uncertain guard | COMMIT_UNCERTAIN / inspect-storage |
| Cleanup failed/thrown/malformed | CLEANUP_FAILED / inspect-storage, separate from root result |

Advice does not trigger actions. Explicit retry means a new intentional caller
request only after addressing the host condition, checking retained artifacts and
revalidating the precondition. Conflict/unknown/unsupported never automatically
retry. Recovery is unavailable even when a failed write could later be retried.
Do not bypass quarantine via low-level acknowledgement or silently reopen a new
session to pretend uncertainty was resolved. Developer/host must inspect actual
target and retained artifacts; this version supplies no reconciliation proof API.

Known committed bytes remain a committed result even if cleanup fails; that exact
ticket can become the saved baseline. Reporting the whole operation as a clean
success while ignoring cleanup is incorrect. Failed/conflicted/uncertain writes
never clear an unsaved revision. A previously clean unchanged document need not
be artificially marked dirty on failure: saved evidence is simply not advanced.

No payload/identity/schema changes; no migration, rollback, backup manager,
renderer/gameplay/protocol, new package or L1/L2 implementation.

## Real manual evidence and limits

Executed ad hoc Node stdin using **Node v24.18.0 on Windows**, no test files.
Fresh ignored fixture: `.artifacts/document-failure-v0.5.9-weTUZ5`.
Actual host: local fs/promises, unique wx stage, full UTF-8 write + sync + close,
then create-only link(temp,target). Expected storage precondition: **absent**;
observations explicitly identity:null/revision:null, no fake mtime/session token.
Selected host refuses revision CAS. Guarded isolated directory is a manual fixture,
not hardened authorization against adversarial symlinks/other writers.
No production adapter, distributed guarantee or power-loss proof is delivered.

Cleanup retains **all staged payloads**, including potential sole valid copies.
It only rmdir's its own disposable empty probe (no recursive deletion). A deliberate
file in that probe causes a real ENOTEMPTY rejection; it does not inject the cleanup
result directly. Handle close precedes link; close failure would be uncertain.
No staged data, backup or destination is deleted. Host close errors/crash cleanup
are audited paths, not independently forced real observations.

| Input/action | Observed |
| --- | --- |
| Write corrupt JSON, load it with existing separate open session | PARSE_FAILED; exact corrupt bytes and existing session snapshot unchanged |
| Save to nonexistent destination parent, probe deliberately nonempty | Real link ENOENT -> WRITE_FAILED plus real rmdir ENOTEMPTY -> CLEANUP_FAILED; target absent; session revision2 unsaved/dirty, content intact |
| Real publish then deliberate lost-ack exception | File decodes authored revision2; COMMIT_UNCERTAIN, savedRevision null, dirty; cleanup retained stages |
| Explicit save again on that uncertain session | previous-write-uncertain; 0 additional host commits; no auto overwrite |
| Known commit with nonempty cleanup probe | Committed exact revision2, saved2; separate CLEANUP_FAILED remains visible |
| Known commit, empty disposable probe | Committed exact revision2; cleanup retained payload, probe removed |
| Existing external target | Real EEXIST -> EXTERNAL_CONFLICT; before/after SHA256 equal; dirty |
| Invalid text content, unsupported revision write | Validation/admission rejection, 0 host dispatches |
| Injected denied/interrupted receipt, no IO | IO_DENIED / WRITE_INTERRUPTED mapping only; dirty and cleanup not-configured |
| Malformed commit and cleanup receipt, no IO | COMMIT_UNCERTAIN + CLEANUP_FAILED, no saved evidence |
| Hold cleanup, edit2->3 and request another save | busy; late commit saves2, current3 still dirty |

**NOT_VERIFIED:** actual permission revoked between validation/write; real interrupted
partial write/process death; close failure; atomic existing-file replacement CAS;
crash/power-loss recovery, remote/browser hosts, GUI/visual/gameplay behavior.
Injected permission/interruption mappings are contract evidence only.
No universal SAFE_SAVE_PASS, RECOVERY_PASS or acceptance claim.

Reproduce from repo root after build, using this manual host with the public root.
The code intentionally preserves fixtures; no testcase/assertions/runner is added.

```js
import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import {TextDecoder} from 'node:util';import * as E from '@rpg-platform/editor';
const dir=await fs.mkdtemp(path.resolve('.artifacts/document-failure-v0.5.9-'));
const context={owner:'text',documentKind:'notes',contentSchemaVersion:1},expected={kind:'absent'};
const env=E.createDocumentEnvelope({schemaVersion:1,identity:{projectId:'manual-project',documentId:'stable-document'},documentKind:'notes',contentSchemaVersion:1,content:'original'});
const make=()=>{const s=E.createDocumentSession(env,null);s.open();s.replaceContent('authored revision2');return s;};
const loc=n=>path.join(dir,n),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const artifacts=new WeakMap(),events=[];let commits=0,cleanups=0;
function host({loseAck=false,cleanupObstacle=false}={}){return {
 conflictProtection:'create-only',publication:'atomic-publish',
 async commit(request){
  commits++;const target=path.resolve(request.locator);
  if(!target.startsWith(dir+path.sep)||request.expected.kind!=='absent'||Buffer.byteLength(request.text)>4194304)return{status:'failed'};
  const temp=loc('.staged-'+crypto.randomUUID()),probe=loc('.cleanup-'+crypto.randomUUID());
  const record={temp,probe};artifacts.set(request,record);
  let handle,prepared=false,closeFailed=false;
  try{handle=await fs.open(temp,'wx');await handle.writeFile(request.text,'utf8');await handle.sync();prepared=true;}
  catch(e){events.push({phase:'prepare',code:e.code});}
  finally{if(handle){try{await handle.close();}catch(e){closeFailed=true;events.push({phase:'close',code:e.code});}}}
  // No pending async writes; failed close is conservatively uncertain, no invented recovery.
  if(closeFailed) return{status:'uncertain'};
  if(!prepared)return{status:'failed',reason:'interrupted-write'};
  await fs.mkdir(probe);
  if(cleanupObstacle)await fs.writeFile(path.join(probe,'retain.txt'),'disposable cleanup obstacle');
  try{await fs.link(temp,target);}
  catch(e){events.push({phase:'publish',code:e.code});
   if(e.code==='EEXIST')return{status:'conflicted'};
   if(e.code==='ENOENT')return{status:'failed',reason:'io-error'};
   if(e.code==='EACCES'||e.code==='EPERM')return{status:'failed',reason:'permission-denied'};
   return{status:'uncertain'};
  }
  if(loseAck)throw Error('deliberate acknowledgement loss after successful link');
  return{status:'committed',confirmation:'isolated-node-local-create-only-link',observation:{identity:null,revision:null}};
 },
 async cleanup(request,outcome){
  cleanups++;const a=artifacts.get(request);
  events.push({phase:'cleanup',outcome,frozen:Object.isFrozen(request)&&Object.isFrozen(request.expected)});
  if(!a)return{status:'cleaned'};
  // Never delete staged payload, target, backup or any directory recursively.
  // rmdir removes only this request's empty disposable probe, never its contents.
  try{await fs.rmdir(a.probe);}catch(e){events.push({phase:'cleanup-io',code:e.code});throw e;}
  return{status:'retained'};
 }
};}
const reader={async read(locator){try{return{status:'read',text:new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(await fs.readFile(locator)),observation:{identity:null,revision:null}};}
 catch(e){if(e.code==='ENOENT')return{status:'not-found'};return{status:'read-failed',reason:e.code==='EACCES'?'permission-denied':'io-error'};}}};
const show=(name,r,s)=>console.log(name,JSON.stringify({result:r,snapshot:s?.getSnapshot()}));
const existing=make(),before=JSON.stringify(existing.getSnapshot());
await fs.writeFile(loc('corrupt.json'),'{"schemaVersion":1, BROKEN',{flag:'wx'});const corruptBefore=hash(await fs.readFile(loc('corrupt.json')));
show('real corrupt file',await E.loadDocument(reader,loc('corrupt.json'),context));
console.log('corrupt bytes unchanged',corruptBefore===hash(await fs.readFile(loc('corrupt.json'))),'separate session unchanged',before===JSON.stringify(existing.getSnapshot()));
const failed=make();show('real missing-parent rejection plus cleanup failure',await E.saveDocument(failed,host({cleanupObstacle:true}),loc('missing-parent/reject.json'),expected,context),failed);
console.log('rejected target absent',await fs.stat(loc('missing-parent/reject.json')).then(()=>false,e=>e.code==='ENOENT'));
const lost=make();show('real commit then lost acknowledgement',await E.saveDocument(lost,host({loseAck:true}),loc('lost.json'),expected,context),lost);
const count=commits;show('uncertain retry blocked',await E.saveDocument(lost,host(),loc('no-retry.json'),expected,context),lost);
console.log('uncertain retry dispatches',commits-count,'committed bytes',E.deserializeDocument(await fs.readFile(loc('lost.json'),'utf8')).document.content);
const success=make();show('known commit plus cleanup failure',await E.saveDocument(success,host({cleanupObstacle:true}),loc('known.json'),expected,context),success);
const clean=make();show('known commit cleanup retained',await E.saveDocument(clean,host(),loc('clean.json'),expected,context),clean);
const external=loc('external.json');await fs.writeFile(external,'external bytes',{flag:'wx'});const externalBefore=hash(await fs.readFile(external));
const conflict=make();show('external conflict',await E.saveDocument(conflict,host(),external,expected,context),conflict);console.log('external hash preserved',externalBefore===hash(await fs.readFile(external)));
const invalid=make();invalid.replaceContent({wrong:'text owner'});const admissionBefore=commits;show('validation reject no IO',await E.saveDocument(invalid,host(),loc('invalid.json'),expected,context),invalid);
show('unsupported CAS no IO',await E.saveDocument(invalid,host(),loc('unsupported.json'),{kind:'revision',identity:null,revision:'host-token'},context));console.log('admission dispatches',commits-admissionBefore);
// Contract-only outcomes below have NO real permission/interruption claim.
for(const reason of ['permission-denied','interrupted-write']){
 const s=make();show('injected '+reason,await E.saveDocument(s,{conflictProtection:'create-only',publication:'atomic-publish',async commit(){return{status:'failed',reason};}},loc('no-io-'+reason),expected,context),s);
}
for(const receipt of [{status:'committed',confirmation:''},{status:'failed',reason:'untrusted-code'}]){
 const s=make();show('malformed receipt contract only',await E.saveDocument(s,{conflictProtection:'create-only',publication:'atomic-publish',async commit(){return receipt;},async cleanup(){return{status:'unexpected'};}},loc('malformed-no-io'),expected,context),s);
}
let enter,release;const started=new Promise(r=>enter=r),gate=new Promise(r=>release=r);const base=host(),late=make();
const pending=E.saveDocument(late,{...base,async cleanup(request,outcome){enter();await gate;return base.cleanup(request,outcome);}},loc('late.json'),expected,context);await started;late.replaceContent('newer revision3');
show('busy during cleanup',await E.saveDocument(late,host(),loc('busy.json'),expected,context));release();show('late ack after cleanup',await pending,late);
console.log('real host events',JSON.stringify(events));
console.log('fixture',path.basename(dir),'node',process.version,'commits',commits,'cleanup calls',cleanups,'files',JSON.stringify(await fs.readdir(dir)));
console.log('GPU globals',typeof globalThis.document,typeof globalThis.OffscreenCanvas);
```

Observed transcript (safe fixture data only):

```text
real corrupt file {"result":{"locator":"D:\\python_code\\game_dev\\jx1_web\\rpg-2d\\.artifacts\\document-failure-v0.5.9-weTUZ5\\corrupt.json","text":"{\"schemaVersion\":1, BROKEN","observation":{"identity":null,"revision":null},"validation":{"status":"invalid","document":null,"diagnostics":[{"group":"envelope","code":"INVALID_JSON","severity":"error","path":"document","reference":{},"details":{}}],"checks":{"content":"NOT_CHECKED","assetReferences":"NOT_CHECKED","spatialReferences":"NOT_CHECKED","fileExistence":"NOT_CHECKED"},"readEligibility":{"inspect":false,"strict":false},"writeEligibility":"NOT_ESTABLISHED"},"status":"parse-failed","failure":{"code":"PARSE_FAILED","recovery":"RECOVERY_NOT_AVAILABLE","nextAction":"correct-input"}}}
corrupt bytes unchanged true separate session unchanged true
real missing-parent rejection plus cleanup failure {"result":{"status":"failed","revision":2,"failure":{"code":"WRITE_FAILED","recovery":"RECOVERY_NOT_AVAILABLE","nextAction":"explicit-retry"},"cleanup":{"status":"failed","failure":{"code":"CLEANUP_FAILED","recovery":"RECOVERY_NOT_AVAILABLE","nextAction":"inspect-storage"}}},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"authored revision2"},"revertBaseline":null,"currentRevision":2,"savedRevision":null,"savedEnvelope":null,"isDirty":true}}
rejected target absent true
real commit then lost acknowledgement {"result":{"status":"uncertain","revision":2,"failure":{"code":"COMMIT_UNCERTAIN","recovery":"RECOVERY_NOT_AVAILABLE","nextAction":"inspect-storage"},"cleanup":{"status":"retained"}},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"authored revision2"},"revertBaseline":null,"currentRevision":2,"savedRevision":null,"savedEnvelope":null,"isDirty":true}}
uncertain retry blocked {"result":{"status":"blocked","reason":"previous-write-uncertain","failure":{"code":"COMMIT_UNCERTAIN","recovery":"RECOVERY_NOT_AVAILABLE","nextAction":"inspect-storage"}},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"authored revision2"},"revertBaseline":null,"currentRevision":2,"savedRevision":null,"savedEnvelope":null,"isDirty":true}}
uncertain retry dispatches 0 committed bytes authored revision2
known commit plus cleanup failure {"result":{"status":"committed","revision":2,"observation":{"identity":null,"revision":null},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"authored revision2"},"revertBaseline":null,"currentRevision":2,"savedRevision":2,"savedEnvelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"authored revision2"},"isDirty":false},"acknowledgement":"applied","cleanup":{"status":"failed","failure":{"code":"CLEANUP_FAILED","recovery":"RECOVERY_NOT_AVAILABLE","nextAction":"inspect-storage"}}},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"authored revision2"},"revertBaseline":null,"currentRevision":2,"savedRevision":2,"savedEnvelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"authored revision2"},"isDirty":false}}
known commit cleanup retained {"result":{"status":"committed","revision":2,"observation":{"identity":null,"revision":null},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"authored revision2"},"revertBaseline":null,"currentRevision":2,"savedRevision":2,"savedEnvelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"authored revision2"},"isDirty":false},"acknowledgement":"applied","cleanup":{"status":"retained"}},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"authored revision2"},"revertBaseline":null,"currentRevision":2,"savedRevision":2,"savedEnvelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"authored revision2"},"isDirty":false}}
external conflict {"result":{"status":"conflicted","revision":2,"failure":{"code":"EXTERNAL_CONFLICT","recovery":"RECOVERY_NOT_AVAILABLE","nextAction":"review-precondition"},"cleanup":{"status":"retained"}},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"authored revision2"},"revertBaseline":null,"currentRevision":2,"savedRevision":null,"savedEnvelope":null,"isDirty":true}}
external hash preserved true
validation reject no IO {"result":{"status":"validation-diagnostics","validation":{"status":"invalid","document":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":{"wrong":"text owner"}},"diagnostics":[{"group":"payload","code":"INVALID_TEXT_CONTENT","severity":"error","path":"document.content","reference":{},"details":{}}],"checks":{"content":"CHECKED","assetReferences":"NOT_APPLICABLE","spatialReferences":"NOT_APPLICABLE","fileExistence":"NOT_CHECKED"},"readEligibility":{"inspect":true,"strict":false},"writeEligibility":"NOT_ESTABLISHED"},"failure":{"code":"VALIDATION_REJECTED","recovery":"RECOVERY_NOT_AVAILABLE","nextAction":"correct-input"}},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":{"wrong":"text owner"}},"revertBaseline":null,"currentRevision":3,"savedRevision":null,"savedEnvelope":null,"isDirty":true}}
unsupported CAS no IO {"result":{"status":"blocked","reason":"CONFLICT_UNDETECTABLE"}}
admission dispatches 0
injected permission-denied {"result":{"status":"failed","revision":2,"failure":{"code":"IO_DENIED","recovery":"RECOVERY_NOT_AVAILABLE","nextAction":"explicit-retry"},"cleanup":{"status":"not-configured"}},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"authored revision2"},"revertBaseline":null,"currentRevision":2,"savedRevision":null,"savedEnvelope":null,"isDirty":true}}
injected interrupted-write {"result":{"status":"failed","revision":2,"failure":{"code":"WRITE_INTERRUPTED","recovery":"RECOVERY_NOT_AVAILABLE","nextAction":"explicit-retry"},"cleanup":{"status":"not-configured"}},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"authored revision2"},"revertBaseline":null,"currentRevision":2,"savedRevision":null,"savedEnvelope":null,"isDirty":true}}
malformed receipt contract only {"result":{"status":"uncertain","revision":2,"failure":{"code":"COMMIT_UNCERTAIN","recovery":"RECOVERY_NOT_AVAILABLE","nextAction":"inspect-storage"},"cleanup":{"status":"failed","failure":{"code":"CLEANUP_FAILED","recovery":"RECOVERY_NOT_AVAILABLE","nextAction":"inspect-storage"}}},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"authored revision2"},"revertBaseline":null,"currentRevision":2,"savedRevision":null,"savedEnvelope":null,"isDirty":true}}
malformed receipt contract only {"result":{"status":"uncertain","revision":2,"failure":{"code":"COMMIT_UNCERTAIN","recovery":"RECOVERY_NOT_AVAILABLE","nextAction":"inspect-storage"},"cleanup":{"status":"failed","failure":{"code":"CLEANUP_FAILED","recovery":"RECOVERY_NOT_AVAILABLE","nextAction":"inspect-storage"}}},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"authored revision2"},"revertBaseline":null,"currentRevision":2,"savedRevision":null,"savedEnvelope":null,"isDirty":true}}
busy during cleanup {"result":{"status":"blocked","reason":"busy"}}
late ack after cleanup {"result":{"status":"committed","revision":2,"observation":{"identity":null,"revision":null},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"newer revision3"},"revertBaseline":null,"currentRevision":3,"savedRevision":2,"savedEnvelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"authored revision2"},"isDirty":true},"acknowledgement":"applied","cleanup":{"status":"retained"}},"snapshot":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"newer revision3"},"revertBaseline":null,"currentRevision":3,"savedRevision":2,"savedEnvelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"authored revision2"},"isDirty":true}}
real host events [{"phase":"publish","code":"ENOENT"},{"phase":"cleanup","outcome":"failed","frozen":true},{"phase":"cleanup-io","code":"ENOTEMPTY"},{"phase":"cleanup","outcome":"uncertain","frozen":true},{"phase":"cleanup","outcome":"committed","frozen":true},{"phase":"cleanup-io","code":"ENOTEMPTY"},{"phase":"cleanup","outcome":"committed","frozen":true},{"phase":"publish","code":"EEXIST"},{"phase":"cleanup","outcome":"conflicted","frozen":true},{"phase":"cleanup","outcome":"committed","frozen":true}]
fixture document-failure-v0.5.9-weTUZ5 node v24.18.0 commits 6 cleanup calls 6 files [".cleanup-2c33ddea-c918-45e0-9e5b-9ab68b2aacc7",".cleanup-543d997c-aa14-4858-b1c6-9b69581f056e",".staged-0896a9ff-2243-46f9-90da-b9f5c26e8a61",".staged-3d0f1539-8a2f-4735-9ad5-924885501b65",".staged-4eaab91d-6bbc-454c-8e35-665170c22753",".staged-5f9cc7c7-40b2-4187-84f7-965c35c97e96",".staged-8a9f45b2-7351-4d79-a427-d60914f3d7b4",".staged-d0534b99-439e-4069-bc1b-f56e35bd700c","clean.json","corrupt.json","external.json","known.json","late.json","lost.json"]
GPU globals undefined undefined
```

## Verification

- `node harness/cli.mjs check`: ARCH_CHECK_PASS, **66** JS/TS files.
  Static scan can miss dynamic imports/reflection; not IO or behavior proof.
- `node harness/cli.mjs scope --projects editor --allow-infra`: SCOPE_PASS,
  eight modified/untracked paths (Editor + directly related Harness docs).
- `node harness/cli.mjs verify --projects editor --with-consumers`: BUILD_PASS.
  Actual consumer graph selects Editor only; its TS references compile dependencies.
- `npm run build -- --force`: PASS, genuine forced TypeScript builds for all five:
  runtime-engine, runtime-render, editor, game-client, game-server.
- Source/emitted root names identical: Editor128, Render52. Current emitted
  load/save/persistence declarations inspected; no public private class/handle types.
  Package exports remain root-only. Helper persistenceFailure is internal to owner,
  not a package root export.
- Strict ES2022/NodeNext no-DOM types:[] skipLibCheck:false consumer compiles all
  three new types, cleanup port/failed reasons and prior Scene/Asset/Spatial/Document/
  load/save public APIs: **0 diagnostics**.
- P1/P2/P3/P4 public counts audited from Git: Editor8/43/74/90,
  Render14/17/17/52; no previous exports removed.
- Pins unchanged and actual cached artifact SHA512 both match:
  Core2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775`;
  Gameplay0.15.2 `acea332aa80f67552192a72b30f81c0bbbfc56bd`.
- No test files/framework, manifest/lock/pin/workflow changes or test execution.
  Exactly five workspace projects. Known Harness DEP0190 warning remains; exit0.
- Initial local compile caught a cast newline and union narrowing issue; fixed.
  Final builds have no failed/unconfigured project.

## Reference principles reviewed

[VS Code Custom Editors](https://code.visualstudio.com/api/extension-guides/custom-editors)
separates document model/lifecycle and views; [Unity serialization](https://docs.unity3d.com/Manual/script-serialization.html)
describes serializable data constraints. [Godot saving](https://docs.godotengine.org/en/stable/tutorials/io/saving_games.html)
selects persistent data and explicitly reports parse failure.
[Unreal asset versioning](https://dev.epicgames.com/documentation/en-us/unreal-engine/versioning-of-assets-and-packages-in-unreal-engine)
distinguishes compatibility/version systems. These are design references, not an IO
guarantee, copied implementation or authorization to implement v0.5.10 migration.
[Node filesystem docs](https://nodejs.org/docs/latest-v24.x/api/fs.html) were consulted
for handle close, link and empty-directory removal; current online page v24.22.1,
actual local evidence v24.18.0. JXQY ProjectDocumentRegistry/DurableFileTransaction
source was not present in this checkout; no source-based JXQY guarantee is asserted.

**READY_FOR_DEVELOPER_REVIEW**. No merge/tag/release/publish; no v0.5.10.
