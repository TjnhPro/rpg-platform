# v0.5.1 — Document Identity & Schema Envelope

DC02 / DC03. **READY_FOR_DEVELOPER_REVIEW**.
Identity and portable envelope capture are implemented; the limited headless manual
observations below are not general Document/persistence verification.

## Baseline, authorization and preflight

- Phase 4 integration baseline: `e46ec24dc662b1bc1588d5ec1c05d4f62739ac3c`.
- Previous checkpoint / source HEAD before this change:
  `7b745bac9ae5dc71ade506d037fa16be17565751` (v0.5.0 DC01).
- Continue `feat/editor-document-contracts-v0.5` and [Phase 5 PR #5](https://github.com/TjnhPro/rpg-platform/pull/5);
  no base switch, new PR, merge, tag or release.
- Developer supplied this next task after the v0.5.0 handoff, with the standing
  instruction to implement without requesting intermediate review. This is the
  session authorization to proceed; it does not turn CI into Developer acceptance.
- Read root/project guidance, architecture, Foundation, README, Harness ownership,
  contracts/workflow/verification, manifests, current source/index and declarations.
  Harness route suggested Editor; authored Document ownership confirms it.
- Primary owner **Editor**. Render is inspected/built only. Engine/Client/Server
  and L1/L2 are unchanged; no new external foundation API is needed.
- Planned/actual scope: `editor/src/document-envelope.ts`, `editor/src/index.ts`,
  `editor/AGENTS.md`, `harness/CONTRACTS.md`, `harness/OWNERSHIP.md` and this report.
  No old Asset/Scene/Spatial implementation, manifest, dependency, pin, lock or
  workflow changes. Exactly five projects.

The v0.5.0 export baseline is Editor **90**, Render **52**. Prior Phase 1–4
integration exports remain 8/14, 43/17, 74/17, 90/52 respectively, at the exact
SHAs recorded in [DC01](document-v0.5.0.md). Current source/emitted declarations
match **97/97 Editor**, **52/52 Render**; all seven additions belong to this task.
The package export map remains root-only. A strict public-root consumer compiles
both new factories/types and existing Asset/Scene/Spatial/Render composition
without DOM libraries, private imports or skipLibCheck.

## Public contract and source decisions

Seven additive root symbols, with no baseline removals/signature changes:

| Symbol | Actual responsibility |
| --- | --- |
| DocumentIdentity | readonly projectId + documentId |
| createDocumentIdentity(input: DocumentIdentity): DocumentIdentity | Exact-field validation and detached frozen key |
| DocumentContentValue / DocumentContentRecord | Readonly portable value tree, not a game/content schema |
| DocumentEnvelopeInput | Explicit schemaVersion:1, identity, documentKind, contentSchemaVersion, content:unknown |
| DocumentEnvelope | Same envelope metadata with captured content:DocumentContentValue |
| createDocumentEnvelope(input: DocumentEnvelopeInput): DocumentEnvelope | Schema-1 construction, metadata validation and deeply detached/frozen content |

ID comparison uses both projectId and documentId, case-sensitively, matching current
Asset/Scene key conventions: nonempty strings without whitespace, no trimming,
case folding, Unicode normalization, coercion or generation. The key is stable
because callers retain/provide it, not because a registry enforces uniqueness.
A content ID can have the same spelling in a different logical namespace; no
inequality or relationship is inferred. Kind is another exact open whitespace-free
string; it neither contributes to identity nor proves supported content semantics.

| Domain | Current decision / limit |
| --- | --- |
| Envelope schemaVersion | Caller explicitly supplies exactly 1; other/missing versions reject. This versions the envelope shape, not a codec |
| contentSchemaVersion | Caller explicitly supplies a positive safe integer or null. Null means the canonical owner has no content schema version, not unknown future compatibility |
| Asset content | Existing AssetDefinition schemaVersion 1 remains content-owned; wrapper does not validate equality or change its interpretation |
| Scene/spatial content | Currently unversioned; use null rather than inventing a version in their records |
| Codec format version | No codec exists; no formatVersion field or conversion is introduced |
| Editing/saved revision, package semver, storage token | Separate domains, absent from this envelope; never inferred from schema numbers |
| Storage location | Host/caller binding outside the authored envelope; no OS path schema or rebinding API |
| Display name and UI state | Existing Object displayName is authored payload data. No universal document title, tab ID, selection or zoom field is introduced |

`content: unknown` permits existing typed owner snapshots at input without an
unsafe generic cast. The factory validates physical portability and returns the
declared readonly value tree; it does **not** validate documentKind against content,
content-schema compatibility, cross-project references or game rules. Callers select
authored content and use canonical owner validation first. A plain record describing
UI state is not recognizable as UI by shape alone; do not supply it as authored data.

Capture reuses unchanged `detachPortableAssetData` inside Editor, avoiding another
recursive copier/serializer or Asset/Scene/Spatial validator. New public declarations
contain only the seven public Document symbols and built-in types; the internal
helper and its Asset diagnostic implementation do not appear in those declarations.
Invalid input throws TypeError (possibly an internal subclass); no new diagnostic
classifier/error union is public. Host/proxy exceptions and recursion/resource
limits are not a new sandbox guarantee.

Supported payloads: finite primitives except negative zero, null, dense arrays and
plain enumerable data records (ordinary or null prototype). Every nested container
is detached/frozen. Dates/classes/DOM/Render handles, functions, undefined, bigint,
symbols, accessors, nonenumerable or custom array properties, cycles and nonfinite
numbers reject under the existing portability rules. A spatial snapshot containing
negative zero is outside this selected profile; there is no implicit normalization
or change to Phase 4 semantics.

Unknown **portable content** fields are retained recursively, including safe own
`__proto__` data keys by the existing detacher. Envelope/identity records require
exact known enumerable own data fields: unknown/symbol/hidden/accessor keys or
custom prototypes reject, never silently drop. Future envelope schema versions
reject. Caller must retain original input on failure. Capture is not a decoder,
migration or permission to overwrite a future file; no unknown-data write profile
is claimed.

## Actual capability and consumer boundary

| Capability | Status after this checkpoint |
| --- | --- |
| Explicit Document identity / schema-1 immutable portable envelope | IMPLEMENTED |
| Existing Asset/Scene/Spatial factories, validation and presentation adapters | IMPLEMENTED, unchanged; reuse their own rules |
| Content kind/schema-specific Document profiles, session state and editing operations | UNAVAILABLE; no registry or automatic owner dispatch |
| Dirty/current/saved revision, codec, Create/Open/Save/Load/migration and storage host | UNAVAILABLE; no mock implementation |
| Game-specific config schema validation | UNAVAILABLE at current Engine root; remains future L3 ownership |
| L2 gameplay archive/persistence | Separate external foundation capability, not used/replaced by this envelope |

Graph unchanged: Engine -> L1/L2; Render -> private Three backend; Editor/Client ->
Engine+Render; Server -> Engine. No workspace project imports Editor, so
`--with-consumers` selects Editor only. Client exports do not gain an Editor
dependency; Server does not acquire graphics. Render is unchanged at 52 symbols.

The [DC01 research](document-v0.5.0.md#research-six-lessons-and-limits) remains the
architecture basis. Reopened [VS Code](https://code.visualstudio.com/api/extension-guides/custom-editors),
[Unity](https://docs.unity3d.com/Manual/script-serialization.html),
[Godot](https://docs.godotengine.org/en/stable/tutorials/io/saving_games.html) and
[Unreal](https://dev.epicgames.com/documentation/en-us/unreal-engine/versioning-of-assets-and-packages-in-unreal-engine).
Local design inference: separate views/storage from authored identity, explicitly
select portable data, and keep version domains distinct. No foreign document
manager, serializer or versioning engine is copied. JXQY pinned source observations
remain the limited inspection recorded in DC01, not newly executed product proof.

## Reproducible manual API observation (no test files)

After the real Editor build, run the following as Node ESM stdin from workspace
root (`node --input-type=module`). It imports only the public root, prints actual
results, uses no runner/assertion library, and is not added to CI:

```js
import {
  createDocumentIdentity, createDocumentEnvelope, createSceneDefinition,
} from '@rpg-platform/editor';
const scene = createSceneDefinition({
  identity: { projectId: 'project-01', sceneId: 'scene-zone-01' },
});
const identity = { projectId: 'project-01', documentId: 'doc-zone-01' };
const notes = { lines: ['original'], future: { vendorFlag: true } };
const input = {
  schemaVersion: 1, identity, documentKind: 'scene', contentSchemaVersion: null,
  content: { scene, notes },
};
const first = createDocumentEnvelope(input);
const second = createDocumentEnvelope({
  ...input, identity: { projectId: 'project-01', documentId: 'doc-zone-02' },
});
identity.documentId = 'changed-by-caller';
notes.lines[0] = 'changed-by-caller';
notes.future.vendorFlag = false;
console.log('documents', first.identity, second.identity,
  first.content.scene.identity, second.content.scene.identity);
console.log('captured', JSON.stringify(first.content));
console.log('frozen', Object.isFrozen(first), Object.isFrozen(first.identity),
  Object.isFrozen(first.content), Object.isFrozen(first.content.notes),
  Object.isFrozen(first.content.notes.lines), Object.isFrozen(first.content.notes.future));
const binding = { location: 'host-slot:one', envelope: first };
binding.location = 'host-slot:two';
console.log('caller-binding-only', binding.location, binding.envelope === first,
  binding.envelope.identity.documentId, binding.envelope.content.scene.identity.sceneId);
console.log('text', createDocumentEnvelope({
  schemaVersion: 1, identity: { projectId: 'project-01', documentId: 'doc-text-01' },
  documentKind: 'text', contentSchemaVersion: 2, content: 'A text-only RPG chapter',
}));
console.log('case', createDocumentIdentity({ projectId: 'P', documentId: 'Doc' }),
  createDocumentIdentity({ projectId: 'P', documentId: 'doc' }));
try { createDocumentIdentity({ projectId: 'project-01', documentId: '' }); }
catch (e) { console.log('blank-id', e instanceof TypeError, e.message); }
try { createDocumentEnvelope({ ...input, documentKind: ' ' }); }
catch (e) { console.log('blank-kind', e instanceof TypeError, e.message); }
try { createDocumentEnvelope({ ...input, contentSchemaVersion: 0 }); }
catch (e) { console.log('zero-content-version', e instanceof TypeError, e.message); }
try { createDocumentEnvelope({ ...input, contentSchemaVersion: 1.5 }); }
catch (e) { console.log('fractional-content-version', e instanceof TypeError, e.message); }
try { createDocumentEnvelope({ ...input, schemaVersion: 2 }); }
catch (e) { console.log('future-envelope', e instanceof TypeError, e.message); }
const future = { ...input, futureEnvelopeField: true };
try { createDocumentEnvelope(future); }
catch (e) { console.log('unknown-envelope', e instanceof TypeError, future.futureEnvelopeField, e.message); }
try { createDocumentEnvelope({ ...input, content: new Date(0) }); }
catch (e) { console.log('host-instance', e instanceof TypeError, e.message); }
console.log('envelope-fields', Object.keys(first));
```

Expected vs observed on Node 24.18.0:

| Action / expected boundary | Observed |
| --- | --- |
| Two envelopes wrap the same owner-created Scene | doc-zone-01 / doc-zone-02 both retain scene-zone-01 in project-01; no coalescing |
| Mutate caller identity and nested content after creation | First key remains doc-zone-01; lines remains ["original"]; future.vendorFlag remains true |
| Inspect frozen nested containers | Envelope, identity, content, notes, lines and future all report true |
| Change the caller's location binding | host-slot:two; same envelope reference and unchanged doc-zone-01 / scene-zone-01. This is caller-side metadata, not product relocation/IO |
| Text-only content | schemaVersion 1, contentSchemaVersion 2, kind text, plain string; no Scene/coordinates/viewport |
| Case policy | Doc and doc retained as distinct exact keys in project P |
| Blank ID / blank kind | TypeError; nonempty whitespace-free key required |
| Content version 0 / 1.5 | TypeError; positive safe integer or explicit null required |
| Envelope version 2 | TypeError; only envelope schema 1 supported |
| Unknown envelope field | TypeError; caller's futureEnvelopeField still true (no write/projection) |
| Date instance as content | TypeError from existing portable-data capture |
| Inspect envelope fields | Exactly schemaVersion, identity, documentKind, contentSchemaVersion, content; no dirty/save/session fields |

This is limited headless API evidence. No bytes are loaded or committed, no storage
host exists, and no visual/editor product behavior is exercised. General Document
lifecycle and persistence remain **FEATURE_NOT_VERIFIED / NOT_VERIFIED**; no
SAFE_SAVE_PASS, MIGRATION_PASS or phase acceptance.

## Verification and remaining decisions

Required gates: `check`, `scope --projects editor --allow-infra`,
`verify --projects editor --with-consumers`, forced workspace build and emitted
declaration/public-root compilation. Exact final-HEAD gate and push/PR CI evidence
will be recorded in PR #5 after the single checkpoint commit.

Observed before commit: ARCH_CHECK_PASS **60** JS/TS files; Editor BUILD_PASS;
forced build of all five projects PASS; strict in-memory public-root declaration
consumer **0 diagnostics** (NodeNext/ES2022, types:[], no DOM, skipLibCheck:false).
Source/emitted name sets match 97/97 and 52/52. No private helper/Three/DOM types
in the new declarations. Scope and whitespace gates accompany the final commit.
Existing Windows DEP0190 warning is nonblocking. No test files/runners/suites,
browser/UI/E2E or historic exhaustive tests were created/run.

Existing installed artifact hashes still match pins: Core 2.0.0 at
`04b7239f998c3c688a0dfa3202f11811a9acd775`, Gameplay 0.15.2 at
`acea332aa80f67552192a72b30f81c0bbbfc56bd`. No upstream modification, re-pin or
new public L1/L2 usage.

No blocker remains for DC02/DC03. Open: owner-specific content compatibility,
workspace/session adoption, revision/commit correlation, codecs, host guarantees,
readonly policy and explicit migration. No .2 behavior is implemented.
The supplied next task is **v0.5.2 — Document State & Content Isolation**;
that title supersedes DC01's provisional allocation, not an approved implementation.
Stop here; no merge, tag, release, publication or next-version implementation.
**READY_FOR_DEVELOPER_REVIEW**.
