import { Badge, Group, Switch, Text, Title } from '@mantine/core';
import { useState } from 'react';
import { EditorPanel } from '../components/panel/EditorPanel.js';
import { EditorShell } from '../layout/EditorShell.js';
import { editorTokens } from '../theme/index.js';
import { AssetViewport } from '../features/asset-browser/AssetViewport.js';
import { ProjectManagerWorkspace } from '../features/project-manager/ProjectManagerPanel.js';
import { AssetBrowserWorkspace } from '../features/asset-browser/AssetBrowserPanel.js';
import { useAssetResourceGrant } from '../features/asset-browser/host.js';
import type { ActiveEditorProject } from '../features/project-manager/ProjectManagerPanel.js';
import type { ReactNode } from 'react';

export function App() {
  const [showGuidance, setShowGuidance] = useState(true);
  return <ProjectManagerWorkspace>{(active, projectPanel) => <AssetWorkspace active={active} projectPanel={projectPanel} showGuidance={showGuidance} setShowGuidance={setShowGuidance} />}</ProjectManagerWorkspace>;
}
function AssetWorkspace({ active, projectPanel, showGuidance, setShowGuidance }: {
  readonly active: ActiveEditorProject | null; readonly projectPanel: ReactNode;
  readonly showGuidance: boolean; readonly setShowGuidance: (value: boolean) => void;
}) {
  const grant = useAssetResourceGrant(active);
  return <AssetBrowserWorkspace active={active} resourcePort={grant?.existing}>
    {(context, browser) => <EditorShell
      header={<Group gap={editorTokens.spacing.standard}>
        <Title order={1} size="md">RPG Editor</Title>
        <Badge color={editorTokens.colors.neutral}>Asset Manager</Badge>
      </Group>}
      toolbar={<Switch label="Show guidance" checked={showGuidance}
        onChange={event => setShowGuidance(event.currentTarget.checked)} />}
      navigator={projectPanel}
      inspector={browser}
      status={<EditorPanel title="Status" variant="status">
        <Text>Project and Asset operations report their own results. Browsing does not verify source files or displayed pixels.</Text>
      </EditorPanel>}>
      <AssetViewport context={context} grant={grant} showGuidance={showGuidance} />
    </EditorShell>}
  </AssetBrowserWorkspace>;
}
