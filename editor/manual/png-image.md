# PNG decoding — optional manual consumer

Build-only policy remains in force: no assertions, test runner, browser automation
or CI runtime job. `png-image.mts` is a finite public-root consumer, not an Editor
production loader. Render alone decodes/owns/closes bitmaps. No GPU/session needed.

From workspace root, build and compile this optional entry:

```powershell
npm run build -- --force
node node_modules/typescript/bin/tsc --ignoreConfig --strict --noUncheckedIndexedAccess --exactOptionalPropertyTypes --module NodeNext --target ES2022 --lib ES2022,DOM --outDir .artifacts/png-manual editor/manual/png-image.mts
python -m http.server 4173 --bind 127.0.0.1 --directory .
```

Open `http://127.0.0.1:4173/editor/manual/png-image.html` in a browser with
createImageBitmap, Blob, import maps and WebCrypto. Click Acquire, decode and
release. Inspect output; no image is drawn. Stop server with Ctrl+C.
The host reads only the literal same-origin PNG URL with a4096-byte stream budget,
closes its reader and records SHA-256. Render never resolves this URL itself.
The committed [sample](png-sample/README.md) has documented2x2 dimensions and
76 bytes. Negative examples mutate memory copies, not the source file.

Inspect for metadata NOT_PERFORMED/reads0, two independent decoded2x2 handles,
source release during decode, first image release/closed while second remains
decoded/owned, repeated release preserving cleanup, late decode completion staying
released/closed, malformed signature NOT_PNG, truncated container INVALID_PNG,
pixel budget DECODE_LIMIT_EXCEEDED, and native corrupt-stream rejection with
failure:null. No automated expected-result comparison occurs. Report actual
browser/version and outcomes; absence of observation is NOT_VERIFIED.
The trace records Render cleanup observations; exact native close invocation counts
and process memory reclamation have not been instrumented.

For a headless **admission-only** trace, optionally run after compiling:

```powershell
@'
import { open } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { inspectPngImage } from './.artifacts/png-manual/png-image.mjs';
const file = await open('editor/manual/png-sample/rgba-2x2.png', 'r');
const buffer = Buffer.alloc(4097);
let length = 0;
try {
  while (length < buffer.length) {
    const { bytesRead } = await file.read(buffer, length, buffer.length - length, null);
    if (bytesRead === 0) break;
    length += bytesRead;
  }
} finally { await file.close(); }
if (length > 4096) throw new Error('Sample exceeds host budget');
const bytes = new Uint8Array(buffer.subarray(0, length));
const revision = createHash('sha256').update(bytes).digest('hex');
console.log('sample', { length, revision });
await inspectPngImage(bytes, revision);
'@ | node --input-type=module
```

Node without native createImageBitmap reports DECODER_UNAVAILABLE for valid PNG
and corrupt compressed data; it does not perform PNG decoding. Malformed envelope
and budget admission run before browser capability lookup. Do not call this
headless PNG decode, bitmap cleanup, pixel verification or visual evidence.
