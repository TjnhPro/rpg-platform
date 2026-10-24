# Phase13 — Project Manager closure audit

Status: **READY_FOR_DEVELOPER_REVIEW_WITH_LIMITATIONS**. CORE_IO_OBSERVED /
UI_BUILD_PASS / UI_NOT_VERIFIED / VISUAL_NOT_VERIFIED. No full behavioral acceptance.
Branch `feat/project-manager-v0.13`; [PR #13](https://github.com/TjnhPro/rpg-platform/pull/13).
Baseline `592e4d0b0352614ae151ec7e8495c7a2fbd31abf`; PM11 parent
`a34232152490087f5753ae2d08a453708b8fac2c`. The final commit is the unique commit
adding this report/checkpoint, discoverable with `git log --diff-filter=A --` and
this path. CI for that exact final SHA must be inspected on PR #13 after push;
this committed report does not preclaim a future remote result.

## Ordered checkpoints

Each row has its own task, checkpoint file and capability commit. No version skipped
or combined; PM11 contains only audit, documentation and one evidenced lifecycle fix.

| Version | Capability | Commit |
| --- | --- | --- |
| v0.13.0 | PM01 frozen architecture/schema and API inventory | 08f18e742b65ae9524b2b390dc2d718746d96340 |
| v0.13.1 | PM02 immutable manifest/metadata, additive Document owner | 7dd327522024f9fc94a32aa6ed98c2e65989dda7 |
| v0.13.2 | PM03 logical roots and original physical root capabilities | 07016881bdc05ec967e256fa33b54240a76d53db |
| v0.13.3 | PM04 scoped document references | e96fc6e3bd269c39feb9c742875bba4838e57b48 |
| v0.13.4 | PM05 tracked active Scene reference | e0ab7bd453c491ed10af31f3402886b2699bb717 |
| v0.13.5 | PM06 canonical Document-backed lifecycle | aafd73f0376d5251397175d72e0a9cf95a960f9f |
| v0.13.6 | PM07 unsaved memory Create | cceb95755bf9f4b77b2af74ea3954b0fee080e02 |
| v0.13.7 | PM08 strict root-bound Open | 077336fac4ae66a84c0b4ae67e9aa57555857e4d |
| v0.13.8 | PM09 manifest-only conditional Save | 07bfbe4949e9850de36eb561a70bdf3b4fd367b5 |
| v0.13.9 | PM10 existing-shell Panel and real two-root filesystem MVP | a34232152490087f5753ae2d08a453708b8fac2c |
| v0.13.10 | PM11 scope/contracts/evidence/build audit | Unique addition of this report |

Harness [ownership instructions](../../harness/OWNERSHIP.md) now require inspecting
HEAD, previous checkpoint/task and affected source before each sequential capability,
gates and commit. They authorize continuation to final review without routine pauses.

## Source and ownership audit

| Source | Canonical responsibility / reused contract |
| --- | --- |
| project-manifest, project-validation, project-diagnostics | Editor authored portable closed schema1, detached/frozen data; existing portable capture and Document identity |
| project-resource-roots, project-root-binding | Editor logical roots and original scoped capabilities; existing ResourceLocator; host alone authorizes physical IO |
| project-document-tracking, project-active-scene | Editor references only, exact project/kind/version/scene selection; no file existence/content assertion |
| project-session | Editor wrapper over exactly one canonical DocumentSession; derived revision/dirty/evidence, terminal close |
| project-create, project-open, project-save | Editor composition of envelope/session, loadDocument and saveDocument; no second codec/writer/ticket engine |
| document-diagnostics | PM02 additive project content-owner validation; old scene/asset/coordinate-space/text branches retained |
| ui/src/features/project-manager, app/App.tsx | One existing EditorPanel in Phase12 shell; Mantine/theme defaults, explicit host API; no CSS/theme/component foundation delta |
| manual/project-* | Optional trusted Editor host and finite real-file repro; no sixth production project or renderer |
| docs and harness/checkpoints/OWNERSHIP | Evidence, ordered execution and ownership pointers only |

Compared actual source against [frozen PM01](project-manager-v0.13.0.md): final
manifest fields/versions unchanged, strict closed records reject unknown fields,
portable locators use project-relative paths directly. Null/absent distinctions,
unique IDs/locators, foreign references, active Scene kind/version/ID and explicit
removal policy are enforced. Manifest self-reference requires its enclosing identity
and storage locator, so it is checked at ProjectSession binding/replacement; pure
manifest diagnostics cannot establish that external context. No silent repair.
Source-backed isolation: original root WeakSet, exact project comparisons, session
WeakMap plus one-time Document adoption, no global selected project at data layer.
UI selection/sessions are local React state, not authored data.

Baseline diff is empty for runtime-engine, runtime-render, game-client, game-server,
all package/lock/config/CI files, existing Document load/save/session, Asset/Scene,
viewport host, UI foundation components/theme/styles. Only additive index exports
and the explicitly authorized diagnostics owner integration touch old API sources.
External L1/L2 pins/imports unchanged; no new external APIs are used by this feature.
Static scope inspection covers the entire baseline-to-HEAD delta, beyond Harness
scope's working-tree check. Existing unrelated untracked `.mcp.json` remains excluded.

## Public API and emitted declarations

AST inventory of source index and emitted `dist/index.d.ts`: **138 -> 178 names**,
40 additions, zero removed names, zero source-only/declaration-only names.
All eleven project source modules have matching emitted declaration export names.
No internal `capture*`, `require*`, `projectFail`, `projectData` helpers leak at root.
Unchanged source for old owners preserves their declarations/semantics; the existing
DocumentValidationContext receives only the additive `owner:'project'` arm.

| Root additions | Names |
| --- | --- |
| Manifest/diagnostics types (8) | ProjectManifest, ProjectManifestInput, ProjectMetadata, ProjectResourceRoot, ProjectDocumentReference, ProjectActiveScene, ProjectDiagnostic, ProjectManifestDiagnosis |
| Binding/session/operation types (7) | ProjectRootBinding, ProjectSession, ProjectSessionSnapshot, CreateProjectOptions, OpenProjectOptions, ProjectOpenResult, ProjectSaveResult |
| Manifest/roots functions (6) | createProjectManifest, readProjectManifest, diagnoseProjectManifest, setProjectResourceRoots, createProjectRootBinding, resolveProjectLocator |
| Document reference functions (6) | trackProjectDocument, listProjectDocuments, getProjectDocument, updateProjectDocument, removeProjectDocument, diagnoseProjectDocuments |
| Selection functions (3) | setProjectActiveScene, clearProjectActiveScene, getProjectActiveScene |
| Session functions (5) | createProjectSession, getProjectSessionSnapshot, openProjectSession, replaceProjectManifest, closeProjectSession |
| Operation functions (3) | createProject, openProject, saveProject |
| Error class and context value (2) | ProjectValidationError, projectDocumentContext |

15 type names + 23 functions + one error class + one context = 40 names.
Declarations are generated build output, not committed source or extra subpath APIs.

## Narrow closure defect correction

Before correction, finite public-API observation: adopt a `created` DocumentSession,
then `closeProjectSession(session,'discard')` produced PROJECT_SESSION_NOT_OPEN.
Canonical DocumentSession.close permits created/open and explicitly rejects absent
discard. Project close incorrectly reused the save/edit open-only guard.
Only project-session.ts now validates the bound created/open state and delegates
close to the canonical owner. No signature change or Document Foundation edit.
Post-build observed output (exit0):

```text
missing disposition rejected; state: created
explicit close: closed
double close rejected: PROJECT_SESSION_CLOSED
```

## Actual evidence and gates — 2026-10-24

| Command | Actual result |
| --- | --- |
| node harness/cli.mjs check | exit0; ARCH_CHECK_PASS, 209 JS/TS files |
| node harness/cli.mjs scope --projects editor --allow-infra | exit0; declared working-tree scope; full baseline diff separately audited |
| node harness/cli.mjs verify --projects editor --with-consumers | exit0 after lifecycle correction; BUILD_SCOPE editor (no production Editor consumers in graph) |
| Editor nested ui:check / ui:build | exit0; 11 sources, 3 unchanged stylesheets, zero errors/manual warnings; TS noEmit + Vite 1003 modules |
| node harness/cli.mjs verify --projects runtime-engine,runtime-render,editor,game-client,game-server --with-consumers | exit0; all five genuine builds configured and passed |
| npm run build -- --force | exit0; all workspace TypeScript references rebuilt, repeated after lifecycle correction |
| node editor/manual/project-manager-mvp.mjs | exit0; actual files and readback, not simulated FS |
| git diff --check | exit0 before checkpoint commit |

Existing Vite >500kB chunk and Windows Harness DEP0190 warnings remain. No build is
unconfigured. No new test runner/unit/integration/browser/Playwright suite, coverage
or screenshot matrix. Builds/static checks alone do not establish functional PASS.

Latest finite real IO repro retained at
`C:\Users\admin\AppData\Local\Temp\rpg-project-manager-SbXZIz`, separate
`game-a/project.json` and `game-b/project.json`. Human-readable command output:

```text
SAVE game-a committed { status: 'cleaned' } false
SAVE game-b committed { status: 'cleaned' } false
REPEAT_ABSENT game-a conflicted
REPLACEMENT game-a { status: 'blocked', reason: 'CONFLICT_UNDETECTABLE' }
OPEN game-a opened [state open, savedRevision 1, isDirty false]
OPEN game-b opened [state open, savedRevision 1, isDirty false]
NEGATIVE_FOREIGN_REFERENCE DOCUMENT_PROJECT_MISMATCH
NEGATIVE_OPEN_ROOT { status: 'rejected', reason: 'root-mismatch' }
UNCHANGED_A_B true true
A_EDIT_B_UNCHANGED true Game B
```

Actual persisted A retains name/description, Assets logical root, scene-main/start
reference and active selection; B has empty documents/null activeScene. Scene file
was not created/read: NOT_CHECKED. Repeated absent conflicts preserve actual files.
Earlier HTTP bridge observation retained Unicode `Dự án A` on real Save/Open;
foreign binding and foreign Origin returned403. Those are API observations, not UI
clicks. [Manual guide](project-manager-mvp.md) contains host command/paths and browser
steps. Browser inventory had no browsers and iab creation reported unavailable;
no Create/Save/Open UI interaction or visual result was observed.

## Supported limits and remaining Developer review

Create is unsaved memory. Open preserves diagnostic/raw text on rejection and adopts
only strict valid loaded evidence; no storage write on Open. Save only publishes
manifest; no tracked document session/content or saved state is owned. Simulated
trusted-port failures/uncertainty/pending-close cases in PM09 demonstrate inherited
coordinator semantics, not real crash/fault injection or storage durability.

Real host supports only absent-target hard-link atomic publication, not replacement
CAS. UI reports unsupported updates; unknown write outcome remains quarantined with
no recovery API. No retry fallback, Save All, autosave, scans, wizard or cloud.
Host authorizes a literal flat project.json in each fresh temporary root; retains
evidence files. Physical root authorization assumes trusted OS account/ancestry;
symlink/junction topology replacement by a hostile same-account process is outside
its guarantee. Lexical validity is not containment/security proof. No power-loss
durability, general filesystem sandbox, full product IO adapter or persisted picker.

Developer owns actual UI/manual product acceptance and acceptance of these limits.
Final PR/check SHA results are reported after push. No automatic merge/tag/release,
publish or next phase is authorized by this closure.
