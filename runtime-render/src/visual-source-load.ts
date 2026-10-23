import type { VisualResourceDescriptor } from './visual-resource.js';
import {
  captureVisualSourceAccess, acceptVisualSourceResponse,
  type CapturedVisualSourceAccess, type VisualSourceProvider,
  type VisualSourceRequest, type VisualSourceResponse, type VisualSourceFailureCode,
} from './visual-source.js';

/** Historical metadata only: never retains a byte buffer, provider or GPU handle. */
export type VisualSourceLoadObservation = {
  readonly id: symbol;
  readonly stage: 'source';
} & (
  | { readonly state: 'requested' | 'pending' | 'released' }
  | { readonly state: 'failed'; readonly failure: VisualSourceFailureCode | null }
  | {
    readonly state: 'source-acquired';
    readonly source: {
      readonly request: VisualSourceRequest;
      readonly revision: string;
      readonly mediaType: string | null;
      readonly contentLength: number;
    };
  }
);

/** Independent single-use source lifetime, not a graphics session or shared lease. */
export interface VisualSourceLoad {
  readonly getSnapshot: () => VisualSourceLoadObservation;
  /** Starts once. Await/catch even when releasing before host completion. */
  readonly start: () => Promise<VisualSourceLoadObservation>;
  /** Fresh caller-owned copy only while source-acquired; otherwise null. */
  readonly copyBytes: () => Uint8Array<ArrayBuffer> | null;
  /** Terminal/idempotent; drops owned bytes and source/provider references. */
  readonly release: () => VisualSourceLoadObservation;
}

/**
 * Capture validated source metadata/authority without IO. Explicit start enters
 * pending; successful completion means bytes only. Known admission failures resolve
 * failed observations. Unexpected provider/response errors reject unchanged and
 * record failed/failure:null. Release never aborts host IO; late success is discarded
 * before reading/copying its bytes, and late rejection still reaches start's caller.
 */
export function createVisualSourceLoad(
  descriptor: VisualResourceDescriptor, sourceIndex: number,
  provider: VisualSourceProvider, maxBytes: number,
): VisualSourceLoad {
  return createLoad(captureVisualSourceAccess(descriptor, sourceIndex, provider, maxBytes));
}

// Separate factory avoids retaining the original descriptor/provider arguments.
function createLoad(access: CapturedVisualSourceAccess | undefined): VisualSourceLoad {
  const id = Symbol();
  let snapshot: VisualSourceLoadObservation = Object.freeze({ id, stage: 'source', state: 'requested' });
  let request: VisualSourceRequest | undefined;
  let bytes: Uint8Array<ArrayBuffer> | undefined;
  let completion: Promise<VisualSourceLoadObservation> | undefined;
  const isReleased = (): boolean => snapshot.state === 'released';

  const adopt = (response: VisualSourceResponse): VisualSourceLoadObservation => {
    // Do not even inspect late host response getters once release revoked adoption.
    if (isReleased()) return snapshot;
    const acquired = acceptVisualSourceResponse(response, request!, true);
    request = undefined;
    // A trusted host response accessor may have reentrantly released this handle.
    if (isReleased()) return snapshot;
    if (acquired.status === 'failed') {
      snapshot = Object.freeze({ id, stage: 'source', state: 'failed', failure: acquired.code });
    } else {
      bytes = acquired.bytes;
      snapshot = Object.freeze({ id, stage: 'source', state: 'source-acquired', source: Object.freeze({
        request: acquired.request, revision: acquired.revision, mediaType: acquired.mediaType,
        contentLength: acquired.contentLength,
      }) });
    }
    return snapshot;
  };

  const reject = (error: unknown): never => {
    access = undefined;
    request = undefined;
    bytes = undefined;
    if (!isReleased()) snapshot = Object.freeze({ id, stage: 'source', state: 'failed', failure: null });
    throw error; // Never guess WebGL/cancellation codes from caller exception shape.
  };

  return Object.freeze({
    getSnapshot: () => snapshot,
    start: (): Promise<VisualSourceLoadObservation> => {
      if (isReleased()) return Promise.resolve(snapshot);
      if (completion !== undefined) return completion;
      snapshot = Object.freeze({ id, stage: 'source', state: 'pending' });
      completion = Promise.resolve().then(() => {
        if (isReleased()) return snapshot;
        const current = access!;
        access = undefined; // No provider closure retained after dispatch.
        if (current.status === 'failed') {
          snapshot = Object.freeze({ id, stage: 'source', state: 'failed', failure: current.code });
          return snapshot;
        }
        request = current.request;
        return Promise.resolve(current.invoke()).then(adopt);
      }).catch(reject);
      return completion;
    },
    copyBytes: (): Uint8Array<ArrayBuffer> | null => bytes === undefined ? null : new Uint8Array(bytes),
    release: (): VisualSourceLoadObservation => {
      access = undefined;
      request = undefined;
      bytes = undefined;
      completion = undefined; // A caller-held Promise has metadata/error only.
      if (!isReleased()) snapshot = Object.freeze({ id, stage: 'source', state: 'released' });
      return snapshot;
    },
  });
}
