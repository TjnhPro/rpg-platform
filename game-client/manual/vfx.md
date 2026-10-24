# VE11 Client VFX intent consumer

The optional browser entry consumes the same Render VFX public root as Editor,
without importing Editor or interpreting gameplay. Runtime Engine currently
exports no game presentation contract; the caller supplies neutral explicit
requests. `impact-fire` and `aura` are opaque sample references, not skill rules
or claims about the monster atlas artwork.

```powershell
node harness/cli.mjs verify --projects game-client
node node_modules/typescript/bin/tsc -p game-client/manual/vfx.tsconfig.json
node game-client/manual/vfx-host.mjs
```

Open `http://127.0.0.1:8782`, select the original `Attack1_0.png` and
`Attack1_0.tpsheet`, then Mount. The existing selected-File grant supplies bytes
and SHA256 revisions. No fake asset or server-side media reader is supplied.
Missing/unsupported metadata or resources close the mount with diagnostics.

Spawn world once requests an effect at210,170. Attach looping aura requests a
repeat effect on the ordinary target at110,170 with translation offset35,0.
Start frames runs the existing Phase6 Client host; Pause frames suspends it and
pauses playing effects. Explicit Start resumes paused playback and the first RAF
delta is0, with no background catchup. Stop world retains its instance/lease for
Restart; Remove world retires it. Remove target invokes the canonical target-loss
policy and reconciles host lease ownership immediately. Close is terminal;
scene switch/remount closes the old mount before acquiring a new one.

Step125 supplies an explicit presentation delta only when RAF is stopped. It does
not resume paused playback: use Resume world, or use Start for automatic frames.
Do not submit elapsed intents while the host is running; the page guards Step.
Only the existing Client host schedules RAF; no Render or VFX clock is added.

## Private adapter contract

`src/vfx-presentation.ts` is DOM-free and outside the unchanged Client root.
`createClientVfxPresentation` borrows one session/scene, accepts a caller resolver
returning a pending asset result and a revocable request lease, and retains only
bounded mount-local correlations. It accepts spawn, transport, remove and elapsed
intents. Scene/gameplay/network IDs are not generated from those correlations;
Render definition IDs and issued effect handles remain distinct.

Each spawn gets its own Phase7 lease from the canonical cache. The adapter owns
effect removal and request-lease release; the host owns target membership/base
lease, source grant/load, camera, cache, scene and viewport. Removed or completed
effects are reconciled before/after advance and after host target deletion.
External target owners must call reconcile after a target mutation while frames
are stopped; Render itself retires the effect immediately on target loss. There
is no additional target lookup, scene store, event bus or network protocol.

Remove/close invalidates pending correlation before releasing rights. A late
result cannot create/rebind an effect, including when the same correlation has
been reused for a new request. Duplicate live requests are explicit errors;
256 includes pending requests, while Render separately enforces canonical scene
admission. Transport before admission rejects; removal is idempotent. Cleanup
attempts every owned release and preserves uncertainty/errors. Unknown effect
references reject without acquiring a lease. Completion is presentation-only and
never invokes a gameplay callback.

The manual host resolves explicit two-frame once/repeat definitions through
`createVisualEffectDefinition`/`resolveVisualEffectDefinition`; Phase7 parses the
atlas, loads resources and manages revisions. Phase8 owns scene/drawables, Phase9
owns camera, U1 owns timing/playback, and Render effect APIs own placement,
attachment and selected-frame synchronization. The fixed sample target has a
separate canonical single-sequence binding, not a Client player implementation.

Context loss uses one cancellable host task after native dispatch to close after
Render's terminal broadcast. Close revokes source IO, closes the adapter, unbinds
target playback, releases leases, camera/scene/cache and the viewport session.
Historical receipts, current ready/loading/failure, effect lifetime and
`pixels:NOT_VERIFIED` remain separate. This entry is not a complete game shell.

## Verification limit

Build/static checks and headless imports are recorded in the
[checkpoint](../../harness/checkpoints/visual-effect-v0.11.10.md). The browser shell
was opened, but Playwright denied selecting sibling-repository files outside its
allowed workspace. No access workaround or fake media was used. Consequently
real once/aura pixels, target-loss cleanup, RAF/background behavior and late-load
cleanup in this Client consumer remain FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED.
The runbook supports manual product review with an authorized file selection.
