import { Badge, Button, Fieldset, Group, Stack, Switch, Text, TextInput, Title } from '@mantine/core';
import { useState } from 'react';
import { ComponentCatalog } from '../components/ComponentCatalog.js';
import { EditorPanel, type EditorPanelState } from '../components/panel/EditorPanel.js';
import { EditorShell } from '../layout/EditorShell.js';
import { editorTokens } from '../theme/index.js';
import { Viewport } from '../viewport/Viewport.js';
import { ProjectManagerPanel } from '../features/project-manager/ProjectManagerPanel.js';

/** UI presentation samples; these are never authored Scene or project records. */
const panelExamples: readonly EditorPanelState[] = [
  { kind: 'empty', message: 'No sample selected. Next example cycles through local presentation states.' },
  { kind: 'loading', message: 'Illustrative pending state. Use Next example to finish; no background operation is running.' },
  { kind: 'error', message: 'Illustrative error only. Use Next example to inspect the read-only sample.' },
  { kind: 'ready' },
];

export function App() {
  const [showGuidance, setShowGuidance] = useState(true);
  const [inspectorExample, setInspectorExample] = useState(0);
  const [inspectorTab, setInspectorTab] = useState<'controls' | 'panel'>('controls');
  const [statusError, setStatusError] = useState(true);

  return (
    <EditorShell
      header={(
        <Group gap={editorTokens.spacing.standard}>
          <Title order={1} size="md">RPG Editor</Title>
          <Badge color={editorTokens.colors.neutral}>Project Manager MVP</Badge>
        </Group>
      )}
      toolbar={(
        <Switch label="Show guidance" checked={showGuidance}
          onChange={(event) => setShowGuidance(event.currentTarget.checked)} />
      )}
      navigator={<ProjectManagerPanel />}
      inspector={(
        <EditorPanel title="Inspector" subtitle="Temporary controls and panel states; no authored data."
          actions={(
            <Stack gap={editorTokens.spacing.compact}>
              <Group role="group" aria-label="Inspector examples" gap={editorTokens.spacing.compact}>
                <Button variant={inspectorTab === 'controls' ? 'filled' : 'default'}
                  aria-pressed={inspectorTab === 'controls'} onClick={() => setInspectorTab('controls')}>Controls</Button>
                <Button variant={inspectorTab === 'panel' ? 'filled' : 'default'}
                  aria-pressed={inspectorTab === 'panel'} onClick={() => setInspectorTab('panel')}>Panel states</Button>
              </Group>
              {inspectorTab === 'panel' && (
                <Button variant="default" onClick={() => setInspectorExample((value) => (value + 1) % panelExamples.length)}>
                  Next example
                </Button>
              )}
            </Stack>
          )}
          state={inspectorTab === 'panel' ? panelExamples[inspectorExample] : { kind: 'ready' }}
          readOnlyReason={inspectorTab === 'panel' && inspectorExample === 3 ? 'This illustrative property can be read and copied; editing is unavailable.' : undefined}
          footer={<Text>Inspector footer · sample only</Text>}>
          {inspectorTab === 'controls' ? <ComponentCatalog /> : (
            <Fieldset legend="Properties">
              <TextInput label="Sample property" value="Illustrative value" readOnly />
            </Fieldset>
          )}
        </EditorPanel>
      )}
      status={(
        <EditorPanel title="Status" variant="status"
          actions={<Button variant="default" onClick={() => setStatusError((value) => !value)}>
            {statusError ? 'Clear sample error' : 'Show sample error'}
          </Button>}
          state={statusError ? { kind: 'error', message: 'Illustrative error only; Clear sample error restores the local status.' } : { kind: 'ready' }}>
          <Text>Project status appears in Project Manager · Guidance {showGuidance ? 'shown' : 'hidden'}</Text>
        </EditorPanel>
      )}
    >
      <Viewport showGuidance={showGuidance} />
    </EditorShell>
  );
}
