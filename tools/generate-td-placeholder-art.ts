import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { TD_ART_MANIFEST } from '../assets/scripts/td/config/td-art-manifest';

// 1x1 transparent PNG. This generator is intentionally dependency-free.
// The ZIP already ships larger generated placeholders; this script exists as a fallback.
const transparentPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAFgwJ/lwD8WQAAAABJRU5ErkJggg==';
const data = Buffer.from(transparentPngBase64, 'base64');

for (const entry of TD_ART_MANIFEST) {
  const absolute = join(process.cwd(), entry.path);
  mkdirSync(dirname(absolute), { recursive: true });
  writeFileSync(absolute, data);
}

console.log(`[generate-td-placeholder-art] wrote ${TD_ART_MANIFEST.length} fallback placeholder files`);
