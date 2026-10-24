import '@mantine/core/styles.css';
import { MantineProvider, type MantineColorSchemeManager } from '@mantine/core';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App.js';
import { editorTheme, editorCssVariablesResolver } from './theme/index.js';

// Fixed bootstrap scheme: avoid the provider's default storage manager entirely.
const colorSchemeManager: MantineColorSchemeManager = {
  get: () => 'dark',
  set: () => {},
  clear: () => {},
  subscribe: () => {},
  unsubscribe: () => {},
};

const target = document.getElementById('editor-ui-root');
if (!target) {
  throw new Error('Editor UI mount target is missing.');
}

createRoot(target).render(
  <StrictMode>
    <MantineProvider
      theme={editorTheme}
      cssVariablesResolver={editorCssVariablesResolver}
      forceColorScheme="dark"
      colorSchemeManager={colorSchemeManager}
    >
      <App />
    </MantineProvider>
  </StrictMode>,
);
