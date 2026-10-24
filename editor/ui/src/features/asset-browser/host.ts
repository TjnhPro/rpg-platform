import { useEffect, useState } from 'react';
import type { ExistingResourceObservation } from '@rpg-platform/editor';
import type { ActiveEditorProject } from '../project-manager/ProjectManagerPanel.js';
import type { AssetResourceGrant } from './AssetViewport.js';

/** Optional same-origin finite host. Ordinary Vite/static deployment has no grant. */
export function useAssetResourceGrant(active: ActiveEditorProject | null): AssetResourceGrant | null {
  const [connected, setConnected] = useState<{ active: ActiveEditorProject; grant: AssetResourceGrant } | null>(null);
  useEffect(() => {
    if (!active) return;
    let live = true;
    const abort = new AbortController();
    const root = active.root.binding;
    void (async () => {
      try {
        const response = await fetch('/__project-host/capability', { signal: abort.signal });
        if (!response.ok) return;
        const capability = await response.json() as { token: string; roots: { projectId: string; bindingId: string }[] };
        if (typeof capability.token !== 'string' || !capability.roots.some(item => item.projectId === root.projectId && item.bindingId === root.bindingId)) return;
        async function read(locator: string) {
          const response = await fetch('/__asset-host/resource', { method: 'POST', signal: abort.signal,
            headers: { 'Content-Type': 'application/json', 'X-Project-Capability': capability.token },
            body: JSON.stringify({ projectId: root.projectId, bindingId: root.bindingId, locator }) });
          if (!response.ok || !response.body) throw new Error('RESOURCE_UNAVAILABLE');
          const reader = response.body.getReader(), chunks: Uint8Array[] = []; let length = 0;
          try {
            for (;;) { const part = await reader.read(); if (part.done) break; length += part.value.length;
              if (length > 20_971_520) throw new RangeError('READ_LIMIT'); chunks.push(part.value); }
          } finally { try { await reader.cancel(); } finally { reader.releaseLock(); } }
          const bytes = new Uint8Array(length); let offset = 0;
          for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
          const result = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) as {
            status: 'available' | 'unverified'; reason?: 'unavailable' | 'not-found' | 'denied';
            observation?: ExistingResourceObservation; bytes?: number[] };
          if (!live) throw new Error('GRANT_REVOKED');
          if (result.status !== 'available') return { status: 'unverified' as const,
            reason: result.reason === 'denied' || result.reason === 'not-found' ? result.reason : 'unavailable' as const };
          const observation = result.observation;
          if (!observation || observation.projectId !== root.projectId || observation.bindingId !== root.bindingId
            || observation.locator !== locator || typeof observation.revision !== 'string' || !observation.revision
            || !Array.isArray(result.bytes) || result.bytes.length > 4_194_304 || observation.byteLength !== result.bytes.length
            || !result.bytes.every(value => Number.isInteger(value) && value >= 0 && value <= 255)) throw new Error('INVALID_RESPONSE');
          return { status: 'available' as const, observation: Object.freeze({ ...observation }), bytes: new Uint8Array(result.bytes) };
        }
        // Probe endpoint availability without claiming a file observation.
        const probe = await read('not-authorized');
        if (!live || probe.status !== 'unverified') return;
        const scope = Object.freeze({ projectId: root.projectId, providerId: Symbol('asset-host'), authorizationGeneration: root.bindingId });
        const grant: AssetResourceGrant = { root,
          existing: { async observe(request) {
            if (request.projectId !== root.projectId || request.bindingId !== root.bindingId) return { status: 'unverified', reason: 'denied' };
            try { const result = await read(request.locator.path); return result.status === 'available'
              ? { status: 'available', observation: result.observation } : result; }
            catch { return { status: 'unverified', reason: 'unavailable' }; }
          } },
          provider: { scope, async read(request) {
            if (!live || request.scope.providerId !== scope.providerId || request.scope.authorizationGeneration !== scope.authorizationGeneration
              || request.identity.projectId !== root.projectId || request.source.role !== 'image') return { status: 'failed', code: 'SOURCE_DENIED' };
            try { const result = await read(request.source.locator.path);
              if (result.status !== 'available') return { status: 'failed', code: result.reason === 'not-found' ? 'SOURCE_NOT_FOUND' : 'SOURCE_DENIED' };
              if (result.bytes.length > request.maxBytes) return { status: 'failed', code: 'CONTENT_TOO_LARGE' };
              return { status: 'provided', bytes: result.bytes, contentLength: result.bytes.length, mediaType: 'image/png', revision: result.observation.revision };
            } catch { return { status: 'failed', code: 'CANCELLED' }; }
          } },
        };
        setConnected({ active, grant });
      } catch { /* Availability is explicit; no fallback data or authority. */ }
    })();
    return () => { live = false; abort.abort(); };
  }, [active]);
  return connected?.active === active ? connected?.grant ?? null : null;
}
