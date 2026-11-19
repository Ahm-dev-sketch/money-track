import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SVG_PATH = join(ROOT, "public", "icons", "icon.svg");
const OUT_DIR = join(ROOT, "public", "icons");
const APP_DIR = join(ROOT, "app");

const svgBuffer = readFileSync(SVG_PATH);

async function main() {
  console.log("Generating crystal-clear PNG icons from SVG...");

  // 1. 512x512 Master PWA icon
  await sharp(svgBuffer)
    .resize(512, 512)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(join(OUT_DIR, "icon-512.png"));
  console.log("✓ Created icon-512.png");

  // 2. 192x192 PWA icon
  await sharp(svgBuffer)
    .resize(192, 192)
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(join(OUT_DIR, "icon-192.png"));
  console.log("✓ Created icon-192.png");

  // 3. 512x512 Maskable icon (with safe padding for Android adaptive icons)
  await sharp(svgBuffer)
    .resize(410, 410)
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 14, g: 61, b: 50, alpha: 1 },
    })
    .png({ quality: 100, compressionLevel: 9 })
    .toFile(join(OUT_DIR, "icon-maskable-512.png"));
  console.log("✓ Created icon-maskable-512.png");

  // 4. 32x32 favicon
  const fav32 = await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toBuffer();

  writeFileSync(join(ROOT, "public", "favicon.ico"), fav32);
  writeFileSync(join(APP_DIR, "favicon.ico"), fav32);
  console.log("✓ Created favicon.ico in public/ and app/");

  console.log("All icons successfully generated!");
}

main().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
