import { gridCellToScenePosition, scenePositionToGridCell } from '@rpg-platform/runtime-render';
import { createSpatialPoint2D, type SpatialPoint2D } from './coordinate-space.js';
import { describeGridConversion } from './grid-conversion.js';
import { containsMapCell, type MapCell } from './map-bounds.js';
import { validateVisualSceneDocument } from './visual-document-edit.js';
import { serializeDocument, deserializeDocument } from './document-codec.js';
import type { DocumentEnvelope } from './document-envelope.js';
import type { AssetCatalog } from './asset-catalog.js';

export type VisualPlacementPosition = Readonly<{ kind: 'scene-point'; position: SpatialPoint2D }>
  | Readonly<{ kind: 'grid-cell'; cell: MapCell; alignment: 'start-corner' | 'center' }>;

/** Canonical Map grid bounds, independent of viewport/camera. No clamp or snap. */
export function resolveVisualPlacementPosition(document: DocumentEnvelope, catalog: AssetCatalog,
  input: VisualPlacementPosition): SpatialPoint2D {
  const decoded = deserializeDocument(serializeDocument({ ...document, content: input } as unknown as DocumentEnvelope));
  if (decoded.status !== 'decoded') throw new TypeError('PLACEMENT_POSITION_CAPTURE');
  const value = decoded.document.content as unknown as VisualPlacementPosition;
  const { profile } = validateVisualSceneDocument(document, catalog);
  const conversion = describeGridConversion(profile.grid, profile.space);
  let point: SpatialPoint2D;
  if (value?.kind === 'scene-point' && Object.keys(value).length === 2 && Object.hasOwn(value, 'position')) {
    point = createSpatialPoint2D(value.position);
    if (point.space.projectId !== profile.space.reference.projectId
      || point.space.coordinateSpaceId !== profile.space.reference.coordinateSpaceId) throw new TypeError('PLACEMENT_SPACE_MISMATCH');
  } else if (value?.kind === 'grid-cell' && Object.keys(value).length === 3 && Object.hasOwn(value, 'cell')
    && (value.alignment === 'center' || value.alignment === 'start-corner')) {
    if (!containsMapCell(profile.extentCells, value.cell)) throw new TypeError('PLACEMENT_OUTSIDE_MAP');
    const position = gridCellToScenePosition(conversion, { space: conversion.space, cell: value.cell }, value.alignment);
    point = createSpatialPoint2D({ space: profile.space.reference, point: position.point });
  } else throw new TypeError('PLACEMENT_POSITION_MODE');
  const cell = scenePositionToGridCell(conversion, { space: conversion.space, point: point.point }, 'floor').cell;
  if (!containsMapCell(profile.extentCells, cell)) throw new TypeError('PLACEMENT_OUTSIDE_MAP');
  return point;
}
