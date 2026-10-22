import {
  createOrthographicPlaneProjection, type OrthographicPlaneProjection,
} from '@rpg-platform/runtime-render';
import { createCoordinateSpaceDefinition, type CoordinateSpaceDefinition } from './coordinate-space.js';

/**
 * Adapt explicit authored source/destination spaces to Render-owned pure mapping.
 * Caller supplies correspondence origins and unit ratios; authored space origin
 * labels are not additional offsets. Render validates/captures the numeric data.
 * No Scene change, conversion formula, camera/viewport state or graphics access.
 */
export function describeOrthographicPlaneProjection(
  sourceInput: CoordinateSpaceDefinition, destinationInput: CoordinateSpaceDefinition,
  mapping: Pick<OrthographicPlaneProjection, 'sourceOrigin' | 'destinationOrigin' | 'destinationUnitsPerSourceUnit'>,
): OrthographicPlaneProjection {
  const source = createCoordinateSpaceDefinition(sourceInput);
  const destination = createCoordinateSpaceDefinition(destinationInput);
  return createOrthographicPlaneProjection({ kind: 'orthographic-plane',
    source: { ...source.reference, unit: source.unit, axes: source.axes },
    destination: { ...destination.reference, unit: destination.unit, axes: destination.axes },
    sourceOrigin: mapping.sourceOrigin, destinationOrigin: mapping.destinationOrigin,
    destinationUnitsPerSourceUnit: mapping.destinationUnitsPerSourceUnit });
}
