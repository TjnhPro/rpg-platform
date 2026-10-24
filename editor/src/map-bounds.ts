import { scenePositionToGridCell } from '@rpg-platform/runtime-render';
import { describeGridConversion } from './grid-conversion.js';
import { mapRecord, requireMapProfile, replaceMapProfile, captureMapExtent } from './map-profile.js';
import type { DocumentEnvelope } from './document-envelope.js';
import type { AssetCatalog } from './asset-catalog.js';

export { mapExtentLimits } from './map-profile.js';
export interface MapExtentCells { readonly width: number; readonly height: number }
export interface MapCell { readonly row: number; readonly column: number }
export function createMapExtent(input: MapExtentCells): MapExtentCells {
  return captureMapExtent(input);
}
export function diagnoseMapCell(extentInput: MapExtentCells, cell: MapCell): 'inside' | 'invalid-cell' | 'outside' {
  const extent = createMapExtent(extentInput);
  mapRecord(cell, ['row', 'column'], 'MAP_CELL');
  if (!Number.isSafeInteger(cell.row) || !Number.isSafeInteger(cell.column)) return 'invalid-cell';
  return cell.row >= 0 && cell.column >= 0 && cell.row < extent.height && cell.column < extent.width ? 'inside' : 'outside';
}
export function containsMapCell(extent: MapExtentCells, cell: MapCell): boolean { return diagnoseMapCell(extent, cell) === 'inside'; }
/** Candidate only: no crop, image resize, placement rebase or session replacement. */
export function resizeMapExtent(document: DocumentEnvelope, extentInput: MapExtentCells, catalog?: AssetCatalog): DocumentEnvelope {
  const source = requireMapProfile(document, catalog), extent = createMapExtent(extentInput);
  const conversion = describeGridConversion(source.profile.grid, source.profile.space);
  for (const object of source.membership.objects) {
    if (object.definition.classification !== 'editor-map:tile') continue;
    if (!object.placement || object.placement.coordinateSpaceId !== source.profile.space.reference.coordinateSpaceId) throw new TypeError('INVALID_TILE_PLACEMENT');
    const cell = scenePositionToGridCell(conversion, { space: conversion.space, point: object.placement.point }, 'floor').cell;
    if (!containsMapCell(source.profile.extentCells, cell) || !containsMapCell(extent, cell)) throw new TypeError('RESIZE_WOULD_EXCLUDE_TILE');
  }
  return replaceMapProfile(source.document, { ...source.profile, extentCells: extent }, catalog);
}
