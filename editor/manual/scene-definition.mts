// Optional finite public-root consumer; inspect output, no assertions or runner.
import {
  createSceneIdentity, createSceneDefinition,
  type SceneIdentityInput, type SceneDefinitionInput,
} from '@rpg-platform/editor';

const host = {
  identity: { projectId: 'text-project', sceneId: 'intro-0012' },
  title: 'Introduction',
  savePath: 'drafts/intro.json',
};
const before = JSON.stringify(host);
const identity = createSceneIdentity(host.identity);
const scene = createSceneDefinition(host);
const independentScene = createSceneDefinition(host);
console.log('Captured empty Scene:', scene);
console.log('Input unchanged by creation:', JSON.stringify(host) === before,
  'host remains mutable:', !Object.isFrozen(host), !Object.isFrozen(host.identity));
console.log('Detached/frozen:', scene !== host, scene.identity !== host.identity,
  Object.isFrozen(scene), Object.isFrozen(scene.identity));
console.log('Repeated identity reads:', scene.identity, scene.identity,
  'same snapshot reference:', scene.identity === scene.identity);
console.log('Independent captures:', independentScene, independentScene !== scene,
  independentScene.identity !== scene.identity);

host.title = 'Renamed introduction';
host.savePath = 'scenes/renamed.json';
console.log('Title/path edits stay host-local:', host, 'Scene:', scene);
host.identity.sceneId = 'edited-host-id';
console.log('Host ID edit does not change captures:', identity, scene, independentScene);
console.log('Same local ID in another project:', createSceneDefinition({
  identity: { projectId: 'other-project', sceneId: scene.identity.sceneId },
}));
console.log('Case-sensitive ID retained:', createSceneIdentity({
  projectId: 'text-project', sceneId: 'Intro-0012',
}));

// Untyped host input uses the same public validation path, not a separate validator.
try {
  const input: unknown = { identity: { projectId: 'text-project' }, savePath: 'intro.json' };
  createSceneDefinition(input as SceneDefinitionInput);
} catch (error) {
  console.log('Missing sceneId rejected:', error instanceof TypeError,
    error instanceof Error ? error.message : 'unknown');
}
try {
  createSceneIdentity({ projectId: 'text-project', sceneId: 'two words' });
} catch (error) {
  console.log('Whitespace ID rejected:', error instanceof TypeError);
}
try {
  const input: unknown = { projectId: 'text-project', sceneId: 12 };
  createSceneIdentity(input as SceneIdentityInput);
} catch (error) {
  console.log('Numeric ID rejected:', error instanceof TypeError);
}
console.log('SCENE_METADATA_ONLY / RENDERING_NOT_PERFORMED / VISUAL_NOT_VERIFIED');
