// Explicit finite manual host, not part of builds/CI or an automatic suite.
import { open, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { inspectAtlasMetadata } from '../../.artifacts/atlas-manual/atlas-metadata.mjs';

const limit = 1024 * 1024;
async function readSelectedFile(path) {
  const canonical = await realpath(path);
  const file = await open(canonical, 'r');
  try {
    const before = await file.stat({ bigint: true });
    if (!before.isFile() || before.size < 1n || before.size > BigInt(limit)) throw new Error('Selected metadata exceeds read budget');
    const buffer = new Uint8Array(limit + 1);
    let length = 0;
    while (length < buffer.length) {
      const read = await file.read(buffer, length, buffer.length - length, null);
      if (read.bytesRead === 0) break;
      length += read.bytesRead;
    }
    const after = await file.stat({ bigint: true });
    if (length > limit || BigInt(length) !== before.size || after.size !== before.size
      || after.mtimeNs !== before.mtimeNs || after.ctimeNs !== before.ctimeNs) throw new Error('Selected file changed during bounded read');
    const bytes = buffer.slice(0, length);
    console.log('original metadata provenance', { bytes: length, sha256: createHash('sha256').update(bytes).digest('hex'), file: canonical });
    return bytes;
  } finally { await file.close(); }
}

const args = process.argv.slice(2);
const frameMode = args[0] === '--frames';
const geometryMode = args[0] === '--geometry';
if (frameMode || geometryMode) args.shift();
if (args.length === 0 || args.length % 3 !== 0 || args.length > 6) {
  throw new Error('Usage: atlas-metadata-node.mjs <original.tpsheet> <exact-header-texture> <image-source-locator> [second triple]');
}
const selected = [];
for (let index = 0; index < args.length; index += 3) selected.push({
  readMetadata: () => readSelectedFile(args[index]), textureReference: args[index + 1], imageLocator: args[index + 2],
});
const observer = geometryMode ? (await import('../../.artifacts/atlas-manual/atlas-geometry.mjs')).inspectAtlasGeometry : frameMode ? (await import('../../.artifacts/atlas-manual/frame-resolution.mjs')).inspectFrameResolution : undefined;
await inspectAtlasMetadata(selected, observer);

if (geometryMode) {
  console.log('Explicit malformed in-memory variant; original remains unchanged');
  const first = selected[0];
  await inspectAtlasMetadata([{ ...first, readMetadata: async () => {
    const text = new TextDecoder().decode(await first.readMetadata());
    const bad = text.replace(/^([^#:\r\n][^;]*);[^;]+;/mu, '$1;9007199254740991;');
    return new TextEncoder().encode(bad);
  } }]);
}
