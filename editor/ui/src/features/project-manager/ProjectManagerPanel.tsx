import { Alert, Button, Group, Select, Stack, Text, TextInput } from '@mantine/core';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createProject, openProject, saveProject, closeProjectSession,
  getProjectSessionSnapshot, type ProjectSession } from '@rpg-platform/editor';
import { EditorPanel } from '../../components/panel/EditorPanel.js';
import { editorTokens } from '../../theme/index.js';
import { connectProjectHost, type ProjectHostRoot } from './host.js';

const locator = Object.freeze({ type: 'project-relative' as const, path: 'project.json' });
export interface ActiveEditorProject { readonly session: ProjectSession; readonly root: ProjectHostRoot;
  readonly notifyManifestChange: () => void }
export function ProjectManagerWorkspace({ children }: {
  readonly children: (active: ActiveEditorProject | null, panel: ReactNode) => ReactNode;
}) {
  const [roots, setRoots] = useState<readonly ProjectHostRoot[]>([]);
  const [projectId, setProjectId] = useState('game-a');
  const [names, setNames] = useState<Record<string, string>>({ 'game-a': 'Game A', 'game-b': 'Game B' });
  const [sessions, setSessions] = useState<ReadonlyMap<string, ProjectSession>>(new Map());
  const [message, setMessage] = useState('Connecting to project host…');
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);
  const alive = useRef(false);
  const busy = useRef(false);
  useEffect(() => {
    alive.current = true;
    const controller = new AbortController();
    connectProjectHost(controller.signal).then((connected) => {
      if (!controller.signal.aborted) { setRoots(connected); setMessage('Host ready. New projects remain unsaved until Save.'); }
    }).catch(() => {
      if (!controller.signal.aborted) { setError(true); setMessage('Filesystem host unavailable. Start the documented Project Manager host.'); }
    });
    return () => { alive.current = false; controller.abort(); };
  }, []);
  useEffect(() => {
    const warnUnsaved = (event: BeforeUnloadEvent) => {
      if ([...sessions.values()].some((session) => getProjectSessionSnapshot(session).isDirty)) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warnUnsaved);
    return () => window.removeEventListener('beforeunload', warnUnsaved);
  }, [sessions]);
  const active = sessions.get(projectId);
  const snapshot = active ? getProjectSessionSnapshot(active) : undefined;
  const root = roots.find((item) => item.projectId === projectId);
  const notifyManifestChange = useCallback(() => setSessions(current => new Map(current)), []);
  const capability = useMemo(() => active && root ? { session: active, root, notifyManifestChange } : null,
    [active, root, snapshot?.currentRevision, notifyManifestChange]);
  const publish = (session: ProjectSession) => {
    if (!alive.current) { closeProjectSession(session, 'discard'); return; }
    setSessions((current) => new Map(current).set(projectId, session));
  };
  async function command(kind: 'create' | 'open' | 'save') {
    if (busy.current || !root) return;
    busy.current = true; setPending(true); setError(false);
    try {
      if (kind === 'create') {
        if (active) throw new Error('PROJECT_ALREADY_OPEN');
        const session = createProject({ identity: { projectId, documentId: 'project-manifest' },
          metadata: { name: names[projectId] ?? '' }, root: root.binding, locator });
        publish(session); setMessage('Created in memory · Unsaved. Save publishes the manifest.');
      } else if (kind === 'open') {
        if (snapshot?.isDirty) throw new Error('UNSAVED_PROJECT');
        const result = await openProject({ root: root.binding, locator, expectedProjectId: projectId });
        if (result.status !== 'opened') { setError(true); setMessage(`Open: ${result.status}${'reason' in result ? ` · ${result.reason}` : ''}`); return; }
        if (active) closeProjectSession(active, 'discard'); // explicitly clean replacement only
        publish(result.session); setMessage('Opened from filesystem · Saved snapshot.');
      } else if (active) {
        const result = await saveProject(active, snapshot?.savedRevision === null ? { kind: 'absent' } : { kind: 'unknown' });
        if (!alive.current) return;
        setSessions((current) => new Map(current));
        const success = result.status === 'committed' && result.acknowledgement === 'applied';
        setError(!success);
        setMessage(success ? 'Manifest published to filesystem. Existing-file updates are unsupported by this host.'
          : `Save: ${result.status}${'reason' in result ? ` · ${result.reason}` : ''}`);
      }
    } catch {
      if (alive.current) { setError(true); setMessage('Operation rejected. Check project name, host availability and unsaved project state; current project retained.'); }
    } finally { busy.current = false; if (alive.current) setPending(false); }
  }
  return children(capability, (
    <EditorPanel title="Project Manager" subtitle="Create, save and open independent project manifests.">
      <Stack gap={editorTokens.spacing.standard}>
        <Select label="Project root" value={projectId} allowDeselect={false}
          data={['game-a', 'game-b']} disabled={pending}
          onChange={(value) => { if (value) { setProjectId(value); setError(false); setMessage('Selected project root. Sessions remain independent.'); } }} />
        <TextInput label="Project name" value={snapshot?.manifest.metadata.name ?? names[projectId] ?? ''}
          readOnly={!!active} disabled={pending}
          onChange={(event) => { const name = event.currentTarget.value; setNames((current) => ({ ...current, [projectId]: name })); }} />
        <Text>Root: {root?.directory ?? 'Unavailable'}</Text>
        <Group gap={editorTokens.spacing.compact}>
          <Button disabled={pending || !root || !!active} onClick={() => void command('create')}>Create</Button>
          <Button variant="default" disabled={pending || !root || !!snapshot?.isDirty} onClick={() => void command('open')}>Open</Button>
          <Button disabled={pending || !active} onClick={() => void command('save')}>Save</Button>
        </Group>
        <Text>Active project: {snapshot ? `${snapshot.manifest.metadata.name} (${snapshot.projectId})` : 'None'}</Text>
        <Text>State: {snapshot ? snapshot.savedRevision === null ? 'Unsaved' : snapshot.isDirty ? 'Modified' : 'Saved' : 'No project'}</Text>
        <Alert title={error ? 'Project operation unavailable' : 'Project status'}
          color={error ? editorTokens.colors.error : editorTokens.colors.neutral} role={error ? 'alert' : 'status'}>{message}</Alert>
        <Text>Save affects only the manifest. Tracked files and Scene contents are not loaded. Existing-file updates are unsupported.</Text>
      </Stack>
    </EditorPanel>
  ));
}
/** Compatibility view; composition hosts should keep Workspace above responsive slots. */
export function ProjectManagerPanel() {
  return <ProjectManagerWorkspace>{(_active, panel) => panel}</ProjectManagerWorkspace>;
}
