import type { RenderFrameSession } from './frame-session.js';
import type { AffineTransform2D } from './planar-affine.js';

// Private canonical-session dispatch, never a second backend or authored registry.
const writers = new WeakMap<RenderFrameSession,
  (instance: object, transform: AffineTransform2D | null) => void>();

export function registerVisualTransformSession(session: RenderFrameSession,
  write: (instance: object, transform: AffineTransform2D | null) => void): void {
  writers.set(session, write);
}

export function writeVisualTransform(session: RenderFrameSession, instance: object,
  transform: AffineTransform2D | null): void {
  const write = writers.get(session);
  if (write === undefined) throw new TypeError('Expected a canonical visual presentation session');
  write(instance, transform);
}
