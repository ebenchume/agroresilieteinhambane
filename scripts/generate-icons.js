import fs from 'fs';
import zlib from 'zlib';

function crc32(buf) {
  let table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function createChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function generatePng(size, maskable = false) {
  // Create raw RGBA scanlines
  const rowLen = 1 + size * 4;
  const rawData = Buffer.alloc(rowLen * size);

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * (maskable ? 0.44 : 0.46);

  for (let y = 0; y < size; y++) {
    const rowOffset = y * rowLen;
    rawData[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < size; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Base gradient: Forest green
      const t = y / size;
      let r = Math.round(6 + t * 4);
      let g = Math.round(78 + t * 40);
      let b = Math.round(59 - t * 25);
      let a = 255;

      // Draw Golden Sun
      const sunDist = Math.hypot(x - cx, y - (cy - size * 0.14));
      if (sunDist < size * 0.16) {
        r = 245; g = 158; b = 11; // Amber Gold
      } else if (sunDist < size * 0.18) {
        r = 251; g = 191; b = 36; a = 220; // Corona
      }

      // Draw Earth curve at bottom
      const earthDist = (y - cy * 1.5) + Math.cos((x - cx) / (size * 0.3)) * (size * 0.1);
      if (earthDist > 0 && y > size * 0.65) {
        r = 120; g = 53; b = 15; // Earth soil
      }

      // Draw Sprout Stem
      if (Math.abs(x - cx) < size * 0.025 && y > size * 0.35 && y < size * 0.72) {
        r = 167; g = 243; b = 208; // Stem
      }

      // Draw Left Leaf
      const lx = (x - cx) / (size * 0.25);
      const ly = (y - cy * 0.95) / (size * 0.25);
      if (lx < 0 && (lx + 0.5) * (lx + 0.5) + ly * ly < 0.25) {
        r = 52; g = 211; b = 153; // Green Leaf
      }

      // Draw Right Leaf
      const rx = (x - cx) / (size * 0.25);
      const ry = (y - cy * 0.85) / (size * 0.25);
      if (rx > 0 && (rx - 0.5) * (rx - 0.5) + ry * ry < 0.25) {
        r = 5; g = 150; b = 105; // Deep Green Leaf
      }

      // In non-maskable mode, round the outer corners
      if (!maskable) {
        const cornerDist = Math.max(Math.abs(x - cx), Math.abs(y - cy));
        const cornerR = size * 0.22;
        const qx = Math.max(0, Math.abs(x - cx) - (cx - cornerR));
        const qy = Math.max(0, Math.abs(y - cy) - (cy - cornerR));
        if (qx * qx + qy * qy > cornerR * cornerR) {
          a = 0; // transparent outside rounded squircle
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  // PNG Signature
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // 8 bits
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // Deflate
  ihdr[11] = 0; // Filter 0
  ihdr[12] = 0; // Non-interlaced

  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT chunk
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

fs.mkdirSync('public', { recursive: true });

fs.writeFileSync('public/pwa-192x192.png', generatePng(192, false));
fs.writeFileSync('public/pwa-512x512.png', generatePng(512, false));
fs.writeFileSync('public/pwa-maskable-512x512.png', generatePng(512, true));
fs.writeFileSync('public/apple-touch-icon.png', generatePng(180, false));

console.log('Successfully generated PWA icons in public/');
