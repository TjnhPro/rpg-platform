import { Alert, Box, Divider, Group, Loader, Paper, ScrollArea, Stack, Text, Title } from '@mantine/core';
import { useId, type ReactNode } from 'react';
import { editorTokens } from '../../theme/index.js';
import classes from '../../styles/panel/panel.module.css';

export type EditorPanelState =
  | { readonly kind: 'ready' }
  | { readonly kind: 'empty' | 'loading' | 'error'; readonly message: string };

/** Internal presentation contract; callers retain all command and data ownership. */
export interface EditorPanelProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly actions?: ReactNode;
  readonly footer?: ReactNode;
  readonly children?: ReactNode;
  readonly state?: EditorPanelState;
  readonly readOnlyReason?: string;
  /** Status is an intrinsic-height shell footer; standard fills a constrained slot. */
  readonly variant?: 'standard' | 'status';
}

/** The sole Panel primitive: Mantine owns controls, decoration and scrolling. */
export function EditorPanel({
  title, subtitle, actions, footer, children, state = { kind: 'ready' }, readOnlyReason,
  variant = 'standard',
}: EditorPanelProps) {
  const id = useId();

  return (
    <Paper component="section" withBorder w="100%" bg={editorTokens.colors.surface}
      className={variant === 'status' ? classes.status : classes.panel}
      aria-labelledby={`${id}-title`} aria-describedby={subtitle ? `${id}-subtitle` : undefined}>
      <Stack component="header" p={editorTokens.spacing.standard} gap={editorTokens.spacing.compact} flex="0 0 auto">
        <Group justify="space-between" align="flex-start" gap={editorTokens.spacing.standard}>
          <Box miw={0} w={variant === 'standard' ? '100%' : 'auto'} flex={variant === 'status' ? 1 : undefined}>
            <Title id={`${id}-title`} order={2} size="sm" lineClamp={2}>{title}</Title>
            {subtitle && <Text id={`${id}-subtitle`} c={editorTokens.colors.mutedText}>{subtitle}</Text>}
          </Box>
          {actions && <Group gap={editorTokens.spacing.compact} aria-label={`${title} actions`}>{actions}</Group>}
        </Group>
      </Stack>
      <Divider />
      <ScrollArea className={variant === 'status' ? classes.statusBody : classes.body}
        type="auto" scrollbars="xy" overscrollBehavior="contain"
        viewportProps={{ tabIndex: 0, 'aria-label': `${title} body` }}>
        <Stack p={editorTokens.spacing.standard} gap={editorTokens.spacing.standard}>
          {readOnlyReason && (
            <Alert title="Read-only" color={editorTokens.colors.neutral}>{readOnlyReason}</Alert>
          )}
          {state.kind !== 'ready' && variant === 'status' && (
            <Text role={state.kind === 'error' ? 'alert' : 'status'}
              c={state.kind === 'error' ? editorTokens.colors.danger : editorTokens.colors.mutedText}>
              {state.kind === 'empty' ? 'Empty' : state.kind === 'loading' ? 'Loading' : 'Error'}: {state.message}
            </Text>
          )}
          {state.kind !== 'ready' && variant === 'standard' && (
            <Alert title={state.kind === 'empty' ? 'Empty' : state.kind === 'loading' ? 'Loading' : 'Error'}
              color={state.kind === 'error' ? editorTokens.colors.error : editorTokens.colors.neutral}
              role={state.kind === 'error' ? 'alert' : 'status'}>
              <Group gap={editorTokens.spacing.standard} wrap="nowrap">
                {state.kind === 'loading' && <Loader size="sm" aria-hidden="true" />}
                <Text>{state.message}</Text>
              </Group>
            </Alert>
          )}
          <Box hidden={state.kind !== 'ready'}>{children}</Box>
        </Stack>
      </ScrollArea>
      {footer && (
        <>
          <Divider />
          <Box component="footer" p={editorTokens.spacing.standard} flex="0 0 auto">{footer}</Box>
        </>
      )}
    </Paper>
  );
}
