import { Alert, Button, Group, Select, Stack, Text, TextInput, Title } from '@mantine/core';
import { useEffect, useState, type ReactNode } from 'react';
import {
  createAssetManagerProject, closeAssetManagerProject, getAssetManagerProjectSnapshot,
  rebuildAssetManagerCatalog, searchManagedAssets, selectManagedAsset, getManagedAssetSelection,
  inspectManagedAsset, assetBrowserCategories, loadDocument, getProjectSessionSnapshot,
  registerExistingAssetResource, adoptAssetManagerCatalog,
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
      if (result.status !== 'admitted') { setMessage(`Register: ${result.status} · ${result.reason}`); return; }
      adoptAssetManagerCatalog(context, result.candidate.catalog, result.candidate.generation);
      onRegistered?.(result.candidate); refresh(value => value + 1);
      setMessage('Registered in memory · Asset Document and manifest are NOT_COMMITTED.');
    } catch { setMessage('Registration rejected; inspect explicit ID/path and active project.'); }
    finally { setPending(false); }
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
      </Group>
      {!resourcePort && <Text>Resource authorization host unavailable. Registration and image preview are unavailable.</Text>}
      <Alert title="Asset status" color={editorTokens.colors.neutral} role="status">{message}</Alert>
    </Stack>
  </EditorPanel>);
}
