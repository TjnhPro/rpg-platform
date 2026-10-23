// Original pixel-art sample authoring, not a loader, runtime fallback or test.
// Node standard library only. Rebuilds the five committed source PNGs + atlas text.
import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';
const output = new URL('./', import.meta.url);
const records = [];
const crc = bytes => {
  let value = 0xffffffff;
  for (const byte of bytes) {
    value ^= byte;
    for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ ((value & 1) ? 0xedb88320 : 0);
  }
  return (value ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const tag = Buffer.from(type), head = Buffer.alloc(4), tail = Buffer.alloc(4);
  head.writeUInt32BE(data.length); tail.writeUInt32BE(crc(Buffer.concat([tag, data])));
  return Buffer.concat([head, tag, data, tail]);
};
function save(name, bytes, mediaType, width, height) {
  writeFileSync(new URL(name, output), bytes);
  records.push({ name, mediaType, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'),
    ...(width ? { width, height } : {}) });
}
function art(name, width, height, paint) {
  const pixels = Buffer.alloc(width * height * 4);
  const rect = (x, y, w, h, rgb) => {
    const color = [parseInt(rgb.slice(0, 2), 16), parseInt(rgb.slice(2, 4), 16), parseInt(rgb.slice(4, 6), 16), 255];
    for (let row = y; row < y + h; row++) for (let col = x; col < x + w; col++) {
      if (row >= 0 && row < height && col >= 0 && col < width) pixels.set(color, (row * width + col) * 4);
    }
  };
  paint(rect);
  const rows = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) pixels.copy(rows, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  const header = Buffer.alloc(13); header.writeUInt32BE(width); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 6;
  save(name, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', header),
    chunk('IDAT', deflateSync(rows, { level: 9 })), chunk('IEND', Buffer.alloc(0))]), 'image/png', width, height);
}
art('courtyard.png', 320, 240, r => {
  r(0, 0, 320, 240, '254c40'); r(12, 20, 296, 208, '3b6851');
  r(26, 42, 268, 164, '5e7566');
  for (let y = 44; y < 206; y += 20) for (let x = 28; x < 294; x += 24) {
    r(x, y, 22, 18, ((x + y) % 48) ? '7b8875' : '8d9580');
    r(x + 2, y + 2, 18, 1, 'a3aa92');
  }
  r(18, 24, 284, 12, '263f3e'); r(18, 24, 284, 3, '9ca58c');
  for (const x of [18, 290]) { r(x, 22, 12, 190, '263f3e'); r(x, 22, 3, 190, '9ca58c'); }
  for (const x of [40, 272]) { r(x, 192, 8, 16, '314b36'); r(x - 4, 184, 16, 12, '4e8a4c'); }
});
art('traveler.png', 32, 48, r => {
  r(8, 44, 17, 3, '34453c'); r(8, 23, 17, 20, '172d54');
  r(10, 19, 13, 21, '3c86bf'); r(9, 39, 6, 8, '212b40'); r(19, 39, 6, 8, '212b40');
  r(10, 7, 14, 15, 'e7b589'); r(8, 4, 18, 7, '493b42'); r(8, 10, 4, 9, '493b42');
  r(19, 12, 2, 3, '222b39'); r(9, 30, 15, 3, 'c99552'); r(24, 20, 4, 20, 'd5dce0');
  r(23, 34, 6, 3, 'd3ae52'); r(4, 24, 6, 13, 'e7b589');
});
art('monsters.png', 96, 48, r => {
  for (let i = 0; i < 3; i++) {
    const x = i * 32, colors = ['b95151', '629d58', 'a579bc'], c = colors[i];
    r(x + 6, 44, 23, 3, '34453c'); r(x + 7, 16, 20, 23, c); r(x + 5, 23, 24, 13, c);
    r(x + 8, 38, 7, 9, c); r(x + 21, 38, 7, 9, c);
    r(x + 6, 8, 6, 14, 'e2d1a2'); r(x + 23, 8, 5, 14, 'e2d1a2');
    r(x + 10, 20, 5, 6, 'f5eecf'); r(x + 20, 20, 5, 6, 'f5eecf');
    r(x + 12, 22, 2, 3, '252938'); r(x + 21, 22, 2, 3, '252938');
    r(x + 13, 30, 10, 3, '4a333c'); r(x + 15, 30, 2, 4, 'f5eecf');
  }
});
art('potion.png', 24, 24, r => {
  r(9, 2, 7, 4, 'a7804c'); r(8, 6, 9, 5, 'c5e0db'); r(5, 10, 15, 12, 'c5e0db');
  r(7, 12, 11, 8, 'd29a35'); r(8, 12, 3, 7, 'ffe7a3'); r(9, 7, 2, 4, 'f3f3d8');
});
art('static-spark.png', 32, 32, r => {
  r(13, 1, 6, 30, 'b7dfdf'); r(1, 13, 30, 6, 'b7dfdf');
  r(9, 7, 14, 18, 'f5bd58'); r(7, 9, 18, 14, 'f5bd58');
  r(12, 10, 8, 12, 'fff0bd'); r(10, 12, 12, 8, 'fff0bd');
});
// Hand-authored rectangular 40300 parser-profile source, not a claimed exporter file.
save('monsters.atlas.txt', Buffer.from(':format=40300\n:texture=monsters.png\n:size=96x48\n:pivotpoints=enabled\n:borders=disabled\nred;0;0;32;48;0.5;0;0;0;0;0\ngreen;32;0;32;48;0.5;0;0;0;0;0\nviolet;64;0;32;48;0.5;0;0;0;0;0\n'), 'text/plain');
writeFileSync(new URL('manifest.json', output), JSON.stringify({ profile: 'original-scene-mvp-art-v1', files: records }, null, 2) + '\n');
console.log('Authored sample PNGs, atlas text and SHA-256 manifest. Not runtime/visual verification.');
