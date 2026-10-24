import { createAssetDefinition, type AssetDefinition, type AssetDefinitionInput, type AssetMetadata } from './asset-definition.js';
import { getAssetDefinition, registerAssetDefinition, updateAssetDefinition, removeAssetDefinition, type AssetCatalog } from './asset-catalog.js';
import { createAssetIdentity, type AssetIdentityInput } from './asset-identity.js';
import { createDocumentEnvelope, type DocumentEnvelope, type DocumentIdentity } from './document-envelope.js';
import { createResourceLocator, type ResourceLocator } from './asset-sources.js';
import { getProjectSessionSnapshot } from './project-session.js';
import { trackProjectDocument, getProjectDocument } from './project-document-tracking.js';
import type { ProjectDocumentReference, ProjectManifest } from './project-manifest.js';
import { requireAssetManagerProject, admitAssetManagerIdentity, type AssetManagerProject } from './asset-manager-project.js';
import { describeAssetBrowserCategory } from './asset-manager-category.js';
import { readAssetDefinitionSnapshot } from './asset-snapshot.js';

export interface AssetRegistrationCandidate {
  readonly contextId: symbol;
  readonly generation: number;
  readonly projectRevision: number;
  readonly catalog: AssetCatalog;
  readonly document: DocumentEnvelope;
  readonly reference: ProjectDocumentReference;
  readonly manifest: ProjectManifest;
  readonly persistence: 'NOT_COMMITTED';
}
function candidate(context: AssetManagerProject, catalog: AssetCatalog, definition: AssetDefinition,
  identity: DocumentIdentity, locator: ResourceLocator, allowTracked: boolean): AssetRegistrationCandidate {
  const { project, root, snapshot } = requireAssetManagerProject(context);
  admitAssetManagerIdentity(context, identity);
  const path = createResourceLocator(locator);
  const current = getProjectSessionSnapshot(project);
  if (identity.documentId === current.documentId || path.path === current.locator) throw new TypeError('MANIFEST_SELF_REFERENCE');
  if (root.projectId !== definition.identity.projectId) throw new TypeError('ASSET_PROJECT_MISMATCH');
  if (describeAssetBrowserCategory(definition).status !== 'valid') throw new TypeError('INVALID_BROWSER_CATEGORY');
  const reference: ProjectDocumentReference = Object.freeze({ identity: Object.freeze({ ...identity }),
    documentKind: 'asset', contentSchemaVersion: 1, locator: path, sceneId: null });
  const existing = getProjectDocument(current.manifest, identity);
  if (existing && !allowTracked) throw new TypeError('DOCUMENT_ALREADY_TRACKED');
  if (existing && (existing.documentKind !== 'asset' || existing.contentSchemaVersion !== 1 || existing.locator.path !== path.path))
    throw new TypeError('ASSET_DOCUMENT_BINDING_MISMATCH');
  const manifest = existing ? current.manifest : trackProjectDocument(current.manifest, reference);
  const document = createDocumentEnvelope({ schemaVersion: 1, identity, documentKind: 'asset', contentSchemaVersion: 1, content: definition });
  return Object.freeze({ contextId: context.id, generation: snapshot.generation, projectRevision: current.currentRevision,
    catalog, document, reference, manifest, persistence: 'NOT_COMMITTED' });
}
/** Candidate only. Caller explicitly adopts catalog and separately saves asset/manifest. */
export function registerManagedAsset(context: AssetManagerProject, input: AssetDefinitionInput,
  documentIdentity: DocumentIdentity, locator: ResourceLocator): AssetRegistrationCandidate {
  const { snapshot } = requireAssetManagerProject(context);
  const definition = createAssetDefinition(input);
  if (definition.identity.projectId !== snapshot.projectId) throw new TypeError('ASSET_PROJECT_MISMATCH');
  return candidate(context, registerAssetDefinition(snapshot.catalog, definition), definition, documentIdentity, locator, false);
}
/** Explicit metadata patch; keys not in patch and all sources/dependencies/provenance survive. */
export function updateManagedAssetMetadata(context: AssetManagerProject, identity: AssetIdentityInput,
  patch: AssetMetadata, sourceDocument: DocumentEnvelope, locator: ResourceLocator): AssetRegistrationCandidate {
  const { snapshot } = requireAssetManagerProject(context);
  const key = createAssetIdentity(identity);
  if (key.projectId !== snapshot.projectId) throw new TypeError('ASSET_PROJECT_MISMATCH');
  const existing = getAssetDefinition(snapshot.catalog, key.assetId);
  if (!existing) throw new TypeError('ASSET_NOT_REGISTERED');
  const source = createDocumentEnvelope(sourceDocument);
  const sourceAsset = readAssetDefinitionSnapshot(source.content);
  if (source.documentKind !== 'asset' || source.contentSchemaVersion !== 1
    || source.identity.projectId !== key.projectId || sourceAsset.identity.projectId !== key.projectId
    || sourceAsset.identity.assetId !== key.assetId) throw new TypeError('ASSET_DOCUMENT_BINDING_MISMATCH');
  // Capture patch through canonical portable metadata admission before spreading.
  const admitted = createAssetDefinition({ ...existing, metadata: patch }).metadata;
  const definition = createAssetDefinition({ ...existing, metadata: { ...existing.metadata, ...admitted } });
  return candidate(context, updateAssetDefinition(snapshot.catalog, definition), definition, source.identity, locator, true);
}
/** In-memory candidate only. No file/tracking/reference/preview cascade. */
export function unregisterManagedAsset(context: AssetManagerProject, identity: AssetIdentityInput): AssetCatalog {
  const { snapshot } = requireAssetManagerProject(context);
  const key = createAssetIdentity(identity);
  if (key.projectId !== snapshot.projectId) throw new TypeError('ASSET_PROJECT_MISMATCH');
  return removeAssetDefinition(snapshot.catalog, key.assetId);
}
