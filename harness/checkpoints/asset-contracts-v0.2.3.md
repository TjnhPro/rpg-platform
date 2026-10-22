# v0.2.3 — Resource Locator & Composite Sources (AR05 / AR06)

Status: **READY_FOR_DEVELOPER_REVIEW**, subject to observed verification below.
Continue Phase 2 branch `feat/editor-render-asset-contracts-v0.2` and Draft PR #2.
Developer instructed implementation/verification without intermediate review gates,
with review at the final step; previous checkpoints are not retroactively accepted.
Stop before v0.2.4; no merge, phase closure, tag, release or publish.

## Preflight and source audit

Clean baseline `e63981dd002b5d1acb4b211425a57a7040cd4830` (v0.2.2), following
Developer-merged Phase 1 baseline `4cec85b5a00e2477f00eee29e2da6025a532e973`.
Read mandatory root/project AGENTS, ARCHITECTURE and Harness ownership/contracts/
workflow/verification, actual Editor identity/definition/root APIs, manifests and
compiler settings. Editor has 16 public root symbols, Render 14. Existing metadata
is portable deeply frozen data; existing identity is explicit and independent of
source filenames. No locator/source relationship API or asset serializer exists.
No PNG/TPSheet files were found in workspace source inventory; `0012.png` and
`0012.tpsheet` below are illustrative names only, with no bytes inspected.

Primary owner: **Editor**, authored resource locations and source relationships.
Render is an unchanged collaborator for future consumption, not a second catalog.
No L1/L2 API is needed; no package dependency or ownership direction changes.
Preflight announced locator/source additions, ordering/uniqueness and build scope.
Eight paths: Editor src asset-sources/asset-definition/index, manual consumer and
README, Editor AGENTS, Harness CONTRACTS and this checkpoint. Infra allowance is
only the two Harness notes. No compiler/checker/manifest/lockfile/CI edits.

## Public API delta — all owned by Editor

| Surface | Implemented contract |
| --- | --- |
| `ResourceLocator` (new) | readonly type literal project-relative and path string |
| `createResourceLocator` (new) | validates/detaches/freezes locator; native TypeError on invalid input |
| `AssetSourceReference` (new) | readonly role string and ResourceLocator |
| `AssetDefinitionInput.sources` (additive) | optional readonly source list |
| `AssetDefinition.sources` (additive) | detached frozen list, empty when omitted/undefined |

Only three new root symbols (Editor 16 -> 19); existing factory now validates and
copies optional sources. Internal detachAssetSources helper is not a package-root
API; deep imports remain blocked by the existing export map. No separate redundant
source validator/registry/resolver API. Source list/reference/locator and definition
are frozen. Inputs are not frozen or modified. Only declared source/locator fields
are copied; arbitrary host fields are not retained. Host getters/Proxy exceptions
may propagate as with existing identity/top-level definition inputs; not a sandbox.

Previous factory inputs remain valid. Their output gains an empty sources list;
schemaVersion remains 1 as an additive field in the current in-memory record.
This is an explicit output-shape delta, not byte-for-byte old JSON output.
No persisted serializer/migration exists. Identity/kind/metadata signatures and
validation semantics are unchanged. Existing consumers use factory-produced records;
hand-constructed typed AssetDefinition values now need sources. No tracked production
consumer requires an adjustment. Future serialization must define omitted-source
compatibility explicitly rather than assuming a migration implemented here.

## Locator policy

Only `{ type: 'project-relative', path: 'assets/0012.png' }` is implemented. It is
serializable literal data relative to the authored project's content root, never
relative to process cwd or a guessed Windows drive. Type discriminator reserves a
clear extension seam: a future approved remote/archive variant can have its own
payload while retaining the role/locator source envelope. Unknown types currently
throw; no placeholder remote/archive implementation or URL synthesis.

- Nonempty primitive path, slash separators only, no normalization/trim/case folding,
  percent decoding, Unicode normalization or URL conversion.
- Reject leading/trailing/repeated slash (empty segments), `.` and `..` segments,
  backslashes, absolute/UNC/drive/URL syntax.
- Reject characters `<>:"|?*#%`, ASCII controls U+0000–001F and U+007F. Thus query,
  fragment, encoded traversal and Windows alternate-data-stream syntax are not
  silently interpreted. `%` is always literal-invalid, not a decoding instruction.
- Reject surrounding whitespace on each segment, trailing dots, and case-insensitive
  device-name patterns CON/PRN/AUX/NUL/COM1–9/LPT1–9 (including superscript 1/2/3
  variants), also before a dot extension. Internal spaces and other Unicode text
  remain exact. These are explicit conservative lexical rules, not a claim to
  model every platform's filename restrictions or permissions.

Equality is exact case-sensitive path text within this locator type. No filesystem
alias/case/Unicode collision check, symlink traversal check, root lookup, existence
scan or access check. A future loader must establish actual containment and apply
deployment-specific encoding/IO policy separately; lexical validation proves none
of those properties. No platform-specific URL or absolute root is stored.

## Composite source policy

An asset owns one identity and an ordered array of role/locator references; sources
do not get path-derived Asset IDs. Empty sources are allowed for authored/text-only
or currently source-free definitions. Role is an exact nonempty whitespace-free
resource/data label (e.g. image, atlas-metadata), with an open vocabulary. No game
roles, file-extension inference, atlas/page parser or required-role schema.

Preserve caller order without sorting or selecting a primary source. Reject exact
duplicate `(role, locator.type, locator.path)` pairs. Repeated roles with distinct
paths permit multiple pages; the same locator under distinct roles is allowed as
an explicit authored relationship. No global state or cross-asset uniqueness claim.
Per-source provenance and role-specific selection semantics remain unassigned until
needed; existing optional identity.sourceId stays asset-level provenance text.

Move/rename is an explicit new definition with updated locator strings and preserved
projectId/assetId, not filesystem tracking. Windows-to-Linux relocation requires no
stored drive/separator rewriting; actual case sensitivity and files still need host
review. Shared PNG + TPSheet and future multipage sources fit this same envelope.
Remote CDN or archive access stays deferred, never treated as a local path.

## Working proof / verification

Separate manual public consumer `editor/manual/asset-sources.mts` creates one
image+atlas-metadata definition, prints freeze/detachment observations and creates
a relocated multipage definition with the same logical identity. It prints native
errors for traversal, unsupported remote type and duplicate pairs. No assertion,
test helper/runner, browser/visual/E2E suite, automatic runtime job or asset IO.

```sh
node harness/cli.mjs check
node harness/cli.mjs scope --projects editor,runtime-render --allow-infra
node harness/cli.mjs verify --projects editor,runtime-render --with-consumers
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/asset-sources.mts editor/manual/asset-definition.mts editor/manual/asset-identity.mts
node editor/manual/asset-sources.mts
```

Review emitted declarations and whitespace/scope. Existing CI independently builds
all five projects and forces the workspace build; exact checkpoint SHA and push/PR
CI links are recorded in continuing PR #2. Build PASS is compile evidence only.

Observed locally on Node 24.18.0 / npm 12.2.0:

| Gate / evidence | Result |
| --- | --- |
| Harness static architecture | ARCH_CHECK_PASS; 16 JS/TS source files |
| Scope | SCOPE_PASS; eight paths in declared Editor + justified Harness notes |
| Render independent build | BUILD_PASS |
| Editor independent build | BUILD_PASS |
| Discovered Client consumer independent build | BUILD_PASS; no source changes |
| Strict public consumer compilation | Exit 0 for new source consumer and both earlier identity/definition examples |
| Emitted declaration inspection | Three new root exports; optional input/readonly output sources; internal helper absent from root |
| Manual Node consumer | Exit 0; finite observations below, not automated behavioral PASS |
| Whitespace | git diff --check passed |

Manual output printed two ordered sources (image `assets/0012.png`, atlas-metadata
`assets/0012.tpsheet`) under identity sample-project / visual-idle and sourceId 0012.
Four freeze observations were true; removing one host source left authored source
count 2 while host count became 1. Explicit relocated definition printed three
ordered sources, including two image pages, with logical identity equality true.
Traversal, unsupported remote type and duplicate pair printed native TypeError
recognition true with the relevant validation message. No broad invalid-path
matrix or exhaustive validator coverage is claimed.

No failed/unconfigured build remains. Existing Windows Harness DEP0190 warning is
unchanged. Engine/Server independent builds and full workspace build are covered
by existing CI, not repeated locally for this selected scope.

No file existence, real PNG/TPSheet bytes,
parsing, import/copy/cache, runtime loading, export round-trip or visual behavior is
verified. No v0.2.4 reference/resolution work. Exactly five projects; Engine, Render,
Client and Server source/dependencies are untouched. L1/L2 remain read-only with
unchanged pins; neither foundation is imported into these asset modules.
