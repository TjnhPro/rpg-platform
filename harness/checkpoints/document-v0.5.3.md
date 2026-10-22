# v0.5.3 — Document Lifecycle Foundation

DC06 / DC09. **READY_FOR_DEVELOPER_REVIEW**.
Finite headless observations below; storage-backed lifecycle remains
**FEATURE_NOT_VERIFIED**. Stop before v0.5.4.

## Baseline, authorization and preflight

- Phase 4 integration base: `e46ec24dc662b1bc1588d5ec1c05d4f62739ac3c`.
- Previous checkpoint/source HEAD: `8803183972a20f0163e375c56b1f8f70a21203b5`
  (v0.5.2 DC04/DC05).
- Same `feat/editor-document-contracts-v0.5`, same [draft PR #5](https://github.com/TjnhPro/rpg-platform/pull/5),
  base main unchanged. One checkpoint commit; exact final SHA/CI are recorded in
  PR/handoff outside the self-referential commit.
- Developer supplied this next task following v0.5.2, with standing authorization
  to implement without intermediate review questions. That authorizes this task;
  CI does not constitute phase/product acceptance.
- Read root AGENTS, ARCHITECTURE, FOUNDATION, README, Harness ownership/contracts/
  workflow/verification, Editor/Render AGENTS, actual manifests, source/index and
  emitted declarations. Harness route suggests Editor; actual ownership confirms
  **Editor — session orchestration**. No uncertainty or owner relocation.
- Preflight declared a new session module/root exports and directly related docs.
  Actual six paths: editor/src/document-session.ts, editor/src/index.ts,
  editor/AGENTS.md, harness/CONTRACTS.md, harness/OWNERSHIP.md, this checkpoint.
- Render is inspected/compiled only; no project imports Editor today, so consumer
  expansion selects Editor only. Full build additionally compiles all five projects.
  No L1/L2 API additions, other project edits or dependency changes.

## Source audit and capability inventory

| Capability | At v0.5.2 | This checkpoint |
| --- | --- | --- |
| Identity/envelope | IMPLEMENTED explicit scoped keys, schema 1, portable detached frozen content | Unchanged |
| Whole-content update | IMPLEMENTED replaceDocumentContent, no patch/merge or implicit schema bump | Reused by session |
| Document session | UNAVAILABLE; no global registry or tab manager | IMPLEMENTED factory-local mutable closure with frozen observations |
| Revert | No baseline/operation | IMPLEMENTED explicit caller-memory target only; NOT storage reload |
| Preview host | IMPLEMENTED mount/replace/unmount/terminal idempotent close; owns Render session | Unchanged and never called by Document session |
| Render lifecycle | IMPLEMENTED binding/graphics-specific lifecycle; different resources and disposal semantics | Unchanged; not reused as Document lifecycle |
| Dirty/revision, saved acknowledgement, codec, IO, migrations | DOCUMENTED_ONLY future contracts / UNAVAILABLE operations | Still UNAVAILABLE; no fake success |

The v0.5.2 authored snapshot is portable data; live session and preview facades
contain methods/closure state and are not authored payloads. Source search found
no Project Manager/document registry or tab binding. Two factories with identical
Document identity therefore create independent sessions, not automatic copies of
a shared store and not synchronized views. A host wanting two views of one live
Document must give both views the SAME session capability. No global singleton,
lookup, deduplication, reference count, event subscription or conflict resolver.

No matching ProjectDocumentRegistry/DurableFileTransaction sources are present
in this checkout (filename search). No external JXQY behavior is claimed.

Principles consulted, without copying code or adopting their full systems:

- [VS Code custom editors](https://code.visualstudio.com/api/extension-guides/custom-editors):
  separates model from views and describes multiple views of one document.
  Here host sharing is explicit; no UI lifetime integration is implemented.
- [Unity serialization](https://docs.unity3d.com/Manual/script-serialization.html):
  explicit serialization/data constraints inform keeping live capabilities outside
  authored content; existing Platform portable rules stay authoritative.
- [Godot saving games](https://docs.godotengine.org/en/stable/tutorials/io/saving_games.html):
  identifies selected persistent data before serialization/storage. No Godot
  gameplay fields or save implementation are introduced.
- [Unreal versioning](https://dev.epicgames.com/documentation/en-us/unreal-engine/versioning-of-assets-and-packages-in-unreal-engine):
  distinguishes compatibility/version domains. No migration or inferred writable
  future format; Document and content schema versions remain distinct.

## Exact additive contract and lifecycle

Three new root exports (no old signatures changed):

```ts
createDocumentSession(
  envelope: DocumentEnvelope,
  revertBaseline: DocumentEnvelope | null,
): DocumentSession
DocumentSession
DocumentSessionSnapshot
```

Both inputs are captured via existing createDocumentEnvelope. A non-null baseline
must match project/document identity, kind and both schema versions. Its provenance
is **caller-supplied memory**, visible as revertBaseline, never claimed saved or
storage-verified. Null explicitly disables revert. The baseline cannot be advanced
or swapped during this checkpoint. Content semantics stay canonical-owner/caller
responsibility, not a universal document schema.

| Operation | Allowed state | Result / failure |
| --- | --- | --- |
| factory | n/a | created, validated captured envelope and explicit baseline/null |
| getSnapshot | any | frozen state/envelope/revertBaseline observation, including closed |
| open | created only | open; activates supplied data, no load/decode/IO |
| replaceContent | open only | detached whole-content replacement through v0.5.2; remains open |
| revert | open with non-null baseline | restore explicit captured baseline; remains open |
| close('discard') | created or open | closed, terminal; retains final authored snapshot |
| duplicate open, repeated close, edit/revert/reopen after close | invalid | Error, no successful transition |
| missing/other close admission, bad input/baseline | invalid | TypeError; no implicit discard |
| revert without baseline | invalid | Error; no invented saved state |

Each transition returns an immutable observation; old observations and caller
inputs remain unchanged. No editing revision/equality/dirty calculation is inferred
from object identity. Close always requires explicit host discard admission,
including never-saved and unedited data, because saved/dirty evidence does not yet
exist. To cancel a close, the host does not call close (or receives rejection for
an invalid admission). Session close never removes a tab, revokes caller snapshots
or disposes a Render/preview host. There are no owned GPU/IO resources here.
Host retains final data for inspection/recovery and controls capability release.

Typed callers pass plain data records. Existing portable rejection behavior and
native host/proxy exceptions remain; resource limits or adversarial/reentrant
proxies are not a newly hardened security boundary. No migration/safety policy
is inferred by successful capture/open/revert/close.

## Reproducible manual observations (not a test suite)

Executed Node ESM against the public package root, no asserts, runner, browser,
fixture file or automated test gate. Expected: old/other session stays "one",
edited snapshot stays "two", close without discard preserves open data, closed
mutators fail, explicit memory baseline restores its captured value.

Run from workspace PowerShell after genuine build:

```powershell
@'
import {createDocumentEnvelope, createDocumentSession} from '@rpg-platform/editor';
const input={schemaVersion:1,identity:{projectId:'p',documentId:'text-1'},documentKind:'text',contentSchemaVersion:null,content:{chapters:['one'],extension:{future:true}}};
const envelope=createDocumentEnvelope(input);
const a=createDocumentSession(envelope,null), b=createDocumentSession(envelope,null);
const attempt=(label,action)=>{try{action();console.log(label,'UNEXPECTED_SUCCESS');}catch(error){console.log(label,error.name,error.message);}};
const original=a.getSnapshot();
console.log('created',original.state,original.revertBaseline);
attempt('edit-before-open',()=>a.replaceContent('invalid'));
a.open(); b.open();
attempt('duplicate-open',()=>a.open());
const replacement={chapters:['two'],extension:{future:true}};
const edited=a.replaceContent(replacement);
replacement.chapters.push('caller-change');input.content.chapters.push('caller-change');
console.log('isolation',original.envelope.content.chapters,edited.envelope.content.chapters,b.getSnapshot().envelope.content.chapters);
attempt('snapshot-mutation',()=>edited.envelope.content.chapters.push('forbidden'));
attempt('no-baseline-revert',()=>a.revert());
attempt('close-without-admission',()=>a.close());
attempt('close-cancelled',()=>a.close('cancel'));
console.log('retained-after-denial',a.getSnapshot().state,a.getSnapshot().envelope.content.chapters);
const cyclic={};cyclic.self=cyclic;
attempt('invalid-edit',()=>a.replaceContent(cyclic));
console.log('after-invalid-edit',a.getSnapshot().envelope.content.chapters);
const view1={session:a,zoom:2},view2={session:a,selection:'line-1'};
console.log('shared-views',view1.session===view2.session,view2.session.getSnapshot().state);
console.log('closed',a.close('discard').state,a.getSnapshot().envelope.content.chapters);
for(const [label,action] of [['reopen',()=>a.open()],['edit-closed',()=>a.replaceContent('bad')],['revert-closed',()=>a.revert()],['close-again',()=>a.close('discard')]])attempt(label,action);
console.log('other-session',b.getSnapshot().state,b.getSnapshot().envelope.content.chapters);
const baselineInput={...input,content:'baseline from caller memory'};
const c=createDocumentSession(envelope,baselineInput);
baselineInput.content='caller changed baseline';
c.open();c.replaceContent('new text');
console.log('explicit-revert',c.revert().envelope.content,c.getSnapshot().state);
attempt('baseline-key-mismatch',()=>createDocumentSession(envelope,{...envelope,identity:{projectId:'p',documentId:'other'}}));
attempt('baseline-kind-mismatch',()=>createDocumentSession(envelope,{...envelope,documentKind:'scene'}));
attempt('baseline-schema-mismatch',()=>createDocumentSession(envelope,{...envelope,contentSchemaVersion:2}));
console.log('close-created',createDocumentSession(envelope,null).close('discard').state);
console.log('authored-keys',Object.keys(c.getSnapshot().envelope),'session-keys',Object.keys(c.getSnapshot()));
console.log('frozen',Object.isFrozen(a),Object.isFrozen(original),Object.isFrozen(edited.envelope.content.chapters));
b.close('discard');c.close('discard');
'@ | node --input-type=module
```

Observed:

```text
created created null
edit-before-open Error Document session requires open; current state is created
duplicate-open Error Document session requires created; current state is open
isolation [ 'one' ] [ 'two' ] [ 'one' ]
snapshot-mutation TypeError Cannot add property 1, object is not extensible
no-baseline-revert Error Document session has no caller-supplied revert baseline
close-without-admission TypeError Document close requires explicit host discard admission
close-cancelled TypeError Document close requires explicit host discard admission
retained-after-denial open [ 'two' ]
invalid-edit TypeError Document content["self"] must contain only portable JSON data: plain enumerable data objects, dense arrays and finite primitives (no negative zero or cycles)
after-invalid-edit [ 'two' ]
shared-views true open
closed closed [ 'two' ]
reopen Error Document session requires created; current state is closed
edit-closed Error Document session requires open; current state is closed
revert-closed Error Document session requires open; current state is closed
close-again Error Document session is closed
other-session open [ 'one' ]
explicit-revert baseline from caller memory open
baseline-key-mismatch TypeError Document revert baseline must match identity, kind and schema versions
baseline-kind-mismatch TypeError Document revert baseline must match identity, kind and schema versions
baseline-schema-mismatch TypeError Document revert baseline must match identity, kind and schema versions
close-created closed
authored-keys [
  'schemaVersion',
  'identity',
  'documentKind',
  'contentSchemaVersion',
  'content'
] session-keys [ 'state', 'envelope', 'revertBaseline' ]
frozen true true true
```

The same-ID independent sessions and two caller-side views of one session are
separate cases. These are ordinary caller objects, not an implemented UI manager.
Text content uses no Scene/Map/canvas and does not acquire graphics. The negative
baseline case also demonstrates no implicit identity/schema conversion.
Close-created and rejected no-admission cases do not indicate a saved document.

## Verification and compatibility evidence

- `node harness/cli.mjs check`: **ARCH_CHECK_PASS**, 61 JS/TS files.
  This is static import/boundary scanning, not runtime/security correctness.
- `node harness/cli.mjs scope --projects editor --allow-infra`: declared six
  paths only; committed diff is inspected separately after commit.
- `node harness/cli.mjs verify --projects editor --with-consumers`:
  **BUILD_PASS** Editor. No workspace project currently imports Editor.
- `npm run build -- --force`: **BUILD_PASS** runtime-engine, runtime-render,
  editor, game-client, game-server. No unconfigured or failed build remains.
- TypeScript AST/source/emitted inventory: Editor **101/101**, Render **52/52**,
  no set differences. Only the three session symbols added since v0.5.2.
  Historical baseline source inventories: Phase 1 8/14, Phase 2 43/17,
  Phase 3 74/17, Phase 4 90/52 (Editor/Render).
- Strict in-memory public-root consumer compiles existing Asset/Scene/Spatial/
  Document and new session types/operations: zero diagnostics, NodeNext ES2022,
  lib es2022 only, types [], skipLibCheck false. Emitted session declarations
  expose only public Document types, primitives and capability signatures;
  no private implementation, DOM, GPU, THREE or storage types.
- Core 2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775`;
  Gameplay 0.15.2 `acea332aa80f67552192a72b30f81c0bbbfc56bd`.
  Existing artifact SHA-512 values match unchanged foundation pins.
- Root-only package export maps, five workspace projects and dependency directions
  unchanged. No previous Asset/Scene/Spatial source, other project source,
  manifests, dependencies, lockfiles, pins or workflow edits.
- `git diff --check` and protected-path review; exact committed diff/final HEAD
  gates and push + PR CI recorded in PR ledger after commit.
- Node 24.18.0 / npm 12.2.0. Existing Windows DEP0190 Harness warning is nonblocking.
- No tests/runners, automated suites, browser/UI/E2E, coverage or legacy exhaustive
  tests created/run. No SAFE_SAVE_PASS, MIGRATION_PASS or visual acceptance claim.

## Limits and next boundary

**READY_FOR_DEVELOPER_REVIEW** for v0.5.3 only. The described headless manual calls
were observed; general product lifecycle/persistence remains FEATURE_NOT_VERIFIED.
No actual storage host/adapter, expected storage token, saved revision or disk
before/after bytes exist in this checkpoint. Storage-backed open/revert is
NOT_VERIFIED and deferred to v0.5.7; no fake load or save acknowledgement.

Next decisions: v0.5.4 current/saved revisions and dirty policy, later host IO/
commit evidence, read-only compatibility and registry/UI integration. Do not
advance into those now. No blockers inside the declared v0.5.3 scope.
Stop before v0.5.4; no merge/tag/release/publish.
