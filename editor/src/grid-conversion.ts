import { createOrthogonalGridConversion, type OrthogonalGridConversion } from '@rpg-platform/runtime-render';
import { createCoordinateSpaceDefinition, type CoordinateSpaceDefinition } from './coordinate-space.js';
import { createOrthogonalGridDefinition, type OrthogonalGridDefinition } from './orthogonal-grid.js';

/**
 * Adapt authored grid + its explicit matching space to Render's immutable request.
 * No formula, lookup or Scene mutation. Invalid/mismatched data throws TypeError;
 * origin remains grid-local numeric data, never adjusted by the space origin label.
 */
export function describeGridConversion(
  gridInput: OrthogonalGridDefinition, spaceInput: CoordinateSpaceDefinition,
): OrthogonalGridConversion {
  const grid = createOrthogonalGridDefinition(gridInput), space = createCoordinateSpaceDefinition(spaceInput);
  if (grid.space.projectId !== space.reference.projectId || grid.space.coordinateSpaceId !== space.reference.coordinateSpaceId) {
    throw new TypeError('Authored grid and coordinate space mismatch');
  }
  return createOrthogonalGridConversion({ space: { ...grid.space, unit: space.unit },
    orientation: grid.orientation, origin: grid.origin, cellSize: grid.cellSize, indexing: grid.indexing });
}
