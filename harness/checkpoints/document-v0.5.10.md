# v0.5.10 — Schema Compatibility & Migration (DC16)

**READY_FOR_DEVELOPER_REVIEW** — one checkpoint; stop before v0.5.11.
Build and finite manual observations do not establish Developer acceptance,
universal MIGRATION_PASS or SAFE_SAVE_PASS.

## Exact baseline and authorization

- Repository: https://github.com/TjnhPro/rpg-platform
- Branch: `feat/editor-document-contracts-v0.5`; existing draft [PR #5](https://github.com/TjnhPro/rpg-platform/pull/5), base `main`.
- Pre-change HEAD / previous v0.5.9 checkpoint: `171bbcd3c5e1dc956bb47744cfde369d45ce2c83`.
- Accepted Phase 4 baseline: `e46ec24dc662b1bc1588d5ec1c05d4f62739ac3c`.
- Earlier closure refs: P1 `4cec85b5a00e2477f00eee29e2da6025a532e973`,
  P2 `fea9b734b849fa1c6bc953530e1fa425d43cfca8`,
  P3 `5ce0feb4c1967c0dee14919b9c11d56991a46bd0`.
- Developer's standing instruction to implement supplied tasks without intermediate
  review approval, recorded in Editor AGENTS.md, together with delivery of this task
  authorizes execution. This does not infer acceptance from CI or claim separate
  recorded ACCEPTED verdicts for every previous checkpoint.
- Primary owner: **Editor** compatibility policy and explicit migration control.
  Existing content owners supply trusted transformations and canonical validators;
  host owns IO. No collaborating production project or external L1/L2 API changes.
- Preflight: inspect current codec/envelope/diagnostics/load/save/session, root exports,
  manifests and declarations, then add two functions and three readonly contracts in
  one same-owner module. Six changed paths: `editor/src/document-compatibility.ts`,
  `editor/src/index.ts`, `editor/AGENTS.md`, `harness/CONTRACTS.md`,
  `harness/OWNERSHIP.md`, this checkpoint. No workspace Editor consumers found.
- Commands: Harness check/scope/verify with consumers, forced all-five workspace
  build, emitted declaration and strict public-root no-DOM compile. No tests.
- Final SHA and exact-head CI links belong in the existing PR ledger after commit,
  since a commit cannot embed its own hash.

## Current-source audit

Read root AGENTS/ARCHITECTURE/FOUNDATION/README, relevant project guidance,
Harness OWNERSHIP/CONTRACTS/WORKFLOW/VERIFICATION, manifests and current public source
and declarations. Five projects remain unchanged. Root-only package export maps
remain unchanged; no deep cross-project imports or new dependency/package.

| Capability | Baseline | This checkpoint |
| --- | --- | --- |
| Envelope schema 1 / nullable owner-bound content version | IMPLEMENTED v0.5.1 | Unchanged |
| Bounded portable codec, original decoded content | IMPLEMENTED v0.5.5 | Reused before/after transform |
| Canonical Scene/Asset/Spatial/text diagnostics | IMPLEMENTED v0.5.6 | Reused for target validation |
| Load/save/exact-ticket/uncertain guards | IMPLEMENTED v0.5.7–9 | Unchanged; migration does not call them |
| Explicit compatibility inspection / single forward candidate | UNAVAILABLE | IMPLEMENTED DC16 |
| Published historical Document schema migrations | UNAVAILABLE | No invented historical envelope revision |
| Product filesystem adapter / existing-file replacement CAS | UNAVAILABLE / host-only declared capability | Still unavailable |
| General migration registry/chaining/downgrade/recovery | UNAVAILABLE | Still unavailable |
| Future game-config owner binding in Engine | DOCUMENTED_ONLY | No invented owner/validator |
| General unknown-data content integration | Deferred v0.5.11 | No broad implementation here |

Historical evidence: `git show e63981d:editor/src/asset-definition.ts` (v0.2.2)
returns schemaVersion1, identity, kind and metadata, before sources/dependencies
were added. Current createAssetDefinition defaults these missing collections to [].
Current readAssetDefinitionSnapshot requires current fields and rejects unknown
structural fields; arbitrary metadata remains portable/preserved.

The demo therefore uses this real historical Asset shape and explicitly named
**demo document-content profiles 1 -> 2**. It does NOT claim published Asset schema2,
a historical Document schema2 or a production migration catalog. Envelope schema1
and nested Asset.schemaVersion1 remain unchanged; document content binding is
separate from domain schema, package version, session revision and storage token.

Design references consulted for principles only:
[VS Code custom editors](https://code.visualstudio.com/api/extension-guides/custom-editors)
(separate documents/views and host persistence),
[Unity serialization](https://docs.unity3d.com/Manual/script-serialization.html)
(owner-controlled serialized fields),
[Godot saving](https://docs.godotengine.org/en/stable/tutorials/io/saving_games.html)
(explicit data/save control),
[Unreal asset versioning](https://dev.epicgames.com/documentation/en-us/unreal-engine/versioning-of-assets-and-packages-in-unreal-engine)
(version interpretation is explicit). No copied implementation or inherited guarantee.
No actual JXQY ProjectDocumentRegistry/DurableFileTransaction source was available;
no claim of parity.

## Public contract and safety policy

Editor source/emitted root **128 -> 133**, Render **52 -> 52**; previous exports
unchanged. New symbols only:
`inspectDocumentCompatibility`, `migrateDocument`, `DocumentMigration`,
`DocumentCompatibilityResult`, `DocumentMigrationResult`.

- Inspect takes exact text, explicit DocumentValidationContext and optional selected
  migration. Current strict-valid target is writable-compatible; older portable data
  is read-only/migration-needed or migration-unavailable. Read-only does not validate
  the old profile's semantics. Kind mismatch, malformed/future envelope, future
  numeric content and invalid current content are rejected distinctly.
- Only current envelope schema1 can be interpreted. No envelope upgrade is supplied.
  Unversioned/null profiles are inspectable but have no numeric migration step here.
- Migration is opt-in, synchronous, one explicitly named forward source/target step.
  Exact kind/source/target must match. Invalid programmer contracts throw TypeError.
  No transforms during inspection or when current/future/unavailable.
- Callback receives frozen detached source content. Trusted owner callback must
  validate its interpretation of legacy data, be pure, synchronous and perform no IO.
  Purity, semantic correctness and hostile code isolation are NOT mechanically proven.
- Callback output passes existing bounded portable codec before recursive capture.
  Cycles/nonfinite/unsupported/oversized/deep values reject. Transform exceptions
  become safe transform-failed; trusted resolver exceptions still propagate.
- Conservative additive preservation checks every old key and value recursively,
  including unknown fields, identity and references. Array length and positions
  must remain equal. Record additions are allowed; removal, value changes, renaming
  or list expansion are not supported. This is deliberately narrower than a general
  migration engine and does not prove newly added data is semantically safe.
- Canonical target owner/reference diagnostics must be strict-valid. Missing catalog
  or space coverage blocks a candidate; no projection is substituted for original
  content. Frozen candidate plus original text are returned; source envelope remains
  unchanged, with Document/Scene/Asset/Object IDs retained wherever present.
- Every outcome keeps writeEligibility NOT_ESTABLISHED. No session replacement,
  revision/saved baseline change, load/open action, disk write or automatic Save.
  Caller separately adopts candidate as unsaved content and explicitly uses Save.
  A host could intentionally supply another binding, so no global admission policy
  is implied outside these APIs.

## Reproducible ad hoc manual evidence

Executed once from workspace root after build, Node **v24.18.0**, real Windows local
filesystem. No committed executable script/test file or runner. Public package root
only. Re-running selects a fresh ignored directory. Printed results were inspected;
this is bounded manual evidence, not an automated suite.

Selected directory: `.artifacts/document-migration-v0.5.10-1yKF5K`.
Source SHA256 before/after migration and after explicit Save As:
`C00EA2B3BC2703FA5204D18EF87122DCD07DD89B74239393505FA9EFD45E9955`.

Storage host: local fs staging opened wx, full UTF-8 write/sync/close, then hardlink
publication to an absent target. Expected token is **{kind:'absent'}**, no invented
revision/ETag; committed observation identity/revision are null. Stages are retained,
no cleanup hook. Atomic create-only namespace publication is observed; no existing
target replacement CAS, hostile symlink defense or crash/power-loss durability claim.

| Action/input | Observed result |
| --- | --- |
| Inspect historical shape, no path | read-only / migration-unavailable |
| Inspect with named exact step | read-only / migration-needed; transform calls0 |
| Explicit additive historical-shape migration | migrated, content profile2, canonical valid/strict true, diagnostics[] |
| Identity/unknown metadata | stable-asset, manual-project/asset-document unchanged; future vendor/array retained; only sources[]/dependencies[] added |
| Source/session preservation | source hash unchanged; existing session JSON unchanged and dirty true; transform input and metadata frozen |
| No path / wrong source precondition | blocked migration-unavailable |
| Future content99 | rejected future-content; migration blocked source-not-migratable |
| Future envelope2 / malformed JSON | rejected unsupported-envelope / malformed INVALID_JSON |
| Unknown structural extension lost by factory | blocked data-loss |
| Changed assetId / shortened metadata array | blocked data-loss |
| Added missing Asset dependency without catalog | blocked validation-rejected; ASSET_REFERENCES_NOT_CHECKED, strict false |
| Throwing transform | blocked transform-failed; private error not exposed |
| Async transform output | blocked candidate-rejected |
| Save future content with current target binding | validation-diagnostics CONTENT_CONTRACT_MISMATCH, dispatch0; no overwrite |
| Inspect candidate / repeat migrate | writable-compatible current but NOT_ESTABLISHED; already-current, transform calls0 |
| Adopt candidate as new unsaved session | revision1, savedRevision null, dirty true; migration committed writes0 |
| Explicit Save As candidate.json | committed revision1/saved1, dirty false; one real host commit; source unchanged |
| Saved candidate decode | contentSchemaVersion2, envelope/schema1 |

File list after run:
`legacy.json`, `candidate.json`,
`.staged-839c965f-da42-4bc0-830a-a32d6ffe3624`.
Postvalidation/missing-path results never update a session or saved evidence.
Only the separate explicit Save operation clears its new session's dirty state.

Run the following in PowerShell (finite manual transcript, not CI):
~~~powershell
@'
import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import * as E from '@rpg-platform/editor';
const dir=await fs.mkdtemp(path.resolve('.artifacts/document-migration-v0.5.10-')),file=n=>path.join(dir,n),hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const context={owner:'asset',documentKind:'asset',contentSchemaVersion:2};
// Actual v0.2.2 Asset output shape (git e63981d); profile1/2 below are DEMO
// document-content bindings, NOT published Asset or envelope schema versions.
const legacy={schemaVersion:1,identity:{projectId:'manual-project',documentId:'asset-document'},documentKind:'asset',contentSchemaVersion:1,content:{schemaVersion:1,identity:{projectId:'manual-project',assetId:'stable-asset',sourceId:null},kind:'data',metadata:{future:{vendor:'retain',values:[1,'two',null]}}}};
const originalText=JSON.stringify(legacy,null,2)+'\n';await fs.writeFile(file('legacy.json'),originalText,{flag:'wx'});
const before=hash(await fs.readFile(file('legacy.json')));const text=await fs.readFile(file('legacy.json'),'utf8');
const existing=E.createDocumentSession(E.createDocumentEnvelope(legacy),null);existing.open();const sessionBefore=JSON.stringify(existing.getSnapshot());
let transforms=0,commits=0;
const migration={name:'demo-asset-v0.2.2-add-empty-collections',documentKind:'asset',sourceContentSchemaVersion:1,targetContentSchemaVersion:2,transform(content){transforms++;console.log('transform input frozen',Object.isFrozen(content),Object.isFrozen(content.metadata));return E.createAssetDefinition(content);}};
const show=(label,result)=>console.log(label,JSON.stringify(result));
show('inspect legacy without path',E.inspectDocumentCompatibility(text,context));
show('inspect with explicit path',E.inspectDocumentCompatibility(text,context,migration));console.log('inspect transforms',transforms);
const migrated=E.migrateDocument(text,context,migration);show('explicit migrate',migrated);
console.log('legacy bytes hash unchanged',before===hash(await fs.readFile(file('legacy.json'))),'existing session unchanged',sessionBefore===JSON.stringify(existing.getSnapshot()),'existing dirty',existing.getSnapshot().isDirty);
show('missing path',E.migrateDocument(text,context));
show('wrong source precondition',E.migrateDocument(text,context,{...migration,sourceContentSchemaVersion:3,targetContentSchemaVersion:4}));
const newer=JSON.stringify({...legacy,contentSchemaVersion:99});
show('future content',E.inspectDocumentCompatibility(newer,context,migration));show('future content migrate blocked',E.migrateDocument(newer,context,migration));
const futureEnvelope=JSON.stringify({...legacy,schemaVersion:2});show('future envelope',E.inspectDocumentCompatibility(futureEnvelope,context,migration));show('future envelope migrate',E.migrateDocument(futureEnvelope,context,migration));
show('malformed',E.inspectDocumentCompatibility('{BROKEN',context,migration));
const unknownStructural=JSON.stringify({...legacy,content:{...legacy.content,vendorExtension:{sole:'must survive'}}});show('unknown root projection blocked',E.migrateDocument(unknownStructural,context,migration));
show('changed ID blocked',E.migrateDocument(text,context,{...migration,transform(c){return E.createAssetDefinition({...c,identity:{...c.identity,assetId:'changed'}});}}));
show('changed metadata array blocked',E.migrateDocument(text,context,{...migration,transform(c){return E.createAssetDefinition({...c,metadata:{future:{vendor:'retain',values:[1,'two']}}});}}));
show('post-validation rejection',E.migrateDocument(text,context,{...migration,transform(c){return {...c,sources:[],dependencies:[{projectId:'manual-project',assetId:'missing',expectedKind:null,subresourceId:null}]};}}));
show('transform throws',E.migrateDocument(text,context,{...migration,transform(){throw Error('private host details');}}));
show('async transform rejected',E.migrateDocument(text,context,{...migration,async transform(c){return c;}}));
const port={conflictProtection:'create-only',publication:'atomic-publish',async commit(request){
 commits++;const dest=path.resolve(request.locator);if(!dest.startsWith(dir+path.sep)||request.expected.kind!=='absent')return{status:'failed'};
 const staged=file('.staged-'+crypto.randomUUID());let h;
 try{h=await fs.open(staged,'wx');await h.writeFile(request.text,'utf8');await h.sync();}
 finally{if(h)await h.close();}
 try{await fs.link(staged,dest);}catch(e){return{status:e.code==='EEXIST'?'conflicted':'uncertain'};}
 return{status:'committed',confirmation:'manual-create-only-link',observation:{identity:null,revision:null}};
}};
const futureSession=E.createDocumentSession(E.createDocumentEnvelope({...legacy,contentSchemaVersion:99}),null);futureSession.open();show('future save current binding',await E.saveDocument(futureSession,port,file('legacy.json'),{kind:'absent'},context));console.log('future save dispatches',commits);
if(migrated.status==='migrated'){
 const candidateText=E.serializeDocument(migrated.candidate);show('inspect candidate',E.inspectDocumentCompatibility(candidateText,context,migration));
 const callsBefore=transforms;show('already current',E.migrateDocument(candidateText,context,migration));console.log('already current transform calls',transforms-callsBefore);
 const s=E.createDocumentSession(migrated.candidate,null);s.open();show('candidate unsaved snapshot',s.getSnapshot());console.log('migration alone committed writes',commits);
 show('explicit Save As',await E.saveDocument(s,port,file('candidate.json'),{kind:'absent'},context));
 console.log('source unchanged after explicit save',before===hash(await fs.readFile(file('legacy.json'))),'saved candidate contentSchemaVersion',E.deserializeDocument(await fs.readFile(file('candidate.json'),'utf8')).document.contentSchemaVersion);
}
console.log('fixture',path.basename(dir),'Node',process.version,'commits',commits,'files',JSON.stringify(await fs.readdir(dir)));
'@ | node --input-type=module
~~~

Additional public-root manual checks:
~~~powershell
@'
import * as E from '@rpg-platform/editor';
const ctx={owner:'text',documentKind:'headless-notes',contentSchemaVersion:2};
const source=E.serializeDocument(E.createDocumentEnvelope({schemaVersion:1,identity:{projectId:'p',documentId:'d'},documentKind:'headless-notes',contentSchemaVersion:1,content:'hello'}));
console.log('headless text no scene',E.migrateDocument(source,ctx,{name:'same-text-new-profile',documentKind:'headless-notes',sourceContentSchemaVersion:1,targetContentSchemaVersion:2,transform:c=>c}).status);
console.log('kind mismatch',E.inspectDocumentCompatibility(source,{...ctx,documentKind:'other'}).reason);
const current=JSON.parse(source);current.contentSchemaVersion=2;current.content={bad:'not text'};
console.log('current invalid',E.inspectDocumentCompatibility(JSON.stringify(current),ctx).reason);
for(const [name,transform] of [['cycle',()=>{const o={};o.self=o;return o;}],['too-deep',()=>{let o={};for(let i=0;i<70;i++)o={child:o};return o;}],['nonfinite',()=>Infinity]])console.log(name,E.migrateDocument(source,ctx,{name,documentKind:'headless-notes',sourceContentSchemaVersion:1,targetContentSchemaVersion:2,transform}).reason);
'@ | node --input-type=module
~~~
Observed: headless text with no Scene migrated; kind mismatch = kind-mismatch;
current invalid text = validation-rejected; cyclic/deep/nonfinite outputs each
candidate-rejected. Text profile demonstration is explicit, no gameplay schema.

## Verification and immutable scope

| Command/audit | Observed |
| --- | --- |
| npm run build --workspace @rpg-platform/editor | PASS, genuine tsc build |
| node harness/cli.mjs check | ARCH_CHECK_PASS:67 JS/TS files |
| node harness/cli.mjs scope --projects editor --allow-infra | SCOPE_PASS:6 paths after report creation |
| node harness/cli.mjs verify --projects editor --with-consumers | BUILD_PASS editor; no current Editor consumer projects |
| npm run build -- --force | PASS all five project references |
| Strict public-root consumer of five new symbols + serializeDocument | 0 diagnostics; ES2022 only, types:[], strict, skipLibCheck:false, NodeNext; ignored compile artifact only |
| Source/emitted root inventory | Editor133/133, Render52/52; declarations expose public types, no platform leaks |
| npm run foundations:prepare | FOUNDATIONS_READY, both artifact bytes match exact pins |
| git diff --check | PASS |
| Exact-head push/PR Foundation build CI | Recorded post-push in PR ledger |

Direct invocation of prepare-foundations without npm initially rejected its required
npm CLI context; corrected to the repository-prescribed npm script above. This was
not an artifact/build failure. Existing Harness child-process DEP0190 warning remains;
no tooling scope expansion.

Core **2.0.0 / 04b7239f998c3c688a0dfa3202f11811a9acd775** and Gameplay
**0.15.2 / acea332aa80f67552192a72b30f81c0bbbfc56bd** unchanged; cached SHA512
integrities match pins. No manifests, locks, pins, workflows, other project source,
domain schema, export map or dependencies changed. Static scanning is limited to
configured import constraints, not a full semantic proof.

## Remaining limits and stop boundary

No UI, browser, visual, E2E, unit/integration/snapshot tests or test frameworks added
or executed. No universal migration acceptance or functional/visual certification.
No published envelope migration, general destructive transformation, chaining,
downgrade, registry, file adapter, automatic open/adopt/save, recovery/unlock, CAS
replacement or project-wide upgrade. No gameplay or Render state persistence.

Future stress cases (multiple views, large maps, 2D/2.5D, late acknowledgement,
different storage adapters, Client export and headless Server) do not gain new
contracts from this checkpoint. Existing stable IDs, revision separation and host
guarantees remain authoritative. General unknown-data/content integration remains
**v0.5.11, not authorized here**.

**READY_FOR_DEVELOPER_REVIEW**. Stop; no merge/tag/release/publish or next version.
