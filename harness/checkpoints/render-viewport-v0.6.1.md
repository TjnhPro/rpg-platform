# v0.6.1 — Canvas Binding & Target Capabilities

RV02. IMPLEMENTED; **FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**.
No phase acceptance, merge, release or publication. Continue Phase6 branch
`feat/render-context-viewport-v0.6`, [PR6](https://github.com/TjnhPro/rpg-platform/pull/6).

## Preflight, scope and task-directed allocation

Clean starting HEAD and PR head: `63744fd5e7a2ccda514b3f1dde4123f80e5bfa2f`
(v0.6.0), based on merged Phase1–5 main
`8aee145e7272dcccff3f20b9be4c70b63ec27b43`. No missing baseline contract.
Read root/Render guidance, architecture, Harness ownership/contracts/workflow/
verification, existing frame lifecycle/failures/backend, package/export/lock and
compiler configuration, prior checkpoint, Editor demo/Spatial adapter and Client
root. Current code, not old roadmap prose, determines behavior.

Primary owner: **runtime-render**. Editor/Client production logic unchanged;
consumers rebuilt. Harness records the contract, not another production owner.
Scope: Render index/frame-session/three-frame, new private canvas-target helper,
optional Render manual HTML/guide, Render guidance, Harness contract/ownership
notes and this report. No public schema, gameplay, Scene/Document, sizing policy,
dependencies, compiler config, scanner or CI changes. No L1/L2 call/change.

The supplied RV02 target-capability task supersedes v0.6.0's provisional RV02/RV03
metrics allocation. Logical size, pixel ratio, resize, suspension and recovery
remain unimplemented/unassigned until supplied follow-up tasks. No v0.6.2 task
is supplied or implemented by this checkpoint.

## Public additive contract — Render52 → Render54

Root-only exports; Editor remains134. Exact new declarations:

```ts
export type RenderTargetCapabilities =
  | { readonly status: 'invalid-target' | 'unsupported-target' }
  | {
    readonly status: 'supported-target';
    readonly kind: 'html-canvas';
    readonly width: number;
    readonly height: number;
    readonly dimensions: 'valid' | 'invalid';
    readonly reservation: 'unreserved' | 'in-use';
    readonly graphics: 'NOT_CHECKED';
  };
export declare function inspectRenderTarget(target: unknown): RenderTargetCapabilities;
```

Input is the raw target, not a binding wrapper. Observations are frozen scalar
snapshots retaining no target. No getContext, Three import, reservation mutation,
layout measurement or element creation/removal occurs during inspection. Native
drawing-buffer width/height attributes are not CSS/logical metrics or a GPU limit
check. Positive attributes mean valid dimensions for existing acquisition admission,
not guaranteed allocation capacity. Unreserved is momentary and instance-local;
it is not a lock ticket or graphics readiness. In-use includes pending acquisition
and cleanup-failure quarantine; it cannot distinguish those from a live session.

| Condition | Inspection | Existing acquisition diagnostic (unchanged) |
| --- | --- | --- |
| null/primitive, not a binding-compatible reference | invalid-target | INVALID_HOST_TARGET / initialize |
| Noncanvas object/function; no DOM; foreign-realm/Offscreen/prototype lookalike | unsupported-target | UNSUPPORTED_TARGET / acquire |
| Same-realm native canvas, zero width/height | supported-target + dimensions invalid | UNSUPPORTED_TARGET / acquire |
| Positive-size native canvas | supported-target + dimensions valid; graphics NOT_CHECKED | Actual acquisition still required |
| Target reserved by this package instance | supported canvas reports reservation in-use | TARGET_IN_USE / acquire; check precedes backend admission |
| No/lost WebGL2 context | Inspection does not probe context | GRAPHICS_UNAVAILABLE / acquire |

Existing factories, bound/created/disposed snapshots, receipt and both failure
unions are unchanged. No new required lifecycle member or union variant is added.
Dimensions are distinguished by the new observation, preserving old acquisition
error consumers rather than introducing a breaking error code. Unknown failures
remain unknown; classifier branding is still package-instance local.

## Source and ownership evidence

- `src/canvas-target.ts` uses native HTMLCanvasElement prototype width/height getters
  for brand validation, then same-realm instanceof. Arbitrary candidate properties
  (width/getContext/etc.) are never read by this helper; prototype-shaped objects
  and Proxy wrappers cannot pass merely by exposing similar fields. No DOM globals
  are read at module evaluation; inspection without HTMLCanvasElement is supported.
  Host tampering with global browser intrinsics is not a security boundary promised
  here. Real canvas/backend behavior still requires manual review.
- `src/three-frame.ts` reuses that private helper for actual acquisition and retains
  the existing positive-size rejection and WebGL2-only backend. Native canvas
  dimensions are now read from prototype getters rather than shadowed own properties.
  The helper's DOM type is private and absent from root declaration dependencies.
- `src/frame-session.ts` inspection reads the **same existing WeakSet**; the factory's
  reservation/try/catch/dispose code is byte-unchanged. In particular, collision sets
  the local target to undefined before throwing, so its catch cannot release another
  session's reservation. Only the reserving call releases after clean failure/disposal;
  cleanup failure keeps quarantine. No second registry or lifecycle.
- Host owns canvas element, CSS and host listeners. Render owns graphics resources
  and backend-created listeners. No Editor access to private targets, append/remove,
  OffscreenCanvas/worker/cross-realm support, fallback, multiple backend or new loop.
- `RenderHostBinding.target: object` and metadata-only createRenderSession remain
  opaque and do not invoke the helper or require browser globals. Metadata bound
  remains distinct from acquisition returned, submitted and displayed.
- Render DOM/DOM.Iterable libs are unchanged. Editor already has its own DOM lib for
  its existing browser host; this is not a new shared DOM requirement. Client/Engine/
  Server configs and ES2022-only Server remain unchanged.
- Three manifest/lock/installed version0.186.1 and types0.186.0 match; TypeScript6.0.3.
  Five-project graph unchanged: Render→Three; Editor/Client→Engine+Render;
  Server→Engine; Engine→public Core kernel+Gameplay. Read-only pins remain L1
  `04b7239f998c3c688a0dfa3202f11811a9acd775` / L2
  `acea332aa80f67552192a72b30f81c0bbbfc56bd`.

## Manual consumer and verification

[Manual guide](../../runtime-render/manual/README.md) and
[HTML consumer](../../runtime-render/manual/target-capabilities.html) import Render
public root only. Static host-owned canvases, target selection, Inspect, explicit
Acquire/duplicate Acquire/Dispose show safe observations and failure classification.
No assertions, test harness or automatic frame. Dispose/pagehide intent releases a
late result; host markup/listeners are outside the production Render root.

**Consumer supplied, browser sequence NOT RUN.** Expected outcomes in the guide
describe contracts, not observed behavioral PASS. No GPU/context-loss/recovery,
isolation or visual result is claimed from builds. No tests/frameworks added/run.

| Gate | Actual result |
| --- | --- |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS; 70 JS/TS source files |
| `scope --projects runtime-render,editor,game-client --allow-infra` | SCOPE_PASS; 10 changed documentation/source/manual paths |
| `verify --projects runtime-render,editor,game-client --with-consumers` | BUILD_PASS: Render, Editor, Client independent builds |
| `npm run build -- --force` | BUILD_PASS: all five workspace projects |
| New named public-API consumer compilation | PASS; ignored `.artifacts/rv02-compile/consumer.ts`, tsc noEmit, strict ES2022-only lib, no execution/assertions |
| Fresh declarations/export inventory | Render54 / Editor134; no native/Three types in new public contract |
| Whitespace diff | PASS |

No failed/unconfigured build; existing Harness Windows DEP0190 shell warning remains.
Static scan is regex/import inspection, not runtime proof. Exact checkpoint SHA
and successful push/PR CI links are recorded in PR6 after push; introducing commit
can be resolved with `git log --diff-filter=A --format=%H -- harness/checkpoints/render-viewport-v0.6.1.md`.
