# v0.6.2 — Graphics Context Lifecycle

RV03/RV04. IMPLEMENTED; **FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**.
No browser run, phase acceptance, merge, release or publication.

## Preflight and scope

Starting clean HEAD/PR6 head: `a43a442a7d681ba6a6fa95b8d160c4a64355ddcc`
(v0.6.1). Continue `feat/render-context-viewport-v0.6` and
[PR6](https://github.com/TjnhPro/rpg-platform/pull/6), base main
`8aee145e7272dcccff3f20b9be4c70b63ec27b43` with merged Phase1–5.
Read root/Render guidance, architecture, Harness contracts/ownership/workflow/
verification, v0.1.7/current graphics factory/backend, lifecycle states/error stages,
v0.6.1 native target inspection, declarations, manifest/lock and consumer usage.

Primary owner: **runtime-render**. Changes: frame-session + public index; compiled
manual browser entry + HTML/guide; owner guidance and Harness evidence. Editor/Client
production logic unchanged; their public consumption is rebuilt. No Engine/Server,
L1/L2, backend topology, Scene/Document/Spatial, package/export-map/dependency,
compiler/scanner/CI changes. New observation contracts are additive under supplied
RV03/RV04 task; v0.6.0's provisional ID/version allocation is superseded.

## One canonical acquisition, additive observation

Render54 → **57 root symbols**, Editor134 unchanged. Three additions:

```ts
export type RenderGraphicsSnapshot =
  | { readonly state: 'pending' | 'ready'; readonly failure: null }
  | {
    readonly state: 'failed' | 'disposed';
    readonly failure: RenderFailure | RenderFrameFailure | null;
  };
export interface RenderFrameAcquisition {
  readonly getSnapshot: () => RenderGraphicsSnapshot;
  readonly result: Promise<RenderFrameSession>;
}
export declare function beginRenderFrameSession(host: RenderHostBinding): RenderFrameAcquisition;
```

`createRenderFrameSession(host): Promise<RenderFrameSession>` keeps its exact public
signature and delegates to the same acquisition implementation as begin. A caller
chooses one entrypoint per acquisition; calling both explicitly makes two requests,
which are subject to the existing exclusive reservation. There is one binding
lifecycle/identity/backend per successful request, no observation-owned second
session, registry, renderer or duplicate acquisition. The acquisition handle owns
only a result Promise and a getter; it cannot render, initialize, resize or dispose.
Only the resulting existing session can submit/release resources. Caller must
handle result rejection and dispose any late/unwanted fulfilled result.

Snapshots are detached frozen records, readable after termination, with no target,
native handle, raw exception/cause, persisted ID or backend class. Previous snapshots
remain historical observations. They describe **last observed lifecycle**, not a
live context-health query, display fence or continuous loss/restoration monitoring.
Ready means backend acquisition returned successfully; a later context loss is
detected on existing renderFrame checks, not proactively by the new getter.

## State transitions and failure precedence

| Starting state | Trigger | Observation / result |
| --- | --- | --- |
| none | begin(host) | pending immediately; binding validation/reservation starts synchronously inside the async operation; result settles asynchronously |
| pending | Backend acquired and session constructed | ready, failure:null before result fulfillment; no frame submitted |
| pending | Binding initialize rejection | failed with existing RenderFailure; result rejects original exception; no backend acquired |
| pending | Target conflict/unsupported/context unavailable/construction failure | failed with existing RenderFrameFailure; original rejection preserved; cleanup/reservation/quarantine unchanged |
| pending | Unknown host/module exception | failed, failure:null; original exception rejects; never inferred WebGL code or success |
| ready | Explicit renderFrame succeeds | ready unchanged; separate submitted-only receipt; not displayed |
| ready | Backend renderFrame fails | failed + FRAME_FAILED/renderFrame with cleanupFailed; existing terminal cleanup attempted; original frame error precedence retained |
| ready | First explicit dispose succeeds | disposed, failure:null; existing target-free disposal observation returned |
| ready | First explicit dispose cleanup fails | disposed + CLEANUP_FAILED/dispose; existing error thrown and target quarantine retained; disposed means terminal, NOT successful native cleanup |
| failed/disposed after acquired session | Repeat dispose | Original idempotent disposal result; snapshot/failure retained, no cleanup retry or diagnostic erasure |
| failed/disposed after acquired session | initialize/getSnapshot/renderFrame | Existing SESSION_DISPOSED failure/stage; no submission, revival or graphics-state rewrite |
| failed during acquisition | Caller inspects operation | Failed observation remains; no session result/handle exists to render or dispose |

No render method is available on the pending operation. Result supplies the session
only after acquisition succeeds, and existing lifecycle getSnapshot guard runs
before backend submission after disposal. Observation getter remains readable when
the binding getter correctly rejects. No public union/error stage is expanded.

Internally the existing resource-disposal routine is reused by explicit dispose
and frame failure. Explicit dispose publishes terminal disposed (including cleanup
failure); frame failure publishes terminal failed after cleanup and preserves its
FRAME_FAILED diagnostic. Repeated disposal cannot replace that with clean success.
Acquisition catch still disposes binding and releases only its own reservation on
clean failure. TARGET_IN_USE still clears only the losing call's local variable;
it never deletes the winning call's WeakSet reservation. Partial constructor cleanup
failure still quarantines. Unknown exceptions remain unknown in both channels.

## Compatibility and boundaries

- Metadata createRenderSession/createRenderSessionLifecycle/initialize remain byte-
  unchanged. Created/bound remain reference semantics; EditorPreviewHost stays
  binding-only, not forced into WebGL. Existing RenderFrameSession has no new
  required member; old implementations/consumers and receipt signatures compile.
- Importing the package does not acquire resources or import Three. Only explicit
  begin/create graphics requests reach the existing lazy dynamic backend import.
  No module-level DOM access is introduced in the root graph. The manual entry has DOM access
  only when loaded explicitly; it is neither imported nor exported by the root.
- Host keeps canvas/UI/CSS/listeners and decides when to request frames/release.
  No resize/update operation or new session from viewport work; no cancellation,
  suspend, scheduler, pooling, context recovery, complex Scene/Camera/Texture API.
- Session symbol remains existing local binding identity, not Scene/Asset/Document
  identity. Live graphics observations do not change authored placement, dirty state,
  save lifecycle, gameplay timing or authority. Server remains DOM/GPU independent.
- Three0.186.1 / types0.186.0, TypeScript6.0.3 and five-project graph unchanged.
  Engine's read-only L1/L2 refs remain `04b7239f998c3c688a0dfa3202f11811a9acd775`
  / `acea332aa80f67552192a72b30f81c0bbbfc56bd`. No upstream source/artifact changes.

## Compiled manual consumer and actual verification

[`manual-graphics-lifecycle.ts`](../../runtime-render/src/manual-graphics-lifecycle.ts)
imports the public root, including both new types; the genuine Render build compiles
it. [`graphics-lifecycle.html`](../../runtime-render/manual/graphics-lifecycle.html)
loads that isolated built entry. [Manual guide](../../runtime-render/manual/README.md)
describes pending→ready/failed, explicit frame, terminal disposal and late-result
release. Unsupported object causes real factory rejection; there is no fake GPU,
mock/stub or assertion harness. Browser canvas acquisition depends on actual WebGL2.

**Compiled, NOT executed in browser.** Transition table and manual instructions are
source/contract reasoning, not observed runtime outcomes. No real graphics/visual,
context loss, failure cleanup or quarantine behavior is claimed from builds. No
tests/frameworks, runtime probes, UI or browser automation run/added.

| Gate | Observed result |
| --- | --- |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS; 71 JS/TS source files |
| `scope --projects runtime-render,editor,game-client --allow-infra` | SCOPE_PASS; nine changed source/manual/documentation paths |
| `verify --projects runtime-render,editor,game-client --with-consumers` | BUILD_PASS: Render, Editor, Client |
| Render after `tsc -b runtime-render --clean` | BUILD_PASS including compiled public-root manual entry; does not depend on stale dist declarations |
| `npm run build -- --force` | BUILD_PASS: all five projects |
| ES2022-only named contract consumer | PASS; ignored `.artifacts/rv03-compile/consumer.ts`, strict tsc noEmit; old factory signature assignable, no DOM types required; not executed |
| Emitted declaration inventory | Render57 / Editor134; no new DOM/Three/native handle types |
| `git diff --check` | PASS |

No failed/unconfigured build; existing Windows Harness DEP0190 shell warning remains.
Exact checkpoint SHA and push/PR CI links are recorded in PR6 after commit/push.
Introducing SHA: `git log --diff-filter=A --format=%H -- harness/checkpoints/render-viewport-v0.6.2.md`.
No v0.6.3 task supplied/implemented. Phase execution authorization is not Developer
acceptance; no merge/release/publish performed.
