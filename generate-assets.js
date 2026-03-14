/**
 * generate-assets.js
 * Gera PNGs de placeholder para o Expo sem dependências externas.
 * Usa apenas: fs, path, zlib (todos nativos do Node.js).
 *
 * Cores:
 *   background: #0f0f1a  (roxo escuro — mesma cor do splash do app.json)
 *   accent:     #8257e6  (roxo primário do tema)
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ASSETS_DIR = path.join(__dirname, 'apps', 'mobile', 'assets');
fs.mkdirSync(ASSETS_DIR, { recursive: true });

// ─── PNG encoder puro ────────────────────────────────────────────────────────

function crc32(buf) {
  let crc = 0xffffffff;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c;
    }
    return t;
  })());
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const crcInput = Buffer.concat([typeBytes, data]);
  const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crc32(crcInput));
  return Buffer.concat([len, typeBytes, data, crcBuf]);
}

/**
 * Gera um PNG sólido de cor única.
 * @param {number} width
 * @param {number} height
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @param {object} [opts]
 * @param {number} [opts.circleR]    raio do círculo de accent (0 = sem círculo)
 * @param {number} [opts.ar]         cor do círculo (R)
 * @param {number} [opts.ag]         cor do círculo (G)
 * @param {number} [opts.ab]         cor do círculo (B)
 */
function makePNG(width, height, r, g, b, opts = {}) {
  const { circleR = 0, ar = 255, ag = 255, ab = 255 } = opts;

  // Monta raw image data: 1 byte filtro (0) + RGB por pixel por linha
  const rowSize = 1 + width * 3;
  const raw = Buffer.alloc(height * rowSize, 0);

  const cx = width / 2;
  const cy = height / 2;

  for (let y = 0; y < height; y++) {
    const rowOff = y * rowSize;
    raw[rowOff] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const px = rowOff + 1 + x * 3;
      if (circleR > 0) {
        const dx = x - cx, dy = y - cy;
        const inCircle = dx * dx + dy * dy <= circleR * circleR;
        raw[px]     = inCircle ? ar : r;
        raw[px + 1] = inCircle ? ag : g;
        raw[px + 2] = inCircle ? ab : b;
      } else {
        raw[px] = r; raw[px + 1] = g; raw[px + 2] = b;
      }
    }
  }

  const compressed = zlib.deflateSync(raw, { level: 9 });

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// ─── Cores ───────────────────────────────────────────────────────────────────
// bg: #0f0f1a
const BG = [0x0f, 0x0f, 0x1a];
// accent: #8257e6
const AC = [0x82, 0x57, 0xe6];

// ─── Gerar os 4 arquivos ─────────────────────────────────────────────────────

const assets = [
  {
    file: 'icon.png',
    w: 1024, h: 1024,
    desc: 'App icon (1024×1024)',
    circleR: 380,
  },
  {
    file: 'splash.png',
    w: 1284, h: 2778,
    desc: 'Splash screen (1284×2778)',
    circleR: 200,
  },
  {
    file: 'adaptive-icon.png',
    w: 1024, h: 1024,
    desc: 'Android adaptive icon foreground (1024×1024)',
    circleR: 320,
  },
  {
    file: 'favicon.png',
    w: 48, h: 48,
    desc: 'Favicon (48×48)',
    circleR: 18,
  },
];

for (const { file, w, h, desc, circleR } of assets) {
  const buf = makePNG(w, h, BG[0], BG[1], BG[2], {
    circleR,
    ar: AC[0], ag: AC[1], ab: AC[2],
  });
  const dest = path.join(ASSETS_DIR, file);
  fs.writeFileSync(dest, buf);
  console.log(`✓ ${file}  (${w}×${h}) — ${desc}`);
}

console.log('\nAssets gerados em apps/mobile/assets/');
console.log('Substitua pelos arquivos reais quando tiver o design final.');
