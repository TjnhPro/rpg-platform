# v0.6.13 — Minimal Working Viewport MVP

RV18. **MANUAL_MVP_PREPARED / BUILD_PASS**.
**BLOCKED_BROWSER_ENVIRONMENT / FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED**.
The runnable two-host composition is delivered; real graphics/lifecycle proof is
not established. No Phase6 completion or Developer acceptance is claimed.

## Preflight / ownership

Input d80f9d15cae8d5ec7b3d4abeb1f92aaf319fb6ec (v0.6.12), same
feat/render-context-viewport-v0.6 branch and draft [PR6](https://github.com/TjnhPro/rpg-platform/pull/6).
Phase1–5 merged baseline remains 8aee145e7272dcccff3f20b9be4c70b63ec27b43.
Read root/Render/Editor/Client AGENTS, architecture, Harness contracts/ownership/
workflow/verification, actual roots/declarations/session/backend and manual hosts.
Routing names three projects; canonical primary owner **runtime-render** owns the
graphics contract being demonstrated. Existing public contract suffices: no Render
backend/API modification. Editor/Client collaborators change only internal browser
consumer scoping, manual ratio selection and retained configuration diagnostics.
Editor owns the optional composition HTML; Harness records evidence only.

No production dependency direction change: Engine -> external L1/L2; Render ->
Three; Editor/Client -> Engine+Render; Server -> Engine (Render remains optional
architecturally). No Editor dependency in Client or Render-to-host import. The
manual HTML loads both compiled browser entry scripts as page entrypoints; neither
project imports the other's implementation. Both scripts resolve one Render root
URL in the same document/realm, not iframe-local module instances. Five projects,
no shared package. Engine/Server/L1/L2 untouched. No L1/L2 API used; frozen refs
L1 04b7239f998c3c688a0dfa3202f11811a9acd775,
L2 acea332aa80f67552192a72b30f81c0bbbfc56bd remain unchanged.
Lock audited: Three0.186.1/@types0.186.0/TypeScript6.0.3. Package maps/dependencies
unchanged. Pre-existing .mcp.json is unread/unmodified and excluded from commit.

## RV01–RV17 source/public audit

| Surface / checkpoint | Actual current contract |
| --- | --- |
| RV01 architecture | Existing RenderFrameSession extended incrementally; not a second engine/context manager |
| Phase1 binding APIs | createRenderSessionLifecycle/createRenderSession remain binding-only; getSnapshot mounted/bound does not acquire graphics |
| RV02 inspectRenderTarget | Same-realm HTMLCanvasElement brand/dimensions/reservation observation, graphics NOT_CHECKED |
| RV03–RV04 acquisition | beginRenderFrameSession returns pull observation + result; createRenderFrameSession delegates; one canonical session/backend; no abort API |
| RV05 native loss | Real isContextLost/GL status determines terminal failure; no automatic restore; cleanup uncertainty quarantines target |
| RV06 identity | One full-canvas viewport per acquired session, same ephemeral symbol; terminal/unavailable size null |
| RV07 sizing | planRenderViewportSize validates explicit CSS metrics, ratio and host budgets; floors; not native allocation evidence |
| RV08 resize | resizeRenderViewport validates native limits and captures actual buffer extent/effective ratio; no CSS writes, submission or session replacement |
| RV09–RV11 suspension | suspend retains backend/positive extent/demand; resize preserves suspension; resume applies fresh metrics then enables; disposal releases only owned resources |
| RV12 frame | renderFrame synchronous, no timer/tick; nested call rejects; submitted receipt carries historical active viewport; not display/GPU completion |
| RV13–RV14 demand/scheduling | invalidate/get invalidation are redraw state; Editor on-demand and Client continuous own their independent browser callbacks |
| RV15 diagnostics | getRenderFailure/getRenderFrameFailure brand classifiers; unknown errors stay unknown; cleanupFailed observed independently |
| RV16–RV17 hosts | Editor mount/unmount and Client explicit start/stop/release consume same root; hidden/zero/pending close are host policy |

Root exports unchanged: Render70, Editor134, Client0. No backend THREE/DOM types
added to public declarations. Scene/world positions, Document dirty/revision/save
and authored identity remain separate; none are imported/mutated by the MVP.

## Implementation delta

- [viewport-mvp.html](../../editor/manual/viewport-mvp.html) composes the two actual
  compiled host entries, no duplicated renderer/loop, assertions or test harness.
  Each entry scopes selectors to its own optional section, with standalone pages
  retaining the original document lookup/default browser DPR behavior.
- Editor A starts CSS800×450 and toggles to600×400. Client B starts320×180 and
  retains its independent sizing controls. Each offers explicit host ratio1/2 or
  Browser DPR. This is requested ratio policy, not emulated monitor/device DPR.
  Editor's internal mount receives an optional ratio supplier; no package-root API
  changes. Existing observers, positive-size admission and frame policies remain.
- Both host observations retain lastConfiguration (the actual Render resize
  receipt), beside current requested metrics and viewport snapshot. Native size
  and effective x/y ratio stay visible after later submissions/Observe. Historical
  receipt is not live graphics health. Errors never become a fabricated receipt.
- Controls manually acquire/request/suspend/resume/dispose; no automatic startup.
  A on-demand count should remain idle without demand; B schedules continuously
  only after Start. Neither uses browser frame timing as gameplay/simulation time.
  No business content, asset loader, Scene rendering, camera, animation or VFX.

## Reproduction and expected/observed matrix

Build workspace; serve its root with
`python -m http.server 8080 --bind 127.0.0.1`, then open
http://127.0.0.1:8080/editor/manual/viewport-mvp.html.
Use a browser with same-realm HTMLCanvasElement, WebGL2, ResizeObserver,
matchMedia change events and requestAnimationFrame. No software GPU fallback,
mock, polyfill, injected timer, synthetic loss or automated browser suite.

On 2026-10-23, browser inventory returned `apps:[], browsers:[]`. Attempting to
open this actual page with the in-app browser returned
`Browser is not available: iab`. The temporary local server was stopped afterward.
No browser version/GPU/driver, frame receipt, pixel or browser failure outcome was
observed. This is an environment blocker, not GRAPHICS_UNAVAILABLE evidence.

Statuses below describe actual evidence. Expected results are **not observations**.

| Manual case / action | Expected, subject to real backend admission | Actual status / evidence |
| --- | --- | --- |
| Open actual page in browser | Both hosts and controls available | BLOCKED: browser unavailable as above |
| Mount A, Acquire A; Acquire B, Start B at ratio1 | Separate graphics sessions; initial A request once, B continuous; two opaque clear canvases | NOT_OBSERVED |
| Observe both at initial CSS sizes | A800×450, B320×180 requested; ratio1 candidates800×450 and320×180; inspect accepted native/effective separately | NOT_OBSERVED |
| Resize A once to600×400 while B runs | A ratio1 candidate600×400; B CSS/request/native extent unchanged; B submissions continue | NOT_OBSERVED |
| Set A ratio2 then toggle800×450/600×400 | Candidates1600×900 /1200×800; B stays independently configured | NOT_OBSERVED |
| Set B ratio2, leaving A untouched | B candidate640×360; A configuration unchanged | NOT_OBSERVED |
| Inspect requested vs native accepted/effective | Receipt carries requested CSS/ratio, accepted extent and native/CSS per-axis ratio; may be smaller than candidate or reject, never infer allocation from arithmetic | NOT_OBSERVED |
| Observe A twice without demand while B runs | A submission count stable; B count advances; no FPS/display inference | NOT_OBSERVED |
| Suspend A, Observe A/B | A suspended with positive retained extent and no callback; B still ready/running/submitting | NOT_OBSERVED |
| Resume A | Fresh metrics on same A session; one on-demand frame; B unaffected | NOT_OBSERVED |
| Unmount A / dispose while B runs | A terminal, callback/listeners removed; cleanupFailed observed; B remains ready/submitting | NOT_OBSERVED |
| Mount A then Acquire A explicitly after clean release | New A session via same root/target, frame possible; B unaffected; no automatic recreation | NOT_OBSERVED |
| Existing graphics-lifecycle.html: select unsupported object, Begin | Real UNSUPPORTED_TARGET/acquire, failed observation, no submitted receipt | NOT_OBSERVED |
| Same lifecycle page: acquire canvas, Dispose, Request frame | Existing SESSION_DISPOSED/getSnapshot, terminal observation, no resurrection/false submitted receipt | NOT_OBSERVED |
| Real graphics unavailable/lost environment, explicit acquisition | Classified failure where recognized, otherwise unknown; no receipt, backend fallback or claimed display | NOT_OBSERVED |

For failure/disposed-session steps open the linked
[existing real graphics consumer](../../runtime-render/manual/graphics-lifecycle.html).
For native context loss use only the existing optional DevTools procedure in the
[Render guide](../../runtime-render/manual/README.md). A disposed session is not a
destroyed canvas: clean release permits explicit new session, failed cleanup may
quarantine it. Unknown/unavailable graphics never imply clean cleanup/reuse.

Developer review should record actual browser/version, OS/GPU if available,
sequence, requested/accepted metrics, counters before/after, classified failures,
cleanup observations and visible pixels. No VISUAL_PASS asserted at this checkpoint.
MVP runtime proof remains pending; phase closure must retain this limitation unless
new real observations are supplied. No v0.6.14 implementation.

## Gates

| Gate | Result |
| --- | --- |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS:78 JS/TS files |
| `scope --projects runtime-render,editor,game-client --allow-infra` | SCOPE_PASS:11 paths,10 checkpoint files plus excluded pre-existing .mcp.json |
| `verify --projects runtime-render,editor,game-client --with-consumers` | BUILD_PASS: all three and referenced dependencies |
| `npm run build -- --force` | BUILD_PASS: five projects |
| Strict noEmit ES2022-only/types-empty public consumer compile | PASS: existing Client/Render root contracts; no DOM lib |
| Node import Editor and Client roots | PASS without browser globals; not graphics execution |
| Emitted public symbols | Render70/Editor134/Client0 unchanged |
| `git diff --check` | PASS |

No failed/unconfigured builds. Existing Harness DEP0190 is non-failing. No tests,
browser automation/screenshot assertions or runtime CI added. Exact checkpoint
commit and push/pull_request CI URLs are recorded in PR6 ledger after push.
No merge, release, publication or Phase6 acceptance.
