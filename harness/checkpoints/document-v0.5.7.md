# v0.5.7 — Storage Read & Load Foundation

DC13. **READY_FOR_DEVELOPER_REVIEW**. Finite headless manual read evidence below;
no product/phase acceptance, save safety or migration claim. Stop before v0.5.8.

## Exact baseline and authorization

- Accepted Phase 4 baseline: `e46ec24dc662b1bc1588d5ec1c05d4f62739ac3c`.
- Previous checkpoint/local/origin/PR at audit:
  `a8066c596cbd59da3357a9b112e04a73762b3fae` (v0.5.6), clean.
- Same branch `feat/editor-document-contracts-v0.5`,
  same [draft PR #5](https://github.com/TjnhPro/rpg-platform/pull/5), base main.
- Developer supplied the next task with standing authorization to implement/verify
  without intermediate review questions. This authorizes this task only, not
  automatic acceptance or the next version. CI is not Developer acceptance.
- Final self-referential checkpoint SHA and exact-head CI are recorded in the PR
  ledger/handoff after commit. One checkpoint commit, no merge/tag/release/publish.

## Preflight, ownership and scope

Read root AGENTS/ARCHITECTURE/FOUNDATION/README, Harness OWNERSHIP/CONTRACTS/
WORKFLOW/VERIFICATION, Editor/Render AGENTS, manifests, current source/root exports
and emitted declarations. Route hint selected Editor; ownership is established by
actual authored Document behavior, not the route hint.

Canonical primary owner: **Editor — read port and load orchestration**.
Host collaborator owns actual filesystem/browser IO, authorization, encoding,
resource limits and storage observations. Existing Editor codec, diagnostics and
session factory implement their own behavior; no duplicate domain validation.
Runtime Render remains presentation-only and is neither initialized nor modified.
No new L1/L2 calls. Engine/Client/Server have no change.

Declared scope (six paths):
- editor/src/document-load.ts
- editor/src/index.ts
- editor/AGENTS.md
- harness/CONTRACTS.md
- harness/OWNERSHIP.md
- harness/checkpoints/document-v0.5.7.md

No manifest/lock/pin/workflow/content-owner edits. Exactly five projects.
No current workspace consumer imports Editor, so --with-consumers selects Editor.
Forced workspace build checks all five projects.

## Source/platform audit

IMPLEMENTED before this checkpoint: immutable envelope/identity/content capture;
session lifecycle, revision/dirty and host-attested baseline; bounded pure JSON
codec; explicit owner-bound document/reference diagnostics. IMPLEMENTED here:
injectable text read port, safe outcome union and one-read load orchestration.

UNAVAILABLE / intentionally deferred: built-in production platform adapter,
project storage registry/path convention, storage write/conflict protection,
migration, watchers, UI and registry/cache. Existing manual examples do not
establish an application-wide persisted Document path policy. No actual JXQY
ProjectDocumentRegistry/DurableFileTransaction source is available in this repo.

Selected real manual host: Windows Node v24.18.0, node:fs/promises readFile through
an explicit per-call host port; fatal UTF-8 TextDecoder (ignoreBOM:true retains
the BOM for canonical parser decisions). No Node/browser imports or types in the
portable module. Manual fixture staging uses exclusive creation in a fresh ignored
.artifacts directory; those preparatory writes are not load/save implementation.

Reference principles consulted, with no copied code:
- [VS Code custom editors](https://code.visualstudio.com/api/extension-guides/custom-editors):
  host integration and document lifecycle remain separate.
- [Unity serialization](https://docs.unity3d.com/Manual/script-serialization.html),
  [Godot saving](https://docs.godotengine.org/en/stable/tutorials/io/saving_games.html),
  [Unreal versioning](https://dev.epicgames.com/documentation/en-us/unreal-engine/versioning-of-assets-and-packages-in-unreal-engine):
  use explicit representation/version policy; no automatic migration inferred.
- [Node filesystem readFile](https://nodejs.org/docs/latest-v24.x/api/fs.html#filehandlereadfileoptions):
  host reads bytes; this checkpoint does not infer an atomic storage revision.

## Public API delta and safety decisions

Add five Editor root symbols (114 -> **119**, emitted declarations identical):
loadDocument, DocumentStorageObservation, DocumentReadResult, DocumentReadPort,
DocumentLoadResult. Render stays **52**, no additions. Package exports still only
"."; no deep/cross-repo private imports or new package dependency.

`loadDocument(port, locator, context?) -> Promise<DocumentLoadResult>`.
Locator is a nonempty opaque exact host string; Editor does not resolve, normalize
or derive it from Document/Scene/Asset IDs. Host must authorize it. Read port returns
text, not a live buffer/backend handle, with explicit nullable observed identity
and revision. Null means unknown. Tokens describe the read bytes only and have no
atomicity/CAS guarantee. Document schema, content version, session revision and
storage token remain independent.

Expected IO errors are host-mapped not-found/read-failed; read-failed reason is
permission-denied/io-error/unavailable. Unexpected host exceptions/rejections,
invalid host contracts and resolver exceptions propagate; these are not authored
content failures and never produce empty/fallback documents. No raw exception
message enters a public diagnostic.

Reuse diagnoseDocument exactly once; it calls the canonical codec/owners.
Envelope/JSON/resource-profile rejections map to parse-failed; unsupported envelope
schema maps to unsupported-schema. Decoded but invalid/unresolved/not-checked
content maps to validation-diagnostics. Unsupported content-owner versions remain
canonical schema diagnostics in that outcome (no inferred migration/compatibility).
Every successful read retains original text, detached frozen storage observations
and immutable original validation envelope. Host must bound input bytes before
decoding; existing codec limits still apply after decoding. No claim arbitrary
large input is safe. Invalid UTF-8 host input is not lossy-decoded and overwritten.

Only strict-valid content creates a new session through createDocumentSession,
then open: currentRevision=1, savedRevision=1, savedEnvelope captures loaded content,
isDirty=false, revertBaseline=null. Evidence attests to explicit read-port data
only. It is not a storage commit/token or save admission. Clean describes equality
to this read snapshot, not freshness against later/concurrent storage changes.
Caller continues to own existing session choice; load accepts no current-session
argument and cannot replace/clear another session. Inspect/future data stays a
capture without granting a new live session capability. No invented read-only
session mode, save operation or write authorization.

## Manual observations — real IO, not an automated suite

One ad hoc stdin Node invocation through the public package root, no test file,
runner or CI behavioral gate. Fresh fixture directory:
`.artifacts/document-load-v0.5.7-JoAiDh` (ignored, not committed).

| Input/action | Observed |
| --- | --- |
| saved.json, explicit notes/content version 1 text binding | loaded/open; correct manual-project + stable-document; envelope schema 1; kind notes; content version 1; revisions 1/1; clean; saved content exact |
| Same bytes at relocated.json | same authored IDs, independent explicit location; no path-derived identity |
| malformed JSON | parse-failed / INVALID_JSON; original text preserved; no session |
| envelope schema 99 | unsupported-schema / UNSUPPORTED_SCHEMA; raw text exact; no downgrade/session/write |
| object payload under string text binding | validation-diagnostics / INVALID_TEXT_CONTENT; original unknown payload retained; no session |
| absent.json | real ENOENT -> not-found, distinct from parse/IO |
| read directory | real EISDIR -> read-failed/io-error |
| invalid UTF-8 byte ff | host decoding failure -> read-failed/io-error; no replacement characters |
| valid envelope without context | validation-diagnostics/not-checked; no session |
| explicit different content version binding | validation-diagnostics / CONTENT_CONTRACT_MISMATCH |
| independent already-dirty session | envelope identity and revision unchanged; remains dirty |
| storage observation | identity=null, revision=null throughout; no fabricated ETag |
| headless Node | document/window/OffscreenCanvas undefined; load never calls Render |

The two location files demonstrate location-independent identity; no production
file relocation workflow is claimed. Permission-denied specifically **NOT_VERIFIED**
(no ACL change); real IO failure was observed instead. No atomic/consistent-read,
concurrency, remote IO, browser permissions, visual or save behavior verification.
readFile may observe a concurrently changing file: host provides no stronger
guarantee and token remains unknown.

All six staged file byte hashes before and after the complete read/load sequence
are identical (including rejected data). No load write API exists. Full captured
output and reproducible stdin procedure follow; fixture staging writes precede
the before snapshot.

### Observed output

```text
saved.json {"status":"loaded","rawPreserved":true,"diagnostics":[],"observation":{"identity":null,"revision":null},"session":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"headless saved text"},"revertBaseline":null,"currentRevision":1,"savedRevision":1,"savedEnvelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"headless saved text"},"isDirty":false}}
relocated.json {"status":"loaded","rawPreserved":true,"diagnostics":[],"observation":{"identity":null,"revision":null},"session":{"state":"open","envelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"headless saved text"},"revertBaseline":null,"currentRevision":1,"savedRevision":1,"savedEnvelope":{"schemaVersion":1,"identity":{"projectId":"manual-project","documentId":"stable-document"},"documentKind":"notes","contentSchemaVersion":1,"content":"headless saved text"},"isDirty":false}}
malformed.json {"status":"parse-failed","rawPreserved":true,"diagnostics":["INVALID_JSON"],"observation":{"identity":null,"revision":null},"session":null}
future.json {"status":"unsupported-schema","rawPreserved":true,"diagnostics":["UNSUPPORTED_SCHEMA"],"observation":{"identity":null,"revision":null},"session":null}
invalid-content.json {"status":"validation-diagnostics","rawPreserved":true,"diagnostics":["INVALID_TEXT_CONTENT"],"observation":{"identity":null,"revision":null},"session":null}
absent.json {"status":"not-found","rawPreserved":null,"session":null}
bad-utf8.json {"status":"read-failed","reason":"io-error","rawPreserved":null,"session":null}
directory IO {
  status: 'read-failed',
  locator: 'D:\\python_code\\game_dev\\jx1_web\\rpg-2d\\.artifacts\\document-load-v0.5.7-JoAiDh',
  reason: 'io-error'
}
no binding validation-diagnostics not-checked false
binding mismatch validation-diagnostics [ 'CONTENT_CONTRACT_MISMATCH' ]
BEFORE {"bad-utf8.json":"a8100ae6aa1940d0b663bb31cd466142ebbdbd5187131b92d93818987832eb89","future.json":"4ccc47f8148f64d95db9d49079b37b36b1a8c972f873538a574ab3f3dc60ea9b","invalid-content.json":"3245db4919caa9c00e7b6da7503fefeb51f2584b440a17aa065dea3bff7ae065","malformed.json":"ae0b3f00638cc5d55bb5fb22deed8790c6b2b84080dd01ddadb22e8fcfab5557","relocated.json":"0a93e5f4d8cf16c659cfcb2718fbcdcc3bd036e9e5cec252d519b2b87ec34c3c","saved.json":"0a93e5f4d8cf16c659cfcb2718fbcdcc3bd036e9e5cec252d519b2b87ec34c3c"}
AFTER {"bad-utf8.json":"a8100ae6aa1940d0b663bb31cd466142ebbdbd5187131b92d93818987832eb89","future.json":"4ccc47f8148f64d95db9d49079b37b36b1a8c972f873538a574ab3f3dc60ea9b","invalid-content.json":"3245db4919caa9c00e7b6da7503fefeb51f2584b440a17aa065dea3bff7ae065","malformed.json":"ae0b3f00638cc5d55bb5fb22deed8790c6b2b84080dd01ddadb22e8fcfab5557","relocated.json":"0a93e5f4d8cf16c659cfcb2718fbcdcc3bd036e9e5cec252d519b2b87ec34c3c","saved.json":"0a93e5f4d8cf16c659cfcb2718fbcdcc3bd036e9e5cec252d519b2b87ec34c3c"}
unchanged bytes true other session identical true true true io [
  { name: 'absent.json', code: 'ENOENT' },
  { name: 'document-load-v0.5.7-JoAiDh', code: 'EISDIR' }
]
Node v24.18.0 gpu globals undefined undefined undefined host fixture document-load-v0.5.7-JoAiDh
```

### Reproduction (manual only)

Run after building from workspace root, via PowerShell here-string piped to
`node --input-type=module`. It stages new isolated fixtures then observes public
load results; it is not saved as an executable test file or wired to CI.

```js
import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import {TextDecoder} from 'node:util';import * as E from '@rpg-platform/editor';
await fs.mkdir('.artifacts',{recursive:true});const dir=await fs.mkdtemp(path.resolve('.artifacts/document-load-v0.5.7-'));
const binding={owner:'text',documentKind:'notes',contentSchemaVersion:1};
const env=E.createDocumentEnvelope({schemaVersion:1,identity:{projectId:'manual-project',documentId:'stable-document'},documentKind:'notes',contentSchemaVersion:1,content:'headless saved text'});
const good=E.serializeDocument(env);
const files={'saved.json':good,'relocated.json':good,'malformed.json':'{"schemaVersion":','future.json':good.replace('"schemaVersion":1','"schemaVersion":99'),'invalid-content.json':JSON.stringify({...env,content:{unknown:'retained'}})};
for(const [name,text] of Object.entries(files))await fs.writeFile(path.join(dir,name),text,{flag:'wx'});
await fs.writeFile(path.join(dir,'bad-utf8.json'),new Uint8Array([0xff]),{flag:'wx'});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const before=Object.fromEntries(await Promise.all((await fs.readdir(dir)).map(async name=>[name,hash(await fs.readFile(path.join(dir,name)))])));
const io=[];const port={async read(locator){const selected=path.resolve(locator);if(path.dirname(selected)!==dir&&selected!==dir)return{status:'read-failed',reason:'unavailable'};try{
 const bytes=await fs.readFile(selected);let text;try{text=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true}).decode(bytes);}catch{return {status:'read-failed',reason:'io-error'};}
 return{status:'read',text,observation:{identity:null,revision:null}};
}catch(error){io.push({name:path.basename(selected),code:error.code});return error.code==='ENOENT'?{status:'not-found'}:{status:'read-failed',reason:['EACCES','EPERM'].includes(error.code)?'permission-denied':'io-error'};}}};
const current=E.createDocumentSession(env,null);current.open();current.replaceContent('unsaved current session');const original=current.getSnapshot();
for(const name of [...Object.keys(files),'absent.json','bad-utf8.json']){
 const result=await E.loadDocument(port,path.join(dir,name),binding);
 console.log(name,JSON.stringify({status:result.status,reason:result.reason,rawPreserved:'text'in result?result.text===files[name]:null,diagnostics:result.validation?.diagnostics.map(d=>d.code),observation:result.observation,session:result.status==='loaded'?result.session.getSnapshot():null}));
}
const ioResult=await E.loadDocument(port,dir,binding);console.log('directory IO',ioResult);
const inspect=await E.loadDocument(port,path.join(dir,'saved.json'));console.log('no binding',inspect.status,inspect.validation.status,'session' in inspect);
const mismatch=await E.loadDocument(port,path.join(dir,'saved.json'),{...binding,contentSchemaVersion:2});console.log('binding mismatch',mismatch.status,mismatch.validation.diagnostics.map(d=>d.code));
const after=Object.fromEntries(await Promise.all((await fs.readdir(dir)).map(async name=>[name,hash(await fs.readFile(path.join(dir,name)))])));
console.log('BEFORE',JSON.stringify(before));console.log('AFTER',JSON.stringify(after));
console.log('unchanged bytes',JSON.stringify(before)===JSON.stringify(after),'other session identical',current.getSnapshot().envelope===original.envelope,current.getSnapshot().currentRevision===original.currentRevision,current.getSnapshot().isDirty,'io',io);
console.log('Node',process.version,'gpu globals',typeof globalThis.document,typeof globalThis.window,typeof globalThis.OffscreenCanvas,'host fixture',path.basename(dir));
```

## Build-only verification

- `node harness/cli.mjs check`: **ARCH_CHECK_PASS**, **64** JS/TS source files.
  Static project/public import checks only; cannot prove arbitrary dynamic runtime
  behavior, storage guarantees, gameplay or product acceptance.
- `node harness/cli.mjs scope --projects editor --allow-infra`: **SCOPE_PASS**,
  six modified/untracked paths within declared Editor + infrastructure.
- `node harness/cli.mjs verify --projects editor --with-consumers`: **BUILD_PASS**,
  Editor and its dependency build; no Editor consumers to add.
- `npm run build -- --force`: **PASS**, genuine TypeScript builds for all five:
  runtime-engine, runtime-render, editor, game-client, game-server.
- Strict ES2022/NodeNext, types:[], no DOM, public-root TypeScript consumer using
  all five additions plus existing Scene/Asset/Spatial/Document APIs:
  **0 diagnostics**; source/emitted export names agree Editor119/Render52.
- L1 @rpg/core 2.0.0 / 04b7239f998c3c688a0dfa3202f11811a9acd775;
  L2 @rpg/gameplay 0.15.2 / acea332aa80f67552192a72b30f81c0bbbfc56bd.
  Both downloaded artifacts still match pinned SHA512; no pin/lock changes.
- No test suite, testcase, UI/browser/E2E runner or framework added/run.
- Existing harness Node DEP0190 shell-spawn warning observed; harness source is
  outside this task and unchanged. Build exited successfully.

## Remaining decisions and limits

Production host/platform, authorized locator policy, size/encoding limits and
real storage identity/token/concurrency guarantees remain explicit host decisions.
No default filesystem adapter is exported. Portable root/declarations need no DOM
or Node-specific types. Existing headless authored owners compose unchanged.

No safe-save, automatic migration, watcher, registry/cache, UI, GPU initialization
or v0.5.8 work. Manual finite evidence is not exhaustive product verification.
**READY_FOR_DEVELOPER_REVIEW**, not ACCEPTED.
