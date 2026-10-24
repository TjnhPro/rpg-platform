import { Badge, Group, Stack, Switch, Text, Title } from '@mantine/core';
import { useState } from 'react';
import { EditorShell } from '../layout/EditorShell.js';
import { editorTokens } from '../theme/index.js';

export function App() {
  const [showGuidance, setShowGuidance] = useState(true);

  return (
    <EditorShell
      header={(
        <Group gap={editorTokens.spacing.standard}>
          <Title order={1} size="md">RPG Editor</Title>
          <Badge color={editorTokens.colors.neutral}>Shell demonstration</Badge>
        </Group>
      )}
      toolbar={(
        <Switch label="Show guidance" checked={showGuidance}
          onChange={(event) => setShowGuidance(event.currentTarget.checked)} />
      )}
      navigator={(
        <Stack p={editorTokens.spacing.section} gap={editorTokens.spacing.standard}>
          <Title order={2} size="md">Navigator</Title>
          <Text>No project is open.</Text>
          <Text c={editorTokens.colors.mutedText}>This slot is reserved for future navigation content.</Text>
        </Stack>
      )}
      inspector={(
        <Stack p={editorTokens.spacing.section} gap={editorTokens.spacing.standard}>
          <Title order={2} size="md">Inspector</Title>
          <Text>Nothing selected.</Text>
          <Text c={editorTokens.colors.mutedText}>This slot is reserved for future inspection content.</Text>
        </Stack>
      )}
      status={<Text>Shell demo · No project connected · Guidance {showGuidance ? 'shown' : 'hidden'}</Text>}
    >
      <Stack component="section" aria-label="Viewport placeholder" flex={1}
        p={editorTokens.spacing.section} gap={editorTokens.spacing.standard}
        justify="center" align="center" bg={editorTokens.colors.viewportBackground}>
        <Title order={2} size="lg">Viewport placeholder</Title>
        <Text ta="center">No renderer is connected.</Text>
        {showGuidance && (
          <Text ta="center" c={editorTokens.colors.mutedText}>
            Resize the window to explore the shell. On smaller screens, open Navigator or Inspector
            from the toolbar. Use Tab and Enter or Space; Escape closes a panel and returns focus.
          </Text>
        )}
      </Stack>
    </EditorShell>
  );
}
