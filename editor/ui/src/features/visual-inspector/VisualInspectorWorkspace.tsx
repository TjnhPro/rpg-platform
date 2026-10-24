import { Alert, Button, Group, Select, Stack, Text } from '@mantine/core';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { openMap, saveMap, getProjectSessionSnapshot, getAssetManagerProjectSnapshot,
  setProjectActiveScene, replaceProjectManifest, createVisualDocumentEditor, validateVisualSceneDocument,
  type DocumentSession, type ProjectSession, type DocumentWritePrecondition, type AssetManagerProject,
  type VisualInspectorSelection, type VisualPropertyEdit } from '@rpg-platform/editor';
import type { ActiveEditorProject } from '../project-manager/ProjectManagerPanel.js';
import type { AssetResourceGrant } from '../asset-browser/AssetViewport.js';
import { EditorPanel } from '../../components/panel/EditorPanel.js';
import { editorTokens } from '../../theme/index.js';
import { VisualFields } from './VisualFields.js';
import { VisualViewport } from './VisualViewport.js';

interface Held { readonly project: ProjectSession; readonly session: DocumentSession; readonly expected: DocumentWritePrecondition }

/** One canonical Document session, mounted above responsive panel/viewport lifetime. */
export function VisualInspectorWorkspace({ active, context, grant, showGuidance, children }: {
  readonly active: ActiveEditorProject | null; readonly context: AssetManagerProject | null;
  readonly grant: AssetResourceGrant | null; readonly showGuidance: boolean;
  readonly children: (panel: ReactNode, viewport: ReactNode) => ReactNode;
}) {
  const [held, setHeld] = useState<Held | null>(null), [tracked, setTracked] = useState<string | null>(null);
  const [selection, setSelection] = useState<VisualInspectorSelection>();
  const [pending, setPending] = useState(false), [message, setMessage] = useState('Open a tracked Scene after loading its Asset catalog.');
  const [inspection, setInspection] = useState('');
  const [, refresh] = useState(0);
  const alive = useRef(false), busy = useRef(false), latest = useRef({ active, context, held });
  latest.current = { active, context, held };
  const project = active ? getProjectSessionSnapshot(active.session) : null;
  const catalog = context ? getAssetManagerProjectSnapshot(context).catalog : null;
  const current = held?.project === active?.session ? held : null;
  const snapshot = current?.session.getSnapshot();
  const editor = useMemo(() => active && current && catalog ? createVisualDocumentEditor({ project: active.session,
    root: active.root.binding, document: current.session, catalog }) : null,
  [active?.session, active?.root.binding, current?.session, catalog, project?.manifest.activeScene?.documentId, project?.manifest.activeScene?.sceneId]);
  useEffect(() => { setSelection(undefined); return () => editor?.invalidate(); }, [editor]);
  useEffect(() => { alive.current = true; return () => { alive.current = false;
    const owned = latest.current.held?.session; if (owned && owned.getSnapshot().state !== 'closed') owned.close('discard'); }; }, []);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (latest.current.held?.session.getSnapshot().isDirty) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, []);
  const { map, reason } = useMemo(() => {
    try { return { map: snapshot && catalog ? validateVisualSceneDocument(snapshot.envelope, catalog) : null, reason: '' }; }
    catch (error) { return { map: null, reason: error instanceof TypeError ? error.message : 'Scene validation unavailable' }; }
  }, [snapshot?.envelope, catalog]);
  const view = editor?.read(selection);
  const ready = !!active && !!context && !pending;
  const select = (id: string | null) => {
    if (!editor) return;
    if (id === null) { editor.clear(); setSelection(undefined); return; }
    const result = editor.select(id);
    setSelection(result.status === 'selected' ? result.selection : undefined);
    setMessage(result.status === 'selected' ? 'Object selected. Draft edits require Apply.' : `${result.status}: ${result.reason}`);
  };
  function apply(edit: VisualPropertyEdit) {
    if (!ready || !editor || !selection) return;
    try { const result = editor.apply(selection, edit); setSelection(result.status === 'selected' ? result.selection : undefined);
      refresh(value => value + 1); setMessage('Property applied to Scene Document. Save Scene separately.'); }
    catch (error) { setMessage(error instanceof TypeError ? `Rejected: ${error.message}` : 'Edit unavailable; draft retained.'); }
  }
  async function command(kind: 'open' | 'save') {
    if (!ready || !active || !catalog || busy.current) return;
    const owner = active, assets = catalog, managed = context;
    const stillCurrent = () => alive.current && latest.current.active?.session === owner.session
      && latest.current.active.root.binding === owner.root.binding && latest.current.context === managed;
    busy.current = true; setPending(true);
    try {
      if (kind === 'open') {
        if (held || !tracked) throw new TypeError('Close held Scene and select a tracked Document first');
        const result = await openMap({ project: owner.session, root: owner.root.binding,
          identity: { projectId: project!.projectId, documentId: tracked }, catalog: assets });
        if (!stillCurrent()) { if (result.status === 'opened') result.session.close('discard'); return; }
        if (result.status !== 'opened') { editor?.invalidate(); setSelection(undefined);
          setInspection('text' in result ? result.text ?? '' : ''); setMessage(`Open: ${result.status}${'reason' in result ? ` · ${result.reason}` : ''}`); return; }
        try {
          validateVisualSceneDocument(result.session.getSnapshot().envelope, assets);
          const now = getProjectSessionSnapshot(owner.session);
          replaceProjectManifest(owner.session, setProjectActiveScene(now.manifest, result.reference.identity, result.reference.sceneId!), now.currentRevision);
        } catch (error) { setInspection(result.text); result.session.close('discard'); throw error; }
        setHeld({ project: owner.session, session: result.session, expected: result.observation.revision === null ? { kind: 'unknown' }
          : { kind: 'revision', identity: result.observation.identity, revision: result.observation.revision } });
        owner.notifyManifestChange(); setInspection(''); setMessage('Scene opened from storage. Select any object, including hidden objects.');
      } else if (current) {
        validateVisualSceneDocument(current.session.getSnapshot().envelope, assets);
        const result = await saveMap({ project: owner.session, root: owner.root.binding, session: current.session,
          catalog: assets, expected: current.expected });
        if (!stillCurrent() || latest.current.held !== current) return;
        if (result.status === 'committed') setHeld({ ...current, expected: result.observation.revision === null ? { kind: 'unknown' }
          : { kind: 'revision', identity: result.observation.identity, revision: result.observation.revision } });
        else { editor?.invalidate(); setSelection(undefined); }
        refresh(value => value + 1); setMessage(`Save Scene: ${result.status}${'reason' in result ? ` · ${result.reason}` : ''}. Project was not saved.`);
      }
    } catch (error) { if (stillCurrent()) { editor?.invalidate(); setSelection(undefined);
      setMessage(error instanceof TypeError ? `Rejected: ${error.message}` : 'Scene IO unavailable; inspect host and storage.'); } }
    finally { busy.current = false; if (alive.current) setPending(false); }
  }
  const panel = <EditorPanel title="Visual Properties" subtitle="Authored Scene properties" readOnlyReason={reason || undefined}>
    <Stack gap={editorTokens.spacing.standard}>
      <Text>Project: {project?.projectId ?? 'None'} · Scene: {map?.identity.sceneId ?? 'None'} · revision {snapshot?.currentRevision ?? '—'} · {snapshot ? snapshot.isDirty ? 'Modified' : 'Saved snapshot' : 'No Scene'}</Text>
      {held && !current && <Text>A Scene from another Project is retained. Return to that Project or explicitly close/discard it.</Text>}
      <Select label="Tracked Scene Document" value={tracked} onChange={setTracked} disabled={!ready || !!held}
        data={project?.manifest.documents.filter(item => item.documentKind === 'scene').map(item => ({ value: item.identity.documentId, label: `${item.sceneId} · ${item.identity.documentId}` })) ?? []} />
      <Group gap={editorTokens.spacing.compact}>
        <Button disabled={!ready || !!held || !tracked} onClick={() => void command('open')}>Open Scene</Button>
        <Button disabled={!ready || !map || !current} onClick={() => void command('save')}>Save Scene</Button>
        <Button variant="default" disabled={!held || pending} onClick={() => { editor?.invalidate(); held!.session.close('discard');
          setHeld(null); setSelection(undefined); setInspection(''); setMessage('Scene closed; unsaved edits explicitly discarded.'); }}>Close / discard Scene</Button>
      </Group>
      <Select label="Scene object" clearable value={view?.status === 'selected' ? view.selection.objectId : null} onChange={select}
        data={map?.membership.objects.map(item => ({ value: item.definition.objectId, label: item.definition.displayName ?? item.definition.objectId })) ?? []}
        disabled={!ready || !map} />
      {view?.status === 'selected' && catalog ? <VisualFields key={`${view.selection.generation}:${view.selection.revision}`}
        value={view} catalog={catalog} disabled={!ready || !!reason} apply={apply} />
        : <Text>{view && view.status !== 'selected' ? `${view.status}: ${view.reason}` : 'No selection'}</Text>}
      <Alert title={pending ? 'Pending' : 'Inspector status'} role="status" color={editorTokens.colors.neutral}>{message}</Alert>
      {inspection && <Text component="pre">{inspection}</Text>}
      <Text>Save Scene, Assets and Project separately. Existing-file writes require host CAS. Edits remount preview: acquire again. Preview results do not verify displayed pixels.</Text>
    </Stack>
  </EditorPanel>;
  return children(panel, <VisualViewport document={map?.document ?? null} catalog={catalog} grant={grant} showGuidance={showGuidance} />);
}
