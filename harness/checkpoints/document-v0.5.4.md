# v0.5.4 — Revision & Dirty State Management

DC07 / DC08. **READY_FOR_DEVELOPER_REVIEW**.
Manual typed-seam observations only; real persistence is **FEATURE_NOT_VERIFIED**.
Stop before v0.5.5.

## Exact baseline, authorization and preflight

- Phase 4 integration baseline: `e46ec24dc662b1bc1588d5ec1c05d4f62739ac3c`.
- Previous checkpoint/source HEAD: `677be4099ffa0ad6c56171ec722fccbe137b4510`
  (v0.5.3 DC06/DC09), initially clean local/origin/PR.
- Same `feat/editor-document-contracts-v0.5`, same [draft PR #5](https://github.com/TjnhPro/rpg-platform/pull/5),
  base main unchanged. One checkpoint commit; final SHA and exact-head CI are
  recorded in the PR ledger/handoff outside the self-referential commit.
- Developer supplied the next task with standing instruction to implement without
  intermediate review questions. This authorizes v0.5.4 only; CI is not phase or
  product acceptance.
- Read root/project AGENTS, architecture, FOUNDATION/README, Harness ownership/
  contracts/workflow/verification, actual manifests, source/index/declarations.
  Harness route suggests Editor; **Editor — revision/dirty/saved baseline semantics**
  is canonical owner. Render is inspected/compiled only. No L1/L2 API additions.
- Declared minimal scope: existing session module/root exports plus Editor guidance
  and directly related Harness docs/report. Six changed paths:
  editor/src/document-session.ts, editor/src/index.ts, editor/AGENTS.md,
  harness/CONTRACTS.md, harness/OWNERSHIP.md, this checkpoint.
- No workspace consumer imports Editor; verify --with-consumers selects Editor.
  Whole workspace build also compiles all five projects. No extra package.

## Source audit and design decisions

At v0.5.3: identity/envelope and immutable whole-content replacement IMPLEMENTED;
session created/open/closed and explicit caller-memory revert IMPLEMENTED.
No revision, saved baseline, codec, load/save or asynchronous storage adapter was
implemented. Preview/Render lifecycle owns unrelated resources and is not reused.
Source searches show no document registry/tab manager or real save placeholder
implementation. Future codec/IO/migration policies remain DOCUMENTED_ONLY, their
operations UNAVAILABLE. No JXQY ProjectDocumentRegistry/DurableFileTransaction
source exists in this checkout; no external JXQY behavior is assumed.

Revision is a **session-local generation**, not content hash, timestamp, UUID,
Document/Scene/Asset ID, schema version, package version or storage token.
The existing snapshot factory always detaches records, so structural no-op cannot
be inferred from a new object. There is no deep comparison/hashing framework.

Reference principles consulted without code copying:

- [VS Code custom editors](https://code.visualstudio.com/api/extension-guides/custom-editors):
  document model/edit/save responsibilities stay separate from views.
- [Unity serialization](https://docs.unity3d.com/Manual/script-serialization.html):
  data representation constraints do not make live host objects authored data.
- [Godot saving games](https://docs.godotengine.org/en/stable/tutorials/io/saving_games.html):
  selecting/serializing data is separate from actual storage work.
- [Unreal versioning](https://dev.epicgames.com/documentation/en-us/unreal-engine/versioning-of-assets-and-packages-in-unreal-engine):
  version domains and compatibility are explicit. No migration is implemented here.

## Additive public surface

Four new root types: DocumentLoadedEvidence, DocumentCommitEvidence,
DocumentSaveTicket, DocumentSaveOutcome. Editor symbols 101 -> **105**;
Render unchanged **52**. Existing factory accepts an optional third argument:

```ts
createDocumentSession(envelope, revertBaseline, loadedEvidence?)
```

Existing callers need no new argument. Session snapshots additionally expose
currentRevision, savedRevision, savedEnvelope and isDirty. Session adds
prepareSave(), completeSave(ticket, outcome), revertToSaved(). Prior methods and
their lifecycle/admission policy remain available.

| Operation/domain | Exact policy |
| --- | --- |
| Initial state | created, currentRevision=1; no evidence -> savedRevision/savedEnvelope=null and dirty=true, even with caller-memory revertBaseline |
| Initial loaded evidence | exact portable {kind:'storage-load',confirmation:nonblank string}; trusted host attests exact INITIAL envelope, not revertBaseline; saved=1, clean |
| No-op replacement | Object.is(input content,current content): no capture/generation change; equal primitive or same captured record/array reference only |
| Authored replacement | otherwise existing replaceDocumentContent capture; success increments generation once, no schema bump. Distinct structurally equal objects still count |
| Dirty | no saved snapshot OR !Object.is(current.content,savedEnvelope.content); conservative identity for records, value equality for primitives; never a writable UI flag |
| UI selection/zoom/open/prepare/ack/close | do not increment authored generation |
| prepareSave | open only; frozen exact revision/envelope ticket, no IO/saved transition |
| completeSave | open only, ticket must be issued by THIS session and not previously completed; valid outcome consumes ticket once |
| committed outcome | exact {status:'committed',evidence:{kind:'storage-commit',confirmation:nonblank string}}; host attests exact ticket revision/payload persisted |
| failed/cancelled outcome | exact {status:'failed'} or {status:'cancelled'}; consumes ticket, no saved/current change |
| Invalid proof/ticket | TypeError, no transition; valid ticket remains usable after invalid proof. Cloned, foreign, fabricated and replayed tickets reject |
| Older valid commit acknowledgement | ticket is retired; savedRevision/envelope never roll backward; latest confirmed generation retained |
| revertToSaved | requires a host-confirmed saved snapshot; restore it, increment current generation only if content differs; savedRevision remains actual confirmed generation |
| Legacy revert | still caller-memory baseline per v0.5.3; counts changed content but never creates saved evidence or clears unsaved state |
| Overflow | generation at Number.MAX_SAFE_INTEGER rejects further change before state assignment; guard inspected, not stress-run |
| Closed | terminal, only getSnapshot available; new methods reject just like prior mutators |

No-op and dirty comparisons are deliberately conservative. Replacing a current
record with a structurally equal fresh record increments and stays dirty. Using
revertToSaved reuses the exact captured saved content, so current=4/saved=2 can be
clean after a genuine revert; currentRevision is generation, not a dirty formula.
Equal primitive content can similarly be clean across generations. This policy
does not promise semantic equality for arbitrary records or hidden schemas.

Late Save(2) after edit(3) updates saved to ticket 2 while current stays 3 and dirty
stays true when their content differs. Out-of-order ack(2) after ack(3) cannot
roll back the confirmed baseline. This is **acknowledgement ordering protection**,
not storage write ordering: hosts must serialize writes or use real conflict/
revision-token guarantees. If an old physical write actually overwrites newer
bytes, the host must resolve/report it; this module cannot infer storage reality.

Evidence is a trusted host boundary, not a security proof. Portable/exact shape
and nonblank confirmation text are checked, but no disk/host authenticity is
verified. Host must only declare successful load/commit after observing it for
the exact envelope/ticket. Confirmation is an opaque host correlation label,
not an invented file protocol/ETag or independently verified persistence receipt.
No standalone setter for savedRevision/isDirty. Ticket membership uses private
WeakSet; no global store, clock, durable ticket serialization or async save engine.

## Manual observations, no test files

The following runs real public-root session methods with **MANUAL_ONLY**
declarations. It verifies in-memory correlation/derivation only. It does NOT
provide real storage evidence or claim SAFE_SAVE_PASS/LOAD_PASS. No adapter,
storage token, bytes-before/after or disk write exists here.

Expected: loaded declaration -> 1/1/clean; edit2 -> capture2 -> edit3 -> ack2
gives **3/2/dirty**; fail/cancel leaves saved unchanged; newer ack then older ack
never decreases savedRevision. UI changes do not affect generation. Saved revert
returns exact confirmed content with new current generation and clean state.

Run from workspace PowerShell after build:

```powershell
@'
import {createDocumentEnvelope,createDocumentSession} from '@rpg-platform/editor';
// MANUAL seam exercise only: these labels are NOT real storage commit/load evidence.
const envelope=createDocumentEnvelope({schemaVersion:1,identity:{projectId:'p',documentId:'d'},documentKind:'text',contentSchemaVersion:7,content:{text:'one',extension:{future:true}}});
const loaded={kind:'storage-load',confirmation:'MANUAL_ONLY initial-load declaration'};
const commit={status:'committed',evidence:{kind:'storage-commit',confirmation:'MANUAL_ONLY commit declaration'}};
const log=(label,s)=>{const x=s.getSnapshot();console.log(label,x.currentRevision,x.savedRevision,x.isDirty,x.envelope.content,x.savedEnvelope?.content??null);};
const attempt=(label,action)=>{try{action();console.log(label,'UNEXPECTED_SUCCESS');}catch(e){console.log(label,e.name,e.message);}};
const s=createDocumentSession(envelope,null,loaded);
s.open();const original=s.getSnapshot();log('loaded-1',s);
const ui={session:s,selection:'line-1',zoom:1};ui.selection='line-2';ui.zoom=3;log('ui-only',s);
s.replaceContent(s.getSnapshot().envelope.content);log('same-reference-no-op',s);
s.replaceContent({text:'two',extension:{future:true}});const ticket2=s.prepareSave();
console.log('ticket-2',ticket2.revision,ticket2.envelope.content,Object.isFrozen(ticket2));
s.replaceContent({text:'three',extension:{future:true}});log('edit-3',s);
s.completeSave(ticket2,commit);log('late-ack-2',s);
attempt('ticket-replay',()=>s.completeSave(ticket2,commit));
console.log('old-snapshot',original.currentRevision,original.savedRevision,original.isDirty,original.envelope.content);
s.revertToSaved();log('revert-saved-generation-4',s);
s.revertToSaved();log('repeat-revert-no-op',s);
s.replaceContent({text:'two',extension:{future:true}});log('distinct-record-is-edit',s);
const failed=s.prepareSave();s.completeSave(failed,{status:'failed'});log('failed-not-saved',s);
const cancelled=s.prepareSave();s.completeSave(cancelled,{status:'cancelled'});log('cancelled-not-saved',s);
attempt('retired-failed-ticket',()=>s.completeSave(failed,commit));
const valid=s.prepareSave();
attempt('missing-commit-evidence',()=>s.completeSave(valid,{status:'committed'}));
attempt('empty-evidence',()=>s.completeSave(valid,{status:'committed',evidence:{kind:'storage-commit',confirmation:' '}}));
attempt('wrong-evidence-kind',()=>s.completeSave(valid,{status:'committed',evidence:loaded}));
attempt('unknown-outcome-field',()=>s.completeSave(valid,{status:'failed',isDirty:false}));
log('invalid-proof-unchanged',s);
s.completeSave(valid,commit);log('ack-current-clean',s);
const u=createDocumentSession(envelope,envelope);u.open();log('unsaved-with-memory-baseline',u);
attempt('unsaved-revert-to-saved',()=>u.revertToSaved());
u.replaceContent('edited');u.revert();log('memory-revert-still-unsaved',u);
const other=u.prepareSave();
attempt('cross-session-ticket',()=>s.completeSave(other,commit));
attempt('forged-ticket',()=>u.completeSave({...other},commit));
const uSnapshot=u.getSnapshot();
attempt('dirty-flag-write',()=>{uSnapshot.isDirty=false;});
const order=createDocumentSession(envelope,null,loaded);order.open();
order.replaceContent('two');const older=order.prepareSave();
order.replaceContent('three');const newer=order.prepareSave();
order.replaceContent('four');log('two-edits-pending',order);
order.completeSave(newer,commit);log('newer-ack-3',order);
order.completeSave(older,commit);log('older-ack-2-ignored',order);
const final=order.prepareSave();order.completeSave(final,commit);log('ack-4-clean',order);
console.log('schema-independent',order.getSnapshot().envelope.schemaVersion,order.getSnapshot().envelope.contentSchemaVersion);
const primitive=createDocumentSession({...envelope,content:0},null);primitive.open();
primitive.replaceContent(0);log('primitive-same-value-no-op',primitive);
attempt('negative-zero-rejected',()=>primitive.replaceContent(-0));
attempt('invalid-content-rejected',()=>primitive.replaceContent(()=>{}));
log('invalid-edit-counter-stable',primitive);
const pending=s.prepareSave();s.close('discard');
attempt('complete-closed',()=>s.completeSave(pending,commit));
attempt('prepare-closed',()=>s.prepareSave());
attempt('revert-saved-closed',()=>s.revertToSaved());
console.log('envelope-keys',Object.keys(s.getSnapshot().envelope));
u.close('discard');order.close('discard');primitive.close('discard');
'@ | node --input-type=module
```

Observed output (columns: label, currentRevision, savedRevision, dirty,
current content, saved content):

```text
loaded-1 1 1 false { text: 'one', extension: { future: true } } { text: 'one', extension: { future: true } }
ui-only 1 1 false { text: 'one', extension: { future: true } } { text: 'one', extension: { future: true } }
same-reference-no-op 1 1 false { text: 'one', extension: { future: true } } { text: 'one', extension: { future: true } }
ticket-2 2 { text: 'two', extension: { future: true } } true
edit-3 3 1 true { text: 'three', extension: { future: true } } { text: 'one', extension: { future: true } }
late-ack-2 3 2 true { text: 'three', extension: { future: true } } { text: 'two', extension: { future: true } }
ticket-replay TypeError Unknown, foreign or already completed Document save ticket
old-snapshot 1 1 false { text: 'one', extension: { future: true } }
revert-saved-generation-4 4 2 false { text: 'two', extension: { future: true } } { text: 'two', extension: { future: true } }
repeat-revert-no-op 4 2 false { text: 'two', extension: { future: true } } { text: 'two', extension: { future: true } }
distinct-record-is-edit 5 2 true { text: 'two', extension: { future: true } } { text: 'two', extension: { future: true } }
failed-not-saved 5 2 true { text: 'two', extension: { future: true } } { text: 'two', extension: { future: true } }
cancelled-not-saved 5 2 true { text: 'two', extension: { future: true } } { text: 'two', extension: { future: true } }
retired-failed-ticket TypeError Unknown, foreign or already completed Document save ticket
missing-commit-evidence TypeError Document save outcome requires committed evidence, failed or cancelled
empty-evidence TypeError Document storage evidence requires storage-commit and non-empty confirmation
wrong-evidence-kind TypeError Document storage evidence requires storage-commit and non-empty confirmation
unknown-outcome-field TypeError Document save outcome requires committed evidence, failed or cancelled
invalid-proof-unchanged 5 2 true { text: 'two', extension: { future: true } } { text: 'two', extension: { future: true } }
ack-current-clean 5 5 false { text: 'two', extension: { future: true } } { text: 'two', extension: { future: true } }
unsaved-with-memory-baseline 1 null true { text: 'one', extension: { future: true } } null
unsaved-revert-to-saved Error Document session has no storage-confirmed saved snapshot
memory-revert-still-unsaved 3 null true { text: 'one', extension: { future: true } } null
cross-session-ticket TypeError Unknown, foreign or already completed Document save ticket
forged-ticket TypeError Unknown, foreign or already completed Document save ticket
dirty-flag-write TypeError Cannot assign to read only property 'isDirty' of object '#<Object>'
two-edits-pending 4 1 true four { text: 'one', extension: { future: true } }
newer-ack-3 4 3 true four three
older-ack-2-ignored 4 3 true four three
ack-4-clean 4 4 false four four
schema-independent 1 7
primitive-same-value-no-op 1 null true 0 null
negative-zero-rejected TypeError Document content must contain only portable JSON data: plain enumerable data objects, dense arrays and finite primitives (no negative zero or cycles)
invalid-content-rejected TypeError Document content must contain only portable JSON data: plain enumerable data objects, dense arrays and finite primitives (no negative zero or cycles)
invalid-edit-counter-stable 1 null true 0 null
complete-closed Error Document session requires open; current state is closed
prepare-closed Error Document session requires open; current state is closed
revert-saved-closed Error Document session requires open; current state is closed
envelope-keys [
  'schemaVersion',
  'identity',
  'documentKind',
  'contentSchemaVersion',
  'content'
]
```

Headless text content uses no Scene/Map/renderer. Original snapshot remains frozen
at generation 1; authored envelope keys still exclude all session metadata.
Unknown authored extension survives replacement/ticket capture. Negative zero/
function payload rejection leaves revision unchanged. Actual asynchronous IO,
storage atomicity, multi-view UI and visual correctness remain NOT_VERIFIED.

## Verification and compatibility

- Architecture check: ARCH_CHECK_PASS, **61 JS/TS files**, static constraints only.
  Scope: six declared modified/untracked paths within Editor + infrastructure.
  Final committed diff additionally inspected; no protected/out-of-scope path.
- Editor verify --with-consumers: BUILD_PASS. Forced whole workspace build:
  BUILD_PASS runtime-engine, runtime-render, editor, game-client, game-server.
  No unconfigured/final failed build.
- Initial compile found TypeScript could not narrow readonly arrays through
  Array.isArray for the reused portable union. Fixed with guarded internal
  portable-record narrowing; subsequent real build passed. No dependencies changed.
- Source/emitted root name sets match **105/105 Editor**, **52/52 Render**.
  Only four evidence/ticket/outcome types added since v0.5.3; old symbols retained.
  New declarations expose only public Document types and primitive records,
  no DOM, GPU/THREE, storage implementation or private helper types.
- Strict in-memory public-root consumer compiles existing Asset/Scene/Spatial/
  Document plus session/ticket/outcome/loaded/commit types and new operations:
  zero diagnostics, NodeNext/ES2022, lib es2022, types [], skipLibCheck false.
- Historical public source inventories retained: Phase 1 8/14; Phase 2 43/17;
  Phase 3 74/17; Phase 4 90/52 (Editor/Render).
- Core 2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775`;
  Gameplay 0.15.2 `acea332aa80f67552192a72b30f81c0bbbfc56bd`.
  Artifact SHA-512 matches existing unchanged pins.
- Exactly five projects; root-only export maps/dependency directions unchanged.
  No old Asset/Scene/Spatial implementation, other project, manifest, dependency,
  lock, foundation pin or workflow change. git diff --check passes.
- Final HEAD gates and push/PR CI results are in PR ledger after the single commit.
  Node 24.18.0/npm 12.2.0; existing DEP0190 Windows Harness warning nonblocking.
- No test files/runners, automated unit/integration/browser/UI/E2E/visual suites,
  coverage or historic exhaustive tests created or run. Manual script is report
  evidence, not a new CI gate. Static/build success is not product acceptance.

## Limits and next boundary

**READY_FOR_DEVELOPER_REVIEW** for v0.5.4 only. No blocker inside declared scope.
Real load/save/revert storage guarantees remain **FEATURE_NOT_VERIFIED**;
all successful load/commit declarations above are explicitly manual seam inputs,
not persisted data. No codec, actual IO, autosave, undo/history, hashing framework,
schema migration, renderer or gameplay changes.

Future decisions: v0.5.5 codec, later real host load/commit adapters, physical
write ordering/conflict evidence and storage-backed revert. No v0.5.5
implementation, merge/tag/release/publish.
