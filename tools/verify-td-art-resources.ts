import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { TD_ART_MANIFEST } from '../assets/scripts/td/config/td-art-manifest';

function assertRule(condition: boolean, message: string): void {
  if (!condition) throw new Error(`[verify-td-art-resources] ${message}`);
}

function readPngSize(path: string): { width: number; height: number } {
  const buffer = readFileSync(path);
  assertRule(buffer.length > 24, `${path} should not be empty`);
  assertRule(buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47, `${path} should be PNG`);
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

assertRule(TD_ART_MANIFEST.length > 100, 'manifest should include generated TD resources');

for (const entry of TD_ART_MANIFEST) {
  const absolute = join(process.cwd(), entry.path);
  assertRule(existsSync(absolute), `missing ${entry.path}`);
  const size = readPngSize(absolute);
  assertRule(size.width === entry.width, `${entry.path} width should be ${entry.width}, got ${size.width}`);
  assertRule(size.height === entry.height, `${entry.path} height should be ${entry.height}, got ${size.height}`);
}

console.log(`[verify-td-art-resources] checked ${TD_ART_MANIFEST.length} resources`);
