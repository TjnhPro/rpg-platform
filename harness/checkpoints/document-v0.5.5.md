# v0.5.5 — Serialization & Deserialization Contracts

DC10. **READY_FOR_DEVELOPER_REVIEW**. Manual codec observations below are finite
in-memory evidence, not save/load, visual or phase acceptance. Stop before v0.5.6.

## Baseline, authorization and scope

- Accepted Phase 4 integration baseline: `e46ec24dc662b1bc1588d5ec1c05d4f62739ac3c`.
- Previous checkpoint/source HEAD v0.5.4 DC07/DC08:
  `661304dc146ca6138d9d74f3f1d06b19e873bf89`; initially clean local/origin/PR.
- Continue `feat/editor-document-contracts-v0.5`, same [draft PR #5](https://github.com/TjnhPro/rpg-platform/pull/5).
  One checkpoint commit; final SHA and exact-head push/PR CI go in the PR ledger
  and handoff, outside this self-referential commit. No merge/tag/release/publish.
- Developer supplied this task with standing instruction to implement/verify
  without intermediate review questions. This authorizes v0.5.5 only.
- Read root AGENTS/architecture/FOUNDATION/README, Harness ownership/contracts/
  workflow/verification, Editor/Render AGENTS, manifests and actual source/public
  indexes/emitted declarations. Route hints Editor; canonical primary owner is
  **Editor — portable authored document codec**. No owner ambiguity/dependency
  change, no Render or external L1/L2 API change.
- Six paths: editor/src/document-codec.ts, editor/src/index.ts, editor/AGENTS.md,
  harness/CONTRACTS.md, harness/OWNERSHIP.md, this report. Only Editor production
  source changes. No manifests/locks/pins/workflow or other project source changes.
- No workspace project imports Editor. verify --with-consumers selects Editor;
  the forced workspace build also compiles all five projects independently.

## Audit and contract decisions

Identity/envelope, immutable content capture, session lifecycle, revision/dirty/
host-confirmed saved baseline were IMPLEMENTED before this change. A portable
guard already rejects unsupported graphs and detaches/freezes unknown fields,
using safe own-property construction. Codec was DOCUMENTED_ONLY / UNAVAILABLE.
This change implements DC10 only; load/save adapters, owner-aware document
diagnostics and migration remain UNAVAILABLE. No JXQY registry/transaction source
exists here; no external behavior is assumed.

Reference principles consulted without implementation copying:

- [ECMAScript JSON](https://tc39.es/ecma262/multipage/structured-data.html#sec-json.parse):
  native grammar/numeric/property-order behavior, not arbitrary precision.
- [VS Code custom editors](https://code.visualstudio.com/api/extension-guides/custom-editors):
  model serialization stays separate from views and storage lifecycle.
- [Unity serialization](https://docs.unity3d.com/Manual/script-serialization.html):
  supported data representation does not make live host objects authored data.
- [Godot saving](https://docs.godotengine.org/en/stable/tutorials/io/saving_games.html):
  selecting/serializing data and actual storage are separate.
- [Unreal versioning](https://dev.epicgames.com/documentation/en-us/unreal-engine/versioning-of-assets-and-packages-in-unreal-engine):
  explicit version domains; no automatic migration here.

Four additive root symbols: serializeDocument, deserializeDocument,
DocumentDecodeDiagnostic, DocumentDecodeResult. Editor source/emitted **109/109**
(previous 105); Render unchanged **52/52**. Export maps remain package-root-only.
Historical counts remeasured from actual indexes: Phase 1 Editor8/Render14,
Phase 2 43/17, Phase 3 74/17, Phase 4 90/52.

```ts
serializeDocument(document: DocumentEnvelope): string
deserializeDocument(text: string): DocumentDecodeResult
// {status:'decoded', document} | {status:'rejected', diagnostic:{code,message}}
```

| Policy | Implementation |
| --- | --- |
| Envelope | Existing exact schemaVersion 1 / identity / documentKind / contentSchemaVersion / content capture; no additional schema validator |
| Payload | Existing portable value guard; unknown nested authored fields preserved. No independent Scene/Asset/Spatial interpretation |
| Encode errors | Unsupported values throw TypeError (existing internal subclass may name itself AssetValidationError); resource limits throw RangeError. Native host/Proxy exceptions propagate |
| Decode errors | Frozen rejected result with fixed safe code/message; no echoed source/native exception, empty fallback or executable reviver |
| Codes | INVALID_INPUT, INVALID_JSON, DUPLICATE_KEY, LIMIT_EXCEEDED, UNSUPPORTED_SCHEMA, INVALID_ENVELOPE |
| Versions | Unsupported numeric envelope versions reject; malformed/missing version invalid. contentSchemaVersion preserved without owner compatibility inference |
| Duplicates | Lexical preguard rejects duplicate decoded object keys including escaped equivalents; JSON.parse is final grammar authority. Duplicate/limit may precede syntax error |
| Unsafe keys | __proto__, constructor, prototype and unusual Unicode keys stay own authored data; never merge into prototypes |
| Bounds | 1,048,576 UTF-16 input/output units and aggregate graph string/key units; 64 container levels (root=1); 100,000 value occurrences including root. Keys are not value occurrences |
| Graph | Bound traversal before existing recursive canonical capture; cycles reject, shared records copied by value, no shared object identity preservation |
| Numeric | Finite binary64 excluding -0; native parse can round decimals/large integers or underflow. Precision-sensitive values/IDs must be strings |
| Representation | Compact native JSON, no BOM/newline/sort; ECMAScript key order and number rendering. Stable for same captured input, no semantic/cryptographic canonical equality |
| Session/IO | No session capability is accepted or adopted, no dirty/revision/saved change, no filesystem/browser/storage import, IO or save authorization |

Limits are a fixed codec profile, not a configurable storage format or universal
memory guarantee. An encoder Proxy can run traps/throw native exceptions; the
untrusted decoder accepts text only. Accessor/toJSON callbacks are not invoked
by canonical data serialization. A portable plain record cannot be semantically
classified as UI versus authored content: the host must select the authored
envelope. Extra top-level tab/session fields reject; plain misplaced content
needs its actual owner validation. Decode success grants neither schema
compatibility nor write permission.

## Reproducible manual public-root observations

Executed ad hoc from repository root after genuine builds, not added as a test,
script, runner, automatic suite or CI gate. Input uses real Phase 2/3/4 factories;
decoded data is explicitly recaptured by its canonical owners. Owner validation
is a caller action, not built into this codec or a v0.5.6 implementation.

```powershell
@'
import * as E from '@rpg-platform/editor';
const projectId='project-01';
const space=E.createCoordinateSpaceDefinition({reference:{projectId,coordinateSpaceId:'space-01'},componentCount:2,axes:{x:'right',y:'up'},origin:{x:0,y:0},unit:'tile'});
const scene=E.createSceneMembership({scene:{identity:{projectId,sceneId:'scene-01'}},objects:[{definition:{objectId:'object-0012'},assetReference:{projectId,assetId:'asset-01'}}]});
const placed=E.updateSceneObjectSpatialPlacement(scene,'object-0012',space,{space:space.reference,point:{x:2.25,y:-3.5}});
const metadata=JSON.parse('{"vendor":{"future":{"enabled":true,"labels":["0012"]}},"__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}},"strange.key / 雪":"kept"}');
const asset=E.createAssetDefinition({identity:{projectId,assetId:'asset-01',sourceId:'0012'},kind:'image',metadata});
const doc=E.createDocumentEnvelope({schemaVersion:1,identity:{projectId,documentId:'doc-0012'},documentKind:'content',contentSchemaVersion:null,content:{scene:placed,asset,space}});
const session=E.createDocumentSession(doc,null);session.open();
const before=session.getSnapshot(), text=E.serializeDocument(before.envelope), result=E.deserializeDocument(text);
console.log('roundtrip',result.status);
if(result.status!=='decoded')throw Error('roundtrip rejected');
const restored=result.document;
console.log('identity',JSON.stringify(restored.identity),restored.content.asset.identity.sourceId,restored.content.scene.objects[0].definition.objectId);
console.log('spatial',JSON.stringify(restored.content.scene.objects[0].placement.point));
console.log('unknown',JSON.stringify(restored.content.asset.metadata),Object.hasOwn(restored.content.asset.metadata,'__proto__'),({}).polluted===undefined);
console.log('owner-recapture',E.createSceneMembership(restored.content.scene).objects.length,E.readAssetDefinitionSnapshot(restored.content.asset).identity.sourceId,E.createCoordinateSpaceDefinition(restored.content.space).unit);
console.log('frozen/detached',Object.isFrozen(restored.content.asset.metadata.vendor.future.labels),restored!==doc,restored.content!==doc.content);
console.log('stable',text===E.serializeDocument(restored));
console.log('session-unchanged',JSON.stringify(before)===JSON.stringify(session.getSnapshot()),before.currentRevision,before.savedRevision,before.isDirty);
const textDoc=E.createDocumentEnvelope({...doc,documentKind:'text',content:'Chapter 0012'});
console.log('text-only',E.deserializeDocument(E.serializeDocument(textDoc)).status);
let getters=0;const accessor={get x(){getters++;return 1;}};
const cycle={};cycle.self=cycle;
const cases={nan:NaN,infinity:Infinity,negativeZero:-0,undefined,callback(){},symbol:Symbol('x'),bigint:1n,date:new Date(),classInstance:new(class X{})(),cycle,sparse:Array(2),accessor,toJSON:{toJSON(){getters++;return 'bad';}}};
for(const [name,content]of Object.entries(cases)){try{E.serializeDocument({...doc,content});console.log('UNEXPECTED-ENCODE',name);}catch(e){console.log('encode-rejected',name,e.constructor.name);}}
console.log('callbacks-executed',getters);
const base=JSON.stringify({...doc,content:null});
const decodeCases={
invalidInput:null,malformed:'{',duplicate:'{"schemaVersion":1,"schemaVersion":1}',
escapedDuplicate:'{"x":1,"\\u0078":2}',future:base.replace('"schemaVersion":1','"schemaVersion":2'),
invalidShape:'{}',extraEnvelope:JSON.stringify({...doc,tabId:'tab'}),
overflow:base.replace('"content":null','"content":1e400'),negativeZero:base.replace('"content":null','"content":-0'),
size:' '.repeat(1048577),depth:base.replace('"content":null','"content":'+'['.repeat(65)+'0'+']'.repeat(65)),
values:JSON.stringify({...doc,content:Array(100000).fill(null)})
};
for(const[name,input]of Object.entries(decodeCases)){const r=E.deserializeDocument(input);console.log('decode',name,r.status,r.status==='rejected'?r.diagnostic.code:'UNEXPECTED',Object.isFrozen(r));}
const precision=E.deserializeDocument(base.replace('"content":null','"content":9007199254740993'));
console.log('binary64-limit',precision.status==='decoded'?precision.document.content:precision);
const a=E.createDocumentEnvelope({...doc,content:{a:1,b:2}}),b=E.createDocumentEnvelope({...doc,content:{b:2,a:1}});
console.log('insertion-order-distinct',E.serializeDocument(a)!==E.serializeDocument(b));
console.log('authored-only-top-level',Object.keys(restored).join(','),'polluted',({}).polluted);
'@ | node --input-type=module
```

Observed (Node 24.18.0 / npm 12.2.0):

```text
roundtrip decoded
identity {"projectId":"project-01","documentId":"doc-0012"} 0012 object-0012
spatial {"x":2.25,"y":-3.5}
unknown {"vendor":{"future":{"enabled":true,"labels":["0012"]}},"__proto__":{"polluted":true},"constructor":{"prototype":{"polluted":true}},"strange.key / 雪":"kept"} true true
owner-recapture 1 0012 tile
frozen/detached true true true
stable true
session-unchanged true 1 null true
text-only decoded
encode-rejected nan AssetValidationError
encode-rejected infinity AssetValidationError
encode-rejected negativeZero AssetValidationError
encode-rejected undefined AssetValidationError
encode-rejected callback AssetValidationError
encode-rejected symbol AssetValidationError
encode-rejected bigint AssetValidationError
encode-rejected date AssetValidationError
encode-rejected classInstance AssetValidationError
encode-rejected cycle TypeError
encode-rejected sparse AssetValidationError
encode-rejected accessor TypeError
encode-rejected toJSON AssetValidationError
callbacks-executed 0
decode invalidInput rejected INVALID_INPUT true
decode malformed rejected INVALID_JSON true
decode duplicate rejected DUPLICATE_KEY true
decode escapedDuplicate rejected DUPLICATE_KEY true
decode future rejected UNSUPPORTED_SCHEMA true
decode invalidShape rejected INVALID_ENVELOPE true
decode extraEnvelope rejected INVALID_ENVELOPE true
decode overflow rejected INVALID_ENVELOPE true
decode negativeZero rejected INVALID_ENVELOPE true
decode size rejected LIMIT_EXCEEDED true
decode depth rejected LIMIT_EXCEEDED true
decode values rejected LIMIT_EXCEEDED true
binary64-limit 9007199254740992
insertion-order-distinct true
authored-only-top-level schemaVersion,identity,documentKind,contentSchemaVersion,content polluted undefined
```

The unchanged session remains revision1/saved=null/dirty=true; serialization
does not provide save evidence. No storage call can originate from this pure
module (no IO/host port imports). No physical bytes/adapter were observed.
The binary64 example deliberately shows rounding, not lossless-number support.
No general behavioral PASS is inferred from these finite manual observations.

## Build/static/declaration evidence

Commands (also rerun at final commit; exact-head CI recorded externally):

```powershell
node harness/cli.mjs check
node harness/cli.mjs scope --projects editor --allow-infra
node harness/cli.mjs verify --projects editor --with-consumers
npm run build -- --force
```

- ARCH_CHECK_PASS: **62 JS/TS files**.
- SCOPE_CHECK_PASS: six changed paths, Editor plus directly related Harness docs.
- Editor with consumers: BUILD_PASS. All five projects forced workspace build:
  runtime-engine, runtime-render, editor, game-client, game-server BUILD_PASS.
- TypeScript checker public symbol audit: source/emitted109/109 and52/52,
  no differences. Strict in-memory NodeNext/ES2022 package-root consumer of new
  codec/result/diagnostic and existing session/Scene/Asset/Spatial/Render APIs:
  **zero diagnostics**, lib.es2022 only, types:[], skipLibCheck:false; no DOM.
- Unchanged core2.0.0 `04b7239f998c3c688a0dfa3202f11811a9acd775`,
  gameplay0.15.2 `acea332aa80f67552192a72b30f81c0bbbfc56bd`;
  both artifact SHA512 hashes match foundation pins.
- Windows DEP0190 shell warning is existing tooling output, not a failed build.
  Static checker examines declared imports/boundaries, not arbitrary runtime
  behavior or visual correctness. No new test files/frameworks or automatic
  runtime/UI/E2E suites; no historic exhaustive tests run.

## Open boundaries

**READY_FOR_DEVELOPER_REVIEW**, not ACCEPTED. No blocker within DC10.
Persistence/load/save, atomic writes, storage-token conflict handling, owner-aware
document reference diagnostics, migration, UI/visual behavior and gameplay remain
**FEATURE_NOT_VERIFIED / unavailable here**. Late acknowledgements remain the
v0.5.4 trusted-host seam; codec does not change it. Decoder rejects future envelope
versions rather than retaining a writable lossy fallback. Future compatibility/
read-only/write policies require their own task. Stop before v0.5.6.
