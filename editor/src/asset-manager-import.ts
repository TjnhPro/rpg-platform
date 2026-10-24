import { createAssetDefinition, type AssetDefinitionInput } from './asset-definition.js';
import { createResourceLocator, type AssetSourceReference, type ResourceLocator } from './asset-sources.js';
import type { DocumentIdentity } from './document-envelope.js';
import type { ProjectRootBinding } from './project-root-binding.js';
import { requireAssetManagerProject, type AssetManagerProject } from './asset-manager-project.js';
import { registerManagedAsset, type AssetRegistrationCandidate } from './asset-manager-registration.js';

export interface ExistingResourceRequest {
  readonly operation: 'register-existing';
  readonly root: ProjectRootBinding;
  readonly definition: AssetDefinitionInput;
  readonly source: AssetSourceReference;
  readonly documentIdentity: DocumentIdentity;
  readonly documentLocator: ResourceLocator;
}
export interface ExistingResourceObservation {
  readonly projectId: string;
  readonly bindingId: string;
  readonly locator: string;
  readonly revision: string;
  readonly byteLength: number;
}
export interface ExistingResourcePort {
  /** Trusted host must authorize exact grant/path, bound reads and retain coherent revision. */
  observe(request: { readonly projectId: string; readonly bindingId: string; readonly locator: ResourceLocator }):
    Promise<{ readonly status: 'available'; readonly observation: ExistingResourceObservation }
      | { readonly status: 'unverified'; readonly reason: 'unavailable' | 'not-found' | 'denied' }>;
}
export type ExistingResourceResult =
  | { readonly status: 'rejected'; readonly reason: 'INVALID_REQUEST' | 'ROOT_MISMATCH' | 'INVALID_OBSERVATION' | 'STALE_CONTEXT' }
  | { readonly status: 'unverified'; readonly reason: 'unavailable' | 'not-found' | 'denied' }
  | { readonly status: 'admitted'; readonly observation: ExistingResourceObservation; readonly candidate: AssetRegistrationCandidate };

/** Register existing only. No byte ownership, copy, conversion, IO fallback or auto-adoption. */
export async function registerExistingAssetResource(context: AssetManagerProject, input: ExistingResourceRequest,
  port: ExistingResourcePort | null): Promise<ExistingResourceResult> {
  const initial = requireAssetManagerProject(context);
  if (!input || typeof input !== 'object' || Array.isArray(input))
    return Object.freeze({ status: 'rejected', reason: 'INVALID_REQUEST' });
  if (input.root !== initial.root) return Object.freeze({ status: 'rejected', reason: 'ROOT_MISMATCH' });
  let candidate: AssetRegistrationCandidate;
  let locator: ResourceLocator;
  try {
    const fields = ['operation', 'root', 'definition', 'source', 'documentIdentity', 'documentLocator'];
    if (Object.keys(input).length !== fields.length || fields.some(key => !Object.hasOwn(input, key))
      || input.operation !== 'register-existing') throw new TypeError('INVALID_REQUEST');
    const asset = createAssetDefinition(input.definition);
    locator = createResourceLocator(input.source.locator);
    if (!asset.sources.some(source => source.role === input.source.role && source.locator.path === locator.path))
      throw new TypeError('SOURCE_NOT_DECLARED');
    candidate = registerManagedAsset(context, asset, input.documentIdentity, input.documentLocator);
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    return Object.freeze({ status: 'rejected', reason: 'INVALID_REQUEST' });
  }
  if (!port) return Object.freeze({ status: 'unverified', reason: 'unavailable' });
  const request = Object.freeze({ projectId: initial.snapshot.projectId, bindingId: initial.root.bindingId, locator });
  const result = await port.observe(request);
  let current;
  try { current = requireAssetManagerProject(context); }
  catch { return Object.freeze({ status: 'rejected', reason: 'STALE_CONTEXT' }); }
  if (current.snapshot.generation !== initial.snapshot.generation)
    return Object.freeze({ status: 'rejected', reason: 'STALE_CONTEXT' });
  if (!result || typeof result !== 'object')
    return Object.freeze({ status: 'rejected', reason: 'INVALID_OBSERVATION' });
  if (result.status === 'unverified' && ['unavailable', 'not-found', 'denied'].includes(result.reason))
    return Object.freeze({ status: 'unverified', reason: result.reason });
  if (result.status !== 'available') return Object.freeze({ status: 'rejected', reason: 'INVALID_OBSERVATION' });
  const observed = result.observation;
  if (!observed || Object.keys(observed).length !== 5 || observed.projectId !== request.projectId
    || observed.bindingId !== request.bindingId || observed.locator !== locator.path
    || typeof observed.revision !== 'string' || observed.revision.length === 0
    || !Number.isSafeInteger(observed.byteLength) || observed.byteLength < 0)
    return Object.freeze({ status: 'rejected', reason: 'INVALID_OBSERVATION' });
  return Object.freeze({ status: 'admitted', observation: Object.freeze({ projectId: observed.projectId,
    bindingId: observed.bindingId, locator: observed.locator, revision: observed.revision, byteLength: observed.byteLength }), candidate });
}
