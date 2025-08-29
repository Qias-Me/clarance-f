#!/usr/bin/env node
/**
 * Publish validation artifacts to /public for UI consumption
 * - Copies api/PDFphotos/*.png -> public/validation/photos/
 * - Copies api/PDFoutput/*.json -> public/validation/output/
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function copyDir(src, dst, filter) {
  try {
    const items = await fs.readdir(src);
    await ensureDir(dst);
    for (const name of items) {
      if (filter && !filter(name)) continue;
      const s = path.join(src, name);
      const d = path.join(dst, name);
      const stat = await fs.stat(s);
      if (stat.isFile()) {
        await fs.copyFile(s, d);
        console.log(`📦 ${path.relative(__dirname, d)}`);
      }
    }
  } catch (e) {
    console.warn(`⚠️  Skipped copy from ${src}: ${e.message}`);
  }
}

async function main() {
  const photosSrc = path.join(__dirname, '..', 'api', 'PDFphotos');
  const outputSrc = path.join(__dirname, '..', 'api', 'PDFoutput');
  const photosDst = path.join(__dirname, '..', 'public', 'validation', 'photos');
  const outputDst = path.join(__dirname, '..', 'public', 'validation', 'output');

  await ensureDir(photosDst);
  await ensureDir(outputDst);

  await copyDir(photosSrc, photosDst, (n) => n.toLowerCase().endsWith('.png'));
  await copyDir(outputSrc, outputDst, (n) => n.toLowerCase().endsWith('.json'));

  console.log('✅ Published validation artifacts to /public/validation');
}

main().catch(err => {
  console.error('❌ Failed to publish artifacts:', err);
  process.exit(1);
});
