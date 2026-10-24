import { gridCellToScenePosition, scenePositionToGridCell } from '@rpg-platform/runtime-render';
import { describeGridConversion } from './grid-conversion.js';
import { createSpatialPoint2D, type SpatialPoint2D, type CoordinateSpaceDefinition } from './coordinate-space.js';
import type { OrthogonalGridDefinition } from './orthogonal-grid.js';
import { createMapProfile, requireMapProfile, replaceMapProfile, type MapProfileSnapshot } from './map-profile.js';
import { containsMapCell, type MapCell } from './map-bounds.js';
import type { DocumentEnvelope } from './document-envelope.js';
import type { SceneObjectPlacement } from './scene-membership.js';
import type { AssetCatalog } from './asset-catalog.js';

/** Internal shared grid admission, no formulas or duplicate tile positions. */
export function mapCellPlacement(source: MapProfileSnapshot, cell: MapCell): SceneObjectPlacement {
  if (!containsMapCell(source.profile.extentCells, cell)) throw new TypeError('MAP_CELL_OUTSIDE');
  const conversion = describeGridConversion(source.profile.grid, source.profile.space);
  const position = gridCellToScenePosition(conversion, { space: conversion.space, cell }, 'center');
  return Object.freeze({ coordinateSpaceId: position.space.coordinateSpaceId, point: position.point });
}
export function mapCellToPlacement(document: DocumentEnvelope, cell: MapCell, catalog?: AssetCatalog): SceneObjectPlacement {
  return mapCellPlacement(requireMapProfile(document, catalog), cell);
}
export function mapCanonicalCell(source: MapProfileSnapshot, input: SpatialPoint2D): MapCell {
  const position = createSpatialPoint2D(input), space = source.profile.space.reference;
  if (position.space.projectId !== space.projectId || position.space.coordinateSpaceId !== space.coordinateSpaceId) throw new TypeError('MAP_SPACE_MISMATCH');
  const conversion = describeGridConversion(source.profile.grid, source.profile.space);
  const cell = scenePositionToGridCell(conversion, { space: conversion.space, point: position.point }, 'floor').cell;
  const canonical = mapCellPlacement(source, cell);
  if (canonical.point.x !== position.point.x || canonical.point.y !== position.point.y) throw new TypeError('NONCANONICAL_TILE_CENTER');
  return cell;
}
/** Floor alone is insufficient: exact canonical forward-center agreement required. */
export function mapPlacementToCell(document: DocumentEnvelope, position: SpatialPoint2D, catalog?: AssetCatalog): MapCell {
  return mapCanonicalCell(requireMapProfile(document, catalog), position);
}
export function replaceMapGrid(document: DocumentEnvelope, space: CoordinateSpaceDefinition,
  grid: OrthogonalGridDefinition, catalog?: AssetCatalog): DocumentEnvelope {
  const source = requireMapProfile(document, catalog);
  if (source.membership.objects.some(entry => ['editor-map:tile', 'editor-map:background'].includes(entry.definition.classification ?? '')))
    throw new TypeError('OCCUPIED_MAP_REBASE_UNSUPPORTED');
  return replaceMapProfile(source.document, createMapProfile({ ...source.profile, space, grid }, source.identity), catalog);
}
