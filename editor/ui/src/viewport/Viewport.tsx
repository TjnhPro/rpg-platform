import { Alert, Box, Button, Group, Stack, Text, Title } from '@mantine/core';
import { useEffect, useRef, useState } from 'react';
import { mountEditorViewport, type EditorViewportContent } from '../../../src/viewport-host.js';
import { editorTokens } from '../theme/index.js';
import classes from '../styles/viewport/viewport.module.css';

type ViewportHost = ReturnType<typeof mountEditorViewport>;
type ViewportSnapshot = ReturnType<ViewportHost['getSnapshot']>;
interface Observation {
  readonly event: string;
  readonly snapshot: ViewportSnapshot;
}

// The host already classifies failures; never expose a raw exception/message.
function failureCode(failure: unknown): string | undefined {
  if (failure === 'UNRECOGNIZED') return failure;
  if (typeof failure === 'object' && failure !== null && 'code' in failure
      && typeof failure.code === 'string') return failure.code;
  return undefined;
}

/** React owns the target lifetime; the existing Editor host owns everything else. */
export function Viewport({ showGuidance, contentFactory }: { readonly showGuidance: boolean;
  readonly contentFactory?: (requestFrame: () => void) => EditorViewportContent }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const host = useRef<ViewportHost | undefined>(undefined);
  const [mounted, setMounted] = useState(true);
  const [observation, setObservation] = useState<Observation>();
  const [mountFailed, setMountFailed] = useState(false);

  useEffect(() => {
    if (!mounted || !canvas.current) return;
    let listening = true;
    let instance: ViewportHost | undefined;
    let lossObservation: ReturnType<typeof setTimeout> | undefined;
    const observe = (event: string) => {
      if (listening && instance) setObservation({ event, snapshot: instance.getSnapshot() });
    };
    setObservation(undefined);
    setMountFailed(false);
    try {
      instance = mountEditorViewport(canvas.current, (event) => {
        // Native event listeners can have microtask checkpoints between them.
        // One deferred UI read observes Render after dispatch; no polling/frame loop.
        if (event === 'native-loss-event-observe-after-dispatch') {
          clearTimeout(lossObservation);
          lossObservation = setTimeout(() => observe(event), 0);
        } else observe(event);
      }, undefined, contentFactory?.(() => instance?.requestFrame()));
      host.current = instance;
      observe('mounted-not-acquired');
    } catch {
      setMountFailed(true);
    }
    return () => {
      listening = false;
      clearTimeout(lossObservation);
      if (host.current === instance) host.current = undefined;
      // Explicit Unmount may already have closed it. Late acquisitions are
      // drained by the host; retired effects cannot publish into a fresh mount.
      if (instance?.getSnapshot().host !== 'unmounted') instance?.unmount();
    };
  }, [mounted, contentFactory]);

  const snapshot = observation?.snapshot;
  const graphics = snapshot?.viewport?.graphics;
  const failure = failureCode(snapshot?.lastFailure ?? graphics?.failure);
  const available = mounted && !mountFailed && snapshot?.host === 'mounted';
  const ready = available && graphics?.state === 'ready';
  const paused = snapshot?.paused === true;
  const metrics = snapshot?.metrics;
  const configuration = snapshot?.lastConfiguration;

  function unmount() {
    host.current?.unmount();
    setMounted(false);
  }

  return (
    <Stack component="section" aria-label="Render viewport" className={classes.viewport}
      gap={editorTokens.spacing.standard}>
      <Group justify="space-between" flex="0 0 auto">
        <Title order={2} size="sm">Render viewport</Title>
        <Group gap={editorTokens.spacing.compact}>
          <Button variant="default" disabled={!available || snapshot?.pending || !!snapshot?.viewport}
            onClick={() => host.current?.start()}>Acquire</Button>
          <Button variant="default" disabled={!ready || paused}
            onClick={() => host.current?.requestFrame()}>Frame</Button>
          <Button variant="default" disabled={!available || paused || (!ready && !snapshot?.pending)}
            onClick={() => host.current?.suspend()}>Suspend</Button>
          <Button variant="default" disabled={!ready || !paused}
            onClick={() => host.current?.resume()}>Resume</Button>
          {mounted
            ? <Button variant="default" onClick={unmount}>Unmount viewport</Button>
            : <Button variant="default" onClick={() => setMounted(true)}>Mount viewport</Button>}
        </Group>
      </Group>
      <Text role="status" flex="0 0 auto">
        Last observation · Host: {snapshot?.host ?? 'not observed'} · Acquisition: {snapshot ? (snapshot.pending ? 'pending' : 'idle') : 'not observed'}
        {' · '}Graphics: {graphics?.state ?? 'not acquired'} · Viewport: {snapshot?.viewport?.state ?? 'not configured'}
        {' · '}Paused: {snapshot ? (paused ? 'yes' : 'no') : 'not observed'} · Event: {observation?.event ?? 'none'}
      </Text>
      {(mountFailed || failure) && (
        <Alert title="Viewport unavailable" color={editorTokens.colors.error} role="alert" flex="0 0 auto">
          {mountFailed ? 'The viewport host could not be mounted.' : `Host/Render diagnostic: ${failure}.`}
          {' '}Graphics may be unavailable in this browser. No automatic retry or fallback is running.
          Unmount and mount a fresh target for an explicit new attempt.
        </Alert>
      )}
      {graphics && 'cleanupFailed' in graphics && graphics.cleanupFailed && (
        <Alert title="Cleanup not confirmed" color={editorTokens.colors.error} role="alert" flex="0 0 auto">
          Render reported cleanup failure. This target cannot be acquired again.
        </Alert>
      )}
      {showGuidance && (
        <Text c={editorTokens.colors.mutedText} flex="0 0 auto">
          Mounting does not acquire graphics. Acquire once per mount; Frame requests redraw.
          The host also submits on acquisition/resize demand.
          After hidden/zero-size suspension, use Resume when available; otherwise unmount/mount to acquire again.
          Optional feature content uses this same session. Submitted frames do not prove display.
        </Text>
      )}
      <Box className={classes.surface} bg={editorTokens.colors.viewportBackground}>
        {mounted
          ? <canvas ref={canvas} className={classes.canvas} aria-label="Render canvas">
            This browser needs canvas support for the Render viewport.
          </canvas>
          : <Text p={editorTokens.spacing.standard}>Viewport target removed. Mount to create a fresh target.</Text>}
      </Box>
      <Text c={editorTokens.colors.mutedText} flex="0 0 auto">
        {metrics ? `CSS ${metrics.logicalWidthCssPx.toFixed(2)} × ${metrics.logicalHeightCssPx.toFixed(2)}; requested DPR ${metrics.requestedPixelRatio}. ` : 'No accepted size. '}
        {configuration ? `Buffer ${configuration.size.width} × ${configuration.size.height}. ` : ''}
        Requests {snapshot?.requests ?? 0} · Submissions {snapshot?.submissions ?? 0}
        {' · '}Display: {snapshot?.display ?? 'NOT_VERIFIED'}
      </Text>
    </Stack>
  );
}
