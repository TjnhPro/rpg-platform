# Manual Client browser host

After `npm run build -- --force`, serve the workspace root, for example with
`python -m http.server 8080 --bind 127.0.0.1`, then open
http://127.0.0.1:8080/game-client/manual/frame-continuous.html.
The page uses the real compiled Client browser entry and Render public root,
with local Three from the locked install. It is excluded from package-root
evaluation. No runner, assertions, mocks or automatic startup.

Acquire, then Start. Acquire alone submits/schedules nothing. Start applies fresh
positive host metrics and resumes, then requests one Render frame per host browser
callback. Repeated Start keeps at most one pending callback. The counter records
returned submission receipts, not FPS, GPU completion or displayed frames. The
scene is still an opaque blue clear: no animation/gameplay update is implied.

Stop cancels the callback and suspends without disposing. Start explicitly resumes
the same session. Hidden document stops/suspends; returning visible does not restart.
Dispose/page exit cancels and releases, including an unwanted late acquisition.
Stop/hidden while acquiring marks the late result unwanted. Acquire explicitly
again to replace a terminal session; never auto-recover loss or retry failures.

Use the native DevTools loss procedure in [Render guide](../../runtime-render/manual/README.md)
on this page's canvas if the extension exists. Host loss listener cancels scheduling;
Render alone validates native loss/cleans up. Listener ordering can print a snapshot
before Render handles the same event; use Observe afterwards. No synthetic event
is loss evidence. Terminal/suspended checks stop callbacks; unexpected exceptions
cancel instead of scheduling retries. Existing direct renderFrame rejection remains.

Browser callback/cancellation policy follows the
[HTML animation frames specification](https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#animation-frames).
This host deliberately ignores callback timestamps; Render needs no new timing API.

**Compiled only at v0.6.9. FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED.**
Actual start/stop/restart, hidden-tab cancellation, native loss/cleanup, real frame
submission and visual blue pixels have not been observed. No measured performance
claim, fixed timestep, worker, game-loop kernel or Render-owned singleton.
