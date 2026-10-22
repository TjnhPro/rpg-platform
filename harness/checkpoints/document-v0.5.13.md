# v0.5.13 — Document Foundation Integration & MVP Closure (DC19)

**READY_FOR_DEVELOPER_REVIEW.** Integration/closure audit only; no new production
capability, API, schema or ownership change. Developer decides Phase 5 acceptance.
No merge, tag, release, publication or Feature 06 work is authorized here.

## Exact baseline, authorization and preflight

- Repository: https://github.com/TjnhPro/rpg-platform
- Existing branch: `feat/editor-document-contracts-v0.5`; existing draft
  [PR #5](https://github.com/TjnhPro/rpg-platform/pull/5), base `main` unchanged.
- Accepted Phase 4 baseline / current origin/main:
  `e46ec24dc662b1bc1588d5ec1c05d4f62739ac3c`.
  Prior accepted-phase closure refs: Phase 1
  `4cec85b5a00e2477f00eee29e2da6025a532e973`, Phase 2
  `fea9b734b849fa1c6bc953530e1fa425d43cfca8`, Phase 3
  `5ce0feb4c1967c0dee14919b9c11d56991a46bd0`.
- Previous checkpoint / audited pre-change HEAD, origin branch and PR head:
  `06d5ee61b660786f1a750df25993d62e5ae1d197` (v0.5.12).
- Developer's standing session instruction explicitly permits implementing supplied
  tasks without intermediate approval. Delivery of this closure task authorizes
  its audit; it does not establish a separate ACCEPTED verdict for every previous
  checkpoint. Prior merge instructions identify the accepted phase baselines;
  green CI alone is never treated as Developer approval.
- Primary owner: **Editor**, authored Document integration review. Harness carries
  evidence/guidance only. Render is read/build-only. Engine/Client/Server and L1/L2
  have no implementation role in this closure. No new L1/L2 API is used.
- Planned and actual closure scope: four Markdown files: this checkpoint,
  `editor/AGENTS.md`, `harness/CONTRACTS.md`, `harness/OWNERSHIP.md`.
- Public contract delta at closure: **zero**. No TS/JS, generated declarations,
  manifests, locks, foundation pins, build configuration or CI workflow changes.
- Final closure SHA cannot be embedded in its own commit. The post-push PR ledger
  records the exact SHA, fourteen-row ledger and exact-head CI. Resolve locally:
  `git log -1 --format=%H -- harness/checkpoints/document-v0.5.13.md`.

Read root AGENTS/ARCHITECTURE/FOUNDATION/README, Harness OWNERSHIP/CONTRACTS/
WORKFLOW/VERIFICATION, Editor/Render AGENTS, all project manifests/configs, current
public roots, Document source and emitted declarations; inspect the exact phase
diff and prior checkpoint evidence. Route CLI hints Editor; behavior/source
ownership makes that decision. No unknown or multiple canonical owner was invented.

## Fourteen-checkpoint ledger

All rows are Editor-owned; Harness is tooling/evidence, not another project.
Execution is authorized; individual checkpoint and final phase **acceptance remain
Developer-owned/open**, not inferred from the verification column. Historical
builds/manual observations are the linked checkpoint records, not newly rerun at
each historical revision. Final source is rebuilt at closure.

| Version | Exact checkpoint SHA | API delta | Owner | Verification | Developer acceptance |
| --- | --- | --- | --- | --- | --- |
| [v0.5.0](document-v0.5.0.md) | `7b745bac9ae5dc71ade506d037fa16be17565751` | Architecture only; root90 | Editor | [push:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39773380993); [pull_request:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39773432047) | OPEN |
| [v0.5.1](document-v0.5.1.md) | `390f7520a17fdffe40e387392e1719580a221562` | Identity/envelope +7; root97 | Editor | [push:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39774431721); [pull_request:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39774438683) | OPEN |
| [v0.5.2](document-v0.5.2.md) | `8803183972a20f0163e375c56b1f8f70a21203b5` | replaceDocumentContent +1; root98 | Editor | [push:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39775435420); [pull_request:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39775441869) | OPEN |
| [v0.5.3](document-v0.5.3.md) | `677be4099ffa0ad6c56171ec722fccbe137b4510` | Session/lifecycle +3; root101 | Editor | [push:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39776222837); [pull_request:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39776229482) | OPEN |
| [v0.5.4](document-v0.5.4.md) | `661304dc146ca6138d9d74f3f1d06b19e873bf89` | Dirty/revision/tickets +4; Session shape extended; root105 | Editor | [push:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39777192258); [pull_request:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39777197838) | OPEN |
| [v0.5.5](document-v0.5.5.md) | `a46176eb94bb78b02e55583e35ed649fc9e989e5` | JSON codec +4; root109 | Editor | [push:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39778575880); [pull_request:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39778581723) | OPEN |
| [v0.5.6](document-v0.5.6.md) | `a8066c596cbd59da3357a9b112e04a73762b3fae` | Owner/reference diagnostics +5; root114 | Editor | [push:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39788069228); [pull_request:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39788074627) | OPEN |
| [v0.5.7](document-v0.5.7.md) | `4a59d42443ec6043752e54c0263598a2eb0ddc29` | Read/load +5; root119 | Editor | [push:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39789790960); [pull_request:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39789799537) | OPEN |
| [v0.5.8](document-v0.5.8.md) | `e230e9510dd2b05badae5c880608e05d843bc6bf` | Conditional Save +6; root125 | Editor | [push:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39791412207); [pull_request:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39791420994) | OPEN |
| [v0.5.9](document-v0.5.9.md) | `171bbcd3c5e1dc956bb47744cfde369d45ce2c83` | Failure/cleanup +3; result unions extended; root128 | Editor | [push:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39792898889); [pull_request:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39792906851) | OPEN |
| [v0.5.10](document-v0.5.10.md) | `4e9d611014369d66283f4360fb0c892eaa46cb68` | Compatibility/migration +5; root133 | Editor | [push:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39794595135); [pull_request:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39794603221) | OPEN |
| [v0.5.11](document-v0.5.11.md) | `e0d3193bcd7089b4fffb3d22d179bdba6f032937` | Preserving Scene edit +1; strict profile tightened; root134 | Editor | [push:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39797150303); [pull_request:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39797160314) | OPEN |
| [v0.5.12](document-v0.5.12.md) | `06d5ee61b660786f1a750df25993d62e5ae1d197` | Manual MVP only; root134 | Editor | [push:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39799327211); [pull_request:success](https://github.com/TjnhPro/rpg-platform/actions/runs/39799333262) | OPEN |
| v0.5.13 | This closure commit: exact SHA in PR5 post-push ledger | Zero; root134 | Editor | Final build/CI handoff below and in PR5 | OPEN |

The v0.5.0 version allocation was provisional. Subsequent supplied tasks explicitly
superseded it: v0.5.2 isolation, .3 lifecycle, .4 dirty/revision, .5 codec, .6
validation, .7 load, .8 save, .9 failure/cleanup. This is task-directed allocation,
not missing duplicate implementations. No canonical owner/dependency/pin deviation
was introduced. v0.5.11 deliberately tightened Document Scene strict admission:
construction inputs requiring defaults and unknown structural fields are now
inspect-only; complete canonical snapshots plus four metadata slots remain usable.
This compatibility restriction needs final Developer review; no new schema major
or change to the underlying Scene factories was made.

## Final capabilities and canonical owners

| IDs / area | Actual disposition | Owner and limit |
| --- | --- | --- |
| DC01 architecture | DOCUMENTED_ONLY boundary decision | Editor Document orchestration, not a universal persistence engine |
| DC02/DC03 identity/envelope | IMPLEMENTED | Explicit project/document identity, envelope1, kind and nullable content version |
| DC04/DC05 isolation | IMPLEMENTED | Detached frozen portable content, explicit whole replacement; semantic content selection is caller-trusted |
| DC06/DC09 lifecycle | IMPLEMENTED | Created/open/terminal closed; explicit memory revert/discard, no UI tabs/registry/history |
| DC07/DC08 revision/dirty | IMPLEMENTED | Session-local generation; exact one-shot ticket and trusted loaded/commit evidence |
| DC10 codec | IMPLEMENTED | Bounded JSON profile; encode/decode only, never Save |
| DC11/DC12 diagnostics | IMPLEMENTED | Delegates Scene/Asset/Spatial owners and references; retains original decoded content |
| DC13 load | IMPLEMENTED orchestration | Host supplies exact decoded bytes/text and observations; strict-only fresh session |
| DC14 save | IMPLEMENTED orchestration | Declared atomic host preconditions/publication required; no production adapter |
| DC15 failure/cleanup | IMPLEMENTED classification and hook | Recovery/rollback/reconciliation UNAVAILABLE; cleanup is secondary evidence |
| DC16 compatibility/migration | IMPLEMENTED limited candidate flow | Named opt-in additive forward content step; no auto-adoption/save or general migration engine |
| DC17/DC18 preservation/content integration | IMPLEMENTED supported profile | Scene Document metadata-preserving edit, existing Asset/Spatial owner policies |
| DC19 MVP/closure | DOCUMENTED manual evidence and audit | Real finite storage observations; no new closure API |
| Game-specific config/schema validator | UNAVAILABLE | Future Runtime Engine-owned contract; no invented Skill/Monster rules |
| GUI/save dialog/autosave/undo/multi-view registry | UNAVAILABLE | No product Editor workflow or Render lifecycle integration |
| Existing-file CAS product adapter, crash recovery | UNAVAILABLE | Host decision/capability required; not silently downgraded to overwrite |

Document `projectId + documentId` is not Scene/Object/Asset identity, a tab ID or
filename. Envelope schema1, nullable content-owner version, session generation,
package0.0.0 and opaque storage tokens remain separate domains. Rename/move is a
host operation, not a derived document identity conversion. Authored data excludes
live UI/DOM/THREE/GPU/callback/gameplay state. Plain JSON alone cannot determine
whether a caller put UI-like data in an opaque metadata bag; host selection stays
explicit. Text is valid without Scene, placement, Map, canvas or GPU.

Scene membership/identity, same-ID replacement and relationships reuse the Phase3
owner. Asset snapshot/catalog/reference checks reuse Phase2. Coordinate definitions
and Scene-to-spatial adapter reuse Phase4; canonical math remains in Render.
No copied Scene/Asset/Spatial implementation, gameplay state archive or renderer.

## Public surface, declarations and build graph

Source and emitted root inventories agree: Editor **134/134**, Render **52/52**;
Engine/Client/Server expose zero named domain exports in their bootstrap roots.
Phase5 adds **44 Editor symbols: 12 functions and 32 types**, removes none of the
baseline90, and leaves preexisting owner source/contracts unchanged. Source delta
is ten new `document-*.ts` files plus additive Editor root reexports. The internal
Scene profile module is emitted but is not a package-root export. Private module
helpers do not become supported deep entrypoints.

| Introduced | New root symbols (exact names) |
| --- | --- |
| v0.5.1 | `DocumentContentRecord`, `DocumentContentValue`, `DocumentEnvelope`, `DocumentEnvelopeInput`, `DocumentIdentity`, `createDocumentEnvelope`, `createDocumentIdentity` |
| v0.5.2 | `replaceDocumentContent` |
| v0.5.3 | `DocumentSession`, `DocumentSessionSnapshot`, `createDocumentSession` |
| v0.5.4 | `DocumentCommitEvidence`, `DocumentLoadedEvidence`, `DocumentSaveOutcome`, `DocumentSaveTicket` |
| v0.5.5 | `DocumentDecodeDiagnostic`, `DocumentDecodeResult`, `deserializeDocument`, `serializeDocument` |
| v0.5.6 | `DocumentDiagnostic`, `DocumentDiagnosticCode`, `DocumentValidationContext`, `DocumentValidationResult`, `diagnoseDocument` |
| v0.5.7 | `DocumentLoadResult`, `DocumentReadPort`, `DocumentReadResult`, `DocumentStorageObservation`, `loadDocument` |
| v0.5.8 | `DocumentCommitReceipt`, `DocumentSaveResult`, `DocumentWritePort`, `DocumentWritePrecondition`, `DocumentWriteRequest`, `saveDocument` |
| v0.5.9 | `DocumentCleanupReceipt`, `DocumentCleanupResult`, `DocumentPersistenceFailure` |
| v0.5.10 | `DocumentCompatibilityResult`, `DocumentMigration`, `DocumentMigrationResult`, `inspectDocumentCompatibility`, `migrateDocument` |
| v0.5.11 | `replaceSceneDocumentObject` |

All five manifests retain `exports: {".": ...}` pointing at local ESM/declarations;
no wildcard/private subpath export. Current Editor consumers are the documented
manual root consumer and ignored compile inputs; no workspace production project
imports Editor. `--with-consumers` therefore selects Editor only. Full workspace
build additionally covers the real Engine/Render/Client/Server graph.

```text
runtime-engine -> @rpg/core/kernel, @rpg/gameplay
runtime-render -> three (private backend, lazy graphics acquisition)
editor         -> runtime-engine, runtime-render
game-client    -> runtime-engine, runtime-render
game-server    -> runtime-engine
```

Exactly five workspaces/references; Server's permitted optional Render dependency
is unused. No Render-to-Editor dependency, Client/Server-to-Editor dependency,
shared/common/sixth package, new network protocol or storage infrastructure.
Editor root still loads its existing Runtime dependencies transitively. Headless
module import and no-GPU Document usage are observed; independent Editor-free
content distribution/installability is a future export concern, not delivered here.

All **51 emitted declaration files** were inventoried and compiled together using
TypeScript6.0.3, NodeNext/ES2022-only libraries, `types:[]`, strict,
exactOptionalPropertyTypes/noUncheckedIndexedAccess and `skipLibCheck:false`:
**zero diagnostics**. Counts: Engine1, Render11, Editor37, Client1, Server1.
Each declaration has a current source counterpart; import inspection found only
same-owner relative references and allowed public workspace roots, no THREE/DOM/
Node private implementation types in the portable declaration graph. Existing
strict DC16/DC17 root consumer inputs also compile with zero diagnostics. Internal
type references such as DocumentLoadCapture stay declared in their owning emitted
module; consumers need no private import.

Declaration-byte inventory (SHA256, local build outputs remain ignored):

| Emitted declaration | SHA256 |
| --- | --- |
| `editor/dist/asset-catalog.d.ts` | `de1eb8a7d1fcf9f79063be100c37062332db370334758388998aa9f5838a17b1` |
| `editor/dist/asset-definition.d.ts` | `1caedfa0ba866e5735b66315fb16fb2e34e75902c9162b0d23a347b7d52d8ec5` |
| `editor/dist/asset-diagnostics.d.ts` | `77f65c3f043ebf894ece095d92b2a8e14765134e95dec4f7787c83ef7b967a5b` |
| `editor/dist/asset-identity.d.ts` | `d5006e4e1d349a2bbfe5a71010a22f22dc09a6dc4a8bf409840378c9594adb0e` |
| `editor/dist/asset-reference.d.ts` | `569c55efdb4a03daec594e2a3ae1248edb994431beced611399400507b135078` |
| `editor/dist/asset-snapshot.d.ts` | `93d8063fc6cf3817ef051da43c0c16bd61b0108bb1e2a2376feea87d42a8ff0a` |
| `editor/dist/asset-sources.d.ts` | `9c47fa72e6c1139d587ce2f13c8591f19a6d8fb4a099b72325a392ea117dd6a9` |
| `editor/dist/asset-transitions.d.ts` | `baef43312303bce6ca78e454db9de4bb1ac92ff0386dae450ddca0e9247b9aa7` |
| `editor/dist/asset-validation.d.ts` | `5d710b3222d3aa7f59fbbc08ce49ef0b012f3dce527f82265956111ee41ee0bd` |
| `editor/dist/asset-visual.d.ts` | `87d4b5941e1c4a23fce4312964cbb5be1ddcf5b1dcc88677678398398454301b` |
| `editor/dist/coordinate-space.d.ts` | `41fb2a1a6c2463727d829bc94a838807c38b30f1228e0c165a6899c3d496c28d` |
| `editor/dist/document-codec.d.ts` | `b787bdb32096b3e602f29ff0c34a8d81cac0b1e762c6aae01272ea3490f4462f` |
| `editor/dist/document-compatibility.d.ts` | `1c40bd93eb301ee09cf18e31b3ab088852853e59c0d5d195efa0ef8f69c62595` |
| `editor/dist/document-diagnostics.d.ts` | `96c7e2a643a34eee4e86b68a9c5921a9185e1832c9d9599f9638391846e7d965` |
| `editor/dist/document-envelope.d.ts` | `5803698c51a93e8c8e8e1d45f43f99aa75b31af00d9a3233c9644605d0ef1629` |
| `editor/dist/document-load.d.ts` | `9ef6720b0de8b9cac3334eeb797fd1e5d1c18b3edf455cdcae2e913a54e0ee47` |
| `editor/dist/document-persistence.d.ts` | `843bda8b07ff79c87f12d32f464d2d9b09eb6078446d73c5737d51d4ad0b4e62` |
| `editor/dist/document-save.d.ts` | `dc69833c0f09c10ab9dc364a3167ab9aa79207200ace9f08e0316a396f4519a8` |
| `editor/dist/document-scene-edit.d.ts` | `9a04989338c80c14f9be24b1ae03542bd4ba28dfefab0dbb5972187f21afa454` |
| `editor/dist/document-scene-profile.d.ts` | `75bcb1791fe7a0f907a2716d284176dd950875926638a086f1ed169130a637a8` |
| `editor/dist/document-session.d.ts` | `c6864bd6d88cb076dcc6d9d9587b61da53138059474c364f5e27d660127e5eab` |
| `editor/dist/grid-conversion.d.ts` | `28263bb358736f2e8a6d6667b9259f84aa1e7874fd20ef43d752eaa9ed896d80` |
| `editor/dist/index.d.ts` | `0cc526fd24b4ae2fb902c0a39dc096dd1cfe7a4ed81707cadfbab1b4b8c5b573` |
| `editor/dist/manual-demo.d.ts` | `8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881` |
| `editor/dist/orthogonal-grid.d.ts` | `b20dc1744f860225d4ffbec8bddcaf2db2039abe3977ce1783900d349c62d1b2` |
| `editor/dist/plane-projection.d.ts` | `9cdfcf6c5d1a32625a70d6bd67c062297f2b4fec06c0bba3e5f89f121d588f15` |
| `editor/dist/preview-host.d.ts` | `19f4bec50ed3ce031343510eaf3525165bf5213a2f0f4b73e038ebcb2791be09` |
| `editor/dist/scene-definition.d.ts` | `8bd7dc298d83260b5ae580b1bf589580db187f8b8810ce1e30d688bfcb845b20` |
| `editor/dist/scene-diagnostics.d.ts` | `938e568d74ac9d46bec431698489086260e1850a60fad4d36e90333f9244fdf1` |
| `editor/dist/scene-membership.d.ts` | `3f81429ce7bd28c0c120623883f1ede1ef5eb3edc7a4cb53d2534b9190f58949` |
| `editor/dist/scene-object-definition.d.ts` | `a3ceb97ddb345e4dde925598e2d801c96fa79784bddfc3ceaee8c2d8b658a12b` |
| `editor/dist/scene-spatial-placement.d.ts` | `b67e4b88eebca18477838b13f53d1b27c51a515a9c1bd15660d0eed2484f38ae` |
| `editor/dist/scene-spatial-point.d.ts` | `921bdbe2e18763d9273d5c3a298ef75353ae41dc1f7eb19a779f50be943f64b8` |
| `editor/dist/scene-validation.d.ts` | `756a691e462b9f0a5c7543f624eef895139813ed0609617a85f7c51d5c7540b9` |
| `editor/dist/scene-visual-alignment.d.ts` | `4f2a9d5d08c1119bc1ca8b88a65cd089968a659922fecc439d37afe754fa997d` |
| `editor/dist/scene-visual.d.ts` | `eab223dd4e7bb5c727efc3c5fdb2767baedc2502df1dad2b70125c7eae2726fe` |
| `editor/dist/viewport-mapping.d.ts` | `bfe78a4d41136c065a144bb1c8132380bc165200d63d93a7157934fb30927509` |
| `game-client/dist/index.d.ts` | `2785146e506a7adb4a5b792feaa51745162150e49c93087ad4b9051b5fbbfdcf` |
| `game-server/dist/index.d.ts` | `a9f94c5834dd3f61500e93fc6c0d451caca13ada3fa747ae85b53e76c6d6dfcc` |
| `runtime-engine/dist/index.d.ts` | `8e609bb71c20b858c77f0e9f90bb1319db8477b13f9f965f1a1e18524bf50881` |
| `runtime-render/dist/frame-failure.d.ts` | `0e22238545a74fed02eb9d4125b1653a0424d8a8135a1bc3fdfaabfd78b0f963` |
| `runtime-render/dist/frame-session.d.ts` | `b0dc5d9d83965a97158efb872b2ee53f738fe933b4bc2bbdf3b6e2be5bb6f713` |
| `runtime-render/dist/grid-conversion.d.ts` | `cb84edcf571cd0b3839f9808c6433aecc96d03a08d6fe8e4891476dcf457ca53` |
| `runtime-render/dist/index.d.ts` | `048f9a87c27ee9b052d281e520d900cae67da1bf6d004bc5e9c6a35278878c1b` |
| `runtime-render/dist/planar-affine.d.ts` | `455896b10a1eb7a2d43a7f239a77dee1fb5c5a0bb8bacfc0e06b4afbd2bf971a` |
| `runtime-render/dist/planar-transform.d.ts` | `7d74820e2327831c043f3848c9a869d2f526bc017cd8b2a25c48099d4bd71cd1` |
| `runtime-render/dist/plane-projection.d.ts` | `68a1c44f32397908b7bb36693008036cae220d87e30efbf56bb448e45331b5bb` |
| `runtime-render/dist/three-frame.d.ts` | `d0e1ecc83932cedbd11480154fb0cc9b44aa01c58712e415deadb8f0c6fd58fc` |
| `runtime-render/dist/viewport-mapping.d.ts` | `4643e95e96d3392b5a6453253f92070a389c6f4a62ffa86642d4748f48218dc6` |
| `runtime-render/dist/visual-alignment.d.ts` | `cfeaafd89a8d9f3a326133ae52a53d4559847d84b62fe25b63d5a3f1c2333718` |
| `runtime-render/dist/visual-resource.d.ts` | `5167126b0dd8112a15c7ee0f74757179cd291a71f2ddcb035df81d8b29bdc58b` |

Aggregate SHA256 of sorted path + NUL + digest + LF records: `76699821f91f23be68952b7602a536cac3e652866ccf36e7307f84c54e144c12`.

Protected-path diff from accepted Phase4 to closure is empty for all four other
projects, root manifests/lock/config/tsconfigs, `.github/`, Harness CLI and external
pin/preparation files. All ten Document source files and Editor root are unchanged
from v0.5.12 to this closure; emitted signatures/bytes are unchanged as well.
No test file, framework, runner, coverage or runtime demo CI job was added/run.

External foundation pins and cached tarball SHA512 were rechecked:

| Foundation | Version / exact commit | Artifact integrity (unchanged) |
| --- | --- | --- |
| Core | 2.0.0 / `04b7239f998c3c688a0dfa3202f11811a9acd775` | `sha512-Iys3TTgb8tynmRgwYKAk/3suJVf/PtOi9TJyqXc3N3K2MJjRa++lWNZAWm60vmHyP8i4bKt5cbccnx78F0KkQQ==` |
| Gameplay | 0.15.2 / `acea332aa80f67552192a72b30f81c0bbbfc56bd` | `sha512-8QeN9B3MLVzdfKyMW0hvcOwJJjb31+dlTxfk+6V/rgsYJnimMO/HjQcHmg064CzPs2qu0I1nVV9lp9vjUMS3xg==` |

Installed versions match pins; only Engine's original public foundation imports
exist. No private imports, Legacy Core Gameplay substitution, copied foundation
implementation, source checkout modification or repinning.

## Safety audit: evidence and precise limits

| Concern | Actual semantics / evidence | Limit or open decision |
| --- | --- | --- |
| Unknown content | Envelope/codec retain portable content keys; strict Scene allows canonical complete snapshot and metadata records at membership/Scene/entry/definition | Other structural extensions reject/inspect-only; metadata semantics/reference-looking fields are opaque |
| Editing unknown data | replaceSceneDocumentObject delegates canonical same-ID replacement and preserves all four source metadata slots | Whole-content/session replacement remains caller-trusted, cannot reconstruct fields lost before entry; replacement metadata edits unsupported |
| Future schema | Unsupported envelope2 load retains text/diagnostic without a session; numeric content99 vs target2 rejected | Not a future-schema writable roundtrip; null/unversioned target cannot numerically order99 and returns read-only/migration-unavailable |
| Serialization | Pure JSON encode/decode, duplicate key rejection, finite portable values | 1,048,576 UTF16 units, depth64, values100000; binary64 rounding/order, no lexical numeric fidelity or cryptographic canonical bytes |
| Migration | Explicit named pure trusted callback, exact forward source/target, bounded candidate, additive structural preservation and owner revalidation | Candidate only, no chain/registry/rename/destructive migration/envelope upgrade or semantic proof; source/session/storage not modified |
| Dirty acknowledgement | Session-bound one-shot ticket; saved generation does not roll backward; save2/edit3/ack2 stays dirty | Host evidence is trusted, not cryptographic disk attestation; Object.is policy is conservative, not structural equality |
| Saved restore | revertToSaved uses confirmed snapshot, increments generation when content differs, can be clean3/saved1 | Memory restoration, not filesystem rollback/reload/recovery |
| Compare token | absent or host-observed identity/revision; unknown/no capability refuses before commit | No mtime/hash-then-unconditional-rename CAS; real demo only absent with null observations |
| Publication | Host must atomically enforce condition and publish complete payload; demo stages wx/write/sync/close then exclusive hardlink | Declaration is a host assertion; finite local full-file observation, not proof for every filesystem/reader/writer |
| Failure/uncertainty | Known failed/conflicted does not advance baseline; thrown/malformed/unknown commit quarantines same session coordinator | No reconciliation/unlock API; weak guards are same module/session instance, not global locator locks or distributed coordination |
| Cleanup | Optional once after settlement, same frozen request; separate receipt; known commit can acknowledge despite cleanup failure | Host must settle promptly/release handles and retain sole valid payloads; no timeout/cancel authority; demo12 has no cleanup hook |
| Close during IO | Storage may commit; result reports session-closed acknowledgement without reopening terminal session | Discard is not cancellation/rollback; host must surface commit result |
| Recovery/durability | Explicit RECOVERY_NOT_AVAILABLE | No target rollback, journal/backup restoration, uncertain retry, crash/power-loss guarantee, directory fsync proof or product storage adapter |

v0.5.9 records real ENOENT publish rejection, ENOTEMPTY cleanup failure, actual
publish followed by lost receipt, quarantine with zero redispatch, known committed
bytes plus cleanup failure and real EEXIST conflict preservation. Those are
historical manual observations, **not rerun as a suite at closure**. Its injected
denied/interrupted receipts prove mapping only, not real permissions/process death.
v0.5.11 records supported unknown-data edits, rejected structural future fields,
actual Scene/Asset/Space Save As and source-byte retention. Neither report proves
universal SAFE_SAVE_PASS, RECOVERY_PASS or MIGRATION_PASS.

## MVP evidence independently refreshed at closure

Reexecuted the two existing PowerShell/Node snippets in
[manual/document-mvp.md](../../editor/manual/document-mvp.md) after the real build.
No new executable demo/test/suite was created. Node24.18.0/npm12.2.0 on Windows,
fresh ignored fixture `.artifacts/document-mvp-v0.5.12-Yjptbl`. Full local output:
`.artifacts/document-v0.5.13-manual.log` and `document-v0.5.13-reopen.log`.
These ignored artifacts are not shipped; the finite observed summary below and
prior committed full transcript make the evidence reviewable.

- Inputs remain one Player, three Monster and one attached VFX **visual labels**,
  shared Asset/sourceId string0012, explicit ground space and metadata at all four
  supported slots. No HP/AI/combat/VFX execution or new entity/schema.
- Create/open current1/saved null/dirty; UI selection/zoom plus same-reference
  replacement leaves the authored session unchanged; name/placement edit ->2.
- Canonical content/Asset/spatial checks valid; physical file existence stays
  NOT_CHECKED. Real create-only Save2 -> saved2/clean; exact3474 bytes published.
- Close terminal session, load actual file into independent clean1/saved1 session;
  exact envelope equality, stable Document/Scene/Asset/Object IDs, order, attachment,
  placement and opaque metadata/facing intent retained.
- Existing-file collision -> EXTERNAL_CONFLICT, file SHA and complete dirty session
  unchanged. Saved restore -> current3/saved1/clean with no IO.
- Missing Asset -> TARGET_NOT_FOUND retained, validation-diagnostics, zero dispatch,
  dirty session unchanged; no broken.json published.
- Actual second file publishes rev2 while receipt delivery is held. Edit3 then
  release actual receipt -> current3/saved2/dirty; savedEnvelope is exact rev2.
- Explicit historical Asset-shape candidate: content profiles1->2, nested Asset and
  envelope stay1, unknown metadata/source file/session retained; **no save/adoption**.
- Numeric future content rejected; future envelope no session; text-only valid.
- Fresh Node process reconstructs context from fixture sidecars and reopens actual
  file; current1/saved1/clean, same hash/content, sprite physically absent. Sidecars
  are manual context inputs, not a new dependency distribution/storage format.
- Three real write attempts: two committed publications, one existing-file conflict.
  No fake commit receipt or in-memory persistence substitution.

| Real file | Observed SHA256 |
| --- | --- |
| before.json (unchanged) | `c1c88c7b782848c1a4ac003e3e322b11c3107accff395b254952e6dc4e6f9849` |
| scene.json (3474 bytes, main and fresh process) | `5db6e42af8b0d243d0ac93524bdf3ed3707897122ebe2d42bee62a09c98cff82` |

Host precondition is `{kind:'absent'}`; observation is identity:null/revision:null.
Exclusive stages remain, no cleanup claim. Read is strict UTF8, post-read byte cap,
trusted fresh local directory and lexical child containment. No adversarial symlink
authorization, preallocation memory limit, existing-file replacement CAS, directory
durability or remote/browser host proof. Planar 2.5D sample facing is opaque authored
intent; no depth, direction semantics, Scene renderer, actual sprites or GPU proof.

## Future stress / Developer decisions (no implementation)

| Scenario | Evidence now | Open boundary |
| --- | --- | --- |
| Text RPG | Observed valid, no Scene/canvas/GPU | Product text UI/config owner integration |
| 2D/2.5D authoring | Finite stable IDs/planar placement/opaque facing retention | Actual rendered scene/depth/animation/direction semantics unverified |
| Large Map/scene | Bounded codec and readonly owner operations | Performance/resource limits/product sizing not stress-verified |
| Multiple views/sessions | Factory contract allows explicit sharing, no UI instance serialized | Host shares one session across views; independent equal-ID sessions are not synchronized |
| Independent Renderer | Render untouched; no Editor imports; headless Doc run | Feature06 context/viewport and later scene/resource work require separate authorization |
| Client exported content | Client unchanged and does not import Editor | Export format/consumer distribution not implemented; no Editor installation requirement imposed |
| Server headless | Existing Server build and no Editor dependency | No Document/live gameplay/database persistence integration |
| External edit | Existing-file absent conflict observed | Existing-file atomic CAS adapter/token policy/reconciliation needs real host evidence |
| Unknown fields/future schemas | Supported metadata preserved; unsupported profile/schema refuses strict admission | Broader schema/profile choices require explicit owner-approved compatibility decision |
| Late save/uncertain commit | Real late ack refreshed; historical real lost-ack quarantine | No auto-retry/unlock/global write arbitration/recovery certification |
| Storage adapters | Local inline create-only host only | Product filesystem/browser/cloud adapter and exact guarantees unimplemented |
| Atomicity/durability/cleanup | Full staged payload and conflict observed; separate cleanup semantics | Crash/power loss, concurrent-reader stress, sole-copy recovery and timeout UNVERIFIED/UNSUPPORTED |
| Future game config | DOCUMENTED_ONLY Runtime Engine responsibility | No placeholder validator, generic schema or Client/Server protocol |

No blocking production/data-loss defect was established in this scoped audit.
The limitations above remain material acceptance decisions; they are not silently
implemented or renamed PASS. Root README/ARCHITECTURE still describe Phase4 counts
(90 Editor symbols) and its then-next-phase gate. Treat those as historical
snapshots; current Phase5 source/declarations and this linked Harness report are
the actual inventory. No out-of-scope root-document rewrite is included.

## References and corrections to historical evidence

References were consulted for principles, not copied implementation:

- [VS Code custom editors](https://code.visualstudio.com/api/extension-guides/custom-editors):
  document model vs multiple views and explicit host-managed persistence.
- [Unity serialization](https://docs.unity3d.com/Manual/script-serialization.html):
  serialized representation is a supported data profile, distinct from IO.
- [Godot saving](https://docs.godotengine.org/en/stable/tutorials/io/saving_games.html):
  choose persisted data explicitly; do not import its game-node/gameplay schema.
- [Unreal versioning](https://dev.epicgames.com/documentation/en-us/unreal-engine/versioning-of-assets-and-packages-in-unreal-engine):
  compatibility/write decisions must account for unsupported newer data.
- JXQY pinned `6ff516bc1439e2b622a2e0ee4e1433cd98f8ec61`:
  [ProjectDocumentRegistry.h](https://github.com/Upwinded/JXQY-all-in-one/blob/6ff516bc1439e2b622a2e0ee4e1433cd98f8ec61/jxqy-editor/core/ProjectDocumentRegistry.h),
  [.cpp](https://github.com/Upwinded/JXQY-all-in-one/blob/6ff516bc1439e2b622a2e0ee4e1433cd98f8ec61/jxqy-editor/core/ProjectDocumentRegistry.cpp),
  [DurableFileTransaction.h](https://github.com/Upwinded/JXQY-all-in-one/blob/6ff516bc1439e2b622a2e0ee4e1433cd98f8ec61/jxqy-editor/core/DurableFileTransaction.h),
  [.cpp](https://github.com/Upwinded/JXQY-all-in-one/blob/6ff516bc1439e2b622a2e0ee4e1433cd98f8ec61/jxqy-editor/core/DurableFileTransaction.cpp):
  registry and prepared/committed/recovery/cleanup concerns are separate. Public
  source is available and was inspected, as originally cited in v0.5.0. Correction:
  v0.5.12's unavailable-source wording was too broad. There is no local working
  checkout, but the pinned public source is accessible. No JXQY execution, full transaction
  audit, Qt/path identity/journal/lock copy or parity/durability claim here.

## Verification and closure handoff

Actual commands (existing CLI syntax):

```sh
node harness/cli.mjs check
node harness/cli.mjs scope --projects editor --allow-infra
node harness/cli.mjs verify --projects editor --with-consumers
node harness/cli.mjs verify --projects runtime-engine,runtime-render,editor,game-client,game-server --with-consumers
npm run build -- --force
npm run foundations:prepare
```

Observed architecture **ARCH_CHECK_PASS:69 JS/TS files**; scope **SCOPE_PASS:4
Markdown paths** before commit; genuine independent builds **PASS all five**;
forced workspace build **PASS**; artifact preparation **FOUNDATIONS_READY** exact
pins. No BUILD_UNCONFIGURED or failed project remains. All51 emitted declarations
and existing root consumers compile with zero diagnostics. No test suite was added
or run. Existing Windows Harness DEP0190 warning is unchanged.

Static checker inspects literal source imports/manifests; it cannot prove semantic
ownership or computed/reflection imports. Scope checks the working diff, not phase
history; the full changed-file inventory below independently audits phase history.
Build success is compilation only; refreshed manual evidence is finite, not visual
review, exhaustive save/recovery/migration proof or Developer acceptance.

Before closure, v0.5.0–12 each have observed official successful push/PR runs on
their exact checkpoint SHA. v0.5.12 push39799327211 and PR39799333262 now both
report official success; this refresh supersedes the earlier pending/stale status
captured in the v0.5.12 handoff. Closure final
SHA, clean-tree check and exact-head push/PR CI conclusions are appended to PR5
after commit; the report cannot include its own future hash.

**READY_FOR_DEVELOPER_REVIEW.** Review the complete ledger, supported Scene profile,
trusted host seams and adapter/recovery limits before deciding Phase5 acceptance.
No merge/release or automatic Feature06 follows this checkpoint.

## Full phase changed-file inventory

Exactly thirty paths from accepted Phase4 through this closure. Closure modifies
only the four Markdown paths declared above; all production changes belong to
their earlier checkpoint commits.

```text
A	editor/manual/document-mvp.md
A	editor/src/document-codec.ts
A	editor/src/document-compatibility.ts
A	editor/src/document-diagnostics.ts
A	editor/src/document-envelope.ts
A	editor/src/document-load.ts
A	editor/src/document-persistence.ts
A	editor/src/document-save.ts
A	editor/src/document-scene-edit.ts
A	editor/src/document-scene-profile.ts
A	editor/src/document-session.ts
A	harness/checkpoints/document-v0.5.0.md
A	harness/checkpoints/document-v0.5.1.md
A	harness/checkpoints/document-v0.5.10.md
A	harness/checkpoints/document-v0.5.11.md
A	harness/checkpoints/document-v0.5.12.md
A	harness/checkpoints/document-v0.5.13.md
A	harness/checkpoints/document-v0.5.2.md
A	harness/checkpoints/document-v0.5.3.md
A	harness/checkpoints/document-v0.5.4.md
A	harness/checkpoints/document-v0.5.5.md
A	harness/checkpoints/document-v0.5.6.md
A	harness/checkpoints/document-v0.5.7.md
A	harness/checkpoints/document-v0.5.8.md
A	harness/checkpoints/document-v0.5.9.md
M	editor/AGENTS.md
M	editor/manual/README.md
M	editor/src/index.ts
M	harness/CONTRACTS.md
M	harness/OWNERSHIP.md
```

## Exact added public declarations (inventory excerpt)

Extracted from the current emitted declarations through TypeScript's package-root
export symbols, with comments removed. These are all44 added symbols, not new API
definitions at closure or a standalone module: referenced existing owner types and
internal DocumentLoadCapture are resolved in their original declaration modules.

```ts
export declare function replaceSceneDocumentObject(document: DocumentEnvelope, objectId: string, replacement: SceneObjectMembership, context: Extract<DocumentValidationContext, {
    owner: 'scene';
}>): DocumentEnvelope;
export declare function inspectDocumentCompatibility(text: string, target: DocumentValidationContext, migration?: DocumentMigration): DocumentCompatibilityResult;
export declare function migrateDocument(text: string, target: DocumentValidationContext, migration?: DocumentMigration): DocumentMigrationResult;
export interface DocumentMigration {
    readonly name: string;
    readonly documentKind: string;
    readonly sourceContentSchemaVersion: number;
    readonly targetContentSchemaVersion: number;
    readonly transform: (content: DocumentContentValue) => unknown;
}
export interface DocumentCompatibilityResult {
    readonly status: 'writable-compatible' | 'read-only' | 'rejected';
    readonly reason: 'current' | 'migration-needed' | 'migration-unavailable' | 'unsupported-envelope' | 'malformed' | 'kind-mismatch' | 'future-content' | 'validation-rejected';
    readonly text: string;
    readonly validation: DocumentValidationResult;
    readonly writeEligibility: 'NOT_ESTABLISHED';
}
export type DocumentMigrationResult = {
    readonly status: 'migrated';
    readonly migration: string;
    readonly originalText: string;
    readonly candidate: DocumentEnvelope;
    readonly validation: DocumentValidationResult;
    readonly writeEligibility: 'NOT_ESTABLISHED';
} | {
    readonly status: 'blocked';
    readonly reason: 'source-not-migratable' | 'already-current' | 'migration-unavailable' | 'transform-failed' | 'candidate-rejected' | 'data-loss' | 'validation-rejected';
    readonly compatibility: DocumentCompatibilityResult;
    readonly validation?: DocumentValidationResult;
};
export interface DocumentPersistenceFailure {
    readonly code: 'IO_DENIED' | 'READ_FAILED' | 'NOT_FOUND' | 'PARSE_FAILED' | 'UNSUPPORTED_SCHEMA' | 'VALIDATION_REJECTED' | 'EXTERNAL_CONFLICT' | 'WRITE_FAILED' | 'WRITE_INTERRUPTED' | 'COMMIT_UNCERTAIN' | 'CLEANUP_FAILED';
    readonly recovery: 'RECOVERY_NOT_AVAILABLE';
    readonly nextAction: 'inspect-storage' | 'correct-input' | 'review-precondition' | 'explicit-retry';
}
export type DocumentCleanupReceipt = {
    readonly status: 'cleaned' | 'retained' | 'failed';
};
export type DocumentCleanupResult = {
    readonly status: 'not-configured' | 'cleaned' | 'retained';
} | {
    readonly status: 'failed';
    readonly failure: DocumentPersistenceFailure;
};
export declare function saveDocument(session: DocumentSession, port: DocumentWritePort, locator: string, expected: DocumentWritePrecondition, context?: DocumentValidationContext): Promise<DocumentSaveResult>;
export type DocumentWritePrecondition = {
    readonly kind: 'absent';
} | {
    readonly kind: 'revision';
    readonly identity: string | null;
    readonly revision: string;
} | {
    readonly kind: 'unknown';
};
export interface DocumentWriteRequest {
    readonly locator: string;
    readonly text: string;
    readonly revision: number;
    readonly expected: DocumentWritePrecondition;
}
export type DocumentCommitReceipt = {
    readonly status: 'committed';
    readonly confirmation: string;
    readonly observation: DocumentStorageObservation;
} | {
    readonly status: 'failed';
    readonly reason?: 'permission-denied' | 'io-error' | 'interrupted-write';
} | {
    readonly status: 'conflicted';
} | {
    readonly status: 'uncertain';
};
export interface DocumentWritePort {
    readonly conflictProtection: 'create-only' | 'compare-and-swap' | 'unavailable';
    readonly publication: 'atomic-publish' | 'unavailable';
    commit(request: DocumentWriteRequest): Promise<DocumentCommitReceipt>;
    cleanup?(request: DocumentWriteRequest, outcome: DocumentCommitReceipt['status']): Promise<DocumentCleanupReceipt>;
}
export type DocumentSaveResult = {
    readonly status: 'blocked';
    readonly reason: 'session-not-open' | 'busy' | 'previous-write-uncertain' | 'CONFLICT_UNDETECTABLE' | 'ATOMIC_PUBLICATION_UNAVAILABLE' | 'serialization-rejected';
    readonly failure?: DocumentPersistenceFailure;
} | {
    readonly status: 'validation-diagnostics';
    readonly validation: DocumentValidationResult;
    readonly failure: DocumentPersistenceFailure;
} | {
    readonly status: 'conflicted' | 'failed' | 'uncertain';
    readonly revision: number;
    readonly failure: DocumentPersistenceFailure;
    readonly cleanup: DocumentCleanupResult;
} | {
    readonly status: 'committed';
    readonly revision: number;
    readonly observation: DocumentStorageObservation;
    readonly snapshot: DocumentSessionSnapshot;
    readonly acknowledgement: 'applied' | 'session-closed';
    readonly cleanup: DocumentCleanupResult;
};
export declare function loadDocument(port: DocumentReadPort, locator: string, context?: DocumentValidationContext): Promise<DocumentLoadResult>;
export interface DocumentStorageObservation {
    readonly identity: string | null;
    readonly revision: string | null;
}
export type DocumentReadResult = {
    readonly status: 'read';
    readonly text: string;
    readonly observation: DocumentStorageObservation;
} | {
    readonly status: 'not-found';
} | {
    readonly status: 'read-failed';
    readonly reason: 'permission-denied' | 'io-error' | 'unavailable';
};
export interface DocumentReadPort {
    read(locator: string): Promise<DocumentReadResult>;
}
export type DocumentLoadResult = {
    readonly status: 'not-found';
    readonly locator: string;
    readonly failure: DocumentPersistenceFailure;
} | {
    readonly status: 'read-failed';
    readonly locator: string;
    readonly reason: 'permission-denied' | 'io-error' | 'unavailable';
    readonly failure: DocumentPersistenceFailure;
} | (DocumentLoadCapture & {
    readonly status: 'parse-failed' | 'unsupported-schema' | 'validation-diagnostics';
    readonly failure: DocumentPersistenceFailure;
}) | (DocumentLoadCapture & {
    readonly status: 'loaded';
    readonly session: DocumentSession;
});
export declare function diagnoseDocument(text: string, context?: DocumentValidationContext): DocumentValidationResult;
export type DocumentDiagnosticCode = DocumentDecodeDiagnostic['code'] | SceneDiagnosticCode | AssetDiagnosticCode | 'CONTENT_NOT_CHECKED' | 'CONTENT_CONTRACT_MISMATCH' | 'DOCUMENT_PROJECT_MISMATCH' | 'ASSET_REFERENCES_NOT_CHECKED' | 'SPATIAL_REFERENCES_NOT_CHECKED' | 'SPACE_TARGET_NOT_FOUND' | 'INVALID_SPATIAL_SPACE' | 'INVALID_TEXT_CONTENT' | 'UNSUPPORTED_CONTENT_PROFILE';
export interface DocumentDiagnostic {
    readonly group: 'envelope' | 'schema' | 'payload' | 'reference' | 'spatial' | 'context';
    readonly code: DocumentDiagnosticCode;
    readonly severity: 'error' | 'warning';
    readonly path: string;
    readonly reference: Readonly<Record<string, string | null>>;
    readonly details: Readonly<Record<string, string | number | boolean | null>>;
}
export type DocumentValidationContext = {
    readonly documentKind: string;
    readonly contentSchemaVersion: number | null;
} & ({
    readonly owner: 'scene';
    readonly catalog?: AssetCatalog;
    readonly resolveCoordinateSpace?: (reference: CoordinateSpaceReference) => CoordinateSpaceDefinition | undefined;
} | {
    readonly owner: 'asset';
    readonly catalog?: AssetCatalog;
} | {
    readonly owner: 'coordinate-space';
} | {
    readonly owner: 'text';
});
export interface DocumentValidationResult {
    readonly status: 'valid' | 'invalid' | 'unresolved' | 'not-checked';
    readonly document: DocumentEnvelope | null;
    readonly diagnostics: readonly DocumentDiagnostic[];
    readonly checks: {
        readonly content: 'CHECKED' | 'NOT_CHECKED';
        readonly assetReferences: 'CHECKED' | 'NOT_CHECKED' | 'NOT_APPLICABLE';
        readonly spatialReferences: 'CHECKED' | 'NOT_CHECKED' | 'NOT_APPLICABLE';
        readonly fileExistence: 'NOT_CHECKED';
    };
    readonly readEligibility: {
        readonly inspect: boolean;
        readonly strict: boolean;
    };
    readonly writeEligibility: 'NOT_ESTABLISHED';
}
export declare function serializeDocument(document: DocumentEnvelope): string;
export declare function deserializeDocument(text: string): DocumentDecodeResult;
export interface DocumentDecodeDiagnostic {
    readonly code: 'INVALID_INPUT' | 'INVALID_JSON' | 'DUPLICATE_KEY' | 'LIMIT_EXCEEDED' | 'UNSUPPORTED_SCHEMA' | 'INVALID_ENVELOPE';
    readonly message: string;
}
export type DocumentDecodeResult = {
    readonly status: 'decoded';
    readonly document: DocumentEnvelope;
} | {
    readonly status: 'rejected';
    readonly diagnostic: DocumentDecodeDiagnostic;
};
export declare function createDocumentSession(envelope: DocumentEnvelope, revertBaseline: DocumentEnvelope | null, loadedEvidence?: DocumentLoadedEvidence): DocumentSession;
export interface DocumentSession {
    readonly getSnapshot: () => DocumentSessionSnapshot;
    readonly open: () => DocumentSessionSnapshot;
    readonly replaceContent: (content: unknown) => DocumentSessionSnapshot;
    readonly revert: () => DocumentSessionSnapshot;
    readonly revertToSaved: () => DocumentSessionSnapshot;
    readonly prepareSave: () => DocumentSaveTicket;
    readonly completeSave: (ticket: DocumentSaveTicket, outcome: DocumentSaveOutcome) => DocumentSessionSnapshot;
    readonly close: (disposition: 'discard') => DocumentSessionSnapshot;
}
export interface DocumentSessionSnapshot {
    readonly state: 'created' | 'open' | 'closed';
    readonly envelope: DocumentEnvelope;
    readonly revertBaseline: DocumentEnvelope | null;
    readonly currentRevision: number;
    readonly savedRevision: number | null;
    readonly savedEnvelope: DocumentEnvelope | null;
    readonly isDirty: boolean;
}
export interface DocumentLoadedEvidence {
    readonly kind: 'storage-load';
    readonly confirmation: string;
}
export interface DocumentCommitEvidence {
    readonly kind: 'storage-commit';
    readonly confirmation: string;
}
export interface DocumentSaveTicket {
    readonly revision: number;
    readonly envelope: DocumentEnvelope;
}
export type DocumentSaveOutcome = {
    readonly status: 'committed';
    readonly evidence: DocumentCommitEvidence;
} | {
    readonly status: 'failed' | 'cancelled';
};
export declare function createDocumentIdentity(input: DocumentIdentity): DocumentIdentity;
export declare function createDocumentEnvelope(input: DocumentEnvelopeInput): DocumentEnvelope;
export declare function replaceDocumentContent(envelope: DocumentEnvelope, content: unknown): DocumentEnvelope;
export interface DocumentIdentity {
    readonly projectId: string;
    readonly documentId: string;
}
export interface DocumentEnvelopeInput {
    readonly schemaVersion: 1;
    readonly identity: DocumentIdentity;
    readonly documentKind: string;
    readonly contentSchemaVersion: number | null;
    readonly content: unknown;
}
export interface DocumentEnvelope {
    readonly schemaVersion: 1;
    readonly identity: DocumentIdentity;
    readonly documentKind: string;
    readonly contentSchemaVersion: number | null;
    readonly content: DocumentContentValue;
}
export type DocumentContentValue = null | boolean | number | string | readonly DocumentContentValue[] | DocumentContentRecord;
export interface DocumentContentRecord {
    readonly [key: string]: DocumentContentValue;
}
```
