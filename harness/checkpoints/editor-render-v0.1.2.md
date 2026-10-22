# v0.1.2 — Render initialization and lifecycle (ER07)

Status: **READY_FOR_DEVELOPER_REVIEW — v0.1.2**, subject to gates below.
**SESSION_CONTRACT_VERIFIED_BY_BUILD** describes compilation only.
**FRAME_NOT_RENDERED / FEATURE_NOT_VERIFIED**: no execution, UI or visual evidence.
Earlier checkpoints remain ready for Developer review, not ACCEPTED. The explicit
v0.1.2 task authorizes these additive contracts, not v0.1.3 or Phase 1 acceptance.

## Audit / preflight

Baseline: clean `feat/editor-render-foundation-v0.1` at
`bf1fac160b054d5121b7a51dad7c987e3c5d0d60`, same open Draft PR #1 into main.
Read root/project AGENTS, ARCHITECTURE, FOUNDATION, Harness contracts, ownership,
verification and v0.1.1 report. Inspected actual source, public manifests,
tsconfigs/references, dependency graph and Harness config. No source/ownership
conflict: Render has metadata factory/types only; Editor has a root API adapter.
Preflight was posted in PR before implementation.

Canonical primary owner: **runtime-render**, ER07 lifecycle/state transitions.
Editor collaborates only to call public operations at host-chosen time, without
owning a state machine. Source scope: Render/Editor entrypoints only. Guidance and
checkpoint documentation are the only infrastructure edits. No L1/L2 calls or
foundation changes are needed. Existing five private 0.0.0 packages, root exports,
dependencies and project references stay unchanged. Render has no imports or
dependencies; Editor references Engine/Render; Client is the other Render consumer.
Project builds remain `tsc -b --force`; root build is `tsc -b`.

## Additive API / observable semantics

Existing `RenderHostBinding`, `RenderSessionDescriptor`, `createRenderSession` and
Editor `createEditorPreviewSession` are unchanged. Metadata-only callers do not
implicitly enter a lifecycle. New Render root API:

```ts
interface RenderSessionSnapshot {
  readonly descriptor: RenderSessionDescriptor;
  readonly state: 'created' | 'bound';
}
interface RenderSessionLifecycle {
  readonly getSnapshot: () => RenderSessionSnapshot;
  readonly initialize: () => RenderSessionSnapshot;
}
function createRenderSessionLifecycle(host: RenderHostBinding): RenderSessionLifecycle;
```

Factory delegates descriptor creation to the existing v0.1.1 factory, so every
controller has a distinct symbol identity and frozen binding copy. It does not
adopt external descriptors or create several controllers for the same identity.
Factory captures the input target once; future reassignment of the input wrapper
does not change the binding. No getters on the borrowed target are read.

| Operation / condition | State before | Result / state after |
| --- | --- | --- |
| Factory with typed host binding | none | New frozen lifecycle handle, created |
| getSnapshot | created or bound | Fresh frozen observation, unchanged state |
| initialize with object/function target | created | Accept captured host reference, bound; return fresh snapshot |
| initialize with null/primitive target from untyped caller | created | Throw TypeError before state write; remain created |
| initialize repeated | bound | Idempotent, remain bound; return fresh snapshot |

`bound` means only that this session explicitly accepted an opaque host object
reference. It is not renderer readiness, target liveness, backend validation,
initialization of WebGL, or frame production. Callable objects are accepted because
TypeScript `object` includes functions; no platform capability is inferred. Invalid
untyped host containers/accessor errors may already throw during the unchanged
descriptor factory; no handle/state is published on factory failure. A bad captured
target remains invalid on retry; creating a fresh lifecycle with a valid target is
the current recovery path. No rebind/reset operation is invented.

The transition is actual private state mutation, not a fixed success response or
stub backend: observations before/after initialization differ, and invalid target
references fail before committing the transition. There is no backend hook to
simulate acquisition. No resources/listeners are acquired, so no rollback or
resource manager is needed at this checkpoint.

State lives only in a per-factory closure. Frozen handle prevents operation
replacement; functions close over ownership rather than using caller-controlled
`this`. Every observation captures its state value and cannot mutate current state;
old snapshots remain old observations after transitions. Descriptor/binding are
also frozen. The target is the deliberate exception: a borrowed host-owned reference,
not cloned or frozen, whose lifetime and mutation stay host-controlled.

Editor adds `initializeEditorPreviewSession(target): RenderSessionLifecycle`.
On explicit call it creates the lifecycle via Render's public root, calls
`initialize()` and returns the handle for observation/repeated initialization.
Errors propagate to the host; Editor implements no transition/validation rules.
No import-time invocation, UI, mounting, teardown or automated runtime probe exists.

## Relevant stress review — source reasoning, not execution proof

- Two initializations: first changes created to bound; second is idempotent.
  Fresh snapshot identity is not a second initialization or new session identity.
- Two sessions, one invalid target: state writes occur only in that controller's
  closure after validation; the failure path cannot access another controller.
  Same-target controllers still do not promise exclusive/concurrent GPU ownership.
- Text-only import: Render module defines types/functions only. No automatic
  initialization, DOM/GPU globals, clocks, random, registry, timers or background
  scheduler. Existing symbol identity generation occurs only on explicit creation.
- Later WebGL: bound remains a host-reference contract; a separate acquisition
  operation/state must establish backend readiness with real failure/cleanup
  semantics. Do not reinterpret bound as graphics-ready. No speculative backend
  interface is frozen here. Further signatures require their checkpoint approval.

## Deferred / risk

Disposal/cancellation/terminal states and resource cleanup v0.1.3; structured error
representation/partial backend failures v0.1.4; browser/UI integration, target
replacement and resize v0.1.5; compatibility review v0.1.6; actual backend target
validation, graphics initialization and real frame proof v0.1.7; closure v0.1.8.
The minimal native TypeError is not a structured error taxonomy. Synchronous host
binding does not impose synchronous graphics acquisition later. No scene, object,
gameplay schema, protocol, start/update/stop loop or plugin framework is added.

## Verification / inventory

Six files: Render/Editor source entrypoints, both project AGENTS guidance,
`harness/CONTRACTS.md` discovery link, this report. Historical checkpoint reports,
Harness checker, Engine/Client/Server source, manifests, dependencies, references,
lockfile, CI and package versions are unchanged. Core 2.0.0 revision
`04b7239f998c3c688a0dfa3202f11811a9acd775` and Gameplay 0.15.2 revision
`acea332aa80f67552192a72b30f81c0bbbfc56bd` retain exact artifact pins.

```sh
node harness/cli.mjs check
node harness/cli.mjs scope --projects runtime-render,editor --allow-infra
node harness/cli.mjs verify --projects runtime-render,editor --with-consumers
npm run build -- --force
```

The infrastructure allowance is only for directly related checkpoint documentation.
Observed results are recorded below; exact commit and CI links are in continuing
PR #1 to avoid a self-referential SHA in the commit. No tests, runtime probes,
manual preview or upstream verify suite is run. Compilation and static scanning
do not establish runtime correctness, target suitability, lifecycle isolation,
GPU resource cleanup or visual quality. Developer acceptance remains separate.

Observed local gates on Node 24.18.0 / npm 12.2.0:

| Gate | Result |
| --- | --- |
| Static architecture/import scan | ARCH_CHECK_PASS; 5 JS/TS source files |
| Scope (Render, Editor + checkpoint documentation) | SCOPE_PASS; 6 modified/untracked paths |
| Render independent build | BUILD_PASS |
| Editor independent build / named public API compilation | BUILD_PASS |
| Discovered consumer Game Client build | BUILD_PASS; unchanged source |
| Forced workspace build | BUILD_PASS; all five projects |
| Emitted declarations/JS and source review | Existing signatures retained, new root exports resolve; no DOM/Three types, import-time transition or exposed mutable state |
| Git whitespace check | PASS |

No failed/unconfigured build remains. Existing Windows Harness DEP0190 warning
remains unchanged. **SESSION_CONTRACT_VERIFIED_BY_BUILD** is limited to real
compilation/declaration resolution, not behavioral PASS. **FRAME_NOT_RENDERED** and
**FEATURE_NOT_VERIFIED** remain explicit. Keep PR Draft and stop at v0.1.2.
