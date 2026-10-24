import type { VisualSourceProvider } from '@rpg-platform/runtime-render';
import { requireOpenProjectSession, getProjectSessionSnapshot, type ProjectSession } from './project-session.js';
import type { ProjectRootBinding } from './project-root-binding.js';
import { requireAssetManagerProject, type AssetManagerProject } from './asset-manager-project.js';
import { getManagedAssetSelection, observeManagedAssetSelection } from './asset-manager-selection.js';
import { resolveAssetReference } from './asset-catalog.js';
import { describeResolvedVisualAsset } from './asset-visual.js';

export interface AnimationPreviewBinding {
  readonly project: ProjectSession; readonly root: ProjectRootBinding; readonly assets: AssetManagerProject;
  readonly grant: { readonly root: ProjectRootBinding; readonly provider: VisualSourceProvider } | null;
}
/** Borrow current owners. Selection alone never initiates IO or allocates Render. */
export function inspectAnimationPreviewBinding(binding: AnimationPreviewBinding) {
  const managed = requireAssetManagerProject(binding.assets);
  if (requireOpenProjectSession(binding.project).root !== binding.root || managed.project !== binding.project
    || managed.root !== binding.root) return { status: 'wrong-project' as const };
  const selected = getManagedAssetSelection(binding.assets);
  if (selected.status !== 'resolved') return { status: selected.status };
  if (!binding.grant) return { status: 'grant-unavailable' as const };
  const provider = binding.grant.provider, scope = provider.scope;
  if (binding.grant.root !== binding.root || scope.projectId !== managed.snapshot.projectId) return { status: 'wrong-project' as const };
  const described = describeResolvedVisualAsset(resolveAssetReference(managed.snapshot.catalog, selected.reference), 'image/png');
  if (described.status !== 'described') return { status: 'unsupported' as const, reason: described.reason };
  return Object.freeze({ status: 'ready-to-load' as const, descriptor: described.descriptor, reference: selected.reference,
    catalog: managed.snapshot.catalog, catalogGeneration: managed.snapshot.generation,
    projectRevision: getProjectSessionSnapshot(binding.project).currentRevision, provider,
    scope: Object.freeze({ ...scope }) });
}
type Ready = Extract<ReturnType<typeof inspectAnimationPreviewBinding>, { status: 'ready-to-load' }>;
export interface AnimationPreviewTicket { readonly generation: number; readonly source: Ready }

/** One transient generation; caller registers only its owned cancellation/release rights. */
export function createAnimationPreviewContext(input: AnimationPreviewBinding) {
  const binding = Object.freeze({ ...input });
  let generation = 0, closed = false, active: AnimationPreviewTicket | null = null;
  const releases = new Set<() => unknown>(), cleanupFailures: unknown[] = [];
  const retire = () => { generation++; active = null;
    for (const release of releases) { try { release(); } catch (error) { cleanupFailures.push(error); } }
    releases.clear(); };
  const unsubscribe = observeManagedAssetSelection(binding.assets, retire);
  const assert = (ticket: AnimationPreviewTicket) => {
    if (closed || active !== ticket) throw new TypeError('STALE_ANIMATION_PREVIEW');
    const now = inspectAnimationPreviewBinding(binding), before = ticket.source;
    if (now.status !== 'ready-to-load' || now.catalog !== before.catalog || now.catalogGeneration !== before.catalogGeneration
      || now.projectRevision !== before.projectRevision || now.provider !== before.provider
      || now.scope.providerId !== before.scope.providerId || now.scope.authorizationGeneration !== before.scope.authorizationGeneration
      || JSON.stringify(now.reference) !== JSON.stringify(before.reference)) {
      retire(); throw new TypeError('STALE_ANIMATION_PREVIEW');
    }
    return before;
  };
  return Object.freeze({ inspect: () => closed ? { status: 'disposed' as const } : inspectAnimationPreviewBinding(binding), assert,
    begin(): AnimationPreviewTicket {
      retire(); if (closed) throw new TypeError('ANIMATION_PREVIEW_DISPOSED');
      const source = inspectAnimationPreviewBinding(binding);
      if (source.status !== 'ready-to-load') throw new TypeError(`ANIMATION_PREVIEW:${source.status}`);
      return active = Object.freeze({ generation, source });
    },
    own(ticket: AnimationPreviewTicket, release: () => unknown) { assert(ticket); releases.add(release); return () => releases.delete(release); },
    invalidate: retire,
    dispose() { if (!closed) { closed = true; unsubscribe(); retire(); }
      return Object.freeze({ status: cleanupFailures.length ? 'CLEANUP_UNCERTAIN' : 'disposed', failures: cleanupFailures.length }); }
  });
}
export type AnimationPreviewContext = ReturnType<typeof createAnimationPreviewContext>;
