import { createAssetDefinition, type AssetDefinitionInput } from '@rpg-platform/editor';

// Authored examples only: no file is loaded and no extension is interpreted.
const host = {
  identity: { projectId: 'sample-project', assetId: 'visual-idle', sourceId: '0012' },
  kind: 'image',
  metadata: { label: 'Idle', 'external:source': { originalName: '0012.png', tags: ['original'] } },
};
const image = createAssetDefinition(host);
host.identity.assetId = 'host-changed';
host.metadata['external:source'].tags.push('host-only');
host.metadata.label = 'Renamed';
console.log('Detached image:', JSON.stringify(image));
console.log('Frozen record/identity/metadata/extension/array:',
  Object.isFrozen(image), Object.isFrozen(image.identity), Object.isFrozen(image.metadata),
  Object.isFrozen(image.metadata['external:source']),
  Object.isFrozen((image.metadata['external:source'] as { readonly tags: readonly string[] }).tags));
console.log('Changed host:', JSON.stringify(host));

const text = createAssetDefinition({
  identity: { projectId: 'sample-project', assetId: 'intro-text' },
  kind: 'text',
  metadata: { language: 'vi', 'external:script': { dialect: 'example', enabled: true, note: null } },
});
console.log('Text without texture:', JSON.stringify(text));
const enriched = createAssetDefinition({
  identity: image.identity, kind: image.kind,
  metadata: { ...image.metadata, 'future:directional': { convention: 'uninterpreted' } },
});
console.log('Same logical identity with new metadata:',
  image.identity.projectId === enriched.identity.projectId && image.identity.assetId === enriched.identity.assetId,
  JSON.stringify(enriched));

// Deliberate untyped host input demonstrates rejection at the public boundary.
try {
  createAssetDefinition({ identity: text.identity, kind: 'text', metadata: { hostDate: new Date(0) } } as unknown as AssetDefinitionInput);
} catch (error) {
  console.log('Nonportable metadata rejected:', error instanceof TypeError,
    error instanceof Error ? error.message : 'Unknown error');
}
