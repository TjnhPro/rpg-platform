# VL06 — Texture creation and graphics context integration

Canonical owner: Runtime Render. The existing Phase6 graphics backend owns every
native allocation; Editor hosts only a finite public-root manual consumer and
Client compiles against the same root. No engine/server/L1/L2 or authored asset,
scene, document, network, cache, atlas or gameplay change.

## Public delta

Seven additive root symbols (85 →92): `uploadPngTexture`,
`getRenderTextureSnapshot`, `getRenderTextureFailure`, `RenderTexture`,
`RenderTextureSnapshot`, `RenderTextureOptions`, `RenderTextureFailure`.
Existing APIs and diagnostics are unchanged. Root declarations remain portable
ES2022: no DOM, native bitmap, WebGL or Three type is exposed by this addition.

`uploadPngTexture(session, image, options)` is synchronous and requires a live
canonical graphics session and canonical decoded PNG handle from this package
instance. It never implicitly decodes, fetches, acquires a session or renders.
Package-private weak identity maps reject fabricated handles. No implementation
subpath is exported by the package. Every upload allocates a distinct resource;
no global cache/dedup/lease or source-catalog semantics are introduced.

The frozen opaque handle offers `getSnapshot()` and terminal/idempotent
`release()`. The snapshot contains only symbol identity/session identity,
dimensions, explicit options, stage `gpu-texture`, state and cleanup observation.
`getRenderTextureSnapshot(session, handle)` additionally checks session ownership;
even a new session borrowing the same canvas cannot reuse the old capability.
No native pointer or backend object is available to consumers. Drawing these
handles is a later checkpoint; no sprite/material path is claimed here.

## Upload admission and readiness

Decoded image ≠ allocated texture ≠ usable ≠ frame submitted ≠ displayed.
`usable` is published only after synchronous native creation/upload in the
existing WebGL2 context: non-null allocation, positive bounded dimensions within
MAX_TEXTURE_SIZE, isTexture true, live context and no detected GL error after
upload/state restoration. Existing GL errors reject instead of being drained to
manufacture successful upload. No intermediate constructed handle escapes.
This proves API acceptance only: no fence, GPU completion, pixel readback,
correct color/alpha display, performance or eventual device-health guarantee.
Snapshots are observations; native loss can occur after any read.

Actual dependency: Three0.186.1 / @types0.186.0. Audited installed Three
`WebGLState` catches/logs native texImage2D failures, while initTexture returns
void and texture version/onUpdate can advance without native acceptance.
Consequently this private backend performs the bounded native upload itself
inside its existing context, bracketing it with public renderer.resetState for
cache coherence. It restores the existing viewport/clear color. There is still
one WebGLRenderer/session, no private Three property reflection, alternate
renderer or public native context. Future material integration must remain in
this backend and account for these native allocations explicitly.

## Pixel profile

Both options are mandatory: `sampling: nearest | linear` and
`colorSpace: srgb | linear-srgb`. Pixel-art consumers explicitly select nearest;
the platform does not guess a universal filter. Single level0, no mip generation,
clamp-to-edge, unsigned-byte RGBA. sRGB selects SRGB8_ALPHA8; linear selects RGBA8.
Color interpretation is a host declaration, not an inferred PNG ICC profile.
The v0.7.3 decoder retains from-image/no-premultiplication/no-color-conversion/
no-resize identity; orientation metadata is rejected there. Upload uses straight
alpha, unflipped bitmap, no browser color conversion, unpack alignment1 and no
pixel unpack buffer. ImageBitmap's creation options govern bitmap orientation
and premultiplication; upload flags alone cannot override those choices.
Alpha blending/material/output color management are not implemented here.
Images exceeding native limits reject before allocation instead of resizing.

## Ownership and failure

The bitmap is synchronously borrowed during upload only. Upload and GPU release
never close/release source or image. CPU release after successful upload does
not release that texture; uploading an already released/nondecoded image rejects.
Multiple sessions upload independent GPU copies from the same live decoded image.

Session-local live-resource tracking invalidates all outstanding textures before
backend disposal. Explicit release removes that resource; later session disposal
does not rewrite its released state. Terminal handles drop backend callbacks.
Context-loss event handling checks actual native loss (synthetic events alone
are insufficient); snapshot/release also probes native loss. Loss terminates the
session and invalidates live handles, without automatic restoration. Reacquire
requires the existing explicit graphics API and a fresh session/upload.

Every returned texture has at most one explicit native delete attempt. Upload
failure attempts delete of any allocated native texture before existing session
failure cleanup. Deletion failures remain terminal with delete-failed, mark
session cleanup uncertainty and quarantine its target through existing policy.
`deleted` means delete was accepted/no detected error (including a lost context
whose resources are already invalid); it does not prove driver reclamation.
Three Texture objects are not allocated on this path, so native deletion is the
matching destructor; ImageBitmap CPU ownership stays with the decoder. See
[Three disposal](https://threejs.org/manual/pages/how-to-dispose-of-objects.html)
and [renderer API](https://threejs.org/docs/pages/WebGLRenderer.html).

Known codes: SESSION_UNAVAILABLE, IMAGE_NOT_DECODED, CONTEXT_MISMATCH,
TEXTURE_LIMIT_EXCEEDED, CONTEXT_LOST, GL_STATE_ERROR, UPLOAD_FAILED, CLEANUP_FAILED.
Invalid options/fabricated handles throw TypeError. Admission-only rejection
leaves an otherwise valid session intact. Backend upload failure terminates it;
recognized native loss retains Phase6's CONTEXT_LOST diagnostic. Unknown native
exceptions retain their original identity; classification returns undefined.
If upload and cleanup both fail, the original error is rethrown and session
cleanupFailed carries cleanup uncertainty; do not infer it from the primary
texture error alone. No raw native error is copied into safe snapshots.

## Evidence limits

See [manual procedure](../../editor/manual/texture-upload.md) and
[checkpoint](../../harness/checkpoints/visual-loading-v0.7.4.md). Build/static
evidence is independent of browser evidence. No browser surface is available in
this environment; real successful upload, native loss, fault cleanup, pixel
behavior and memory reclamation remain FEATURE_NOT_VERIFIED / VISUAL_NOT_VERIFIED.
TPSHEET_NOT_VERIFIED; no atlas sample/parser is fabricated. No tests are added.
