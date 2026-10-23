import { prepareVisualResource, type VisualResourceDescriptor } from './visual-resource.js';

/** Host-issued authority identity, not a credential or an authored Asset ID. */
export interface VisualSourceScope {
  readonly projectId: string;
  /** Fresh symbol per provider/authorization boundary; never derive from a path. */
  readonly providerId: symbol;
  /** Replace provider/scope when permissions or root change. */
  readonly authorizationGeneration: string;
}

export interface VisualSourceRequest {
  readonly scope: VisualSourceScope;
  readonly identity: VisualResourceDescriptor['identity'];
  readonly source: VisualResourceDescriptor['sources'][number];
  readonly sourceIndex: number;
  /** Host must bound the read itself, before allocating/returning its payload. */
  readonly maxBytes: number;
  readonly expectedMediaType: string | null;
}

export type VisualSourceFailureCode =
  | 'SOURCE_DENIED' | 'SOURCE_NOT_FOUND' | 'CANCELLED' | 'CONTENT_TOO_LARGE'
  | 'PROVIDER_FAILED' | 'INVALID_RESPONSE' | 'MEDIA_TYPE_MISMATCH';

export type VisualSourceResponse =
  | {
    readonly status: 'provided';
    /** Borrowed until acquisition settles; stable, non-shared, same-realm buffer. */
    readonly bytes: Uint8Array<ArrayBuffer>;
    readonly contentLength: number;
    /** Host observation, not inferred by Render or proof of the encoded format. */
    readonly mediaType: string | null;
    /** Exact revision of these bytes, observed coherently by the host. */
    readonly revision: string;
  }
  | { readonly status: 'failed'; readonly code:
    'SOURCE_DENIED' | 'SOURCE_NOT_FOUND' | 'CANCELLED' | 'CONTENT_TOO_LARGE' };

/**
 * Borrowed for one awaited call; no Render retention, disposal, streams or handles.
 * Host authorizes project + exact source + current grant BEFORE reading and again
 * before returning if revoked during IO. Scope is immutable for this provider.
 * Host owns IO/containment, bounded reads and any partial-read cleanup. Cancellation
 * is host-reported CANCELLED; no Render abort signal or timeout is promised.
 */
export interface VisualSourceProvider {
  readonly scope: VisualSourceScope;
  readonly read: (request: VisualSourceRequest) => Promise<VisualSourceResponse>;
}

export type VisualSourceAcquisition =
  | {
    readonly status: 'source-acquired';
    readonly request: VisualSourceRequest;
    readonly revision: string;
    readonly mediaType: string | null;
    readonly contentLength: number;
    /** Independent mutable copy owned by caller; drop references to release. */
    readonly bytes: Uint8Array<ArrayBuffer>;
  }
  | { readonly status: 'failed'; readonly code: VisualSourceFailureCode };

function nonblank(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

const fail = (code: VisualSourceFailureCode): VisualSourceAcquisition => Object.freeze({ status: 'failed', code });

/**
 * Acquire exactly one logical source via explicit host authority. Invalid caller
 * metadata/options throw TypeError (Promise rejection). Provider rejection, including
 * unknown exceptions, becomes PROVIDER_FAILED without exposing raw host data.
 * No fallback, URL/path resolution, decoder, cache, graphics or global IO access.
 * Host length/media claims are checked but bytes are not format-validated here.
 */
export async function acquireVisualSource(
  descriptor: VisualResourceDescriptor, sourceIndex: number,
  provider: VisualSourceProvider, maxBytes: number,
): Promise<VisualSourceAcquisition> {
  const captured = prepareVisualResource(descriptor).descriptor;
  if (!Number.isSafeInteger(sourceIndex) || sourceIndex < 0 || sourceIndex >= captured.sources.length
    || !Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
    throw new TypeError('Source index and positive safe-integer maxBytes are required');
  }
  const inputScope = provider.scope;
  const scope = Object.freeze({ projectId: inputScope.projectId, providerId: inputScope.providerId,
    authorizationGeneration: inputScope.authorizationGeneration });
  const read = provider.read;
  if (!nonblank(scope.projectId) || typeof scope.providerId !== 'symbol'
    || !nonblank(scope.authorizationGeneration) || typeof read !== 'function') {
    throw new TypeError('An explicit scoped source provider is required');
  }
  if (scope.projectId !== captured.identity.projectId) return fail('SOURCE_DENIED');
  const source = captured.sources[sourceIndex]!;
  const request: VisualSourceRequest = Object.freeze({ scope, identity: captured.identity,
    source, sourceIndex, maxBytes, expectedMediaType: source.role === 'image' ? captured.mediaType : null });
  let response: VisualSourceResponse;
  try { response = await read.call(provider, request); }
  catch { return fail('PROVIDER_FAILED'); }
  // Providers are trusted host code, but malformed/detached responses still fail
  // closed. Do not leak exceptions from response getters or copying its buffer.
  try {
    if (typeof response !== 'object' || response === null) return fail('INVALID_RESPONSE');
    if (response.status === 'failed') {
      const code = response.code;
      return code === 'SOURCE_DENIED' || code === 'SOURCE_NOT_FOUND' || code === 'CANCELLED'
        || code === 'CONTENT_TOO_LARGE' ? fail(code) : fail('INVALID_RESPONSE');
    }
    if (response.status !== 'provided') return fail('INVALID_RESPONSE');
    const { bytes, contentLength, mediaType, revision } = response;
    if (!(bytes instanceof Uint8Array) || !(bytes.buffer instanceof ArrayBuffer)
      || !Number.isSafeInteger(contentLength) || contentLength < 0 || contentLength !== bytes.byteLength
      || !nonblank(revision) || (mediaType !== null && (typeof mediaType !== 'string'
        || !/^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/u.test(mediaType)))) {
      return fail('INVALID_RESPONSE');
    }
    if (contentLength > maxBytes) return fail('CONTENT_TOO_LARGE');
    if (request.expectedMediaType !== null && (mediaType === null
      || request.expectedMediaType.toLowerCase() !== mediaType.toLowerCase())) return fail('MEDIA_TYPE_MISMATCH');
    const owned = new Uint8Array(contentLength);
    owned.set(bytes);
    return Object.freeze({ status: 'source-acquired', request, revision, mediaType, contentLength, bytes: owned });
  } catch { return fail('INVALID_RESPONSE'); }
}
