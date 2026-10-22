# v0.1.6 — Extension and compatibility foundation (ER11 / ER12 / ER13)

Status: **READY_FOR_DEVELOPER_REVIEW — v0.1.6**, subject to recorded build gates.
**FEATURE_NOT_VERIFIED / FRAME_NOT_RENDERED**. This checkpoint documents current
contracts and future decision gates; it implements no visual capability or new API.
Earlier checkpoints remain ready for review, not ACCEPTED. Developer alone accepts
the checkpoint. Stop before v0.1.7; no merge, tag, release or publication.

## Baseline, ownership and scope

Clean `feat/editor-render-foundation-v0.1`, local/remote/Draft PR #1 HEAD
`64d8924d19cab3d8fff4bff6ae2c90b9cf20ec8e` before this change. Read root AGENTS,
ARCHITECTURE, FOUNDATION, Harness CONTRACTS/OWNERSHIP/VERIFICATION, both project
AGENTS and v0.1.5 report; inspected all Render/Editor source, root exports,
manifests, tsconfig references, consumer entrypoints and Harness config. Source
matches v0.1.5. PR preflight precedes implementation.

Canonical primary owner: **runtime-render**, ER11–ER13 presentation contracts.
**editor** collaborates for public consumption and host intent; its state is not a
Render subsystem. No L1/L2 API is needed by this checkpoint. No current consumer
requires a new public extension type. No concrete code/import boundary violation
was found, so no source refactor or checker hardening is justified.

Four documentation files only: this report, `harness/CONTRACTS.md` discovery and
Render/Editor AGENTS guidance. No behavior, signature, schema, identity, lifecycle,
dependency or consumer source delta. Exactly five private 0.0.0 packages remain.
Render has no dependencies/references. Editor and Client depend/reference Engine
and Render; Server only Engine (Render permission is optional, unused). Independent
project builds use `tsc -b --force`; root orchestration uses `tsc -b`.

## ER13 — Actual public surface inventory

Only package roots are exported, to built ESM/declarations. Source and dist paths
are private. All rows below are **Phase 1 provisional**: preserve their current
semantics pending Developer review, including after phase closure until an
explicitly approved migration. Package version 0.0.0 and checkpoint numbers do not
establish a published stable release or grant permission to break consumers.

| Public Render symbol | Owner / current semantics | Actual consumer |
| --- | --- | --- |
| `RenderHostBinding` | Render boundary; readonly `target: object`, borrowed mutable reference, not a drawable capability | Editor factories pass binding; Client only root-imports |
| `RenderSessionDescriptor` | Render; readonly fresh execution-local `id: symbol` and copied/frozen host binding; not serializable | Editor metadata factory returns it; lifecycle snapshots contain it |
| `createRenderSession(host): RenderSessionDescriptor` | Render; metadata only, no validation/acquisition | `createEditorPreviewSession`; Render lifecycle internally |
| `RenderSessionSnapshot` | Render; readonly descriptor + `created` or `bound`; bound accepts reference only | Editor host observations; low-level lifecycle consumer |
| `RenderSessionDisposal` | Render; readonly id + `disposed`, target-free terminal observation | Editor disposal adapter returns it |
| `RenderSessionLifecycle` | Render; frozen handle, independent closure; operations below | Editor initializer and preview-host private slot |
| `createRenderSessionLifecycle(host): RenderSessionLifecycle` | Render; creates metadata in `created`, no backend/resource acquisition | Editor initializer and preview-host mount |
| `RenderFailure` | Render; readonly discriminated code/stage union: INVALID_HOST_TARGET/initialize, SESSION_DISPOSED/initialize or getSnapshot | Editor failure forwarding; no UI policy implemented |
| `getRenderFailure(error: unknown): RenderFailure \| undefined` | Render; private-brand recognition for this package instance only; unknown remains unknown, no raw context | `getEditorPreviewFailure` |

`RenderSessionLifecycle.getSnapshot(): RenderSessionSnapshot` observes an active
session; throws after disposal. `initialize(): RenderSessionSnapshot` validates
object/function reference, is idempotent while bound, throws for invalid target or
disposed session. `dispose(): RenderSessionDisposal` is synchronous, terminal and
idempotent; clears the internal binding, never destroys host target or revokes old
snapshots. Failed target validation leaves the low-level session created; Editor
initializers clean it up. Metadata creation alone does not validate a target.

| Public Editor symbol | Owner / current semantics | Actual consumer |
| --- | --- | --- |
| `createEditorPreviewSession(target: object): RenderSessionDescriptor` | Editor adapter; delegates metadata creation | Public seam; no application/UI caller yet |
| `initializeEditorPreviewSession(target: object): RenderSessionLifecycle` | Editor adapter; create/init, dispose pending on failure, rethrow | Public seam; caller owns returned lifecycle |
| `disposeEditorPreviewSession(session: RenderSessionLifecycle): RenderSessionDisposal` | Editor adapter; delegates public disposal | Public seam; no application/UI caller yet |
| `getEditorPreviewFailure(error: unknown): RenderFailure \| undefined` | Editor adapter; forwards Render classifier unchanged | Public seam; no error UI yet |
| `EditorPreviewHostSnapshot` | Editor; frozen mounted + Render snapshot, or target-free unmounted/unavailable/closed | Host adapter operations return it |
| `EditorPreviewHost` | Editor; frozen orchestration handle, private optional Render lifecycle, methods below | `openEditorPreviewHost` returns it |
| `createEditorPreviewHost(): EditorPreviewHost` | Editor; empty slot, creates no session | `openEditorPreviewHost` |
| `openEditorPreviewHost(target: object \| null): EditorPreviewHost` | Editor; compiled real usage seam calls factory and mount on explicit invocation | Public seam; no application/UI caller yet |

`EditorPreviewHost.getSnapshot()` returns an Editor observation; remains allowed
after close. `mount(target: object | null)` rejects an occupied/closed slot; null
explicitly reports unavailable with no Render session, object creates/initializes
one. `replace(target: object | null)` disposes old before mounting new, no rollback.
`unmount()` disposes/clears an open slot, idempotently. `close()` unmounts then
terminally closes, idempotently. All return `EditorPreviewHostSnapshot`.
Mount/replace/unmount reject after close. Editor misuse uses native Error, not
Render diagnostic codes. Mounted means initialized binding, never frame-ready.
Historical observations retain borrowed targets until the caller drops them.

All types above belong to their exporting owner. Render types used in Editor
signatures are not separately re-exported as Editor-owned types. Client's current
root side-effect import establishes build linkage only: no named lifecycle call,
Client adapter, UI or runtime evidence. Server has no Render consumer today.

## ER11 — Extension operations versus absent subsystems

These are design seams, **not implemented extension APIs**. Do not overload the
opaque host target, descriptor or Editor snapshot with a scene/document store.

| Area | Existing operation to compose with | Deferred operation / owner / constraint |
| --- | --- | --- |
| Visual instances / scene inputs | Create a session; observe its ephemeral identity | Render-owned presentation input/instance operations after real scene consumer evidence; authored serializer owner must be assigned separately |
| Viewport / camera / projection | Host binds a target; Editor orchestrates mount/replace | Render-owned viewport/resize/camera operations; host supplies measured context only when needed; no universal coordinate/projection schema |
| Frame update | Explicit host-controlled lifecycle exists | Render frame submission/update/driver policy, scheduling and cancellation; no current tick/frame API; do not make render callbacks gameplay authority |
| Sprite / directional animation | Presentation owner already assigned to Render | Render visual resource/playback operations; no current sprite model, animation graph or logical monster identity |
| VFX playback | Session provides a future resource ownership scope | Render presentation playback from approved visual inputs/events; damage, loot and reward outcomes remain Engine/game authority |
| Optional host capability | Render import/metadata creation require no graphics; Editor null skips session | Explicit future graphics acquisition/support reporting; no registry, generic capability bag, fake backend or silent no-op success |

Stable ownership is established, operation names/shapes are not. A future API must
be justified by an actual consumer, cross the public root and declare resources,
failure/cancellation and lifetime. Add a minimal type only then. A session id is
not a scene/object/asset id. Authoring tools call shared Render operations; Client
calls the same Render implementation without importing Editor. No plugin system,
mandatory module registry or universal scene graph is required to preserve this seam.

## ER12 — Static host portability audit

Evidence: `runtime-render/src/index.ts` is the entire Render implementation, with
no imports, top-level DOM/Three/WebGL/global access or resources; module evaluation
defines classes/functions only. Its manifest has no dependencies and its tsconfig
has no references. Shared compiler lib is ES2022 only, `types: []`, no DOM lib.
Declarations use object/symbol/unknown, not HTMLElement, canvas or backend classes.
Browser initialization is **absent**, not implemented as a headless renderer.
Future browser-only initialization must be explicit and guarded on the appropriate
acquisition path; importing the root must not initialize or require a GPU.

`editor/src/preview-host.ts` imports only the public Render root and defines
factories; it creates no target or session at evaluation time. Editor root re-exports
it, imports Render and retains its existing Engine bootstrap side-effect import.
Engine has named L1/L2 imports but invokes neither here. Thus the Editor root is
not dependency-free or an isolated content SDK; no upstream behavior portability
claim is inferred. Text-only host intent needs no preview session. Actual content
tools/loaders remain unimplemented. No new public subpath/dependency split is needed
for this checkpoint. Client's Engine/Render root imports have no Editor path.
Server imports only Engine, with no Render/DOM/GPU requirement added.

| Condition | Present contract | Future graphical path constraint |
| --- | --- | --- |
| Rendering absent/disabled by host | Host can omit Render creation; Editor null yields unavailable | Content work must remain independently possible |
| Arbitrary object bound | Reference accepted; no target liveness/GPU support check | Must not report drawable/supported based on this alone |
| Invalid reference | Initialize throws classified INVALID_HOST_TARGET | Preserve failure channel; not equivalent to host disabling preview |
| Unsupported browser/target/backend | No capability probe/API yet; unsupported graphics cannot currently be classified | Explicit supported operation/failure contract requires Developer decision; no catch-and-convert to successful mount |

This is source/declaration analysis and compilation, not a headless execution,
browser support or module-import execution test. No runtime probe is run.

## Compatibility policy and decisions before real rendering

Prefer additive named APIs that preserve current calls, readonly observations,
reference ownership, identity and throwing behavior. Adding exported names is not
automatically safe: new required fields, failure/state union variants, expanded
return types, async transitions and changed resource side effects can break existing
consumers. Do not silently reinterpret bound/mounted as GPU-ready or make existing
reference-only initialization fail for a formerly accepted object due to backend
acquisition. Do not turn synchronous disposal into an unreviewed Promise.

Any signature/schema/identity/lifecycle change requires owner impact analysis and
**explicit Developer approval before implementation**: inventory symbols and callers,
identify compile/semantic effects (including exhaustive switches), describe migration
or coexistence, then build affected owners/consumers. Build cannot accept the semantic
change. Unknown failures must stay unknown; classifier branding is package-instance
local, not message/code duck typing, cross-realm or duplicate-package interoperability.
No promise of cross-process symbol serialization is made.

| Open decision / risk | Current constraint / resolution required before implementation |
| --- | --- |
| Backend / GPU readiness (CONTRACT_RISK) | Three.js remains intended, no dependency selected here. Preserve bound/mounted reference semantics; Developer must approve an explicit acquisition/readiness operation and host-support/failure model before renderer MVP |
| Async acquisition / GPU cleanup (CONTRACT_RISK) | Current init/dispose and Editor cleanup are synchronous and reference-only. If future cleanup can fail, pending.dispose can mask an init error; approve error precedence, cancellation and cleanup ownership before adding fallible resources, rather than claiming current adapter covers them |
| Multi-target / resource cache (CONTRACT_RISK) | Independent closures do not guarantee exclusive GPU ownership when targets are shared. Developer must choose target-sharing restrictions, resource ownership/release policy before actual shared resources; no cache/global manager now |
| Projection | Defer to Map/Scene consumer evidence for Text/2D/2.5D; no common coordinate system imposed |
| Scene document / serializer | Persisted format owner is still unassigned; assign canonical owner before export/save; runtime symbol/target/snapshot never becomes authored content |
| Animation graph / playback | Defer graph/state/event shape until real animation consumers; presentation timing never computes gameplay outcomes |

Risks are escalated in PR #1 for Developer review. The bounded resolution here is
to preserve existing contracts and leave graphics operations unimplemented. The
future GPU/API choices above are **not approved by this report** and must be settled
before the affected real-renderer work; they do not block this documentation/build
checkpoint. No irreversible decision or current contract break is needed now.

## Future stress assessment — no future features implemented

| Scenario | Classification | Evidence and limit |
| --- | --- | --- |
| 2.5D map, directional sprite and camera projection | DEFERRED_TO_PHASE | Render owns future scene inputs, projection/camera and playback; none exist. Binding contract imposes no projection; actual schema/operation decisions require Map/Scene evidence |
| Text RPG Editor authoring without renderer | SUPPORTED_BY_CONTRACT | Can omit session or use null/unavailable; no DOM lib/graphics initialization in current Render/host path. Content tools themselves are deferred, no runnable authoring UI claim |
| Two previews plus independent Client host | SUPPORTED_BY_CONTRACT | Each Editor adapter owns a closure; Client may import Render root directly without Editor. No guarantee for shared GPU targets/resources; that portion is CONTRACT_RISK above |
| VFX event remains presentation, not damage/loot authority | DEFERRED_TO_PHASE | Render ownership excludes rules; no playback/event schema exists. Future visual inputs must carry presentation results, not request Render to settle rewards |
| Server build / potential headless Render import | SUPPORTED_BY_CONTRACT | Actual Server only uses Engine; Render has no imports/DOM/backend side effects and ES2022-only declarations. Optional future Server consumption needs evidence; no headless execution or GPU feature support claimed |

SUPPORTED_BY_CONTRACT means current source permits the limited boundary, never
functional PASS. CONTRACT_RISK items require Developer resolution before affected
future implementation. DEFERRED_TO_PHASE means the subsystem does not exist yet.

## Verification and inventory

Run the real gates below with installed pinned artifacts; on a clean clone use
README's foundations preparation and npm ci first. No upstream verify/test command.

```sh
node harness/cli.mjs check
node harness/cli.mjs scope --projects runtime-render,editor --allow-infra
node harness/cli.mjs verify --projects runtime-render,editor --with-consumers
npm run build -- --force
```

Infra allowance covers only this Harness report/discovery. No checker/config,
source, manifests, references, lockfile, CI, historical reports or package versions
change. L1 Core 2.0.0 at `04b7239f998c3c688a0dfa3202f11811a9acd775` and L2
Gameplay 0.15.2 at `acea332aa80f67552192a72b30f81c0bbbfc56bd` remain read-only,
with unchanged pins/artifacts/exports. No Engine/Client/Server implementation changes.

Observed gate results are recorded below after execution; exact checkpoint SHA and
push/PR CI links are recorded in continuing Draft PR #1. No tests, test runner,
runtime/import execution probe, manual UI preview or frames. Compilation cannot
prove module evaluation safety, cleanup isolation, host compatibility or visual
behavior. **FEATURE_NOT_VERIFIED / FRAME_NOT_RENDERED** remain explicit.

Observed locally on Node 24.18.0 / npm 12.2.0:

| Gate | Result |
| --- | --- |
| Static architecture/import scan | ARCH_CHECK_PASS; 6 JS/TS source files |
| Declared Render/Editor scope + related Harness docs | SCOPE_PASS; 4 modified/untracked paths |
| Render independent build | BUILD_PASS |
| Editor independent build / existing named Render API compilation | BUILD_PASS |
| Discovered Game Client consumer build | BUILD_PASS; root import only, no named operational use claimed |
| Forced whole workspace build | BUILD_PASS; runtime-engine, runtime-render, editor, game-client, game-server |
| Declarations/emitted import review | Inventory matches 9 Render and 8 Editor root symbols; no DOM types/backend dependency introduced |
| Git whitespace check | PASS |

No failed/unconfigured build remains. Existing Windows Harness DEP0190 shell warning
is unchanged. No consumer migration is needed because this checkpoint changes no
runtime export or semantics. Future Render API changes must assess Editor named
calls/types, Client's direct Render dependency and any newly introduced Server
consumer; an unused Harness permission alone is not an actual consumer.
