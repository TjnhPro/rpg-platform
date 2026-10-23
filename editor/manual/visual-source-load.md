# Asynchronous source lifecycle — v0.7.2

Optional finite manual trace; not invoked by CI. Build the workspace first, then:

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/visual-source-load.mts
```

Run this explicitly authorized host sequence from workspace root. It reads only
the real committed Editor manifest, caps allocation/read at4097 bytes and rejects
over4096, closes the file, then supplies a stable snapshot to the source provider.
No file bytes are invented; JSON is not represented as PNG/TPSheet or parsed as atlas.
The hash is of the returned bytes, not a live storage transaction/version guarantee.

```powershell
@'
import { open } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const handle = await open('editor/package.json', 'r');
let bytes;
try {
  const buffer = new Uint8Array(4097);
  let count = 0;
  while (count < buffer.length) {
    const part = await handle.read(buffer, count, buffer.length - count, null);
    if (part.bytesRead === 0) break;
    count += part.bytesRead;
  }
  if (count > 4096) throw new RangeError('Manifest exceeds authorized cap');
  bytes = buffer.slice(0, count);
} finally { await handle.close(); }
const revision = createHash('sha256').update(bytes).digest('hex');
const { inspectVisualSourceLifecycle } = await import('./editor/manual/visual-source-load.mts');
await inspectVisualSourceLifecycle(bytes, revision);
'@ | node --input-type=module
```

Inspect requested/pending/acquired/released observations. The host deliberately
delays one genuine response until after release while two independent requests
complete. Releasing the first does not release the second. The delayed byte getter
prints zero reads and late completion remains released. No source response is
copied/adopted after release. Caller byte copies are independently owned and must
be dropped by the caller; release does not revoke them.

An absent host-snapshot key produces failed/SOURCE_NOT_FOUND with no bytes. An
explicit host rejection reaches the caller as the original Error reference;
safe observation reports failed/failure:null, never a guessed WebGL code. The
caller catches the started Promise even when release is requested. The final
requested-but-released handle does no read. Each handle is released explicitly.
Printed expected read count5 describes this trace, not an assertion/test target.

This observes control flow and reference-drop paths, not heap collection or a
leak-free guarantee. Host owns pending IO and its original response bytes; Render
does not abort/timeout a non-settling host. Source loading is independent of the
existing graphics lifecycle. No image decode, GPU upload, graphics session, source
cache, dedup, lease manager, atlas compatibility or displayed frame is verified.
