// Optional real Editor browser host. No package-root or authored schema change.
import * as E from '@rpg-platform/editor';
import type * as R from '@rpg-platform/runtime-render';
import { mountEditorVfxPreview } from '../dist/manual-vfx-preview.js';
const projectId = 'editor-vfx-manual';
const catalog = E.createAssetCatalog({projectId,definitions:[{identity:{projectId,assetId:'Attack1_0'},kind:'image',metadata:{label:'Original attack atlas'},sources:[
 {role:'atlas-metadata',locator:{type:'project-relative',path:'Attack1_0.tpsheet'}},
 {role:'image',locator:{type:'project-relative',path:'Attack1_0.png'}}]}]});
const membership=E.createSceneMembership({scene:{identity:{projectId,sceneId:'preview'}},objects:[{
 definition:{objectId:'preview-subject'},assetReference:{projectId,assetId:'Attack1_0',expectedKind:'image'},
 placement:{coordinateSpaceId:'ground',point:{x:110,y:170}}}]});
const space=E.createCoordinateSpaceDefinition({reference:{projectId,coordinateSpaceId:'ground'},componentCount:2,
 axes:{x:'right',y:'down'},origin:{x:0,y:0},unit:'world-unit'});
function localProvider() {
  let active = true;
  const pending = new Set<AbortController>();
  const scope = { projectId, providerId: Symbol('manual-source-grant'), authorizationGeneration: '1' };
  const provider: R.VisualSourceProvider = { scope, async read(request) {
    const definition = catalog.definitions.find(item => item.identity.assetId === request.identity.resourceId);
    const source = definition?.sources[request.sourceIndex];
    if (!active || request.scope.providerId !== scope.providerId || request.scope.authorizationGeneration !== '1'
      || request.scope.projectId !== projectId || request.identity.projectId !== projectId
      || source?.role !== request.source.role || source?.locator.path !== request.source.locator.path
      || request.source.locator.type !== 'project-relative') return { status: 'failed', code: 'SOURCE_DENIED' };
    const controller = new AbortController(); pending.add(controller);
    try {
      const response = await fetch(`/asset/${encodeURIComponent(source.locator.path)}`, { signal: controller.signal });
      if (response.status === 404) return { status: 'failed', code: 'SOURCE_NOT_FOUND' };
      if (!response.ok || !response.body) throw new Error('Local source response unavailable');
      const reader = response.body.getReader(), chunks: Uint8Array[] = [];
      let length = 0;
      try {
        while (true) {
          const part = await reader.read(); if (part.done) break;
          length += part.value.length;
          if (length > request.maxBytes) { await reader.cancel(); return { status: 'failed', code: 'CONTENT_TOO_LARGE' }; }
          chunks.push(part.value);
        }
      } finally { reader.releaseLock(); }
      const bytes = new Uint8Array(length); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      const hash = await crypto.subtle.digest('SHA-256', bytes);
      const revision = Array.from(new Uint8Array(hash), value => value.toString(16).padStart(2, '0')).join('');
      if (!active) return { status: 'failed', code: 'CANCELLED' };
      return { status: 'provided', bytes, contentLength: length, revision,
        mediaType: source.role === 'image' ? 'image/png' : null };
    } catch (error) {
      if (!active || controller.signal.aborted) return { status: 'failed', code: 'CANCELLED' };
      throw error;
    } finally { pending.delete(controller); }
  } };
  return { provider, close: () => { active = false; for (const operation of pending) operation.abort(); pending.clear(); } };
}


const grant=localProvider();
const root=document.querySelector<HTMLElement>('[data-vfx-preview]')!;
const preview=mountEditorVfxPreview(root,{catalog,membership,space,provider:grant.provider,closeSources:grant.close,
 effects:[
 {label:'Original attack frames — repeat',effectId:'attack-repeat',reference:E.createAssetReference({projectId,assetId:'Attack1_0',expectedKind:'image'}),frames:['0000','0002'],frameIntervalMs:125,repeat:'repeat'},
 {label:'Original attack frames — once',effectId:'attack-once',reference:E.createAssetReference({projectId,assetId:'Attack1_0',expectedKind:'image'}),frames:['0000','0002'],frameIntervalMs:125,repeat:'once'},
 {label:'Unresolved authored reference',effectId:'unresolved',reference:E.createAssetReference({projectId,assetId:'not-in-catalog',expectedKind:'image'}),frames:['0000'],frameIntervalMs:125,repeat:'repeat'},
 ]});
// Finite manual inspection hook; no timer, test or automatic acceptance assertion.
Object.assign(window,{editorVfxPreview:preview});
