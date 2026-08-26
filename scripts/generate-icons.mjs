import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import potrace from 'potrace';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const sourcePath = join(publicDir, 'logo-source.png');
const logoSvgPath = join(publicDir, 'logo.svg');
const maskableSvgPath = join(publicDir, 'icon-maskable.svg');

const MASKABLE_SCALE = 2.17;
const LOGO_CENTER = 89.5;

async function traceLogoSvg() {
  const { data, info } = await sharp(sourcePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  const bitmap = Buffer.alloc(info.width * info.height);
  for (let i = 0; i < info.width * info.height; i += 1) {
    const red = data[i * 4];
    const alpha = data[i * 4 + 3];
    bitmap[i] = alpha > 128 && red > 200 ? 0 : 255;
  }

  const traceInput = await sharp(bitmap, {
    raw: { width: info.width, height: info.height, channels: 1 },
  })
    .png()
    .toBuffer();

  const svg = await new Promise((resolve, reject) => {
    potrace.trace(
      traceInput,
      {
        turdSize: 2,
        optTolerance: 0.4,
        optCurve: false,
        color: '#f6f3ec',
        background: '#1a7f5a',
      },
      (err, result) => (err ? reject(err) : resolve(result)),
    );
  });

  writeFileSync(logoSvgPath, svg);

  const pathStart = svg.indexOf('<path');
  const pathEnd = svg.lastIndexOf('</svg>');
  const pathMarkup = svg.slice(pathStart, pathEnd);
  const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="#1a7f5a"/>
  <g transform="translate(256 256) scale(${MASKABLE_SCALE}) translate(-${LOGO_CENTER} -${LOGO_CENTER})">
    <rect width="179" height="179" fill="#1a7f5a"/>
    ${pathMarkup}
  </g>
</svg>
`;
  writeFileSync(maskableSvgPath, maskableSvg);

  return { logoSvg: svg, maskableSvg };
}

async function renderPngBuffer(svg, size) {
  return sharp(Buffer.from(svg))
    .resize(size, size, { fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function renderPng(svg, size, file) {
  const png = await renderPngBuffer(svg, size);
  writeFileSync(join(publicDir, file), png);
  console.log(`wrote ${file} (${size}x${size})`);
  return png;
}

/** Build a multi-size .ico with PNG payloads (supported by modern browsers + Googlebot). */
function pngsToIco(entries) {
  const count = entries.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(count, 4);

  const dirSize = 16 * count;
  let offset = 6 + dirSize;
  const dirs = [];
  const bodies = [];

  for (const { size, png } of entries) {
    const dir = Buffer.alloc(16);
    dir[0] = size >= 256 ? 0 : size;
    dir[1] = size >= 256 ? 0 : size;
    dir[2] = 0; // palette
    dir[3] = 0; // reserved
    dir.writeUInt16LE(1, 4); // color planes
    dir.writeUInt16LE(32, 6); // bits per pixel
    dir.writeUInt32LE(png.length, 8);
    dir.writeUInt32LE(offset, 12);
    dirs.push(dir);
    bodies.push(png);
    offset += png.length;
  }

  return Buffer.concat([header, ...dirs, ...bodies]);
}

const { logoSvg, maskableSvg } = await traceLogoSvg();

const logoOutputs = [
  { file: 'logo.png', size: 179 },
  // Google recommends >48px for Search; keep 32 for browser tabs.
  { file: 'favicon-32.png', size: 32 },
  { file: 'favicon.png', size: 96 },
  { file: 'favicon-64.png', size: 64 },
  { file: 'apple-touch-icon.png', size: 180 },
  { file: 'pwa-192x192.png', size: 192 },
  { file: 'pwa-512x512.png', size: 512 },
];

const maskableOutputs = [
  { file: 'pwa-maskable-192.png', size: 192 },
  { file: 'pwa-maskable-512.png', size: 512 },
];

const icoPngs = [];
for (const { file, size } of logoOutputs) {
  const png = await renderPng(logoSvg, size, file);
  if (size === 16 || size === 32 || size === 48) {
    icoPngs.push({ size, png });
  }
}

// Dedicated ICO sizes (16/32/48) — browsers and crawlers still hit /favicon.ico.
for (const size of [16, 32, 48]) {
  if (!icoPngs.some((entry) => entry.size === size)) {
    icoPngs.push({ size, png: await renderPngBuffer(logoSvg, size) });
  }
}
icoPngs.sort((a, b) => a.size - b.size);

const icoPath = join(publicDir, 'favicon.ico');
writeFileSync(icoPath, pngsToIco(icoPngs));
console.log(`wrote favicon.ico (${icoPngs.map((e) => e.size).join('/')})`);

for (const { file, size } of maskableOutputs) {
  await renderPng(maskableSvg, size, file);
}
