# v0.1.5 — Editor–Render host integration (ER04 / ER10)

Status: **READY_FOR_DEVELOPER_REVIEW — v0.1.5**, with gates below.
**FEATURE_NOT_VERIFIED / FRAME_NOT_RENDERED**. Mounted means **preview session
initialized** at the host-reference boundary, never “render preview works”.
Earlier checkpoints remain ready for review, not ACCEPTED. No v0.1.6, Phase 1
closure, merge, tag, release or publication is authorized by this checkpoint.

## Audit / preflight / ownership

Baseline: clean `feat/editor-render-foundation-v0.1` at
`97e6eb4b6a9f7bc897b6c4929779a0c85d1bc901`, same open Draft PR #1 into main.
Read root/project AGENTS, ARCHITECTURE, FOUNDATION, Harness contracts, ownership,
verification and v0.1.4 report. Audited actual Render/Editor source and root exports,
manifests, tsconfig references/dependencies and Harness config. Source agrees with
the report: named low-level Editor consumers already exist, but no retained host
slot or replace/unmount orchestration. No browser UI, document model or target
mounting code exists. Preflight was posted in PR before implementation.

Canonical primary owner: **editor**, host intent and preview-slot orchestration.
Existing public Render lifecycle is sufficient, so Render source/contracts are
unchanged. Render still owns identity, initialization validation, state machine,
disposal and failure classification. Host owns target creation/DOM mounting/removal.
Adapter imports only `@rpg-platform/runtime-render`; no Engine or gameplay call,
private rendering path, Three.js, UI framework or second renderer is introduced.

Exactly five private 0.0.0 projects remain. Editor references Engine/Render; Render
has no dependencies/references; Client is the other Render consumer. Project build
is `tsc -b --force`; root build `tsc -b`. No manifest/dependency/config change.
Existing Editor root's Engine bootstrap import remains for compatibility; the
new integration module is independent of Engine and does not execute gameplay.

## Implemented Editor public surface

Root exports `EditorPreviewHostSnapshot`, `EditorPreviewHost`,
`createEditorPreviewHost()` and `openEditorPreviewHost(target: object | null)`.
Existing low-level Editor session/failure exports remain unchanged. No Render
public API delta or migration is needed.

Each frozen adapter handle owns a private optional Render lifecycle reference and
an empty-slot status. It does not duplicate Render's created/bound/disposed states.
Snapshot is a frozen discriminated union: mounted includes a public immutable
Render snapshot; unmounted/unavailable/closed carry no session or target. No live
Render handle is exposed from the adapter, so callers cannot bypass slot ownership
by disposing its session independently. Historical snapshots still retain their
borrowed target if the caller keeps them; host must drop those references.

| Operation / condition | Semantics / observable result |
| --- | --- |
| createEditorPreviewHost | Unmounted slot; no Render creation or host target access |
| mount(object), empty open slot | Create Render lifecycle, initialize, then retain handle; mounted snapshot |
| mount(null), empty open slot | Explicitly unavailable capability; no Render session; unavailable snapshot |
| mount while mounted (including null) | Native Editor Error before mutation; use replace/unmount |
| replace(object or null), open slot | Dispose old handle before creating any new one; then mount supplied target/unavailable state |
| unmount, open slot | Dispose retained session, then clear slot; unmounted; repeating is idempotent |
| close | Unmount successfully before terminal closed; repeating returns closed observation |
| getSnapshot | Fresh immutable Editor observation; delegates live session observation to Render |
| mount/replace/unmount after close | Native Editor Error; no session creation or resurrection |
| getSnapshot after close | Allowed, target-free closed observation |

`null` is an explicit host-supplied capability-unavailable signal for text/headless
authoring. It does not claim detection of browser/GPU support, does not turn an
init exception into success and does not prevent unrelated content work. Invalid
untyped values such as undefined reach existing Render validation, not this
unavailable branch. No project loader or authored document is required/implemented.
Configuration, dimensions and resize are omitted because no concrete consumer
requires them yet; a generic config/backend schema is not invented.

## Ordering / failure / ownership

Replacement is **dispose old -> clear slot -> create/init new -> retain new**.
There is no rollback/resurrection and no period with two live sessions owned by
one adapter, even when replacing with the same borrowed target. Replacing an empty
or unavailable slot is allowed. Replacing with null releases the existing session
before reporting unavailable. This is local synchronous orchestration, not a
transaction over DOM or graphics acquisition.

If old disposal throws, error propagates before clearing the slot or creating a
replacement; close likewise does not falsely report closed. Current Render cleanup
has no fallible callbacks. If new factory/init fails, old session stays disposed,
slot remains unmounted. Pending init failure calls public dispose then rethrows;
no successful handle is retained. No silent retry, fallback or exception-to-null
conversion occurs. Existing `getEditorPreviewFailure` can classify Render failures;
Editor closed/already-mounted misuse remains native/unrecognized by Render.

Actual DOM creation, attachment and removal remain host-owned. For explicit target
detach/remount ordering, caller can unmount first, detach old target/drop snapshots,
prepare the new target, then mount. `replace` only changes the Render binding and
does not secretly remove either target. Host chooses when to call close. Two
adapters have independent slots; sharing a target across adapters is caller-owned
coordination and does not gain a GPU exclusivity guarantee.

The adapter accepts target references only, never document/workspace stores or
game commands. It does not serialize session observations into content, mutate
authored data, reset dirty state or call Engine APIs. New classes/managers for
projects, assets, scenes, maps, sprites or plugins are absent.

## Compiled usage seam and future stress

`openEditorPreviewHost(target)` is a real Editor source consumer: on explicit call
it creates the adapter, calls mount with caller-supplied target/null and returns
the handle for later operations. No dummy target, mock renderer or import-time
preview is supplied. Illustrative host usage (not an execution test):

```ts
const preview = openEditorPreviewHost(hostOwnedTarget);
preview.replace(nextHostOwnedTarget); // old Render session disposed first
preview.unmount(); // host can now remove its own target and drop old snapshots
preview.close();
```

- Two sequential previews: same adapter can mount/unmount repeatedly with fresh
  Render identities; separate adapter slots cannot access one another's state.
- Mount failure: error and pending cleanup propagate without authored/project
  state access. Replacement failure intentionally leaves no active preview.
- Future Client adapter: Render has no Editor dependency and is unchanged; Client
  can independently consume its public root, without reusing Editor state/tools.
- Future browser target: adapter forwards only borrowed object references through
  approved Render API; concrete capability/DOM/backend decisions need later
  evidence and review, without reaching into private Render internals.

These are source/design assessments, not runtime or visual PASS evidence.

## Inventory / verification

Five files: new `editor/src/preview-host.ts`; Editor root re-exports;
`editor/AGENTS.md`; `harness/CONTRACTS.md`; this report. Render source/AGENTS,
Engine/Client/Server source, historical reports, Harness checker, manifests,
dependencies/references, versions, lockfile and CI are unchanged. No sixth project.
Core 2.0.0 revision `04b7239f998c3c688a0dfa3202f11811a9acd775` and Gameplay
0.15.2 revision `acea332aa80f67552192a72b30f81c0bbbfc56bd` keep exact pins,
exports/artifacts and read-only ownership.

```sh
node harness/cli.mjs check
node harness/cli.mjs scope --projects runtime-render,editor --allow-infra
node harness/cli.mjs verify --projects runtime-render,editor --with-consumers
npm run build -- --force
```

Infra allowance is only related checkpoint documentation/discovery. Exact SHA and
push/PR CI are recorded in continuing PR #1. BUILD ONLY: no tests, runtime/browser
probes, UI or manual preview, upstream verify, screenshot or frame evidence.
Builds establish public API/declaration compilation, not orchestration correctness,
DOM mounting, actual render capability, cleanup isolation or gameplay. Compatibility
v0.1.6, actual backend/frame v0.1.7 and closure v0.1.8 remain deferred.

Observed locally on Node 24.18.0 / npm 12.2.0:

| Gate | Result |
| --- | --- |
| Static architecture/import scan | ARCH_CHECK_PASS; 6 JS/TS source files |
| Scope (Editor + declared Render build scope + related docs) | SCOPE_PASS; 5 modified/untracked paths |
| Render independent build | BUILD_PASS; source/API unchanged |
| Editor independent build / actual lifecycle API compilation | BUILD_PASS |
| Discovered Game Client consumer build | BUILD_PASS; source unchanged |
| Forced workspace build | BUILD_PASS; all five projects |
| Public declarations/emitted JS review | Editor root exports resolve; adapter imports Render root only, no Engine/Three/DOM; old Editor APIs retained |
| Git whitespace check | PASS |

No failed/unconfigured build remains. Existing Windows Harness DEP0190 warning is
unchanged. **FEATURE_NOT_VERIFIED / FRAME_NOT_RENDERED** remain explicit; no
orchestration, UI or GPU behavior is claimed PASS. Keep PR Draft; stop at v0.1.5.
