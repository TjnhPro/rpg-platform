import {
  ActionIcon,
  Alert,
  Button,
  Checkbox,
  createTheme,
  DEFAULT_THEME,
  Input,
  Menu,
  Modal,
  Notification,
  NumberInput,
  Select,
  Switch,
  Tabs,
  Text,
  Textarea,
  TextInput,
  type CSSVariablesResolver,
} from '@mantine/core';

/** Semantic aliases to Mantine tokens, not a second CSS variable system. */
export const editorTokens = {
  colors: {
    primary: 'primary',
    neutral: 'neutral',
    success: 'success',
    warning: 'warning',
    error: 'error',
    accent: 'var(--mantine-primary-color-filled)',
    foreground: 'var(--mantine-color-text)',
    background: 'var(--mantine-color-body)',
    surface: 'var(--mantine-color-default)',
    border: 'var(--mantine-color-default-border)',
    mutedText: 'var(--mantine-color-dimmed)',
    danger: 'var(--mantine-color-error)',
    viewportBackground: 'var(--mantine-color-dark-8)',
  },
  controlSize: 'sm',
  textSize: 'sm',
  radius: 'sm',
  spacing: { compact: 'xs', standard: 'sm', section: 'md' },
} as const;

export const editorTheme = createTheme({
  fontFamily: 'system-ui, sans-serif',
  headings: { fontFamily: 'system-ui, sans-serif' },
  fontFamilyMonospace: DEFAULT_THEME.fontFamilyMonospace,
  primaryColor: editorTokens.colors.primary,
  primaryShade: 6,
  colors: {
    primary: DEFAULT_THEME.colors.blue,
    neutral: DEFAULT_THEME.colors.gray,
    success: DEFAULT_THEME.colors.teal,
    warning: DEFAULT_THEME.colors.yellow,
    error: DEFAULT_THEME.colors.red,
  },
  defaultRadius: editorTokens.radius,
  respectReducedMotion: true,
  other: { editor: editorTokens },
  components: {
    Button: Button.extend({ defaultProps: { size: editorTokens.controlSize, variant: 'filled' } }),
    ActionIcon: ActionIcon.extend({ defaultProps: { size: editorTokens.controlSize, variant: 'default' } }),
    Input: Input.extend({ defaultProps: { size: editorTokens.controlSize } }),
    TextInput: TextInput.extend({ defaultProps: { size: editorTokens.controlSize } }),
    Textarea: Textarea.extend({ defaultProps: { size: editorTokens.controlSize } }),
    NumberInput: NumberInput.extend({ defaultProps: { size: editorTokens.controlSize } }),
    Select: Select.extend({ defaultProps: { size: editorTokens.controlSize } }),
    Checkbox: Checkbox.extend({ defaultProps: { size: editorTokens.controlSize } }),
    Switch: Switch.extend({ defaultProps: { size: editorTokens.controlSize } }),
    // These composite APIs have no control-size prop; Modal.size is dialog width.
    Tabs: Tabs.extend({ defaultProps: { variant: 'default', activateTabWithKeyboard: true } }),
    Menu: Menu.extend({ defaultProps: { trigger: 'click', returnFocus: true, closeOnEscape: true } }),
    MenuItem: Menu.Item.extend({ defaultProps: { fz: editorTokens.textSize } }),
    Modal: Modal.extend({ defaultProps: { centered: true, trapFocus: true, returnFocus: true, closeOnEscape: true } }),
    Notification: Notification.extend({ defaultProps: { withBorder: true, withCloseButton: false } }),
    Alert: Alert.extend({ defaultProps: { variant: 'light' } }),
    Text: Text.extend({ defaultProps: { size: editorTokens.textSize } }),
  },
});

// Bind Mantine's existing feedback variables to the semantic palettes above.
export const editorCssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {},
  dark: {
    '--mantine-color-error': 'var(--mantine-color-error-6)',
    '--mantine-color-success': 'var(--mantine-color-success-6)',
  },
});
