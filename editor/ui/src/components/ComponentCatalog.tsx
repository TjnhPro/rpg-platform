import {
  Alert,
  Box,
  Button,
  Checkbox,
  Fieldset,
  Group,
  Menu,
  Modal,
  Notification,
  NumberInput,
  Select,
  Stack,
  Switch,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useId, useState, type FormEvent } from 'react';
import { editorTokens } from '../theme/index.js';

/** Static UI examples only. Nothing here reads or writes authored/game data. */
export function ComponentCatalog() {
  const id = useId();
  const [tab, setTab] = useState<string | null>('controls');
  const [text, setText] = useState('Sample text');
  const [number, setNumber] = useState<string | number>(3);
  const [option, setOption] = useState<string | null>('first');
  const [checked, setChecked] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [menuOpened, setMenuOpened] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [samplePresent, setSamplePresent] = useState(true);
  const [notice, setNotice] = useState<'success' | 'error' | null>(null);
  const [status, setStatus] = useState('Ready. All values are temporary catalog examples.');

  // Local demonstration constraints, not Asset/Scene/Runtime validation.
  const textError = text.trim() ? undefined : 'Enter sample text.';
  const numberError = typeof number === 'number' && Number.isInteger(number) && number >= 1 && number <= 10
    ? undefined : 'Enter a whole number from 1 to 10.';
  const optionError = option ? undefined : 'Choose a sample option.';

  function startSample(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setSubmitted(true);
    setNotice(null);
    if (textError || numberError || optionError) {
      setStatus('Sample operation not started. Correct the labeled fields.');
      return;
    }
    setPending(true);
    setStatus('Sample operation pending. Use Finish sample operation to complete this demonstration.');
  }

  return (
    <Stack component="section" aria-label="Component catalog" gap={editorTokens.spacing.section}>
      <Title order={3} size="sm">Component catalog</Title>
      <Text c={editorTokens.colors.mutedText}>
        Static demonstration data. No project, document, asset, runtime or persistence is connected.
      </Text>
      <Tabs value={tab} onChange={setTab}>
        <Tabs.List aria-label="Component catalog sections">
          <Tabs.Tab value="controls">Controls and actions</Tabs.Tab>
          <Tabs.Tab value="feedback">Feedback patterns</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="controls" pt={editorTokens.spacing.section}>
          <Stack gap={editorTokens.spacing.section}>
            <Title order={4} size="sm">Controlled inputs</Title>
            <Box component="form" aria-label="Sample controls" noValidate onSubmit={startSample}>
              <Stack gap={editorTokens.spacing.standard}>
                <Fieldset legend="Temporary sample values" disabled={pending}>
                  <Stack gap={editorTokens.spacing.standard}>
                    <TextInput
                      label="Sample text"
                      description="Required for this demonstration only. Clearing it shows validation on submit."
                      placeholder="Enter sample text"
                      required
                      value={text}
                      onChange={(event) => setText(event.currentTarget.value)}
                      error={submitted ? textError : undefined}
                    />
                    <NumberInput
                      label="Sample number"
                      description="A whole number from 1 to 10; empty values remain empty."
                      placeholder="Enter a number"
                      required
                      min={1}
                      max={10}
                      allowDecimal={false}
                      value={number}
                      onChange={setNumber}
                      error={submitted ? numberError : undefined}
                    />
                    <Select
                      label="Sample option"
                      description="Choose an option; the unavailable option cannot be selected."
                      placeholder="Choose a sample option"
                      required
                      clearable
                      clearButtonProps={{ 'aria-label': 'Clear sample option' }}
                      data={[
                        { value: 'first', label: 'First example' },
                        { value: 'second', label: 'Second example' },
                        { value: 'unavailable', label: 'Unavailable example', disabled: true },
                      ]}
                      value={option}
                      onChange={setOption}
                      error={submitted ? optionError : undefined}
                    />
                    <Checkbox
                      label="Include the optional sample choice"
                      description="Checkbox expresses membership in the sample selection."
                      checked={checked}
                      onChange={(event) => setChecked(event.currentTarget.checked)}
                    />
                    <Switch
                      label="Enable the sample setting"
                      description="Switch changes a temporary on/off setting immediately."
                      checked={enabled}
                      onChange={(event) => setEnabled(event.currentTarget.checked)}
                    />
                    <Text>Selection: {checked ? 'included' : 'excluded'}. Setting: {enabled ? 'on' : 'off'}.</Text>
                  </Stack>
                </Fieldset>
                <Group gap={editorTokens.spacing.standard}>
                  <Button type="submit" loading={pending} aria-describedby={`${id}-status`}>
                    Start sample operation
                  </Button>
                </Group>
              </Stack>
            </Box>
            <Group gap={editorTokens.spacing.standard}>
              <Button
                variant="default"
                disabled={!pending}
                onClick={() => {
                  setPending(false);
                  setNotice('success');
                  setStatus('Sample operation completed locally. No data was saved.');
                }}
              >Finish sample operation</Button>
              <Button disabled aria-describedby={`${id}-unavailable`}>Unavailable action</Button>
            </Group>
            <Text id={`${id}-unavailable`} c={editorTokens.colors.mutedText}>
              Unavailable action is intentionally disabled to show its state. Finish is available only while pending.
            </Text>
            <Title order={4} size="sm">Menu and destructive confirmation</Title>
            <Text>Temporary sample entry: {samplePresent ? 'present' : 'removed'}.</Text>
            <Group gap={editorTokens.spacing.standard}>
              <Menu opened={menuOpened} onChange={setMenuOpened}>
                <Menu.Target><Button variant="default">Sample actions</Button></Menu.Target>
                <Menu.Dropdown aria-label="Sample actions">
                  <Menu.Label>Catalog only</Menu.Label>
                  <Menu.Item onClick={() => {
                    setTab('feedback');
                    setNotice('error');
                    setStatus('Showing an illustrative error. No real operation failed.');
                  }}>Show sample error</Menu.Item>
                  <Menu.Item disabled>Unavailable menu action</Menu.Item>
                  <Menu.Divider />
                  <Menu.Item color={editorTokens.colors.error} disabled={!samplePresent} onClick={() => setModalOpened(true)}>
                    Remove sample entry…
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
              <Button color={editorTokens.colors.error} disabled={!samplePresent} onClick={() => setModalOpened(true)}>
                Remove sample entry…
              </Button>
              <Button variant="default" disabled={samplePresent} onClick={() => {
                setSamplePresent(true);
                setStatus('Temporary sample entry restored.');
              }}>Restore sample entry</Button>
            </Group>
          </Stack>
        </Tabs.Panel>
        <Tabs.Panel value="feedback" pt={editorTokens.spacing.section}>
          <Stack gap={editorTokens.spacing.standard}>
            <Title order={4} size="sm">Feedback examples</Title>
            <Alert title="Empty example" color={editorTokens.colors.neutral}>
              No sample entries to display. Return to Controls and actions to explore the controls.
            </Alert>
            <Alert title="Unavailable example" color={editorTokens.colors.warning}>
              No project is connected to this catalog. Project actions are unavailable.
            </Alert>
            <TextInput label="Invalid text example" value="" readOnly error="Enter sample text before continuing." />
            <TextInput label="Disabled text example" value="Unavailable sample value" disabled />
            <Button variant="default" onClick={() => {
              setNotice('error');
              setStatus('Showing an illustrative error. No real operation failed.');
            }}>Show sample error</Button>
            <Text c={editorTokens.colors.mutedText}>
              Start the sample operation on the Controls tab to inspect loading; finish it for a success notification.
            </Text>
          </Stack>
        </Tabs.Panel>
      </Tabs>
      <Text id={`${id}-status`} role="status" aria-live="polite" aria-atomic="true">{status}</Text>
      {notice && (
        <Notification
          role={notice === 'error' ? 'alert' : 'status'}
          title={notice === 'error' ? 'Illustrative error' : 'Sample completed'}
          color={notice === 'error' ? editorTokens.colors.error : editorTokens.colors.success}
          withCloseButton
          closeButtonProps={{ 'aria-label': 'Dismiss sample notification' }}
          onClose={() => setNotice(null)}
        >
          {notice === 'error'
            ? 'This is sample feedback only. Dismiss it or edit the sample controls and start again.'
            : 'The temporary sample operation finished. Nothing was saved.'}
        </Notification>
      )}
      <Modal
        stackId={`${id}-confirmation`}
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Remove temporary sample entry?"
        aria-describedby={`${id}-confirmation`}
        closeButtonProps={{ 'aria-label': 'Cancel removal and close dialog' }}
      >
        <Stack gap={editorTokens.spacing.standard}>
          <Text id={`${id}-confirmation`}>Only the catalog entry will be removed from this temporary view. Restore sample entry makes it available again.</Text>
          <Group gap={editorTokens.spacing.standard}>
            <Button variant="default" data-autofocus onClick={() => setModalOpened(false)}>Cancel</Button>
            <Button color={editorTokens.colors.error} onClick={() => {
              setSamplePresent(false);
              setModalOpened(false);
              setStatus('Temporary sample entry removed after confirmation. Use Restore sample entry to restore it.');
            }}>Remove sample entry</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}
