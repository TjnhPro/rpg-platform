// Explicit finite read-only manual host; not part of CI/build scripts.
import { open } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { inspectInFlightPng } from '../../.artifacts/inflight-manual/inflight-png.mjs';
const selected = new URL('./png-sample/rgba-2x2.png', import.meta.url);
let fileReads = 0;
const readSource = async () => {
  const file = await open(selected, 'r');
  try {
    const before = await file.stat({ bigint: true });
    if (!before.isFile() || before.size < 1n || before.size > 4096n) throw new Error('Sample exceeds fixed host budget');
    const storage = new Uint8Array(4097);
    let length = 0;
    while (length < storage.length) {
      const { bytesRead } = await file.read(storage, length, storage.length - length, null);
      if (bytesRead === 0) break;
      length += bytesRead;
    }
    const after = await file.stat({ bigint: true });
    if (length > 4096 || BigInt(length) !== before.size || before.size !== after.size
      || before.mtimeNs !== after.mtimeNs || before.ctimeNs !== after.ctimeNs) throw new Error('Sample changed during bounded read');
    const bytes = storage.slice(0, length);
    fileReads++;
    return { bytes, revision: createHash('sha256').update(bytes).digest('hex') };
  } finally { await file.close(); }
};
const log = (label, value) => console.log(label, JSON.stringify(value, (_key, item) =>
  typeof item === 'symbol' ? String(item) : item instanceof Error ? { name: item.name, message: item.message } : item, 2));
const selectedSource = await readSource();
log('fixed original PNG provenance (one separate bootstrap read)', { bytes: selectedSource.bytes.length, sha256: selectedSource.revision });
await inspectInFlightPng(readSource, selectedSource.revision, log);
log('total actual file reads including separate bootstrap', fileReads);
