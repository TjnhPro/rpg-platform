import { Badge, Button, Fieldset, Group, Stack, Switch, Text, TextInput, Title } from '@mantine/core';
import { useState } from 'react';
import { EditorPanel, type EditorPanelState } from '../components/panel/EditorPanel.js';
import { EditorShell } from '../layout/EditorShell.js';
import { editorTokens } from '../theme/index.js';
import { Viewport } from '../viewport/Viewport.js';

export function App() {
  const [showGuidance, setShowGuidance] = useState(true);
  const [longSample, setLongSample] = useState(false);
  const [inspectorExample, setInspectorExample] = useState(0);
  const [statusError, setStatusError] = useState(true);
  const inspectorStates: readonly EditorPanelState[] = [
    { kind: 'empty', message: 'No sample selected. Next example cycles through local presentation states.' },
    { kind: 'loading', message: 'Illustrative pending state. Use Next example to finish; no background operation is running.' },
    { kind: 'error', message: 'Illustrative error only. Use Next example to inspect the read-only sample.' },
    { kind: 'ready' },
  ];

  return (
    <EditorShell
      header={(
        <Group gap={editorTokens.spacing.standard}>
          <Title order={1} size="md">RPG Editor</Title>
          <Badge color={editorTokens.colors.neutral}>Viewport integration</Badge>
        </Group>
      )}
      toolbar={(
        <Switch label="Show guidance" checked={showGuidance}
          onChange={(event) => setShowGuidance(event.currentTarget.checked)} />
      )}
      navigator={(
        <EditorPanel title="Navigator" subtitle="Static UI examples, not project entries."
          actions={<Button variant="default" onClick={() => setLongSample((value) => !value)}>
            {longSample ? 'Show short sample' : 'Show long sample'}
          </Button>}
          footer={<Text>Navigator footer · sample only</Text>}>
          <Stack gap={editorTokens.spacing.standard}>
            <Text>No project is open.</Text>
            {longSample && Array.from({ length: 30 }, (_, index) => (
              <Text key={index}>Layout example {index + 1}. This paragraph demonstrates scrolling without any authored data.</Text>
            ))}
          </Stack>
        </EditorPanel>
      )}
      inspector={(
        <EditorPanel title="Inspector" subtitle="Empty → loading → error → read-only."
          actions={<Button variant="default" onClick={() => setInspectorExample((value) => (value + 1) % inspectorStates.length)}>
            Next example
          </Button>}
          state={inspectorStates[inspectorExample]}
          readOnlyReason={inspectorExample === 3 ? 'This illustrative property can be read and copied; editing is unavailable.' : undefined}
          footer={<Text>Inspector footer · sample only</Text>}>
          <Fieldset legend="Properties">
            <TextInput label="Sample property" value="Illustrative value" readOnly />
          </Fieldset>
        </EditorPanel>
      )}
      status={(
        <EditorPanel title="Status" variant="status"
          actions={<Button variant="default" onClick={() => setStatusError((value) => !value)}>
            {statusError ? 'Clear sample error' : 'Show sample error'}
          </Button>}
          state={statusError ? { kind: 'error', message: 'Illustrative error only; Clear sample error restores the local status.' } : { kind: 'ready' }}>
          <Text>No project connected · Guidance {showGuidance ? 'shown' : 'hidden'}</Text>
        </EditorPanel>
      )}
    >
      <Viewport showGuidance={showGuidance} />
    </EditorShell>
  );
}
