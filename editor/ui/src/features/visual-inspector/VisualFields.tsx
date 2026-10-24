import { Button, Group, NumberInput, Select, Stack, Switch, Text } from '@mantine/core';
import { useState } from 'react';
import { createAssetReference, type AssetCatalog, type VisualInspectorSnapshot, type VisualPropertyEdit } from '@rpg-platform/editor';
import { editorTokens } from '../../theme/index.js';

type Numeric = number | string;
const number = (value: Numeric): number => typeof value === 'number' ? value : NaN;
type Selected = Extract<VisualInspectorSnapshot, { status: 'selected' }>;

/** Drafts only. Accepted commands replace this view from the canonical snapshot. */
export function VisualFields({ value, catalog, disabled, apply }: {
  readonly value: Selected; readonly catalog: AssetCatalog; readonly disabled: boolean;
  readonly apply: (edit: VisualPropertyEdit) => void;
}) {
  const profile = value.visual.status === 'supported' ? value.visual.profile : undefined;
  const [group, setGroup] = useState<string | null>('position');
  const [draft, setDraft] = useState<Record<string, Numeric>>({
    x: value.object.placement?.point.x ?? '', y: value.object.placement?.point.y ?? '',
    angle: profile?.orientation?.angleRadians ?? '', sx: profile?.scale?.x ?? '', sy: profile?.scale?.y ?? '',
    ax: profile?.anchor?.anchor.x ?? '', ay: profile?.anchor?.anchor.y ?? '',
    px: profile?.anchor?.pivot.x ?? '', py: profile?.anchor?.pivot.y ?? '',
    ox: profile?.anchor?.localOffset.x ?? '', oy: profile?.anchor?.localOffset.y ?? '',
  });
  const [layer, setLayer] = useState<string | null>(value.object.layerKey ?? null);
  const [asset, setAsset] = useState<string | null>(value.object.assetReference?.assetId ?? null);
  const [visible, setVisible] = useState(profile?.visible ?? false);
  const space = value.map.profile.space;
  const n = (key: string) => number(draft[key] ?? '');
  const inputs = (fields: readonly (readonly [string, string])[]) => fields.map(([key, label]) =>
    <NumberInput key={key} label={label} value={draft[key] ?? ''} disabled={disabled}
      onChange={next => setDraft(previous => ({ ...previous, [key]: next }))} />);
  function commit() {
    switch (group) {
      case 'position': apply({ kind: 'position', point: { space: space.reference, point: { x: n('x'), y: n('y') } } }); break;
      case 'direction': apply({ kind: 'direction', orientation: { axes: space.axes, zeroAxis: 'positive-x', positiveRotation: 'toward-positive-y', angleRadians: n('angle') } }); break;
      case 'layer': apply({ kind: 'layer', layerKey: layer }); break;
      case 'scale': apply({ kind: 'scale', scale: { x: n('sx'), y: n('sy') } }); break;
      case 'anchor': apply({ kind: 'anchor', anchor: { unit: space.unit, anchor: { x: n('ax'), y: n('ay') },
        pivot: { x: n('px'), y: n('py') }, localOffset: { x: n('ox'), y: n('oy') } } }); break;
      case 'visibility': apply({ kind: 'visibility', visible }); break;
      case 'binding': apply({ kind: 'binding', reference: asset === null ? null
        : createAssetReference({ projectId: value.selection.projectId, assetId: asset, expectedKind: 'image' }) }); break;
    }
  }
  return <Stack gap={editorTokens.spacing.standard}>
    <Text>{value.selection.projectId} / {value.selection.sceneId} / {value.selection.objectId}</Text>
    <Select label="Property" value={group} allowDeselect={false} onChange={setGroup}
      data={['position', 'direction', 'layer', 'scale', 'anchor', 'visibility', 'binding']} disabled={disabled} />
    {group === 'position' && <>{inputs([['x', 'Position X'], ['y', 'Position Y']])}
      <Text>{space.reference.coordinateSpaceId} · {space.unit} · +X {space.axes.x}, +Y {space.axes.y}. Placement: {value.object.placement === undefined ? 'absent' : value.object.placement === null ? 'null' : 'authored'}</Text></>}
    {group === 'direction' && <>{inputs([['angle', 'Facing (radians)']])}
      <Text>Zero: +X; positive: toward +Y ({space.axes.y}); range [0, 2π). Facing does not change image rotation or animation frame.</Text></>}
    {group === 'layer' && <><Select label="Layer" clearable placeholder="Unassigned (null on Apply)" data={value.map.profile.layers.map(item =>
      ({ value: item.layerKey, label: `${item.layerKey} · ${item.role}${item.visible ? '' : ' · hidden'}` }))} value={layer} onChange={setLayer} disabled={disabled} />
      <Text>Current layer: {value.object.layerKey === undefined ? 'absent' : value.object.layerKey ?? 'null'}</Text></>}
    {group === 'scale' && <>{inputs([['sx', 'Scale X'], ['sy', 'Scale Y']])}<Text>Dimensionless. Zero collapses; negative reflects.</Text></>}
    {group === 'anchor' && <><Text>Local numeric {space.unit}; anchor, pivot and offset are separate. Placement stays unchanged.</Text>
      {inputs([['ax', 'Anchor X'], ['ay', 'Anchor Y'], ['px', 'Pivot X'], ['py', 'Pivot Y'], ['ox', 'Local offset X'], ['oy', 'Local offset Y']])}</>}
    {group === 'visibility' && <><Switch label="Object visible" checked={visible} disabled={disabled} onChange={event => setVisible(event.currentTarget.checked)} />
      <Text>Authored: {profile?.visible === undefined ? 'absent (host supplies preview default)' : String(profile.visible)}. Layer visibility remains separate.</Text></>}
    {group === 'binding' && <><Select label="Visual Asset" clearable placeholder="No binding (null on Apply)" data={catalog.definitions.map(item =>
      ({ value: item.identity.assetId, label: `${item.identity.assetId} · ${item.kind}` }))} value={asset} onChange={setAsset} disabled={disabled} />
      <Text>Only resolvable visual images can be applied. Clear retains the Scene object.</Text></>}
    <Group gap={editorTokens.spacing.compact}><Button disabled={disabled} onClick={commit}>Apply property</Button></Group>
    <Text>Blank numeric drafts reject on Apply. Absent values stay absent until explicitly applied. Applying resets unapplied drafts.</Text>
  </Stack>;
}
