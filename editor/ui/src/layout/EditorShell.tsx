import {
  AppShell,
  Box,
  Button,
  Group,
  Modal,
  ScrollArea,
  Stack,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { editorTokens } from '../theme/index.js';
import classes from '../styles/layout/shell.module.css';

/** Internal UI slots only; this is not part of the portable Editor package API. */
export interface EditorShellProps {
  readonly header: ReactNode;
  readonly toolbar: ReactNode;
  readonly navigator: ReactNode;
  readonly inspector: ReactNode;
  readonly status: ReactNode;
  readonly children: ReactNode;
}

/** One canonical shell. Panel contents are mounted in exactly one location. */
export function EditorShell({ header, toolbar, navigator, inspector, status, children }: EditorShellProps) {
  const id = useId();
  const theme = useMantineTheme();
  const navigatorDocked = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);
  const inspectorDocked = useMediaQuery(`(min-width: ${theme.breakpoints.lg})`);
  const [activePanel, setActivePanel] = useState<'navigator' | 'inspector'>('navigator');
  const [panelOpened, setPanelOpened] = useState(false);
  const workspace = useRef<HTMLElement>(null);

  // A panel returning to its dock also closes its temporary dialog.
  useEffect(() => {
    if ((activePanel === 'navigator' && navigatorDocked) || (activePanel === 'inspector' && inspectorDocked)) {
      setPanelOpened(false);
    }
  }, [activePanel, navigatorDocked, inspectorDocked]);

  const dialogOpened = panelOpened && (activePanel === 'navigator' ? !navigatorDocked : !inspectorDocked);

  function openPanel(panel: 'navigator' | 'inspector') {
    setActivePanel(panel);
    setPanelOpened(true);
  }

  return (
    // Coordinate panel dialogs and consumer confirmations with Mantine, not DOM listeners.
    <Modal.Stack>
      <Box className={classes.shell}>
        <AppShell
          mode="static"
          padding={editorTokens.spacing.standard}
          header={{ height: 'auto' }}
          footer={{ height: 'auto' }}
          navbar={{
            width: 'calc(var(--mantine-spacing-xl) * 8)',
            breakpoint: 'md',
            collapsed: { mobile: true },
          }}
          aside={{
            width: 'calc(var(--mantine-spacing-xl) * 8)',
            breakpoint: 'lg',
            collapsed: { mobile: true },
          }}
        >
          <AppShell.Header>
            <Stack px={editorTokens.spacing.section} py={editorTokens.spacing.compact} gap={editorTokens.spacing.compact}>
              {header}
              <Group component="section" aria-label="Editor toolbar" gap={editorTokens.spacing.standard}>
                <Button variant="default" hiddenFrom="md" aria-haspopup="dialog"
                  aria-expanded={dialogOpened && activePanel === 'navigator'}
                  onClick={() => openPanel('navigator')}>Open navigator</Button>
                <Button variant="default" hiddenFrom="lg" aria-haspopup="dialog"
                  aria-expanded={dialogOpened && activePanel === 'inspector'}
                  onClick={() => openPanel('inspector')}>Open inspector</Button>
                <Button variant="default" onClick={() => workspace.current?.focus()}>Focus workspace</Button>
                {toolbar}
              </Group>
            </Stack>
          </AppShell.Header>

          <AppShell.Navbar className={classes.region} aria-label="Navigator" inert={!navigatorDocked}
            display={{ base: 'none', md: 'flex' }}>
            {navigatorDocked && navigator}
          </AppShell.Navbar>

          <AppShell.Main className={classes.region} ref={workspace} tabIndex={-1} aria-label="Main workspace">
            <ScrollArea h="100%" type="auto" scrollbars="xy" classNames={{ content: classes.workspaceContent }}
              viewportProps={{ tabIndex: 0, 'aria-label': 'Workspace content' }}>
              {children}
            </ScrollArea>
          </AppShell.Main>

          <AppShell.Aside className={classes.region} aria-label="Inspector" inert={!inspectorDocked}
            display={{ base: 'none', lg: 'flex' }}>
            {inspectorDocked && inspector}
          </AppShell.Aside>

          <AppShell.Footer>
            <Group px={editorTokens.spacing.section} py={editorTokens.spacing.compact} role="status" aria-live="polite">
              {status}
            </Group>
          </AppShell.Footer>

          <Modal stackId={`${id}-panel`} opened={dialogOpened} onClose={() => setPanelOpened(false)}
            title={activePanel === 'navigator' ? 'Navigator' : 'Inspector'} fullScreen
            classNames={{ content: classes.panelDialog, body: classes.panelDialogBody }}
            trapFocus returnFocus closeOnEscape closeButtonProps={{ 'aria-label': 'Close panel' }}>
            {activePanel === 'navigator' ? !navigatorDocked && navigator : !inspectorDocked && inspector}
          </Modal>
        </AppShell>
      </Box>
    </Modal.Stack>
  );
}
