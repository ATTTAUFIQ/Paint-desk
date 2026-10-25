import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.resolve(__dirname, '../public');
const svgPath = path.join(publicDir, 'favicon.svg');
const svgContent = fs.readFileSync(svgPath, 'utf8');

// Extract inner elements of the SVG to compose centered icons
const innerSvg = svgContent
  .replace(/<\?xml.*?\?>/i, '')
  .replace(/<svg[^>]*>/i, '')
  .replace(/<\/svg>/i, '');

// Helper to wrap the SVG in a canvas of given size and padding
function createSvgDocument(size, paddingRatio = 0.15, bgColor = null) {
  const pad = size * paddingRatio;
  const innerSize = size - pad * 2;
  const bgRect = bgColor ? `<rect width="${size}" height="${size}" fill="${bgColor}" rx="${bgColor === 'transparent' ? 0 : 0}" />` : '';

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      ${bgRect}
      <g transform="translate(${pad}, ${pad})">
        <svg viewBox="0 0 48 46" width="${innerSize}" height="${innerSize}">
          ${innerSvg}
        </svg>
      </g>
    </svg>
  `;
}

// Maskable icon requires safe area (safe zone is inner circle of 80% diameter -> 40% radius)
// We use 30% padding so the logo fits within 60% of canvas, well within safe zone.
function createMaskableSvgDocument(size, bgColor = '#1e293b') {
  const pad = size * 0.22;
  const innerSize = size - pad * 2;

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e1b4b" />
          <stop offset="50%" stop-color="#0f172a" />
          <stop offset="100%" stop-color="#1e293b" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#bgGrad)" />
      <g transform="translate(${pad}, ${pad})">
        <svg viewBox="0 0 48 46" width="${innerSize}" height="${innerSize}">
          ${innerSvg}
        </svg>
      </g>
    </svg>
  `;
}

async function generate() {
  console.log('Generating PWA icons...');

  // 1. Standard 192x192
  const svg192 = Buffer.from(createSvgDocument(192, 0.1));
  await sharp(svg192).resize(192, 192).png().toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 2. Standard 512x512
  const svg512 = Buffer.from(createSvgDocument(512, 0.1));
  await sharp(svg512).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // 3. Maskable 512x512
  const svgMaskable = Buffer.from(createMaskableSvgDocument(512, '#0f172a'));
  await sharp(svgMaskable).resize(512, 512).png().toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png');

  // 4. Apple Touch Icon 180x180 (no transparency for iOS)
  const svgApple = Buffer.from(createMaskableSvgDocument(180, '#0f172a'));
  await sharp(svgApple).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png');

  // 5. Small favicons
  const svg64 = Buffer.from(createSvgDocument(64, 0.05));
  await sharp(svg64).resize(64, 64).png().toFile(path.join(publicDir, 'pwa-64x64.png'));

  const svg32 = Buffer.from(createSvgDocument(32, 0.05));
  await sharp(svg32).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32x32.png'));

  const svg16 = Buffer.from(createSvgDocument(16, 0.05));
  await sharp(svg16).resize(16, 16).png().toFile(path.join(publicDir, 'favicon-16x16.png'));

  console.log('All icons generated successfully!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
