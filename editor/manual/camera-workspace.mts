import { createSceneMembership, describeSceneObjectSpatialPoint, createCoordinateSpaceDefinition,
  createDocumentEnvelope, createDocumentSession } from '@rpg-platform/editor';
import { createConfiguredRenderCamera, getRenderCameraViewSnapshot, panRenderCamera, setRenderCameraZoom,
  projectRenderCameraPoint, screenToRenderCameraSelectedPlane, screenPointToViewport2D,
  zoomRenderCameraAtFocus, getRenderVisualDiagnostic } from '@rpg-platform/runtime-render';

/** Finite manual CPU consumer. No graphics stand-ins, assertions or automated suite. */
export function observeCameraWorkspace(log: (event: string, detail: unknown) => void): void {
  const projectId = 'camera-workspace';
  const space = createCoordinateSpaceDefinition({ reference: { projectId, coordinateSpaceId: 'ground' }, componentCount: 2,
    axes: { x: 'right', y: 'down' }, origin: { x: 0, y: 0 }, unit: 'scene-unit' });
  const source = { ...space.reference, unit: space.unit, axes: space.axes };
  const authored = createSceneMembership({ scene: { identity: { projectId, sceneId: 'authored-scene' } }, objects: [
    { definition: { objectId: 'illustration' }, placement: { coordinateSpaceId: source.coordinateSpaceId, point: { x: 160, y: 120 } } }] });
  const document = createDocumentSession(createDocumentEnvelope({ schemaVersion: 1, identity: { projectId, documentId: 'doc' },
    documentKind: 'camera-manual', contentSchemaVersion: 1, content: authored }), null);
  document.open();
  const before = { authored: JSON.stringify(authored), document: JSON.stringify(document.getSnapshot()) };
  const description = describeSceneObjectSpatialPoint(authored, 'illustration', space);
  if (description.status !== 'described') throw new TypeError('Explicit placement unavailable');
  const point = description.request;
  const config = { kind: 'orthographic', source, center: { x: 160, y: 120 },
    scale: { unit: 'css-px-per-source-unit', x: 1, y: 1 }, zoom: 1, viewportPolicy: 'preserve-scale' } as const;
  const a = createConfiguredRenderCamera(config, { min: 0.1, max: 10 }), b = createConfiguredRenderCamera(config, { min: 0.1, max: 10 });
  const bBefore = getRenderCameraViewSnapshot(b);
  const css = { projectId, coordinateSpaceId: 'viewport-css', unit: 'css-px', axes: space.axes };
  const screen = { projectId, coordinateSpaceId: 'client-css', unit: 'css-px', axes: space.axes };
  const logical = { plane: css, width: 320, height: 240,
    screen: { plane: screen, origin: { x: 40, y: 80 }, screenUnitsPerViewportUnit: { x: 1, y: 1 } } };
  const project = () => projectRenderCameraPoint(a, logical, point, null).viewportPoint.point;
  try {
    log('EXPECTED', { before: { x: 160, y: 120 }, afterPan5: { x: 155, y: 120 },
      focusWorldPreserved: true, cameraBUnchanged: true, authoredAndDocumentUnchanged: true,
      tolerance: 1e-9, nativeFrames: 'NOT_OBSERVED' });
    log('OBSERVED initial', project());
    panRenderCamera(a, { plane: source, delta: { x: 5, y: 0 } });
    log('OBSERVED pan5', project());
    const screenPoint = { plane: screen, point: { x: 240, y: 180 } };
    const inverse = () => screenToRenderCameraSelectedPlane(a, logical, { cameraView: getRenderCameraViewSnapshot(a),
      selectedPlane: source, point: screenPoint }, null).selectedPlanePoint.point;
    const focusBefore = inverse();
    const mapping = projectRenderCameraPoint(a, logical, point, null).mapping;
    zoomRenderCameraAtFocus(a, { zoom: 2, mapping, focus: screenPointToViewport2D(mapping, screenPoint) });
    log('OBSERVED pointer focus', { before: focusBefore, after: inverse(), projectedPlacement: project() });
    const invalid = (event: string, action: () => unknown) => {
      const previous = getRenderCameraViewSnapshot(a);
      try { log(event, { returned: action() }); }
      catch (error) { log(event, { type: error instanceof Error ? error.name : typeof error,
        safe: getRenderVisualDiagnostic(error), sameView: previous === getRenderCameraViewSnapshot(a) }); }
    };
    invalid('OBSERVED invalid width', () => projectRenderCameraPoint(a, { ...logical, width: 0 }, point, null));
    invalid('OBSERVED invalid zoom', () => setRenderCameraZoom(a, 0));
    invalid('OBSERVED unknown plane', () => projectRenderCameraPoint(a, logical,
      { ...point, plane: { ...source, coordinateSpaceId: 'unknown' } }, null));
    a.dispose();
    log('OBSERVED independence and truth', { bExactViewUnchanged: bBefore === getRenderCameraViewSnapshot(b),
      bProjected: projectRenderCameraPoint(b, logical, point, null).viewportPoint.point,
      authoredUnchanged: before.authored === JSON.stringify(authored),
      documentUnchanged: before.document === JSON.stringify(document.getSnapshot()),
      document: document.getSnapshot(), a: getRenderCameraViewSnapshot(a) });
    log('NOT_OBSERVED', ['native canvas pixels', 'DPR accepted buffer', 'continuous scheduling', 'expired GPU resource',
      'pending browser unmount', 'context loss', 'live Engine gameplay positions']);
  } finally { a.dispose(); b.dispose(); }
}
