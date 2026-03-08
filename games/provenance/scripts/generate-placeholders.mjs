#!/usr/bin/env node
/**
 * Generates minimal valid PNG placeholder images for icons and screenshots.
 * Uses raw PNG encoding (no dependencies) — produces solid-color images.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { deflateSync } from 'node:zlib';

const PUBLIC = join(dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')), '..', 'public');

function createPNG(width, height, r, g, b) {
  // Build raw RGBA scanlines
  const rowBytes = width * 4 + 1; // +1 for filter byte
  const raw = Buffer.alloc(rowBytes * height);
  for (let y = 0; y < height; y++) {
    const offset = y * rowBytes;
    raw[offset] = 0; // no filter
    for (let x = 0; x < width; x++) {
      const px = offset + 1 + x * 4;
      raw[px] = r;
      raw[px + 1] = g;
      raw[px + 2] = b;
      raw[px + 3] = 255;
    }
  }

  const compressed = deflateSync(raw);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = crc32(typeAndData);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc >>> 0);
    return Buffer.concat([len, typeAndData, crcBuf]);
  }

  // CRC32 table
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crcTable[n] = c;
  }
  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const icons = [
  { name: 'icon-44.png', size: 44 },
  { name: 'icon-50.png', size: 50 },
  { name: 'icon-150.png', size: 150 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
];

const screenshots = [
  { name: 'gameplay-wide.png', w: 1280, h: 720 },
  { name: 'gameplay-narrow.png', w: 720, h: 1280 },
];

// Theme color: #1a1a2e with gold accent #c9a227
const BG = { r: 26, g: 26, b: 46 };
const GOLD = { r: 201, g: 162, b: 39 };

mkdirSync(join(PUBLIC, 'icons'), { recursive: true });
mkdirSync(join(PUBLIC, 'screenshots'), { recursive: true });

for (const { name, size } of icons) {
  const png = createPNG(size, size, GOLD.r, GOLD.g, GOLD.b);
  writeFileSync(join(PUBLIC, 'icons', name), png);
  console.log(`✓ icons/${name} (${size}×${size}, ${png.length} bytes)`);
}

for (const { name, w, h } of screenshots) {
  const png = createPNG(w, h, BG.r, BG.g, BG.b);
  writeFileSync(join(PUBLIC, 'screenshots', name), png);
  console.log(`✓ screenshots/${name} (${w}×${h}, ${png.length} bytes)`);
}

console.log('\nDone — all placeholder assets generated.');
