# VL05 — PNG browser decoding foundation

Runtime Render owns PNG admission, browser decoding and the private decoded
bitmap. Editor supplies authorized bytes and the optional finite manual consumer;
Client compiles the same root. This additive checkpoint is authorized by the
[v0.7.3 task](tasks/visual-loading-v0.7.3.md). No L1/L2 API is involved.

## Public delta

Five root exports (Render80 →85): `createPngImageDecode`, `PngDecodeLimits`,
`PngDecodeFailure`, `PngImageObservation`, `PngImageDecode`. Prior declarations,
including metadata-only `prepareVisualResource`, stay unchanged. The public
declarations use ES2022 data/interfaces, with no DOM/THREE types.

Create using an existing `VisualSourceLoad` and explicit budgets. Creation is
browser/IO-free. Acquire the source separately before `start()`. Start enters
pending synchronously and runs once; repeated start returns the same completion
until release. The decoder uses `copyBytes()`, never transfers/detaches provider
bytes and never releases the source. Source and image are independent lifetimes.
Releasing the source after the decoder has copied its bytes does not release the
image. Releasing it before copy yields `SOURCE_NOT_ACQUIRED`.

Observation stage is `decoded-image`; states requested/pending/decoded/failed/
released. `decoded` means browser decode succeeded and dimensions passed checks,
not GPU upload, frame submission or displayed pixels. Native bitmap stays private
inside this handle. Consumers cannot close/transfer/borrow it. This checkpoint
does not expose a draw/upload operation. Each decode creates its own bitmap;
there is no sharing, lease, cache or global resource registry.

## Format and admission

Required positive safe-integer budgets: `maxBytes <= 16777216`,
`maxDimension <= 8192`, `maxPixels <= 16777216`; lower host limits encouraged.
Source metadata is checked before copying; actual copy length is checked again.
PNG signature, bounded chunk envelope and first IHDR are inspected; nonzero
integer width/height and their product must meet budgets before invoking browser
decode. At most65536 chunks. Supported IHDR bit-depth/color combinations follow
PNG; compression/filter methods0, interlace0/1. IDAT must exist/consecutive, IEND
must be empty/final. Unknown critical chunks, APNG chunks and eXIf are rejected.
No JPEG/WebP/GIF or EXIF orientation support. Media hints and source role are not
format evidence. Neither `mediaType:null` nor `image/png` bypasses byte inspection.

This is bounded container admission, not a full PNG validator/decompressor.
CRC checking, palette/chunk semantic validation and decompression are delegated
to the browser; browser leniency may vary. `INVALID_PNG` covers detected envelope/
IHDR errors; `NOT_PNG` covers signature mismatch; `UNSUPPORTED_PNG` covers excluded
features; `DECODE_LIMIT_EXCEEDED` covers budgets. The browser must still decode
successfully. Its resulting width/height must be positive safe integers, within
budget and exactly equal to IHDR; otherwise close and `DIMENSION_MISMATCH`.

Budgets do not guarantee a process memory ceiling or hard decode timeout. Browser
implementation, intermediate allocations, metadata inflation, internal pixel
precision and malformed streams can consume additional memory/CPU. No decompression
ratio instrumentation, process sandbox or native cancellation is promised.

## Pixels, color and decoder identity

Uses native `createImageBitmap(new Blob([bytes], {type:'image/png'}), options)`.
Options are fixed: `imageOrientation:'from-image'`, `premultiplyAlpha:'none'`,
`colorSpaceConversion:'none'`, no resize/crop/flip. Orientation-bearing eXIf is
excluded, so the admitted PNG raster uses its unrotated source dimensions.
The browser is requested to retain unpremultiplied alpha and skip color-space
conversion. This does not promise a portable RGBA8 typed buffer, identical
rounding/hidden transparent colors, or a display color profile. No canvas readback
or pixel comparison has been performed.

The fixed identity is
`browser-png-v1/from-image/alpha-none/color-none/no-resize`; changing output options
requires a new identity. Future cache identity also needs source scope, coherent
revision and input identity; GPU identity needs context/session. No cache key or
sharing policy is implemented now. Node without native createImageBitmap returns
`DECODER_UNAVAILABLE`; no headless PNG decoder/polyfill/dependency is installed.

## Ownership, late completion and errors

`release()` is terminal and idempotent. It drops source/completion references and
attempts native `ImageBitmap.close()` once for the owned bitmap. Ownership is
cleared before close, preventing retries/double close even if close throws.
Releasing pending decode does not cancel native work: any eventual bitmap is
closed once without adopting decoded state. Await/catch the original start Promise
even after release. A late native rejection still rejects unchanged. No source
bytes or bitmap appears in historical snapshots.

Cleanup observations: not-needed before allocation, owned while decoded, closed
after a successful close call, close-failed after an exception. Pending release
may initially say not-needed and later become closed/close-failed; state remains
released. Native cleanup failure propagates unchanged from release (or start for
late cleanup). No automatic retry; successful close is not a memory profiler result.
Unexpected browser/source exceptions reject unchanged and record failure:null.
No heuristic classification by exception message/name, no WebGL failure code.
Known Render admission failures resolve failed snapshots; invalid budget arguments
throw TypeError. Preserve source metadata and old source APIs independently.

## Evidence and references

[Consumer](../../editor/manual/png-image.md),
[checkpoint](../../harness/checkpoints/visual-loading-v0.7.3.md).
Browser runtime/decode/cleanup observations are pending; build does not prove them.
No TPSheet/atlas or GPU decoding/display evidence is implied.

Primary specifications audited 2026-10-23:
[WHATWG ImageBitmap](https://html.spec.whatwg.org/multipage/imagebitmap-and-animations.html#imagebitmap),
[W3C PNG3](https://www.w3.org/TR/2025/REC-png-3-20250624/).
Installed Three0.186.1 ImageBitmapLoader uses fetch/Cache and native createImageBitmap;
we reuse the native decoding API directly to preserve the explicit provider boundary
and avoid implicitly adding Three's URL access/cache. No second renderer is added.
