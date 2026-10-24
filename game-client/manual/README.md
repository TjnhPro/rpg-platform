# Camera host integration - v0.9.12

[Two-host manual guide](../../harness/manual/camera-hosts.md): canonical camera,
independent Editor on-demand / Client continuous scheduling, real PNG and honest
CPU/native evidence. Browser and visual acceptance remain pending.

# Manual Client viewport host — v0.6.12 RV17

v0.6.13 also provides a [two-host manual composition](../../editor/manual/viewport-mvp.html)
with independent A/Editor and B/Client canvas sections in one document/realm.
Client still imports only Render root and scopes its DOM lookup to its own host.
The optional ratio selector chooses 1/2/browser DPR; lastConfiguration retains
the Render resize receipt (requested/native accepted/effective ratio).
See [RV18 procedure/evidence](../../harness/checkpoints/render-viewport-v0.6.13.md).
No browser was available to execute this composition; all browser cases remain
NOT_OBSERVED. Existing standalone page behavior defaults to browser DPR.

Build with `npm run build -- --force`, serve the workspace root, e.g.
`python -m http.server 8080 --bind 127.0.0.1`, and open
http://127.0.0.1:8080/game-client/manual/frame-continuous.html.
This independent page imports the compiled Client browser entry and Render public
root, with local locked Three. Client imports neither Editor nor Three. The Client
package root never imports this browser entry. No assertions, runner or mocks.

Manual review procedure (not executed at this checkpoint):

1. Acquire, then Observe: actual graphics acquisition and measured CSS/current
   browser DPR configuration, initially suspended, no scheduled/submitted frame.
   Start applies fresh metrics/resumes the same session and requests continuously.
   Repeated Start must retain at most one pending browser callback. Receipts count
   submissions, not FPS, GPU completion or displayed frames. Expected visual is
   the existing opaque blue clear, not Scene rendering or animation.
2. Toggle CSS width while running. Compare requested CSS metrics/DPR with Render's
   configured drawing-buffer extent and later receipt viewport. Change browser
   zoom or move between monitors with different DPR; media query re-arms and
   ResizeObserver/window resize deliver host measurements. Each callback also
   remeasures before submission. The canvas is untransformed, borderless and
   padding-free; its bounds represent logical content size for this demo only.
   Render performs all pixel rounding and limit checks. Host limits are 4096 per
   axis / 4,000,000 pixels, with rejection instead of clamping.
3. Stop suspends and cancels; resize while stopped must not schedule or resume.
   Start explicitly resumes. Zero CSS height cancels/suspends without setting a
   zero native buffer. Restore height alone must not resume; press Start. Hidden
   tab also stops/suspends and requires explicit Start when visible again.
4. Dispose releases the held session while keeping page host controls/observers
   available for explicit Acquire. Unmount/pagehide closes the host permanently,
   disconnects observers/media/window/document/canvas listeners and releases it.
   Reload to mount again, including after BFCache return; no automatic recreation.
   The canvas/CSS remain host-owned. Cleanup failure remains visible through the
   retained acquisition's terminal snapshot/cleanupFailed; no quarantine reset.
5. Cold-cache network throttling permits Stop/Dispose/Unmount while acquisition
   is pending. There is no abort API: the original handler disposes unwanted late
   results and never adopts/configures/schedules them. Acquire is blocked until
   the prior operation settles. No fake delays or success instrumentation.
6. Native loss review uses the actual DevTools procedure in the
   [Render guide](../../runtime-render/manual/README.md), when available. The host
   cancels callbacks; Render alone detects/cleans up real loss. Observe after event
   dispatch because the host listener can run before Render's. No synthetic event
   or automatic retry/recovery. Explicit Acquire may still reject on a lost or
   quarantined target. Reload/new target is a host decision, not promised recovery.

Browser requirements: modern same-realm HTMLCanvasElement/WebGL2, ResizeObserver,
matchMedia change events and requestAnimationFrame. References:
[ResizeObserver](https://drafts.csswg.org/resize-observer/),
[CSSOM View](https://drafts.csswg.org/cssom-view/),
[HTML animation frames](https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#animation-frames).
No polyfill/fallback backend, gameplay tick, timing contract or Render-owned loop.

**BUILD_PASS is compilation only. FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED.**
No browser frame, resize/DPR/visibility delivery, pending-close race, native loss,
cleanup, GPU memory reclamation or visual blue pixels have been observed here.
Manual functional/visual acceptance remains Developer-owned. Phase6 remains open.
# Visual resource consumer — v0.7.12

[Client resource guide](visual-resource.md) covers explicit local PNG/TPSheet
selection, Render loading/cache/frame-view consumption, missing source and disposal.
The Harness-only two-host page supports same-realm Editor isolation inspection.
No Editor dependency, tests or sprite renderer. Browser NOT_EXECUTED.
- [v0.8.12 neutral Scene host](scene.md): Client-only PNG/visual-instance page and
  Harness two-host comparison with the existing Editor preview. Compiled only;
  browser NOT_EXECUTED. No Editor runtime dependency or new root API.

- [v0.8.13 seven-instance Scene MVP](../../runtime-render/manual/scene-mvp.md):
  original PNG/atlas sources, independent Editor/Client hosts, canonical resource
  leases and instance controls. Strict compiled manual consumer only; browser
  NOT_EXECUTED, FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED.

# Animation integration - v0.10.10

[Client animation manual](animation.md): explicit selected-file content and intent,
existing Phase6 continuous scheduling, canonical Render playback/binding/camera,
terminal cleanup. Actual finite Chrome observations and limitations are recorded
in the [SA11 checkpoint](../../harness/checkpoints/sprite-animation-v0.10.10.md).
