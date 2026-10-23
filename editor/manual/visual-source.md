# Resource provider manual consumer — v0.7.1

From workspace root after the regular build, compile the optional consumer:

```powershell
node node_modules/typescript/bin/tsc --ignoreConfig --noEmit --strict --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM editor/manual/visual-source.mts
```

Then run this finite host sequence. Node built-ins are used only by the explicitly
invoked host. The one literal committed manifest is authorized by the person running
the demo; no user path, crawler, URL mapping or directory grant is accepted.
Read is bounded before allocation and requires EOF within 4096 bytes. The provider
owns a private in-memory snapshot; SHA-256 identifies exactly the returned bytes,
not a transactional revision of a live filesystem. No physical missing-file claim
is made: the missing case is an absent entry in this host's authorized snapshot.

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
  if (count > 4096) throw new RangeError('Demo manifest exceeds authorized byte cap');
  bytes = buffer.slice(0, count);
} finally { await handle.close(); }
const revision = createHash('sha256').update(bytes).digest('hex');
const { inspectVisualSourceAccess } = await import('./editor/manual/visual-source.mts');
await inspectVisualSourceAccess(bytes, revision);
'@ | node --input-type=module
```

Inspect printed observations: metadata preparation performs zero provider reads;
authorized bytes retain manifest contents/revision in a separate buffer; ungranted
image and foreign project return SOURCE_DENIED; absent authorized key returns
SOURCE_NOT_FOUND; cap1 returns CONTENT_TOO_LARGE; explicitly requesting image/png
for the JSON manifest returns MEDIA_TYPE_MISMATCH. No fallback or default image.
This manual consumer is not invoked by CI and has no assertions or test runner.

The manifest is genuine source bytes for this IO boundary proof, **not** PNG or
atlas data. No real image/TPSheet sample is committed/provided. There is no decoding,
texture upload, cache, lease, frame or display proof. Browser Editor/Client hosts
remain unchanged and may later provide their own explicit authorized snapshots.
Filesystem realpath/symlink containment, URL/CORS/credential policy and revocation
are obligations of future product providers, not proven by this literal-file demo.
