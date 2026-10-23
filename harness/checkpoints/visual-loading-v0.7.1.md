# v0.7.1 — Resource Provider & Source Access (VL03)

**READY_FOR_NEXT_CHECKPOINT / BUILD_PASS**.
Finite source-access observations below; overall **FEATURE_NOT_VERIFIED /
VISUAL_NOT_VERIFIED / TPSHEET_NOT_VERIFIED**. No functional phase acceptance.

## Preflight and ownership

Starting HEAD: `862339c20491bc3d278c5fed892418f61e0bd5e9` (v0.7.0).
Branch `feat/visual-resource-loading-v0.7`; main/origin/main
`33c9da5ac79cfce27043927fe5d7e08e3bd6d02c`, refreshed via git fetch origin.
Existing draft [PR7](https://github.com/TjnhPro/rpg-platform/pull/7) targets main.
Previous checkpoint's exact-head push and pull_request builds both SUCCESS:
[push](https://github.com/TjnhPro/rpg-platform/actions/runs/39901895720),
[PR](https://github.com/TjnhPro/rpg-platform/actions/runs/39901936476).
No prerequisite merge, phase acceptance or new base is inferred.

Read root/project guidance, ARCHITECTURE/FOUNDATION and Harness contracts,
ownership/workflow/verification. Audited current Render metadata/ordered sources,
frame-session/Three cleanup, public declarations/manifests; Editor locator,
asset-visual/reference contracts and optional browser host; Client root/host.
No source provider existed; no real image/TPSheet sample is tracked/provided.
Three0.186.1/@types0.186.0, TypeScript6.0.3 remain locked and unchanged.
Initial tracked tree was clean; pre-existing untracked .mcp.json is unread,
unmodified and excluded from staging. Ignored local artifacts remain untracked.

Canonical primary owner **runtime-render**: portable authorized-source port and
acquisition coordinator. Editor is touched only for a real optional host consumer
and its manual guide. Client requires compilation against the changed root, with
no source change. Task explicitly authorizes this additive public boundary; no
new owner or import direction. No external L1/L2 API required. Engine/Server and
read-only L1/L2 remain unchanged, as do all manifests/pins/lockfiles and Harness
rules/config/checker. Exactly five projects.

## Delivered scope and exact public delta

- Render `src/visual-source.ts`: explicit project/provider/authorization scope,
  source-index request, borrowed provider response, caller-owned buffer copy,
  revision/media/length observation and safe failure union. No automatic IO.
- Render `src/index.ts`: seven additive root symbols, 70 -> 77:
  acquireVisualSource, VisualSourceScope, VisualSourceRequest, VisualSourceResponse,
  VisualSourceProvider, VisualSourceFailureCode, VisualSourceAcquisition.
- Render [contract record](../../runtime-render/docs/visual-loading-v0.7.1.md):
  lifetime, permission/revision trust, limits, media and normalized error semantics.
- Render [supplied task](../../runtime-render/docs/tasks/visual-loading-v0.7.1.md):
  this milestone only, whitespace cleaned.
- Editor [manual consumer](../../editor/manual/visual-source.mts),
  [guide](../../editor/manual/visual-source.md) and manual README link: explicitly
  supplied real bounded manifest snapshot, public Render root only. No new Editor
  production API; Editor134/Client0 unchanged.
- This checkpoint report. Exact commit/CI ledger is appended to the same PR after
  push; no self-referential SHA or fabricated pending-check success here.

prepareVisualResource remains sync/pure metadata with NOT_PERFORMED, unchanged.
The existing image hint applies only to image-role acquisition, not metadata.
Repeated source roles are selected by explicit index; no page/frame interpretation.
No filesystem/URL construction, fetch, decoder, atlas parser, upload, cache, lease,
alternate renderer, Scene instance, authored schema or gameplay change.

## Actual verification evidence

| Command / observation | Result |
| --- | --- |
| node harness/cli.mjs check | Exit0, ARCH_CHECK_PASS, 80 JS/TS files |
| node harness/cli.mjs scope --projects runtime-render,editor,game-client --allow-infra | Exit0, SCOPE_PASS9 paths: eight task files plus pre-existing .mcp.json, which is excluded from commit |
| node harness/cli.mjs verify --projects runtime-render,editor,game-client --with-consumers | Exit0, Render/Editor/Client genuine independent BUILD_PASS |
| npm run build -- --force | Exit0, real all-five project-reference build |
| Strict noEmit compile of editor/manual/visual-source.mts, ES2022+DOM | Exit0, package-root consumer resolves/compiles |
| Strict noEmit compile of ignored .artifacts/vl03-consumer.mts, ES2022 only | Exit0, all seven public symbols usable without DOM types |
| Guide's finite Node host sequence, manually invoked | Exit0, observations below; no assertions/test runner |
| Headless Render root dynamic import with throwing getters for window/document/URL/fetch/HTMLCanvasElement/WebGL2RenderingContext/ImageBitmap | Exit0; imported acquireVisualSource function, no getter access |
| Source/import inspection and emitted declarations | Render portable path has no fs/fetch/URL/graphics acquisition; seven additions, Editor/Client public surfaces unchanged |
| git diff --cached --check | Exit0, no whitespace errors |

No failed/unconfigured final build. The first manual consumer compilation exposed
Object.freeze literal contextual widening/implicit-any; fixed with explicit
Object.freeze<VisualSourceProvider> and recompiled successfully before the demo.
Existing Windows Harness DEP0190 warning remains non-failing. Build/CI does not
execute the manual scenario or validate behavior/graphics/security.

The manual host explicitly authorizes the one literal committed editor/package.json,
reads at most4097 bytes (rejects above4096) and closes the handle before supplying
the immutable snapshot/revision. Local observed length483 bytes, SHA-256
`ecc9bccdc933060161ab4a6a5ec49191701a1dfd36512f735cbba1aadf448177`.
Checkout newline differences may change byte length/revision. This hash identifies
the exact read bytes, not an atomic live-filesystem version claim.

Observed output:

- metadata-only NOT_PERFORMED, provider-calls0;
- authorized manifest source-acquired, application/json, length483, exact revision;
  independent buffer true and printed actual manifest contents;
- ungranted image SOURCE_DENIED;
- authorized absent host-snapshot key SOURCE_NOT_FOUND (not a physical-file probe);
- maxBytes1 CONTENT_TOO_LARGE;
- explicit image/png expectation against the JSON source MEDIA_TYPE_MISMATCH;
- other-project identity SOURCE_DENIED before provider invocation;
- total host reads5; no fallback image, decoder or graphics activity.

## Limitations and next handoff

No architecture/dependency blocker for VL03. This minimal complete-buffer port is
trusted-host coordination, not a sandbox: host must enforce permissions, bounded
IO, coherent bytes/revision and revocation before delivery. Same-realm non-shared
buffers only. Caller owns its mutable copy; the wrapper freeze is not byte freezing.
Host CANCELLED is supported as a failure result; no Render abort/timeout behavior or
runtime cancellation observation is claimed. Malformed/unknown host responses fail
closed, but every failure path was not independently executed.

No real PNG/TPSheet supplied; the manifest is real source bytes, never an image or
invented atlas fixture. Real PNG decode, producer atlas compatibility, browser
provider integration, texture/cache/lease lifetime, graphics/display, filesystem
containment and performance/leak-free behavior remain unverified. Browser hosts are
not rewritten for this portable-source checkpoint. Developer owns manual product
review/phase acceptance. No tests/frameworks, merge, release or publish.

Continue on the same branch/PR when v0.7.2 is supplied; do not invent its requirements
or include its byte/decode/loading subsystem in this checkpoint commit.
