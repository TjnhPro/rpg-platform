# v0.1.1 — Render host binding and session identity

Status: **READY_FOR_DEVELOPER_REVIEW — v0.1.1** after the gates recorded below.
Runtime/visual status: **FEATURE_NOT_VERIFIED**. v0.1.0 remains ready for review,
not ACCEPTED. This explicit v0.1.1 task authorizes this checkpoint's public API;
it does not authorize v0.1.2 or completion of Phase 1.

## Audit and preflight

Baseline: clean `feat/editor-render-foundation-v0.1` at
`2ab3e032055c79e7e28f446f4787e5f6d2e2bce7`, same Draft PR #1 into main.
Read root/project AGENTS, ARCHITECTURE, FOUNDATION, Harness contracts, ownership,
verification and v0.1.0 report; inspected source, manifests, tsconfig references
and Harness configuration. Source agrees with the earlier checkpoint: Render
exports nothing, Editor has only bootstrap Engine/Render imports. No architecture
conflict or prior approved signature to break was found.

Preflight was posted in the continuing PR before implementation. Canonical owner
is **runtime-render**, ER03/ER06. Editor collaborates only to adapt a host-owned
target through the public root and compile against real exported symbols. The
behavior delta is explicit creation of immutable binding/identity metadata. There
is no initialized renderer, ready state or implicit active preview.

Exactly five private 0.0.0 workspaces remain. Render has no dependencies or project
references; Editor references Engine/Render; Client is the other current Render
consumer. Root-only exports and build scripts are unchanged: project `tsc -b
--force`, root `tsc -b`. No new package, dependency or configuration is needed.
L1 Core 2.0.0 at `04b7239f998c3c688a0dfa3202f11811a9acd775` and L2 Gameplay
0.15.2 at `acea332aa80f67552192a72b30f81c0bbbfc56bd`, pins, lockfile and Engine
public imports are unchanged. This checkpoint uses no external L1/L2 API.

## Implemented public surface and ownership

Render package root exports:

```ts
interface RenderHostBinding { readonly target: object }
interface RenderSessionDescriptor {
  readonly id: symbol;
  readonly host: RenderHostBinding;
}
function createRenderSession(host: RenderHostBinding): RenderSessionDescriptor;
```

Editor root exports `createEditorPreviewSession(target: object):
RenderSessionDescriptor`, delegating directly to Render's root factory. It is a
minimal source consumer/host adapter seam, not an operational preview UI. Nothing
calls either factory at module import time. No additional adapter manager exists.

The current concrete need is to associate a preview request with a host target
without selecting a backend. `object` is deliberately an opaque borrowed reference,
not an arbitrary configuration bag to interpret, and not a drawable capability.
Callers must supply only the target reference, never a document/workspace store,
gameplay state or native renderer. No backend target interface, dimensions, resize
events or platform capability matrix is invented without a consumer.

- Host creates/mounts/removes its target and is responsible for its own platform
  conditions. Render does not clone, freeze, mutate, inspect or remove the target.
  Host target lifetime/mutability is not guaranteed by the descriptor.
- Factory snapshots `host.target` into a fresh frozen binding wrapper and freezes
  a fresh descriptor. Later reassignment of the caller's input wrapper cannot
  rebind it; the underlying borrowed target intentionally remains mutable.
- Render generates a fresh `Symbol()` per call, without a counter or registry.
  Identity is local to that JS execution, compared by symbol equality, not stable
  across reloads or serializable. It is neither host identity nor a document,
  scene, asset, gameplay or network session ID. Reusing one target still produces
  separate descriptor identities; this grants no concurrent GPU-use guarantee.
- Descriptor is metadata, not a privileged capability, authenticity token or live
  resource handle. Structural TypeScript types do not prevent fabricated objects.
  Backend suitability/liveness and untyped caller validation are not performed;
  returning a descriptor is never evidence that rendering is possible.
- Each call owns its wrapper/metadata only. No shared mutable session state exists.
  No cancellation/disposal operation is exported: nothing is allocated or retained
  by a registry. Dropping a descriptor releases only the caller's reference; it
  cannot cancel another session. Actual resource disposal belongs to v0.1.3.

This is an implemented **metadata operation**, not CONTRACT_ONLY and not a mock
engine. Render session runtime state/resources remain Render-owned when introduced;
this checkpoint creates neither. Types/functions are additive to an empty public
surface; no prior signature changes. New API is private-workspace scope, not a
published compatibility promise. Public declarations contain no DOM/Three types.

## Relevant future stress review — source/design evidence only

| Scenario | Current assessment | Remaining proof |
| --- | --- | --- |
| Two preview hosts | Per-call symbol, wrapper and descriptor; no shared registry; target reference belongs to each host | Actual resource/lifecycle isolation v0.1.3/v0.1.7 |
| Client uses Render without Editor | Render has no imports; same package root is already in Client's dependency graph | Operational Client feature outside this task |
| Node imports Render | Module defines factory only; no DOM/GPU/global host access at import or descriptor creation; compilation uses ES2022 without DOM lib | Source/declaration review only; no Node execution probe performed |
| Host target replaced | Descriptor keeps original borrowed reference; no setter/rebind API | Editor replacement/release ordering v0.1.5 |

## Deferred decisions and limits

- v0.1.2: initialization/acquisition ordering and suitability validation seam;
  descriptor creation remains distinct from renderer acquisition.
- v0.1.3: disposal, cancellation, repeat release and real resource isolation.
- v0.1.4: explicit error representation and partial-failure recovery.
- v0.1.5: actual Editor UI/DOM adapter, target replacement, resize signal needs.
- v0.1.6: compatibility based on consumers, including whether a typed capability
  replaces/refines the opaque target; no generic backend/plugin framework now.
- v0.1.7: real backend/target validation, Three.js and frame evidence.
- v0.1.8: integration/closure review.

No viewport, scene schema, coordinate model, lifecycle, renderer, frame-ready flag,
global cache, gameplay, protocol or Client/Server feature is implemented. A text
authoring flow can leave the factory unused. No target ownership transfer occurs.

## Verification and changed files

Required commands, using existing artifact setup and unchanged pins:

```sh
node harness/cli.mjs check
node harness/cli.mjs scope --projects runtime-render,editor --allow-infra
node harness/cli.mjs verify --projects runtime-render,editor --with-consumers
npm run build -- --force
```

`--allow-infra` permits only this checkpoint report and the contracts discovery
link. Changed-file inventory (six files): Render/Editor source roots, Render/Editor
AGENTS guidance, `harness/CONTRACTS.md`, this report. Historical v0.1.0 report and
Harness checker are unchanged. Engine, Client, Server, manifests, dependencies,
versions, lockfile, pins and CI are unchanged.

Observed gate results and exact-head CI are recorded below/on the continuing PR.
No tests, runtime probes, manual preview or upstream verification suite is run.
No runtime/visual isolation, lifecycle or GPU behavior is claimed as PASS.

Observed locally on Node 24.18.0 / npm 12.2.0:

| Gate | Result |
| --- | --- |
| Harness static check | ARCH_CHECK_PASS; 5 JS/TS source files |
| Declared scope + checkpoint documentation | SCOPE_PASS; 6 modified/untracked paths |
| Render independent build | BUILD_PASS |
| Editor independent build / named root API resolution | BUILD_PASS |
| Discovered consumer Game Client build | BUILD_PASS; no source edits |
| Forced workspace build | BUILD_PASS; all five projects |
| Emitted JS/declaration review | Expected root exports; no DOM/Three types, reverse imports or import-time factory invocation |
| Git whitespace check | PASS |

No failed/unconfigured build remains. Existing Windows Harness DEP0190 warning
is unchanged. Source review supports metadata isolation and absence of graphics
globals; it is not execution evidence. Exact checkpoint SHA and push/PR CI links
are recorded in PR #1 rather than embedding a self-referential commit SHA here.
Stop at **READY_FOR_DEVELOPER_REVIEW — v0.1.1**, keep PR Draft.
