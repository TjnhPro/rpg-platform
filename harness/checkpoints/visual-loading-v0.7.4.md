# v0.7.4 — VL06 Texture Creation & Graphics Context Integration

Status: **READY_FOR_NEXT_CHECKPOINT / BUILD_PASS**.
**FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED / TPSHEET_NOT_VERIFIED**.
Successful GPU upload and cleanup acceptance remain pending browser observation.

## Baseline, authorization and ownership

- Starting HEAD: `6ee115559175f5ccd86e85231054669e1bd9b9b3` (v0.7.3).
- main/origin main: `33c9da5ac79cfce27043927fe5d7e08e3bd6d02c`.
- Branch `feat/visual-resource-loading-v0.7`; existing open draft PR#7.
- v0.7.3 push [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39904738803)
  and PR [SUCCESS](https://github.com/TjnhPro/rpg-platform/actions/runs/39904746033),
  both exact starting HEAD. Prior implementation is not formal Developer acceptance.
- Supplied [task](../../runtime-render/docs/tasks/visual-loading-v0.7.4.md) authorizes
  this additive public contract and finite manual consumer without per-version gate.
- Pre-existing untracked `.mcp.json` is unread/unmodified/excluded from commit.

Read agent guidance, architecture/Foundation, Harness ownership/contracts/workflow/
verification, preceding checkpoint, source/public declarations, actual Three
dependency and graphics acquisition/loss/disposal. Primary owner: Runtime Render
for upload admission, private native allocations, per-session texture lifetime and
safe diagnostics. Editor is touched only for an optional authorized PNG consumer;
Client is a compile consumer. No Engine/Server/L1/L2 API needed or modified.
Exactly five projects; no manifests/lockfile/dependency/checker/config/CI changes.
No breaking API, owner movement, alternate renderer or authored schema changes.

## Scoped files and public delta

Fourteen task paths:

- Render `src/frame-session.ts`, `three-frame.ts`: integrate upload and cleanup
  into the existing backend/session and existing target quarantine policy.
- Render `src/png-image.ts`, `png-bitmap.ts`: private synchronous bitmap borrow;
  v0.7.3 public contract unchanged and browser types kept off reachable declarations.
- Render `src/render-texture.ts`, `texture-lifetime.ts`, `index.ts`: opaque guarded
  API, frozen observations, terminal cleanup and seven additive root symbols.
- Render `docs/visual-loading-v0.7.4.md`, `docs/tasks/visual-loading-v0.7.4.md`:
  exact contract/limits and supplied implementable task.
- Editor `manual/texture-upload.mts`, `.html`, `.md`, `manual/README.md`: optional
  finite public-root consumer with two real graphics sessions and existing PNG.
- This checkpoint.

Render85 →92, Editor134/Client0 unchanged, counted from emitted root declarations
using TypeScript checker. Added exactly `uploadPngTexture`,
`getRenderTextureSnapshot`, `getRenderTextureFailure`, `RenderTexture`,
`RenderTextureSnapshot`, `RenderTextureOptions`, `RenderTextureFailure`.
No old root symbol removed or existing public declaration changed. Root remains
headless-importable and portable ES2022 without DOM types.

Audited Three0.186.1/@types0.186.0. Native upload lives inside the same Phase6
backend/context, using public renderer.resetState around bounded WebGL2 work;
Three's catch-and-log upload wrapper cannot prove native acceptance. No second
renderer, private Three properties or native pointers cross the public boundary.
Explicit nearest/linear + srgb/linear-srgb options, single mip, clamp, straight
alpha and no resize/color guessing; see the contract for precise interpretation.

Usable is native API upload acceptance with no detected GL error, not GPU
completion/pixel/display evidence. Release/loss/session disposal are terminal;
CPU source/image ownership stays independent. Partial allocation failure attempts
native deletion; uncertain cleanup records failure and quarantines the target.
Unknown exceptions remain original, including combined upload/cleanup failure.
No material, sprite, frame draw, loop, cache, lease, atlas/TPSheet or VFX behavior.

## Build and static evidence

All final commands exit0:

| Gate | Observed result |
| --- | --- |
| `npm run build --workspace runtime-render` | BUILD_PASS |
| `node harness/cli.mjs check` | ARCH_CHECK_PASS, 88 JS/TS files |
| `node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra` | SCOPE_PASS15 (14 task paths + excluded .mcp.json) |
| `node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers` | Render/Editor/Client independent BUILD_PASS |
| `npm run build -- --force` | All-five workspace BUILD_PASS |
| Strict ES2022/DOM compile of optional manual entry | PASS |
| Strict ES2022, types[], skipLibCheck:false root consumer compile | PASS; all seven additions resolve without DOM |
| Root import with throwing browser-global getters; metadata preparation | PASS; no browser accesses, NOT_PERFORMED |
| `git diff --cached --check` | PASS |

An initial portable compile exposed an internal ImageBitmap declaration reachable
through png-image; moving private borrowing to png-bitmap fixed this before final
gates. No final failed/unconfigured build. Existing Windows DEP0190 warning is
non-failing. No tests/assertions/runners/browser automation added or run. Exact
checkpoint SHA and push/PR CI URLs/results are appended to PR#7's ledger after
push; this report does not invent its own commit SHA or remote CI result.

## Manual evidence and gaps

The existing original PNG is unchanged: 76 bytes, documented2x2 RGBA, SHA256
`e9aa41812d69aa8ebbee3fb351fede258f2a159c4a547b3187ee54184dea0b79`.
Root imported with browser globals guarded; metadata preparation observed
resourceLoading NOT_PERFORMED. No decode/upload/GPU path ran in Node.
Current computer surface inventory returned apps[]/browsers[]. The finite manual
consumer compiles but is unexecuted. It supplies a bounded fixed-URL host and
instructions for real decode/upload, A/B context isolation, CPU release, explicit
texture release, terminal session disposal and fresh-session rejection of old
handles; those instructions are not observations.

Actual native allocation/upload acceptance, pixel sampling/alpha/color behavior,
cross-context/reacquire runtime rejection, native loss and cleanup under faults,
exact delete/close counts and driver memory reclamation remain unverified.
No visible sprite/frame or leak-free claim. No real TPSheet sample/parser.
Developer owns functional/visual review and phase acceptance. No architecture
blocker observed; manual verification gap is permitted at this intermediate
checkpoint. No merge/release/publish or v0.7.5 implementation included.
