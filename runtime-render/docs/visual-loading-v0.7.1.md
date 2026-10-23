# VL03 — authorized source provider contract

Runtime Render owns the portable acquisition coordinator. Editor owns the optional
manual host consumer; Client remains a root consumer requiring compilation only.
The supplied task authorizes this additive public seam. No ownership/import
direction changes and no external L1/L2 API is needed.

## Public delta

Seven added root symbols (70 -> 77): acquireVisualSource, VisualSourceScope,
VisualSourceRequest, VisualSourceResponse, VisualSourceProvider,
VisualSourceFailureCode and VisualSourceAcquisition. Editor134/Client0 unchanged.
Existing descriptor/preparation, graphics APIs and failure classifiers unchanged.
All package manifests/exports/dependencies unchanged; root-only consumption.

acquireVisualSource(descriptor, sourceIndex, provider, maxBytes) returns an awaited
source-acquired or failed observation. The selected ordered index disambiguates
repeated roles/pages without inventing atlas semantics. Metadata is detached by
the existing synchronous prepareVisualResource; it still reports NOT_PERFORMED.
Acquisition is separate and does not decode, create graphics or submit frames.

## Authority, provenance and lifetime

The host supplies an immutable scope: exact projectId, fresh providerId symbol and
authorizationGeneration. Replacing a root, permission set or principal requires a
new provider/scope. Strings/locators cannot grant rights. Cross-project requests
fail before invoking read. The host additionally authorizes the exact source and
current grant before reading and returning bytes, including revocation during IO.
The port is trusted host code, not a sandbox capable of policing a malicious host.
Logical locators are never mapped to URLs/paths inside Render; portable lexical
validation is not symlink/realpath containment. Host code owns those IO guarantees.

Provider is borrowed during a single awaited request; Render holds no registry,
cache, retained source handle or provider disposal obligation. The response is a
complete same-realm Uint8Array backed by ArrayBuffer, never SharedArrayBuffer or a
stream. Host retains ownership and must keep the bytes stable until acquisition
settles. Render copies into a fresh caller-owned mutable buffer before success;
freezing the wrapper does not freeze these bytes. Caller drops references when
finished; host independently releases its original bytes/partial read/IO handles.
No external-resource release callback is needed for this buffer-only response.

The returned frozen request preserves selected identity/source and authority scope;
revision identifies exactly the bytes in this response. Host must observe revision
and bytes coherently. A declared revision is not validated against live storage by
Render. Fresh symbols isolate independent providers; equal path/asset/revision text
never implicitly authorizes sharing. There is no reuse, deduplication or cache at
this checkpoint. Any future cache needs explicit authority, revisions and options,
plus graphics generation for GPU objects, as described in v0.7.0.

## Bounds, media and errors

maxBytes is a required positive safe integer, forwarded to the host. Host bounds
the read before allocation; Render checks actual view byteLength, declared length
and the cap again before allocating its copy. This is a per-source bound, not a
global concurrent memory budget or a hostile-provider memory sandbox. Empty bytes
can be acquired; image validity belongs to a future decode stage.

Media is an explicit bare type/subtype or null, never filename sniffing. For image
roles the descriptor image hint is required to match the provider's nonnull media
observation, case-insensitively; null descriptor means no expectation. Non-image
roles have no image-hint constraint, allowing future metadata source access without
pretending metadata is an image. Media claims do not prove the encoded format.

| Outcome | Meaning |
| --- | --- |
| SOURCE_DENIED | Cross-project admission or host denies current permission |
| SOURCE_NOT_FOUND | Authorized source absent in host storage/snapshot |
| CANCELLED | Host explicitly reports cancellation; no signal/timeout supplied by Render |
| CONTENT_TOO_LARGE | Host bounded read rejected, or actual response exceeds cap |
| PROVIDER_FAILED | read throws/rejects; raw exception/cause/credentials not exposed |
| INVALID_RESPONSE | Malformed/length-inconsistent/shared/detached payload or copy failure |
| MEDIA_TYPE_MISMATCH | Nonnull expected image media lacks matching host observation |

Invalid caller metadata, source index, budget or provider configuration rejects
with TypeError. Unexpected accessors on caller configuration may reject directly;
this input is trusted host code. Malformed response getters are normalized. There
is no fallback image, retry, unknown-error success, URL fetch or filesystem access.
Render cancellation is not implemented; host CANCELLED is a failure observation,
and a host that never settles can leave the request pending. The coordinator never
adopts the source into a graphics session or retains it after the caller releases it.

## Evidence scope

[Manual guide](../../editor/manual/visual-source.md) compiles a real package-root
consumer and supplies an explicitly authorized bounded snapshot of the committed
Editor manifest. It demonstrates source bytes/provenance, missing/denied sources,
media mismatch, bounds and zero IO from metadata preparation. The manifest is
actual JSON, not a fabricated PNG/TPSheet fixture. No browser provider, decoder,
atlas parser, source cache, GPU resource or lease exists here. Functional/visual
phase acceptance remains Developer-owned; see the checkpoint for actual commands.
