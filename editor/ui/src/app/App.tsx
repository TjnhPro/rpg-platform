import { Badge, Group, Select, Switch, Text, Title } from '@mantine/core';
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
import { MapWorkspace } from '../features/map/MapWorkspace.js';
import { VisualInspectorWorkspace } from '../features/visual-inspector/VisualInspectorWorkspace.js';

export function App() {
  const [showGuidance, setShowGuidance] = useState(true);
  return <ProjectManagerWorkspace>{(active, projectPanel) => <AssetWorkspace active={active} projectPanel={projectPanel} showGuidance={showGuidance} setShowGuidance={setShowGuidance} />}</ProjectManagerWorkspace>;
}
function AssetWorkspace({ active, projectPanel, showGuidance, setShowGuidance }: {
  readonly active: ActiveEditorProject | null; readonly projectPanel: ReactNode;
  readonly showGuidance: boolean; readonly setShowGuidance: (value: boolean) => void;
}) {
  const grant = useAssetResourceGrant(active);
  const [tool, setTool] = useState<string | null>('map');
  return <AssetBrowserWorkspace active={active} resourcePort={grant?.existing}>
    {(context, browser) => <VisualInspectorWorkspace active={active} context={context} grant={grant} showGuidance={showGuidance}>
      {(visualPanel, visualViewport) => <MapWorkspace active={active} context={context} grant={grant} showGuidance={showGuidance}>
      {(mapPanel, mapViewport) => <EditorShell
      header={<Group gap={editorTokens.spacing.standard}>
        <Title order={1} size="md">RPG Editor</Title>
        <Badge color={editorTokens.colors.neutral}>Scene Editor</Badge>
      </Group>}
      toolbar={<Group gap={editorTokens.spacing.standard}>
        <Select label="Workspace" data={[{ value: 'map', label: 'Map Editor' }, { value: 'assets', label: 'Asset Browser' }, { value: 'visual', label: 'Visual Inspector' }]}
          value={tool} allowDeselect={false} onChange={setTool} />
        <Switch label="Show guidance" checked={showGuidance}
          onChange={event => setShowGuidance(event.currentTarget.checked)} />
      </Group>}
      navigator={projectPanel}
      inspector={tool === 'map' ? mapPanel : tool === 'visual' ? visualPanel : browser}
      status={<EditorPanel title="Status" variant="status">
        <Text>Map, Project and Asset saves report separately. Preview outcomes do not verify displayed pixels.</Text>
      </EditorPanel>}>
      {tool === 'map' ? mapViewport : tool === 'visual' ? visualViewport : <AssetViewport context={context} grant={grant} showGuidance={showGuidance} />}
    </EditorShell>}
    </MapWorkspace>}
    </VisualInspectorWorkspace>}
  </AssetBrowserWorkspace>;
}
