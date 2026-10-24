import { Button, Stack, Text, TextInput } from '@mantine/core';
import { editorTokens } from './index.js';

/** Presentation sample only; no document, runtime state or feature commands. */
export function ThemeSample() {
  return (
    <Stack
      component="section"
      aria-label="Theme sample"
      p={editorTokens.spacing.section}
      gap={editorTokens.spacing.standard}
      bg={editorTokens.colors.surface}
      c={editorTokens.colors.foreground}
    >
      <Text>Theme sample — presentation only</Text>
      <Button type="button">Sample button</Button>
      <TextInput label="Sample input" description="Not saved to authored content" />
    </Stack>
  );
}
