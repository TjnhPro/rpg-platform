import type { RenderFrameSession, RenderFrameReceipt } from './frame-session.js';
import { getRenderTextureSnapshot, type RenderTexture } from './render-texture.js';
import { isCanonicalAtlasGeometry, type AtlasFrameGeometry } from './atlas-geometry.js';

export interface DemoTextureRequest {
  readonly texture: RenderTexture;
  readonly uv: readonly [number, number, number, number];
}
const submissions = new WeakMap<RenderFrameSession, (request: DemoTextureRequest) => RenderFrameReceipt>();
/** Private dispatch, no native handle or global current session. */
export function registerVisualResourceDemo(session: RenderFrameSession,
  submit: (request: DemoTextureRequest) => RenderFrameReceipt): void { submissions.set(session, submit); }

/**
 * Demonstration only: one texture or canonical frame stretched to the central 80%
 * of the active viewport. Borrows a live right for this synchronous call, retains
 * nothing, and uses the existing frame admission/terminal policy. No Scene model,
 * sprite instance, layout, animation or display acknowledgement.
 * Host attests that the canonical geometry belongs to this image page; matching
 * dimensions alone cannot establish source-content identity.
 */
export function renderVisualResourceDemo(session: RenderFrameSession, texture: RenderTexture,
  geometry?: AtlasFrameGeometry): RenderFrameReceipt {
  const snapshot = getRenderTextureSnapshot(session, texture);
  if (snapshot.state !== 'usable') throw new TypeError('Demo requires a live texture right');
  if (geometry !== undefined && (!isCanonicalAtlasGeometry(geometry)
    || geometry.pagePixels.width !== snapshot.width || geometry.pagePixels.height !== snapshot.height)) {
    throw new TypeError('Demo requires matching canonical frame geometry');
  }
  const submit = submissions.get(session);
  if (submit === undefined) throw new TypeError('Demo requires a canonical graphics session');
  const uv = geometry?.uv;
  return submit({ texture, uv: uv ? [uv.left, uv.top, uv.right, uv.bottom] : [0, 0, 1, 1] });
}
