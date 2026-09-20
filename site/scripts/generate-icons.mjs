// Renders the committed social/icon PNGs from their SVG sources.
//
// The PNGs are committed and served from `public/`, so this script is a
// developer tool, not part of the build: running it requires a font stack for
// the SVG text and its output would not be byte-identical across machines.
// Re-run `npm run generate:icons` after editing `assets/og.svg` or
// `public/favicon.svg` and commit the regenerated PNGs.
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const siteRoot = new URL('../', import.meta.url);
const source = (path) => fileURLToPath(new URL(path, siteRoot));
const output = (path) => fileURLToPath(new URL(path, siteRoot));

mkdirSync(output('public'), { recursive: true });

// Social preview card. Rendered denser than needed and downscaled so the text
// lands on the 1200x630 size every crawler expects.
const og = await sharp(source('assets/og.svg'), { density: 288 })
    .resize(1200, 630)
    .png({ compressionLevel: 9 })
    .toFile(output('public/og.png'));

// Apple touch icons are drawn as opaque squares; the rounded corners of the
// favicon glyph are flattened into the brand background.
const appleTouchIcon = await sharp(source('public/favicon.svg'), { density: 288 })
    .resize(180, 180)
    .flatten({ background: '#00531f' })
    .png({ compressionLevel: 9 })
    .toFile(output('public/apple-touch-icon.png'));

console.log(`og.png            ${og.width}x${og.height}`);
console.log(`apple-touch-icon  ${appleTouchIcon.width}x${appleTouchIcon.height}`);
