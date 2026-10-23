import type { RenderFrameSession } from './frame-session.js';
import type { AffineTransform2D } from './planar-affine.js';

// Private canonical-session dispatch, never a second backend or authored registry.
interface PresentationControl {
  readonly transform: (instance: object, transform: AffineTransform2D | null, visible: boolean) => void;
  readonly visibility: (instance: object, visible: boolean) => void;
  readonly suspended: () => boolean;
}
const writers = new WeakMap<RenderFrameSession, PresentationControl>();

export function registerVisualTransformSession(session: RenderFrameSession, control: PresentationControl): void {
  writers.set(session, control);
}

export function writeVisualTransform(session: RenderFrameSession, instance: object,
  transform: AffineTransform2D | null, visible: boolean): void {
  presentation(session).transform(instance, transform, visible);
}

export function writeVisualVisibility(session: RenderFrameSession, instance: object, visible: boolean): void {
  presentation(session).visibility(instance, visible);
}

export function readVisualViewportSuspension(session: RenderFrameSession): boolean {
  return presentation(session).suspended();
}

function presentation(session: RenderFrameSession): PresentationControl {
  const control = writers.get(session);
  if (control === undefined) throw new TypeError('Expected a canonical visual presentation session');
  return control;
}
