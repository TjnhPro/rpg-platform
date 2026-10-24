import { Alert, Button, Group, NumberInput, Select, Stack, Switch, Text, TextInput } from '@mantine/core';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createMap, openMap, saveMap, readMapProfile, createCoordinateSpaceDefinition, createOrthogonalGridDefinition,
  getProjectSessionSnapshot, replaceProjectManifest, setProjectActiveScene, getAssetManagerProjectSnapshot, getManagedAssetSelection,
  resizeMapExtent, replaceMapGrid, updateMapLayer, reorderMapLayers, setMapBackground, clearMapBackground, setMapTile, removeMapTile,
  type DocumentEnvelope, type DocumentSession, type ProjectSession, type AssetManagerProject, type DocumentWritePrecondition } from '@rpg-platform/editor';
import type { ActiveEditorProject } from '../project-manager/ProjectManagerPanel.js';
import type { AssetResourceGrant } from '../asset-browser/AssetViewport.js';
import { EditorPanel } from '../../components/panel/EditorPanel.js';
import { editorTokens } from '../../theme/index.js';
import { MapViewport } from './MapViewport.js';

interface HeldMap { readonly project: ProjectSession; readonly session: DocumentSession; readonly expected: DocumentWritePrecondition }
type Numeric = number | string;
const initial = { width: 8 as Numeric, height: 6 as Numeric, cellWidth: 32 as Numeric, cellHeight: 32 as Numeric, originX: 0 as Numeric, originY: 0 as Numeric };
const numeric = (value: Numeric) => typeof value === 'number' ? value : NaN;

/** Stable above responsive panels; canonical sessions outlive panel visibility. */
export function MapWorkspace({ active, context, grant, showGuidance, children }: {
  readonly active: ActiveEditorProject | null; readonly context: AssetManagerProject | null; readonly grant: AssetResourceGrant | null;
  readonly showGuidance: boolean; readonly children: (panel: ReactNode, viewport: ReactNode) => ReactNode;
}) {
  const [held, setHeld] = useState<HeldMap | null>(null);
  const [sceneId, setSceneId] = useState('map-01'), [documentId, setDocumentId] = useState('map-document');
  const [locator, setLocator] = useState('map.scene.json'), [spaceId, setSpaceId] = useState('map-plane');
  const [settings, setSettings] = useState(initial);
  const [row, setRow] = useState<Numeric>(2), [column, setColumn] = useState<Numeric>(3);
  const [layerKey, setLayerKey] = useState<string | null>(null), [trackedId, setTrackedId] = useState<string | null>(null);
  const [pending, setPending] = useState(false), [message, setMessage] = useState('Select an active project and load its Asset catalog.');
  const [inspection, setInspection] = useState('');
  const [, refresh] = useState(0);
  const latest = useRef({ active, context, held }); latest.current = { active, context, held };
  const mounted = useRef(true), busy = useRef(false);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; const owned = latest.current.held?.session;
    if (owned?.getSnapshot().state === 'open') owned.close('discard'); }; }, []);
  useEffect(() => {
    setRow(2); setColumn(3); setLayerKey(null); setTrackedId(null); setInspection(''); setSettings(initial);
    setSceneId('map-01'); setDocumentId('map-document'); setLocator('map.scene.json'); setSpaceId('map-plane');
  }, [active?.session]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (latest.current.held?.session.getSnapshot().isDirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, []);
  const project = active ? getProjectSessionSnapshot(active.session) : null;
  const catalog = context ? getAssetManagerProjectSnapshot(context).catalog : null;
  const current = held && held.project === active?.session ? held : null;
  const snapshot = current?.session.getSnapshot();
  const admitted = snapshot && catalog ? readMapProfile(snapshot.envelope, catalog) : null;
  const map = admitted?.status === 'supported' ? admitted.snapshot : null;
  const ready = !!active && !!context && !!catalog && !pending;
  function populate(document: DocumentEnvelope) {
    if (!catalog) return;
    const result = readMapProfile(document, catalog);
    if (result.status !== 'supported') return;
    const { profile } = result.snapshot;
    setSettings({ width: profile.extentCells.width, height: profile.extentCells.height, cellWidth: profile.grid.cellSize.width,
      cellHeight: profile.grid.cellSize.height, originX: profile.grid.origin.x, originY: profile.grid.origin.y });
    setLayerKey(null); setRow(2); setColumn(3); setInspection('');
  }
  function edit(operation: (document: DocumentEnvelope) => DocumentEnvelope) {
    if (!ready || !current || !snapshot) return;
    try { const candidate = operation(snapshot.envelope); current.session.replaceContent(candidate.content);
      refresh(value => value + 1); setMessage('Map modified in memory. Save Map and Save Project are separate.'); }
    catch (error) { setMessage(error instanceof TypeError ? `Edit rejected: ${error.message}` : 'Map edit rejected; original retained.'); }
  }
  async function command(kind: 'create' | 'open' | 'save') {
    if (!ready || !active || !catalog || !context || busy.current) return;
    if (kind !== 'save' && held) { setMessage('Close the held Map explicitly before creating or opening another.'); return; }
    busy.current = true; setPending(true);
    const owner = active, selectedContext = context;
    const stillCurrent = () => mounted.current && latest.current.active?.session === owner.session
      && latest.current.active.root.binding === owner.root.binding && latest.current.context === selectedContext;
    try {
      if (kind === 'create') {
        const space = createCoordinateSpaceDefinition({ reference: { projectId: project!.projectId, coordinateSpaceId: spaceId }, componentCount: 2,
          axes: { x: 'right', y: 'down' }, origin: { x: 0, y: 0 }, unit: 'scene-unit' });
        const made = createMap({ project: owner.session, root: owner.root.binding, identity: { projectId: project!.projectId, documentId },
          scene: { projectId: project!.projectId, sceneId }, trackingLocator: { type: 'project-relative', path: locator },
          profile: { schemaVersion: 1, extentCells: { width: numeric(settings.width), height: numeric(settings.height) }, space,
            grid: createOrthogonalGridDefinition({ space: space.reference, orientation: 'orthogonal',
              origin: { x: numeric(settings.originX), y: numeric(settings.originY) }, cellSize: { width: numeric(settings.cellWidth), height: numeric(settings.cellHeight) },
              indexing: { columnDirection: 'positive-x', rowDirection: 'positive-y', negativeIndices: 'reject' } }),
            layers: [{ layerKey: 'background', role: 'background', visible: true }, { layerKey: 'tiles', role: 'tiles', visible: true }] } });
        try { replaceProjectManifest(owner.session, setProjectActiveScene(made.trackingCandidate, made.reference.identity, sceneId), made.projectRevision); }
        catch (error) { made.session.close('discard'); throw error; }
        setHeld({ project: owner.session, session: made.session, expected: { kind: 'absent' } });
        populate(made.session.getSnapshot().envelope); owner.notifyManifestChange(); setMessage('Created unsaved Map; Scene tracking and active selection adopted explicitly.');
      } else if (kind === 'open') {
        if (!trackedId) throw new TypeError('SELECT_TRACKED_SCENE');
        const result = await openMap({ project: owner.session, root: owner.root.binding, identity: { projectId: project!.projectId, documentId: trackedId }, catalog });
        if (!stillCurrent()) { if (result.status === 'opened') result.session.close('discard'); return; }
        if (result.status !== 'opened') { setMessage(`Open: ${result.status}${'reason' in result ? ` · ${result.reason}` : ''}`); setInspection('text' in result ? result.text ?? '' : ''); return; }
        try { const now = getProjectSessionSnapshot(owner.session);
          replaceProjectManifest(owner.session, setProjectActiveScene(now.manifest, result.reference.identity, result.reference.sceneId!), now.currentRevision); }
        catch (error) { result.session.close('discard'); throw error; }
        const expected: DocumentWritePrecondition = result.observation.revision === null ? { kind: 'unknown' }
          : { kind: 'revision', identity: result.observation.identity, revision: result.observation.revision };
        setHeld({ project: owner.session, session: result.session, expected }); populate(result.session.getSnapshot().envelope);
        owner.notifyManifestChange(); setMessage('Opened Map from storage. Existing-file updates require host CAS.');
      } else if (current) {
        const result = await saveMap({ project: owner.session, root: owner.root.binding, session: current.session, catalog, expected: current.expected });
        if (!stillCurrent() || latest.current.held !== current) return;
        if (result.status === 'committed') setHeld({ ...current, expected: result.observation.revision === null ? { kind: 'unknown' }
          : { kind: 'revision', ...result.observation, revision: result.observation.revision } });
        refresh(value => value + 1); setMessage(`Save Map: ${result.status}${'reason' in result ? ` · ${result.reason}` : ''}. Project manifest was not saved.`);
      }
    } catch (error) { if (stillCurrent()) setMessage(error instanceof TypeError ? `Operation rejected: ${error.message}` : 'Map operation unavailable; inspect current project and host.'); }
    finally { busy.current = false; if (mounted.current) setPending(false); }
  }
  function selectedReference() {
    if (!context) throw new TypeError('ASSET_CATALOG_UNAVAILABLE');
    const selected = getManagedAssetSelection(context);
    if (selected.status !== 'resolved') throw new TypeError('SELECT_IMAGE_IN_ASSET_BROWSER');
    return selected.reference;
  }
  const panel = <EditorPanel title="Map Editor" subtitle="One Map is one Scene Document.">
    <Stack gap={editorTokens.spacing.standard}>
      <Text>Project: {project?.projectId ?? 'None'} · Map: {map?.identity.sceneId ?? 'None'} · Document: {snapshot?.envelope.identity.documentId ?? 'None'}</Text>
      <Text>{snapshot ? snapshot.savedRevision === null ? 'Unsaved' : snapshot.isDirty ? 'Modified' : 'Saved snapshot' : 'No active Map'}</Text>
      {held && !current && <Text>A Map from another project is retained. Switch back or explicitly discard it before opening another.</Text>}
      <TextInput label="New Scene ID" value={sceneId} disabled={!ready || !!held} onChange={event => setSceneId(event.currentTarget.value)} />
      <TextInput label="New Document ID" value={documentId} disabled={!ready || !!held} onChange={event => setDocumentId(event.currentTarget.value)} />
      <TextInput label="Tracking locator" value={locator} disabled={!ready || !!held} onChange={event => setLocator(event.currentTarget.value)} />
      <TextInput label="New coordinate space ID" value={spaceId} disabled={!ready || !!held} onChange={event => setSpaceId(event.currentTarget.value)} />
      <Text>New Maps: scene-unit, axes right/down, positive column/row; background then tiles. Existing Maps retain authored axes/unit/indexing.</Text>
      {map && <Text>Authored: {map.profile.extentCells.width}×{map.profile.extentCells.height} cells · {map.profile.grid.cellSize.width}×{map.profile.grid.cellSize.height} {map.profile.space.unit} · origin ({map.profile.grid.origin.x},{map.profile.grid.origin.y})</Text>}
      {(['width', 'height', 'cellWidth', 'cellHeight', 'originX', 'originY'] as const).map(key => <NumberInput key={key}
        label={{ width: 'Width (cells)', height: 'Height (cells)', cellWidth: 'Cell width (units)', cellHeight: 'Cell height (units)', originX: 'Grid origin X', originY: 'Grid origin Y' }[key]}
        value={settings[key]} disabled={!ready} onChange={value => setSettings(previous => ({ ...previous, [key]: value }))} />)}
      <Group gap={editorTokens.spacing.compact}>
        <Button disabled={!ready || !!held} onClick={() => void command('create')}>Create Map</Button>
        <Button disabled={!ready || !current} onClick={() => void command('save')}>Save Map</Button>
        <Button variant="default" disabled={!held || pending} onClick={() => { held!.session.close('discard'); setHeld(null); setLayerKey(null); setInspection(''); setMessage('Map closed; unsaved edits explicitly discarded.'); }}>Close Map / discard</Button>
        <Button variant="default" disabled={!ready || !map} onClick={() => edit(document => {
          let candidate = resizeMapExtent(document, { width: numeric(settings.width), height: numeric(settings.height) }, catalog!);
          const grid = createOrthogonalGridDefinition({ ...map!.profile.grid, origin: { x: numeric(settings.originX), y: numeric(settings.originY) },
            cellSize: { width: numeric(settings.cellWidth), height: numeric(settings.cellHeight) } });
          if (JSON.stringify(grid) !== JSON.stringify(map!.profile.grid)) candidate = replaceMapGrid(candidate, map!.profile.space, grid, catalog!);
          return candidate;
        })}>Apply dimensions / grid</Button>
      </Group>
      <Select label="Tracked Scene Document" data={project?.manifest.documents.filter(ref => ref.documentKind === 'scene').map(ref => ({ value: ref.identity.documentId, label: `${ref.sceneId} · ${ref.identity.documentId}` })) ?? []}
        value={trackedId} onChange={setTrackedId} disabled={!ready || !!held} />
      <Button variant="default" disabled={!ready || !!held || !trackedId} onClick={() => void command('open')}>Open Map</Button>
      {map?.profile.layers.map(layer => <Switch key={layer.layerKey} label={`${layer.layerKey} (${layer.role})`} checked={layer.visible} disabled={!ready}
        onChange={event => { const visible = event.currentTarget.checked; edit(document => updateMapLayer(document, { ...layer, visible }, catalog!)); }} />)}
      <Button variant="default" disabled={!ready || !map} onClick={() => edit(document => reorderMapLayers(document, map!.profile.layers.map(layer => layer.layerKey).reverse(), catalog!))}>Reverse layer order</Button>
      <Text>Background: {map?.membership.objects.find(entry => entry.definition.classification === 'editor-map:background')?.assetReference?.assetId ?? 'None'}</Text>
      <Button disabled={!ready || !map} onClick={() => edit(document => {
        const layer = map!.profile.layers.filter(layer => layer.role === 'background'); if (layer.length !== 1) throw new TypeError('SELECT_SINGLE_BACKGROUND_LAYER');
        return setMapBackground(document, { objectId: map!.membership.objects.find(entry => entry.definition.classification === 'editor-map:background')?.definition.objectId ?? crypto.randomUUID(), layerKey: layer[0]!.layerKey, reference: selectedReference() }, catalog!);
      })}>Use Asset Browser selection as background</Button>
      <Button variant="default" disabled={!ready || !map} onClick={() => edit(document => clearMapBackground(document, catalog!))}>Clear background</Button>
      <Select label="Tile layer" data={map?.profile.layers.filter(layer => layer.role === 'tiles').map(layer => layer.layerKey) ?? []} value={layerKey} onChange={setLayerKey} disabled={!ready || !map} />
      <NumberInput label="Row (zero based)" value={row} onChange={setRow} disabled={!ready || !map} />
      <NumberInput label="Column (zero based)" value={column} onChange={setColumn} disabled={!ready || !map} />
      <Text>Tiles: {map?.membership.objects.filter(entry => entry.definition.classification === 'editor-map:tile').map(entry => `${entry.definition.objectId}: ${entry.assetReference?.assetId}`).join(' · ') || 'None'}</Text>
      <Button disabled={!ready || !map || !layerKey} onClick={() => edit(document => setMapTile(document, { scene: map!.identity,
        layerKey: layerKey!, cell: { row: numeric(row), column: numeric(column) }, newObjectId: crypto.randomUUID(), reference: selectedReference() }, catalog!))}>Place / replace selected image</Button>
      <Button variant="default" disabled={!ready || !map || !layerKey} onClick={() => edit(document => removeMapTile(document, { scene: map!.identity,
        layerKey: layerKey!, cell: { row: numeric(row), column: numeric(column) } }, catalog!))}>Remove tile</Button>
      <Alert title="Map status" color={editorTokens.colors.neutral} role="status">{message}</Alert>
      {inspection && <Text component="pre">{inspection}</Text>}
      <Text>Save Asset Documents before tracking a Map, then Save Map and Save Project separately. Existing-file updates need CAS; this finite host is create-only. Edits remount preview; acquire again. Source/Render failures leave authored data intact.</Text>
    </Stack>
  </EditorPanel>;
  return children(panel, <MapViewport document={map?.document ?? null} catalog={catalog} grant={grant} showGuidance={showGuidance} />);
}
