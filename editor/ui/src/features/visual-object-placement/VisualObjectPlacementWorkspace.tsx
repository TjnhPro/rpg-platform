import { Alert, Button, Group, NumberInput, Select, Stack, Text, TextInput } from '@mantine/core';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createMap, openMap, saveMap, createCoordinateSpaceDefinition, createOrthogonalGridDefinition,
  getProjectSessionSnapshot, getAssetManagerProjectSnapshot, getManagedAssetSelection, setProjectActiveScene,
  replaceProjectManifest, validateVisualSceneDocument, createVisualPlacementEditor, readVisualPlacementScene,
  visualPlacementLabels, type DocumentSession, type ProjectSession, type AssetManagerProject,
  type DocumentWritePrecondition, type VisualPlacementEditor, type VisualInspectorSelection,
  type VisualPlacementPosition, type VisualPlacementEdit, type VisualPropertyEdit } from '@rpg-platform/editor';
import type { ActiveEditorProject } from '../project-manager/ProjectManagerPanel.js';
import type { AssetResourceGrant } from '../asset-browser/AssetViewport.js';
import { VisualViewport } from '../visual-inspector/VisualViewport.js';
import { VisualFields } from '../visual-inspector/VisualFields.js';
import { EditorPanel } from '../../components/panel/EditorPanel.js';
import { editorTokens } from '../../theme/index.js';

interface Held { readonly project: ProjectSession; readonly session: DocumentSession; readonly expected: DocumentWritePrecondition }
interface Controller { readonly project: ProjectSession; readonly document: DocumentSession; readonly assets: AssetManagerProject;
  readonly projectRevision: number; readonly catalogGeneration: number; readonly editor: VisualPlacementEditor }
type Numeric = number | string;
const numeric = (value: Numeric) => typeof value === 'number' ? value : NaN;

/** Host orchestration only. One Scene session and shared Phase16 inspector above panel lifetime. */
export function VisualObjectPlacementWorkspace({ active, context, grant, showGuidance, children }: {
  readonly active: ActiveEditorProject | null; readonly context: AssetManagerProject | null;
  readonly grant: AssetResourceGrant | null; readonly showGuidance: boolean;
  readonly children: (panel: ReactNode, viewport: ReactNode) => ReactNode;
}) {
  const [held, setHeld] = useState<Held | null>(null), [controller, setController] = useState<Controller | null>(null);
  const [selection, setSelection] = useState<VisualInspectorSelection>();
  const [sceneId, setSceneId] = useState('main'), [documentId, setDocumentId] = useState('placement-scene');
  const [locator, setLocator] = useState('map.scene.json'), [spaceId, setSpaceId] = useState('map-plane');
  const [dimensions, setDimensions] = useState<Record<'width' | 'height' | 'cellWidth' | 'cellHeight', Numeric>>({ width: 8, height: 6, cellWidth: 32, cellHeight: 32 });
  const [tracked, setTracked] = useState<string | null>(null), [layer, setLayer] = useState<string | null>(null);
  const [classification, setClassification] = useState<string | null>('npc');
  const [objectId, setObjectId] = useState(''), [displayName, setDisplayName] = useState(''), [cloneId, setCloneId] = useState('');
  const [mode, setMode] = useState<string | null>('scene-point'), [alignment, setAlignment] = useState<string | null>('center');
  const [x, setX] = useState<Numeric>(0), [y, setY] = useState<Numeric>(0);
  const [pending, setPending] = useState(false), [message, setMessage] = useState('Create or open a Scene, then choose an Asset in Asset Browser.');
  const [inspection, setInspection] = useState('');
  const [, refresh] = useState(0);
  const alive = useRef(false), busy = useRef(false), latest = useRef({ active, context, held });
  latest.current = { active, context, held };
  const project = active ? getProjectSessionSnapshot(active.session) : null;
  let catalog: ReturnType<typeof getAssetManagerProjectSnapshot>['catalog'] | null = null, generation = 0, assetLabel = 'Unavailable';
  try {
    if (context) { const managed = getAssetManagerProjectSnapshot(context); catalog = managed.catalog; generation = managed.generation;
      const selected = getManagedAssetSelection(context); assetLabel = selected.reference?.assetId ?? selected.status; }
  } catch { /* Context is explicitly unavailable while Project/catalog is being rebound. */ }
  const current = held?.project === active?.session ? held : null, snapshot = current?.session.getSnapshot();
  let map: ReturnType<typeof validateVisualSceneDocument> | null = null, reason = '';
  try { if (snapshot && catalog) map = validateVisualSceneDocument(snapshot.envelope, catalog); }
  catch (error) { reason = error instanceof TypeError ? error.message : 'Scene validation unavailable'; }
  const editor = controller && controller.project === active?.session && controller.document === current?.session
    && controller.assets === context && controller.projectRevision === project?.currentRevision && controller.catalogGeneration === generation
    ? controller.editor : null;
  useEffect(() => {
    setController(null); setSelection(undefined);
    if (!active || !context || !current || !catalog) return;
    let owned: VisualPlacementEditor;
    try { owned = createVisualPlacementEditor({ project: active.session, root: active.root.binding, document: current.session, assets: context });
      setController({ project: active.session, document: current.session, assets: context, projectRevision: project!.currentRevision,
        catalogGeneration: generation, editor: owned }); }
    catch (error) { setMessage(error instanceof TypeError ? `Placement unavailable: ${error.message}` : 'Placement context unavailable'); return; }
    return () => owned.dispose();
  }, [active?.session, active?.root.binding, current?.session, context, catalog, generation, project?.currentRevision]);
  useEffect(() => { setLayer(null); setTracked(null); setObjectId(''); setCloneId(''); setDisplayName(''); setX(0); setY(0); }, [active?.session]);
  useEffect(() => { alive.current = true; return () => { alive.current = false;
    const session = latest.current.held?.session; if (session && session.getSnapshot().state !== 'closed') session.close('discard'); }; }, []);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (latest.current.held?.session.getSnapshot().isDirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, []);
  const view = editor?.inspector.read(selection), ready = !!active && !!context && !!catalog && !pending;
  const position = (): VisualPlacementPosition => {
    if (!map) throw new TypeError('SCENE_REQUIRED');
    if (mode === 'grid-cell') {
      if (alignment !== 'center' && alignment !== 'start-corner') throw new TypeError('EXPLICIT_CELL_ALIGNMENT_REQUIRED');
      return { kind: 'grid-cell', cell: { column: numeric(x), row: numeric(y) }, alignment };
    }
    if (mode !== 'scene-point') throw new TypeError('EXPLICIT_POSITION_MODE_REQUIRED');
    return { kind: 'scene-point', position: { space: map.profile.space.reference, point: { x: numeric(x), y: numeric(y) } } };
  };
  const accept = (result: ReturnType<VisualPlacementEditor['edit']>, text: string) => {
    setSelection(result.status === 'selected' ? result.selection : undefined); refresh(value => value + 1); setMessage(text);
  };
  function author(kind: 'place' | 'move' | 'duplicate' | 'delete') {
    if (!ready || busy.current || !editor || !current || !snapshot) return;
    try {
      if (kind === 'place') {
        if (!layer || !classification) throw new TypeError('SELECT_LAYER_AND_CLASSIFICATION');
        accept(editor.place(editor.placement.capture(layer, classification), { objectId, displayName, position: position() }), 'Object placed in Scene. Save Scene separately.');
      } else {
        if (!selection) throw new TypeError('SELECT_OBJECT');
        const edit: VisualPlacementEdit = kind === 'delete' ? { kind } : kind === 'move' ? { kind, position: position() }
          : { kind, newObjectId: cloneId, position: position() };
        accept(editor.edit(selection, snapshot.currentRevision, edit), `${kind}: authored Scene changed. Save Scene separately.`);
      }
    } catch (error) { setMessage(error instanceof TypeError || error instanceof RangeError ? `Rejected: ${error.message}` : 'Authoring unavailable; Scene retained.'); }
  }
  function apply(edit: VisualPropertyEdit) {
    if (!ready || busy.current || !editor || !selection || !current || !active || !context) return;
    try {
      const source = readVisualPlacementScene({ project: active.session, root: active.root.binding, document: current.session, assets: context });
      accept(edit.kind === 'position' ? editor.edit(selection, source.document.currentRevision, { kind: 'move', position: { kind: 'scene-point', position: edit.point } })
        : editor.inspector.apply(selection, edit), 'Inspector property applied to the same Scene. Save Scene separately.');
    } catch (error) { setMessage(error instanceof TypeError ? `Rejected: ${error.message}` : 'Property unavailable; draft retained.'); }
  }
  async function command(kind: 'create' | 'open' | 'save') {
    if (!ready || !active || !context || !catalog || busy.current) return;
    if (kind !== 'save' && held) { setMessage('Close / discard the held Scene before opening another.'); return; }
    const owner = active, managed = context, assets = catalog;
    const stillCurrent = () => alive.current && latest.current.active?.session === owner.session
      && latest.current.active.root.binding === owner.root.binding && latest.current.context === managed;
    busy.current = true; setPending(true);
    try {
      if (kind === 'create') {
        const space = createCoordinateSpaceDefinition({ reference: { projectId: project!.projectId, coordinateSpaceId: spaceId },
          componentCount: 2, axes: { x: 'right', y: 'down' }, origin: { x: 0, y: 0 }, unit: 'scene-unit' });
        const made = createMap({ project: owner.session, root: owner.root.binding, identity: { projectId: project!.projectId, documentId },
          scene: { projectId: project!.projectId, sceneId }, trackingLocator: { type: 'project-relative', path: locator }, profile: {
            schemaVersion: 1, extentCells: { width: numeric(dimensions.width), height: numeric(dimensions.height) }, space,
            grid: createOrthogonalGridDefinition({ space: space.reference, orientation: 'orthogonal', origin: { x: 0, y: 0 },
              cellSize: { width: numeric(dimensions.cellWidth), height: numeric(dimensions.cellHeight) },
              indexing: { columnDirection: 'positive-x', rowDirection: 'positive-y', negativeIndices: 'reject' } }),
            layers: [{ layerKey: 'background', role: 'background', visible: true }, { layerKey: 'tiles', role: 'tiles', visible: true },
              { layerKey: 'objects', role: 'objects', visible: true }] } });
        try { replaceProjectManifest(owner.session, setProjectActiveScene(made.trackingCandidate, made.reference.identity, sceneId), made.projectRevision); }
        catch (error) { made.session.close('discard'); throw error; }
        setHeld({ project: owner.session, session: made.session, expected: { kind: 'absent' } });
        owner.notifyManifestChange(); setInspection(''); setMessage('Scene created in memory. Asset catalog rebinding; choose its Asset again.');
      } else if (kind === 'open') {
        if (!tracked) throw new TypeError('SELECT_TRACKED_SCENE');
        const result = await openMap({ project: owner.session, root: owner.root.binding,
          identity: { projectId: project!.projectId, documentId: tracked }, catalog: assets });
        if (!stillCurrent()) { if (result.status === 'opened') result.session.close('discard'); return; }
        if (result.status !== 'opened') { editor?.invalidate(); setSelection(undefined); setInspection('text' in result ? result.text ?? '' : '');
          setMessage(`Open Scene: ${result.status}${'reason' in result ? ` · ${result.reason}` : ''}`); return; }
        try { validateVisualSceneDocument(result.session.getSnapshot().envelope, assets);
          const now = getProjectSessionSnapshot(owner.session);
          replaceProjectManifest(owner.session, setProjectActiveScene(now.manifest, result.reference.identity, result.reference.sceneId!), now.currentRevision); }
        catch (error) { result.session.close('discard'); throw error; }
        setHeld({ project: owner.session, session: result.session, expected: result.observation.revision === null ? { kind: 'unknown' }
          : { kind: 'revision', identity: result.observation.identity, revision: result.observation.revision } });
        owner.notifyManifestChange(); setInspection(''); setMessage('Scene opened from storage. Choose an object.');
      } else if (current) {
        validateVisualSceneDocument(current.session.getSnapshot().envelope, assets);
        const result = await saveMap({ project: owner.session, root: owner.root.binding, session: current.session, catalog: assets, expected: current.expected });
        if (!stillCurrent() || latest.current.held !== current) return;
        if (result.status === 'committed') setHeld({ ...current, expected: result.observation.revision === null ? { kind: 'unknown' }
          : { kind: 'revision', identity: result.observation.identity, revision: result.observation.revision } });
        else { editor?.invalidate(); setSelection(undefined); }
        refresh(value => value + 1); setMessage(`Save Scene: ${result.status}${'reason' in result ? ` · ${result.reason}` : ''}. Project and Assets saved separately.`);
      }
    } catch (error) { if (stillCurrent()) { editor?.invalidate(); setSelection(undefined);
      setMessage(error instanceof TypeError || error instanceof RangeError ? `Rejected: ${error.message}` : 'Scene IO unavailable; retained Scene was not replaced.'); } }
    finally { busy.current = false; if (alive.current) setPending(false); }
  }
  const panel = <EditorPanel title="Visual Object Placement" subtitle="Scene authoring and visual properties" readOnlyReason={reason || undefined}>
    <Stack gap={editorTokens.spacing.standard}>
      <Text>Project: {project?.projectId ?? 'None'} · Scene: {map?.identity.sceneId ?? 'None'} · revision {snapshot?.currentRevision ?? '—'} · {snapshot ? snapshot.savedRevision === null ? 'Unsaved' : snapshot.isDirty ? 'Modified' : 'Saved snapshot' : 'No Scene'}</Text>
      {held && !current && <Text>A Scene from another Project is retained. Return to that Project or explicitly close / discard it.</Text>}
      <TextInput label="New Scene ID" value={sceneId} disabled={!ready || !!held} onChange={event => setSceneId(event.currentTarget.value)} />
      <TextInput label="New Document ID" value={documentId} disabled={!ready || !!held} onChange={event => setDocumentId(event.currentTarget.value)} />
      <TextInput label="Scene locator" value={locator} disabled={!ready || !!held} onChange={event => setLocator(event.currentTarget.value)} />
      <TextInput label="New coordinate space ID" value={spaceId} disabled={!ready || !!held} onChange={event => setSpaceId(event.currentTarget.value)} />
      {(['width', 'height', 'cellWidth', 'cellHeight'] as const).map(key => <NumberInput key={key}
        label={{ width: 'Width (cells)', height: 'Height (cells)', cellWidth: 'Cell width (scene units)', cellHeight: 'Cell height (scene units)' }[key]}
        value={dimensions[key]} disabled={!ready || !!held} onChange={value => setDimensions(previous => ({ ...previous, [key]: value }))} />)}
      <Text>New Scenes: scene-unit, origin 0,0, axes right/down, positive grid indices; background, tiles, objects layers.</Text>
      <Select label="Tracked Scene Document" value={tracked} onChange={setTracked} disabled={!ready || !!held}
        data={project?.manifest.documents.filter(item => item.documentKind === 'scene').map(item => ({ value: item.identity.documentId, label: `${item.sceneId} · ${item.identity.documentId}` })) ?? []} />
      <Group gap={editorTokens.spacing.compact}>
        <Button disabled={!ready || !!held} onClick={() => void command('create')}>Create Scene</Button>
        <Button disabled={!ready || !!held || !tracked} onClick={() => void command('open')}>Open Scene</Button>
        <Button disabled={!ready || !map || !current} onClick={() => void command('save')}>Save Scene</Button>
        <Button variant="default" disabled={!held || pending} onClick={() => { editor?.dispose(); held!.session.close('discard');
          setHeld(null); setController(null); setSelection(undefined); setInspection(''); setMessage('Scene closed; unsaved edits explicitly discarded.'); }}>Close / discard Scene</Button>
      </Group>
      <Text>Current Asset Browser selection: {assetLabel}</Text>
      <TextInput label="Object ID (unique in Scene)" value={objectId} disabled={!ready} onChange={event => setObjectId(event.currentTarget.value)} />
      <TextInput label="Display name" value={displayName} disabled={!ready} onChange={event => setDisplayName(event.currentTarget.value)} />
      <Select label="Authoring classification" data={[...visualPlacementLabels]} value={classification} allowDeselect={false} onChange={setClassification} disabled={!ready} />
      <Select label="Object layer" data={map?.profile.layers.filter(item => item.role === 'objects').map(item => item.layerKey) ?? []} value={layer} onChange={setLayer} disabled={!ready || !map} />
      {map && !map.profile.layers.some(item => item.role === 'objects') && <Text>No objects-role layer. Open or create a Scene with an authored objects layer.</Text>}
      <Select label="Position mode" data={[{ value: 'scene-point', label: 'Scene X / Y' }, { value: 'grid-cell', label: 'Grid column / row' }]} value={mode} allowDeselect={false} onChange={setMode} disabled={!ready} />
      <NumberInput label={mode === 'grid-cell' ? 'Column (zero based)' : 'Scene X'} value={x} onChange={setX} disabled={!ready} />
      <NumberInput label={mode === 'grid-cell' ? 'Row (zero based)' : 'Scene Y'} value={y} onChange={setY} disabled={!ready} />
      {mode === 'grid-cell' && <Select label="Cell alignment" data={['center', 'start-corner']} value={alignment} allowDeselect={false} onChange={setAlignment} disabled={!ready} />}
      <Button disabled={!ready || !editor || !layer || !classification || !objectId} onClick={() => author('place')}>Place selected Asset</Button>
      <Select label="Scene objects" clearable value={view?.status === 'selected' ? view.selection.objectId : null}
        data={map?.membership.objects.map(item => ({ value: item.definition.objectId, label: `${item.definition.objectId} · ${item.definition.classification ?? 'unclassified'}` })) ?? []}
        disabled={!ready || !editor} onChange={id => { if (!editor) return;
          if (id === null) { editor.inspector.clear(); setSelection(undefined); return; }
          const result = editor.inspector.select(id); accept(result, result.status === 'selected' ? 'Selected current Scene object.' : `${result.status}: ${result.reason}`); }} />
      <TextInput label="Duplicate object ID (new)" value={cloneId} disabled={!ready} onChange={event => setCloneId(event.currentTarget.value)} />
      <Group gap={editorTokens.spacing.compact}>
        <Button disabled={!ready || view?.status !== 'selected'} onClick={() => author('move')}>Move to entered position</Button>
        <Button disabled={!ready || view?.status !== 'selected' || !cloneId} onClick={() => author('duplicate')}>Duplicate to entered position</Button>
        <Button variant="default" disabled={!ready || view?.status !== 'selected'} onClick={() => author('delete')}>Delete selected object</Button>
      </Group>
      {view?.status === 'selected' && catalog && <VisualFields key={`${view.selection.generation}:${view.selection.revision}`}
        value={view} catalog={catalog} disabled={!ready || !!reason} apply={apply} />}
      <Alert title={pending ? 'Pending' : 'Placement status'} role="status" color={editorTokens.colors.neutral}>{message}</Alert>
      {inspection && <Text component="pre">{inspection}</Text>}
      <Text>Save Scene, Assets and Project separately. Existing-file updates require host CAS. After edits acquire preview again. VFX is an authoring label; playback and canvas picking are unavailable.</Text>
    </Stack>
  </EditorPanel>;
  return children(panel, <VisualViewport document={map?.document ?? null} catalog={catalog} grant={grant} showGuidance={showGuidance} />);
}
