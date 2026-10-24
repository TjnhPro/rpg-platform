import { Alert, Button, Group, NumberInput, Select, Stack, Switch, Text, Textarea } from '@mantine/core';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { getAssetManagerProjectSnapshot, getManagedAssetSelection,
  type AssetManagerProject, type DocumentSession } from '@rpg-platform/editor';
import type { SpriteDirectionIndex } from '@rpg-platform/runtime-render';
import { inspectAnimationPreviewBinding } from '../../../../dist/animation-vfx-preview-context.js';
import { EditorPanel } from '../../components/panel/EditorPanel.js';
import { Viewport } from '../../viewport/Viewport.js';
import { editorTokens } from '../../theme/index.js';
import type { ActiveEditorProject } from '../project-manager/ProjectManagerPanel.js';
import type { AssetResourceGrant } from '../asset-browser/AssetViewport.js';
import { createPreviewController, previewFailure, type PreviewController, type PreviewSettings, type PreviewDeclaration, type PreviewCommand } from './controller.js';
import { finiteSampleDeclaration } from './finite-sample.js';

type Numeric = number | string;
const number = (value: Numeric) => typeof value === 'number' ? value : NaN;
/** Stable feature state above Shell panels; all graphics stay in the active Viewport. */
export function AnimationVfxPreviewWorkspace({ active, context, grant, sceneDocument, showGuidance, children }: {
  readonly active: ActiveEditorProject | null; readonly context: AssetManagerProject | null; readonly grant: AssetResourceGrant | null;
  readonly sceneDocument: DocumentSession | null; readonly showGuidance: boolean;
  readonly children: (panel: ReactNode, viewport: ReactNode) => ReactNode;
}) {
  const runtime = useRef<PreviewController | null>(null), alive = useRef(false);
  const [declaration, setDeclaration] = useState(''), [mode, setMode] = useState<string | null>('sprite');
  const [clipId, setClipId] = useState<string | null>(null), [clips, setClips] = useState<string[]>([]);
  const [direction, setDirection] = useState<string | null>('0'), [declaredMode, setDeclaredMode] = useState<string | null>(null);
  const [repeat, setRepeat] = useState<string | null>('repeat'), [timingMode, setTimingMode] = useState<string | null>('interval');
  const [interval, setInterval] = useState<Numeric>(150), [fps, setFps] = useState<Numeric>(8), [speed, setSpeed] = useState<Numeric>(1);
  const [delta, setDelta] = useState<Numeric>(125), [inScene, setInScene] = useState(false);
  const [targetId, setTargetId] = useState<string | null>(null), [targets, setTargets] = useState<readonly string[]>([]);
  const [points, setPoints] = useState<Record<'anchorX'|'anchorY'|'pivotX'|'pivotY'|'offsetX'|'offsetY'|'worldX'|'worldY', Numeric>>({
    anchorX: 0, anchorY: 0, pivotX: 0, pivotY: 0, offsetX: 0, offsetY: 0, worldX: 0, worldY: 0 });
  const [message, setMessage] = useState('Select an image in Asset Browser, then Acquire and prepare an explicit preview declaration.');
  const [diagnostics, setDiagnostics] = useState('NOT_CHECKED'), [acquired, setAcquired] = useState(false), [prepared, setPrepared] = useState(false), [pending, setPending] = useState(false);
  const busy = useRef(false);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  let catalogGeneration = -1, selectionKey = 'none', selectedLabel = 'None';
  try { if (context) { catalogGeneration = getAssetManagerProjectSnapshot(context).generation;
    const selected = getManagedAssetSelection(context); selectionKey = JSON.stringify(selected.reference); selectedLabel = selected.reference?.assetId ?? selected.status; } } catch { /* Transition has no usable selection. */ }
  const binding = useMemo(() => active && context && grant ? { project: active.session, root: active.root.binding, assets: context, grant } : null,
    [active, context, grant, catalogGeneration, selectionKey]);
  let source: ReturnType<typeof inspectAnimationPreviewBinding> | null = null;
  try { if (binding) source = inspectAnimationPreviewBinding(binding); } catch { /* Retired owner is unavailable. */ }
  const sample = source?.status === 'ready-to-load' ? finiteSampleDeclaration(source.descriptor) : null;
  const supported = source?.status === 'ready-to-load' && source.descriptor.sources.some(item => item.role === 'atlas-metadata');
  const document = inScene ? sceneDocument : null;
  const sceneRevision = document?.getSnapshot().currentRevision;
  useEffect(() => { setPrepared(false); setClips([]); setClipId(null); setDeclaredMode(null); setTargets([]); setTargetId(null);
    setDeclaration(''); setDiagnostics('NOT_CHECKED'); setMessage('Selection/context changed. Acquire and prepare explicitly.'); }, [binding]);
  const contentFactory = useMemo(() => (requestFrame: () => void) => {
    let owned: PreviewController | null = null, live = true;
    return {
      acquired(session: Parameters<typeof createPreviewController>[0]['session']) {
        if (!binding || !grant) return;
        live = true; // Viewport start releases its empty slot before the first acquisition.
        owned = createPreviewController({ binding, grant, session, document, requestFrame,
          notify(value) { if (live && alive.current && runtime.current === owned) setDiagnostics(value); } });
        runtime.current = owned; if (live && alive.current) setAcquired(true);
      },
      configured(_session: Parameters<typeof createPreviewController>[0]['session'], ...args: Parameters<PreviewController['configure']>) { owned?.configure(...args); },
      availabilityChanged(value: boolean) { owned?.setAvailable(value); },
      release() {
        live = false;
        if (runtime.current === owned) runtime.current = null;
        if (alive.current) { setAcquired(false); setPrepared(false); setDiagnostics('PREVIEW_RELEASED; display NOT_VERIFIED'); }
        owned?.dispose(); owned = null;
      },
    };
  }, [binding, grant, document, sceneRevision]);
  function settings(selectedClip = clipId): PreviewSettings {
    if (!selectedClip) throw new TypeError('PREVIEW_CLIP_REQUIRED');
    return { mode: mode === 'vfx' ? 'vfx' : 'sprite', clipId: selectedClip, direction: Number(direction) as SpriteDirectionIndex,
      playback: { timing: timingMode === 'fps' ? { fps: number(fps) } : { frameIntervalMs: number(interval) },
        repeat: repeat === 'once' ? 'once' : 'repeat', speed: number(speed) },
      points: { groundAnchor: { x: number(points.anchorX), y: number(points.anchorY) }, pivot: { x: number(points.pivotX), y: number(points.pivotY) }, localOffset: { x: number(points.offsetX), y: number(points.offsetY) } },
      world: { x: number(points.worldX), y: number(points.worldY) }, targetId: inScene ? targetId : null };
  }
  async function operate(action: (controller: PreviewController) => Promise<void>) {
    const owned = runtime.current;
    if (!owned || busy.current) { if (alive.current) setMessage('Acquire the viewport first, or wait for the current operation.'); return; }
    busy.current = true; setPending(true);
    try { await action(owned); if (alive.current && runtime.current === owned) setMessage('Operation observed. Inspect canonical playback/binding diagnostics below.'); }
    catch (error) { if (alive.current && runtime.current === owned) setMessage(previewFailure(error)); }
    finally { busy.current = false; if (alive.current) setPending(false); }
  }
  async function load(owned: PreviewController) {
    const parsed = JSON.parse(declaration) as PreviewDeclaration;
    const first = parsed.declaration?.clips[0]; const id = first ? ('directions' in first ? first.clipId : first.clip.clipId) : null;
    if (!id) throw new TypeError('PREVIEW_CLIP_REQUIRED');
    setPrepared(false); const result = await owned.load(declaration, settings(id));
    if (alive.current && runtime.current === owned) { setClips(result.clips); setClipId(id); setDeclaredMode(result.mode); setTargets(result.targets); setPrepared(true); }
  }
  const controlsDisabled = !acquired || !prepared || pending;
  const panel = <EditorPanel title="Animation & VFX Preview" subtitle="Ephemeral preview · no authoring or save">
    <Stack gap={editorTokens.spacing.standard}>
      <Text>Project: {active?.root.projectId ?? 'None'} · Selected Asset: {selectedLabel}</Text>
      <Text>Choose an Asset in Asset Browser. Selection does not autoplay.</Text>
      {!supported && <Alert title="Animation unavailable" color={editorTokens.colors.neutral}>HOST_METADATA_UNAVAILABLE or unsupported selection. A current image, atlas-metadata and scoped resource host are required.</Alert>}
      <Textarea label="Preview declaration (JSON)" description="Explicit source bindings, sheets and ordered clips; no FPS/direction inference." autosize minRows={3} maxRows={10}
        value={declaration} maxLength={1_048_576} onChange={event => setDeclaration(event.currentTarget.value)} />
      <Button variant="default" disabled={!sample || pending} onClick={() => { setDeclaration(sample!); setMode('sprite'); }}>Use explicit ani063 sample declaration</Button>
      <Select label="Preview mode" data={[{ value: 'sprite', label: 'Sprite (declared directional / neutral)' }, { value: 'vfx', label: 'VFX · neutral sprite-sequence' }]}
        value={mode} allowDeselect={false} onChange={setMode} disabled={pending} />
      <Button disabled={!supported || !acquired || !declaration || pending} onClick={() => void operate(load)}>Prepare preview sources & clips</Button>
      <Select label="Declared clip" data={clips} value={clipId} onChange={setClipId} disabled={controlsDisabled} />
      <Select label="Direction slot (preview convention; compass unverified)" data={['0','1','2','3','4','5','6','7']} value={direction} allowDeselect={false}
        disabled={controlsDisabled || declaredMode !== 'eight-way' || mode === 'vfx'} onChange={value => { setDirection(value); if (value) void operate(owned => owned.direction(Number(value) as SpriteDirectionIndex)); }} />
      <Text>Direction: {declaredMode === 'eight-way' && mode !== 'vfx' ? direction : 'N/A'}</Text>
      <Select label="Repeat override" data={['once','repeat']} value={repeat} allowDeselect={false} onChange={setRepeat} disabled={pending} />
      <Select label="Timing override" data={[{ value: 'interval', label: 'Frame interval ms' }, { value: 'fps', label: 'FPS' }]} value={timingMode} allowDeselect={false} onChange={setTimingMode} disabled={pending} />
      {timingMode === 'fps' ? <NumberInput label="Preview FPS" value={fps} onChange={setFps} min={.1} max={120} disabled={pending} />
        : <NumberInput label="Preview frame interval ms" value={interval} onChange={setInterval} min={1000 / 120} max={10000} disabled={pending} />}
      <NumberInput label="Preview speed" value={speed} onChange={setSpeed} min={.125} max={4} step={.125} disabled={pending} />
      <Switch label="Preview in current Placement Scene" checked={inScene} disabled={!sceneDocument || pending} onChange={event => setInScene(event.currentTarget.checked)} />
      {!sceneDocument && <Text>Scene unavailable. Create/open a Scene in Visual Placement & Inspector first.</Text>}
      <Select label="Attach VFX to authored target" data={targets.map(value => ({ value, label: value }))} placeholder="World placement (no target)" clearable
        value={targetId} onChange={setTargetId} disabled={!inScene || mode !== 'vfx' || controlsDisabled} />
      <Text>Inspection override · image-pixel / frame-top-left · artist ground and original size NOT_VERIFIED. Scene world values use {inScene ? 'the current Scene plane' : 'preview-unit, right/down'}; one plane unit per pixel.</Text>
      {(['anchorX','anchorY','pivotX','pivotY','offsetX','offsetY','worldX','worldY'] as const).map(key => <NumberInput key={key} label={`Preview ${key}`} value={points[key]} disabled={pending}
        onChange={value => setPoints(current => ({ ...current, [key]: value }))} />)}
      <Button variant="default" disabled={controlsDisabled} onClick={() => void operate(owned => owned.apply(settings()))}>Apply configuration (reset stopped)</Button>
      <Group gap={editorTokens.spacing.compact}>
        {(['play','pause','resume','stop','restart'] as const).map(command => <Button key={command} variant="default" disabled={controlsDisabled}
          onClick={() => void operate(owned => owned.command(command as PreviewCommand))}>{command.slice(0, 1).toUpperCase() + command.slice(1)}</Button>)}
      </Group>
      <NumberInput label="Manual delta ms" value={delta} onChange={setDelta} min={0} max={60000} disabled={pending} />
      <Button variant="default" disabled={controlsDisabled} onClick={() => void operate(owned => owned.step(number(delta)))}>Step canonical playback</Button>
      <Text>Step respects Render state: paused playback does not advance. Hidden/suspended viewport requires explicit viewport Resume, then playback Resume. Configuration edits take effect only when applied.</Text>
      <Alert title={pending ? 'Pending' : 'Preview status'} role="status" color={editorTokens.colors.neutral}>{message}</Alert>
      <Text component="pre" role="status">{diagnostics}</Text>
    </Stack>
  </EditorPanel>;
  return children(panel, <Viewport contentFactory={contentFactory} showGuidance={showGuidance} />);
}
