# v0.1.3 — Disposal and state ownership (ER05 / ER08)

Status: **READY_FOR_DEVELOPER_REVIEW — v0.1.3**, with observed gates below.
**FEATURE_NOT_VERIFIED / FRAME_NOT_RENDERED**. No GPU cleanup claim.
Earlier checkpoints remain ready for review, not ACCEPTED. This task authorizes
the disposal delta only; no v0.1.4, merge, tag, release or publication.

## Audit / preflight

Clean baseline `2939b5df3cfceedc8e9597df366e2c98a55d179c` on
`feat/editor-render-foundation-v0.1`, same open Draft PR #1 into main. Read root
and relevant project AGENTS, ARCHITECTURE, FOUNDATION, Harness contracts, ownership,
verification and v0.1.2 report; inspected source, exports, manifests, references,
dependencies and Harness config. No source/ownership mismatch was found.
Preflight was posted in PR before implementation.

Primary owner: **runtime-render**, ER05/ER08 state ownership and terminal cleanup.
Editor collaborates only at the existing host adapter seam to call public disposal,
including disposal when its initialization fails before it can return the handle.
No L1/L2 API is called. Exactly five private 0.0.0 projects remain; no dependency,
manifest, reference, pin, lockfile or CI modification. Render has no imports or
dependencies. Editor references Engine/Render; Client is the other Render consumer.
Genuine commands remain project `tsc -b --force` and root `tsc -b`.

## ER05 ownership inventory — actual source, no invented resources

| Data / allocation | Owner / lifetime | Disposal responsibility |
| --- | --- | --- |
| Private session state, descriptor/binding reference | Render lifecycle closure | Clear descriptor reference, mark terminal |
| Host target (opaque borrowed object/function) | Host, including mount/unmount and its mutations | Render never mutates/freezes/removes/destroys it |
| Frozen descriptor and old active observations | Render creates values; callers may retain references | Cannot revoke caller-held values; host drops them when no longer needed |
| Frozen lifecycle handle/functions | Render creates; caller holds capability | Operations reject after disposal except idempotent dispose; caller drops handle |
| Frozen terminal observation | Render creates; identity only | Safe to retain without binding/target; no cleanup needed |
| Registered subscriptions/listeners/timers | None exist | No unsubscribe/callback registry introduced |
| GPU/native allocations, scene objects or shared cache | None exist | No GPU cleanup implemented or validated |
| Editor workspace, authored config/content, gameplay state | Never passed into these contracts | Unchanged, never reset by Render disposal |

The only concrete cleanup is releasing the lifecycle's explicit descriptor/binding
reference and terminating future operations. Target identity may deliberately be
shared by hosts; no exclusivity or shared GPU ownership is implied. Every lifecycle
has independent state and a unique identity, with no global mutable registry.

## ER08 public delta and compatibility

Render root adds `RenderSessionDisposal { readonly id: symbol; readonly state:
'disposed' }` and `RenderSessionLifecycle.dispose(): RenderSessionDisposal`.
The factory's existing signature and active `RenderSessionSnapshot` state union
(`created | bound`) stay unchanged. Disposal has its own target-free observation,
so active snapshot consumers do not have to handle a descriptor-less union member.
Metadata-only v0.1.1 creation is unchanged and has no lifecycle to dispose.

This task explicitly introduces a new terminal behavior. Existing pre-disposal
behavior/signatures remain; post-disposal calls are newly rejected. The additional
required member affects structural producers of the interface in principle, but
source audit found none: current consumers use Render's factory-owned handles.
It is not a published package compatibility claim. No existing owner/signature
is replaced or dependency direction changed.

| Call / condition | Result / state |
| --- | --- |
| dispose from created | Clear internal binding reference; disposed |
| dispose from bound | Same cleanup; disposed |
| dispose after failed initialize | Failure left created; cleanup is allowed; disposed |
| repeat dispose | Same frozen terminal observation/identity; remains disposed |
| initialize after dispose, including previously detached method reference | Throw native Error; no transition, rebinding or reactivation |
| getSnapshot after dispose, including detached method reference | Throw native Error; no new target-bearing snapshot |
| Read old snapshot/descriptor after disposal | Historical immutable value still readable; it can retain host target |
| Factory fails before handle is returned | No published session; no registry/native allocation to clean |

Disposal sets descriptor to undefined and state to disposed without calling host
code, allocating during cleanup, awaiting or yielding. The frozen terminal value
is prepared during creation and contains only id/state. This is consistent within
the current synchronous JS boundary; not a distributed/async cleanup guarantee.
No resource cleanup callback can fail because none exists. No catch suppresses a
cleanup failure or reports GPU success. Future fallible cleanup must explicitly
report failure and remaining ownership before claiming successful disposal; its
error representation belongs to v0.1.4 and concrete resource acquisition work.

All methods close over the same private descriptor variable, rather than retaining
a descriptor in a public mutable table. Disposal guards stop initialize and active
observation. The host must still drop old snapshots, metadata and handles; disposal
cannot revoke external references or force garbage collection. No heap/profiler
measurement or runtime memory reclamation proof is claimed.

Editor adds `disposeEditorPreviewSession(session): RenderSessionDisposal`, which
delegates to public dispose. The existing initialize adapter also disposes then
rethrows on initialization failure, because no successful handle was handed back.
Successful handles stay live until the host explicitly requests disposal. Host
ordering: call public disposal, then remove host-owned target/bindings and drop
retained handles/snapshots. No preview manager, remount UI or independent state
machine exists in Editor. Render never destroys the host's DOM/target.

## Relevant stress review — source reasoning only

- A/B previews: dispose A touches only A's closure; B's state/reference is not
  accessible there. Even if both borrow the same target, neither destroys it.
- Remount/unmount: old handle rejects work after disposal; Render registered no
  callbacks and holds no binding through its explicit descriptor variable after
  cleanup. Caller-held snapshots may retain old target and must be dropped.
- Partial/failed initialization: current init validates then writes state, with
  no async/native acquisition or partial external work. Failed init remains created
  and can be disposed. No nonexistent partial-GPU cleanup path is fabricated.
- Later textures/sprites/VFX: resources actually created by Render must stay
  Render-owned and be released via the public lifecycle; borrowed host resources
  remain host-owned. No generic manager/pooling/registry is introduced now.

## Verification / boundaries

Changed files (six): Render/Editor source roots, both project AGENTS guidance,
`harness/CONTRACTS.md` discovery link and this report. Historical reports, Harness
checker, Engine/Client/Server source, manifests, dependencies, package versions,
references, lockfile, CI and external artifacts are unchanged. Core 2.0.0 revision
`04b7239f998c3c688a0dfa3202f11811a9acd775`, Gameplay 0.15.2 revision
`acea332aa80f67552192a72b30f81c0bbbfc56bd` remain pinned and read-only.

```sh
node harness/cli.mjs check
node harness/cli.mjs scope --projects runtime-render,editor --allow-infra
node harness/cli.mjs verify --projects runtime-render,editor --with-consumers
npm run build -- --force
```

Infrastructure allowance is limited to this report and contracts discovery.
Exact checkpoint SHA/push/PR CI are recorded in continuing PR #1. No tests, runtime
probes, upstream verify, UI, manual preview, GPU profiler or functional evidence.
Builds verify compilation/public resolution only; architecture scanning is literal
static inspection, not proof of execution isolation or complete semantic ownership.
Structured errors v0.1.4, browser integration v0.1.5, compatibility v0.1.6 and real
backend/frame proof v0.1.7 remain deferred. No scene/assets/gameplay feature is added.

Observed locally on Node 24.18.0 / npm 12.2.0:

| Gate | Result |
| --- | --- |
| Harness static check | ARCH_CHECK_PASS; 5 JS/TS files inspected |
| Scope (Render/Editor + checkpoint documentation) | SCOPE_PASS; 6 modified/untracked paths |
| Render independent build | BUILD_PASS |
| Editor independent build / public disposal API resolution | BUILD_PASS |
| Discovered Game Client consumer build | BUILD_PASS; source unchanged |
| Forced workspace build | BUILD_PASS; all five projects |
| Emitted JS/declaration review | Expected root exports; terminal value has no target, internal reference clearing/guards present; no DOM/Three types |
| Git whitespace check | PASS |

No failed/unconfigured build remains. Existing Windows Harness DEP0190 warning
remains unchanged. **FEATURE_NOT_VERIFIED / FRAME_NOT_RENDERED**: no execution,
isolation, memory-reclamation or GPU cleanup PASS is claimed from these builds.
Stop at **READY_FOR_DEVELOPER_REVIEW — v0.1.3**; keep the Phase 1 PR Draft.
