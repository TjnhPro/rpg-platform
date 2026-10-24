// Explicit finite example, not application defaults or an additional authored model.
import * as E from '@rpg-platform/editor';
export function sampleMapProfile(projectId) {
  const space = E.createCoordinateSpaceDefinition({ reference: { projectId, coordinateSpaceId: 'map-plane' },
    componentCount: 2, axes: { x: 'right', y: 'down' }, origin: { x: 0, y: 0 }, unit: 'scene-unit' });
  return { schemaVersion: 1, extentCells: { width: 8, height: 6 }, space,
    grid: E.createOrthogonalGridDefinition({ space: space.reference, orientation: 'orthogonal', origin: { x: 0, y: 0 },
      cellSize: { width: 32, height: 32 }, indexing: { columnDirection: 'positive-x', rowDirection: 'positive-y', negativeIndices: 'reject' } }),
    layers: [{ layerKey: 'background', role: 'background', visible: true }, { layerKey: 'tiles', role: 'tiles', visible: true }] };
}
export function createSampleMap(root) {
  const projectId = root.projectId;
  const project = E.createProject({ identity: { projectId, documentId: 'project-manifest' }, metadata: { name: 'Map example' }, root,
    locator: { type: 'project-relative', path: 'project.json' } });
  const made = E.createMap({ project, root, identity: { projectId, documentId: 'map-document' }, scene: { projectId, sceneId: 'map-01' },
    profile: sampleMapProfile(projectId), trackingLocator: { type: 'project-relative', path: 'map.scene.json' } });
  E.replaceProjectManifest(project, E.setProjectActiveScene(made.trackingCandidate, made.reference.identity, 'map-01'), made.projectRevision);
  return { project, session: made.session, identity: made.reference.identity, catalog: E.createAssetCatalog({ projectId }) };
}
