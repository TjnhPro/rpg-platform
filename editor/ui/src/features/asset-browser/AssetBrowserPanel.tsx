import { Alert, Button, Group, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  createAssetManagerProject, closeAssetManagerProject, getAssetManagerProjectSnapshot,
  rebuildAssetManagerCatalog, searchManagedAssets, selectManagedAsset, getManagedAssetSelection,
  inspectManagedAsset, assetBrowserCategories, loadDocument, getProjectSessionSnapshot,
  registerExistingAssetResource, registerManagedAsset, adoptAssetManagerCatalog, createDocumentSession,
  saveDocument, trackProjectDocument, replaceProjectManifest,
  type AssetManagerProject, type ExistingResourcePort, type AssetRegistrationCandidate,
} from '@rpg-platform/editor';
import type { ActiveEditorProject } from '../project-manager/ProjectManagerPanel.js';
import { EditorPanel } from '../../components/panel/EditorPanel.js';
import { editorTokens } from '../../theme/index.js';

export function AssetBrowserWorkspace({ active, resourcePort = null, onRegistered, children }: {
  readonly active: ActiveEditorProject | null;
  readonly resourcePort?: ExistingResourcePort | null;
  readonly children: (context: AssetManagerProject | null, panel: ReactNode) => ReactNode;
  readonly onRegistered?: (candidate: AssetRegistrationCandidate) => void;
}) {
  const [loaded, setLoaded] = useState<{ active: ActiveEditorProject; context: AssetManagerProject } | null>(null);
  const context = loaded?.active === active ? loaded?.context ?? null : null;
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [assetId, setAssetId] = useState('');
  const [sourcePath, setSourcePath] = useState('');
  const [message, setMessage] = useState('No active project.');
  const [pending, setPending] = useState(false);
  const [drafts, setDrafts] = useState<readonly AssetRegistrationCandidate[]>([]);
  const [receipts, setReceipts] = useState('No asset write attempted.');
  const currentActive = useRef(active);
  currentActive.current = active;
  useEffect(() => () => { currentActive.current = null; }, []);
  useEffect(() => { setDrafts([]); setReceipts('No asset write attempted.'); }, [active?.session]);
  const [, refresh] = useState(0);
  useEffect(() => {
    let cancelled = false;
    let owned: AssetManagerProject | null = null;
    setLoaded(null); setQuery(''); setCategory(null); setPending(false);
    setAssetId(''); setSourcePath('');
    if (!active) { setMessage('No active project.'); return; }
    setPending(true); setMessage('Loading explicitly tracked asset Documents…');
    void (async () => {
      try {
        owned = createAssetManagerProject(active.session, active.root.binding);
        const project = getProjectSessionSnapshot(active.session);
        const documents = [];
        for (const ref of project.manifest.documents.filter(item => item.documentKind === 'asset')) {
          const port = active.root.binding.readPort;
          if (!port) throw new Error('READ_UNAVAILABLE');
          const loaded = await loadDocument(port, ref.locator.path,
            { owner: 'asset', documentKind: 'asset', contentSchemaVersion: 1 });
          if (loaded.status !== 'loaded') throw new Error('ASSET_DOCUMENT_UNAVAILABLE');
          documents.push(loaded.session.getSnapshot().envelope); loaded.session.close('discard');
        }
        if (cancelled) return;
        rebuildAssetManagerCatalog(owned, documents, 1);
        setLoaded({ active, context: owned }); setMessage('Project catalog loaded. Source files are not checked by browsing.');
      } catch { if (!cancelled) setMessage('Asset Documents unavailable or rejected. Catalog was not partially adopted.'); }
      finally { if (!cancelled) setPending(false); }
    })();
    return () => { cancelled = true; if (owned) closeAssetManagerProject(owned); };
  }, [active]);
  const snapshot = context ? getAssetManagerProjectSnapshot(context) : null;
  const matches = context && snapshot ? searchManagedAssets(context, { projectId: snapshot.projectId,
    query, ...(category ? { category } : {}) }) : null;
  const selection = context ? getManagedAssetSelection(context) : null;
  const inspection = context ? inspectManagedAsset(context, selection?.reference ?? null) : null;
  async function register() {
    if (!active || !context || !snapshot || !resourcePort || pending) return;
    setPending(true);
    try {
      const source = { role: 'image', locator: { type: 'project-relative' as const, path: sourcePath } };
      const result = await registerExistingAssetResource(context, { operation: 'register-existing', root: active.root.binding,
        definition: { identity: { projectId: snapshot.projectId, assetId }, kind: 'image',
          metadata: category && category !== 'uncategorized' ? { editorBrowserCategory: category } : {}, sources: [source] },
        source, documentIdentity: { projectId: snapshot.projectId, documentId: assetId },
        documentLocator: { type: 'project-relative', path: `${assetId}.asset.json` } }, resourcePort);
      if (currentActive.current !== active) return;
      if (result.status !== 'admitted') { setMessage(`Register: ${result.status} · ${result.reason}`); return; }
      adoptAssetManagerCatalog(context, result.candidate.catalog, result.candidate.generation);
      setDrafts(current => [...current, result.candidate]);
      onRegistered?.(result.candidate); refresh(value => value + 1);
      setMessage('Registered in memory · Asset Document and manifest are NOT_COMMITTED.');
    } catch { if (currentActive.current === active) setMessage('Registration rejected; inspect explicit ID/path and active project.'); }
    finally { if (currentActive.current === active) setPending(false); }
  }
  function registerItem() {
    if (!active || !context || !snapshot || pending) return;
    try {
      const candidate = registerManagedAsset(context, { identity: { projectId: snapshot.projectId, assetId }, kind: 'text',
        metadata: { editorBrowserCategory: 'item', editorDisplayName: 'Metadata Item', vendor: { retained: true } } },
        { projectId: snapshot.projectId, documentId: assetId }, { type: 'project-relative', path: `${assetId}.asset.json` });
      adoptAssetManagerCatalog(context, candidate.catalog, candidate.generation);
      setDrafts(current => [...current, candidate]); refresh(value => value + 1);
      setMessage('Metadata Item registered in memory · NOT_COMMITTED.');
    } catch { setMessage('Item registration rejected. Use an explicit unique project-local ID.'); }
  }
  async function saveAssets() {
    if (!active || !context || !drafts.length || pending || !active.root.binding.writePort) return;
    const project = getProjectSessionSnapshot(active.session);
    if (project.savedRevision !== null) { setMessage('This host cannot replace an existing project manifest. Asset writes were not started.'); return; }
    setPending(true); const outcomes: string[] = [];
    try {
      for (const draft of drafts) {
        getAssetManagerProjectSnapshot(context);
        const document = createDocumentSession(draft.document, null); document.open();
        try {
          const result = await saveDocument(document, active.root.binding.writePort, draft.reference.locator.path,
            { kind: 'absent' }, { owner: 'asset', documentKind: 'asset', contentSchemaVersion: 1 });
          if (currentActive.current !== active) return;
          outcomes.push(`${draft.reference.locator.path}: ${result.status}`);
          setReceipts(outcomes.join(' · '));
          if (result.status !== 'committed' || result.acknowledgement !== 'applied') {
            setMessage('Partial asset save. Manifest tracking unchanged; inspect actual receipts. No automatic retry.'); return;
          }
        } finally { document.close('discard'); }
      }
      getAssetManagerProjectSnapshot(context);
      const current = getProjectSessionSnapshot(active.session);
      if (current.savedRevision !== null) {
        setMessage('Asset Documents committed, but the manifest was saved during this operation. Tracking remains unchanged; inspect files before continuing.'); return;
      }
      const manifest = drafts.reduce((candidate, draft) => trackProjectDocument(candidate, draft.reference), current.manifest);
      replaceProjectManifest(active.session, manifest, current.currentRevision);
      setDrafts([]); active.notifyManifestChange();
      setMessage('Asset Documents committed. Manifest is modified in memory; use Project Manager Save separately.');
    } catch { if (currentActive.current === active) setMessage('Asset operation interrupted or context changed. Check per-file receipts; no atomic rollback is promised.'); }
    finally { if (currentActive.current === active) setPending(false); }
  }
  return children(context, <EditorPanel title="Asset Browser" subtitle="Project assets · resource kind and browser category are independent.">
    <Stack gap={editorTokens.spacing.standard}>
      <Text>Project: {snapshot?.projectId ?? 'None'}</Text>
      <TextInput label="Search assets" value={query} maxLength={1024} disabled={!context || pending}
        onChange={event => setQuery(event.currentTarget.value)} />
      <Select label="Asset category" clearable data={assetBrowserCategories} value={category}
        disabled={!context || pending} onChange={setCategory} />
      <Text>{matches?.count ?? 0} matches</Text>
      <Stack gap={editorTokens.spacing.compact} aria-label="Project asset list">
        {matches?.definitions.map(asset => <Button key={asset.identity.assetId} variant="default" disabled={pending}
          aria-pressed={selection?.reference?.assetId === asset.identity.assetId}
          onClick={() => { if (context) { selectManagedAsset(context, { ...asset.identity, expectedKind: asset.kind }); refresh(value => value + 1); } }}>
          {asset.identity.assetId} · {asset.kind}
        </Button>)}
        {matches?.count === 0 && <Text>No matching assets.</Text>}
      </Stack>
      <Title order={3} size="sm">Read-only asset Inspector</Title>
      <Text>{inspection ? JSON.stringify(inspection, null, 2) : 'No selection.'}</Text>
      <Title order={3} size="sm">Static preview</Title>
      <Text>{inspection?.status === 'resolved' && inspection.definition.kind !== 'image'
        ? 'Unsupported resource kind. Metadata remains available.' : 'Select an image and use the shared viewport when a resource host is connected.'}</Text>
      <TextInput label="New asset ID" value={assetId} disabled={!context || pending}
        onChange={event => setAssetId(event.currentTarget.value)} />
      <TextInput label="Existing project resource path" value={sourcePath} disabled={!context || pending}
        onChange={event => setSourcePath(event.currentTarget.value)} />
      <Group gap={editorTokens.spacing.compact}>
        <Button disabled={!context || pending || !resourcePort || !assetId || !sourcePath}
          onClick={() => void register()}>Register existing resource</Button>
        <Button variant="default" disabled={!context || pending || !assetId} onClick={registerItem}>Register metadata Item</Button>
        <Button disabled={!drafts.length || pending || !active?.root.binding.writePort}
          onClick={() => void saveAssets()}>Save asset documents</Button>
      </Group>
      <Text>{drafts.length} unsaved asset Documents · {receipts}</Text>
      <Text>Save asset Documents before the first Project Save. Existing-file updates are unsupported by this finite host.</Text>
      <Text>Switching project discards unsaved asset registrations. Save asset Documents and then the Project manifest first.</Text>
      {!resourcePort && <Text>Resource authorization host unavailable. Registration and image preview are unavailable.</Text>}
      <Alert title="Asset status" color={editorTokens.colors.neutral} role="status">{message}</Alert>
    </Stack>
  </EditorPanel>);
}
