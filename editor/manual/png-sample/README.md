# PNG sample provenance

`rgba-2x2.png` is an original deterministic demonstration asset authored for this
checkpoint, dedicated to CC0-1.0. No third-party image or game content is used.
76 bytes; SHA-256:
`e9aa41812d69aa8ebbee3fb351fede258f2a159c4a547b3187ee54184dea0b79`.

PNG signature, IHDR width2/height2/depth8/color6/compression0/filter0/interlace0,
one zlib IDAT and IEND. Top row RGBA: red (255,0,0,255), green (0,255,0,255).
Bottom row: blue (0,0,255,255), white (255,255,255,128). Each row uses filter0.
Constructed using Python standard-library struct/zlib with compression level9;
chunk CRC32 covers type+data. This is a real PNG image, not an atlas/TPSheet sample.

The manual consumer only reads this file. Negative examples mutate independent
in-memory copies; the committed file is never rewritten by the consumer.
