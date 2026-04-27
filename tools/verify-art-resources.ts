import { ART_RESOURCE_MANIFEST } from '../assets/scripts/config/art-resource-manifest';
import type { UnitArtEntry } from '../assets/scripts/config/art-resource-manifest';
import type { EnemyId, UnitId } from '../assets/scripts/models/types';

declare const process: {
  argv: string[];
  cwd(): string;
  exit(code?: number): never;
};
declare function require(moduleName: string): unknown;

type FsStat = {
  isDirectory(): boolean;
};

const { randomUUID } = require('crypto') as { randomUUID(): string };
const { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } = require('fs') as {
  existsSync(filePath: string): boolean;
  mkdirSync(filePath: string, options: { recursive: boolean }): void;
  readFileSync(filePath: string): {
    length: number;
    subarray(start: number, end?: number): { toString(encoding: 'ascii' | 'hex'): string };
    readUInt32BE(offset: number): number;
  };
  readdirSync(filePath: string): string[];
  statSync(filePath: string): FsStat;
  writeFileSync(filePath: string, content: string, encoding: 'utf8'): void;
};
const path = require('path') as {
  basename(filePath: string, extension?: string): string;
  dirname(filePath: string): string;
  extname(filePath: string): string;
  resolve(...paths: string[]): string;
};

type ResourceIssue = {
  kind: 'missing-file' | 'missing-meta' | 'invalid-png';
  path: string;
  detail?: string;
};

const root = process.cwd();
const writeMeta = process.argv.includes('--write-meta');
const clips = ['move', 'attack', 'death_fall', 'corpse_fade'] as const;
const issues: ResourceIssue[] = [];
let createdMetaCount = 0;

const toAbs = (relativePath: string): string => path.resolve(root, relativePath);

const exists = (relativePath: string): boolean => existsSync(toAbs(relativePath));

const addIssue = (kind: ResourceIssue['kind'], relativePath: string, detail?: string): void => {
  issues.push({ kind, path: relativePath, detail });
};

const imageMeta = (filename: string): string => {
  const uuid = randomUUID();
  const displayName = path.basename(filename, path.extname(filename));
  return `${JSON.stringify({
    ver: '1.0.22',
    importer: 'image',
    imported: true,
    uuid,
    files: ['.png', '.json'],
    subMetas: {
      '6c48a': {
        importer: 'texture',
        uuid: `${uuid}@6c48a`,
        displayName,
        id: '6c48a',
        name: 'texture',
        userData: {
          wrapModeS: 'repeat',
          wrapModeT: 'repeat',
          minfilter: 'linear',
          magfilter: 'linear',
          mipfilter: 'none',
          anisotropy: 0,
          isUuid: true,
          imageUuidOrDatabaseUri: uuid,
        },
        ver: '1.0.21',
        imported: true,
        files: ['.json'],
        subMetas: {},
      },
    },
    userData: {
      hasAlpha: true,
      type: 'texture',
      redirect: `${uuid}@6c48a`,
    },
  }, null, 2)}\n`;
};

const directoryMeta = (): string => `${JSON.stringify({
  ver: '1.1.0',
  importer: 'directory',
  imported: true,
  uuid: randomUUID(),
  files: [],
  subMetas: {},
  userData: {
    compressionType: {},
    isRemoteBundle: {},
  },
}, null, 2)}\n`;

const ensureMeta = (relativePath: string, type: 'image' | 'directory'): void => {
  const metaPath = `${relativePath}.meta`;
  if (exists(metaPath)) return;

  addIssue('missing-meta', metaPath);
  if (!writeMeta) return;

  const absMetaPath = toAbs(metaPath);
  mkdirSync(path.dirname(absMetaPath), { recursive: true });
  writeFileSync(absMetaPath, type === 'image' ? imageMeta(relativePath) : directoryMeta(), 'utf8');
  createdMetaCount += 1;
};

const checkFile = (relativePath: string): void => {
  if (!exists(relativePath)) {
    addIssue('missing-file', relativePath);
    return;
  }
  if (relativePath.endsWith('.png')) {
    checkPng(relativePath);
  }
  ensureMeta(relativePath, 'image');
};

const checkDirectory = (relativePath: string): void => {
  if (!exists(relativePath)) {
    addIssue('missing-file', relativePath);
    return;
  }
  ensureMeta(relativePath, 'directory');
};

const listDirectories = (relativePath: string): string[] => {
  if (!exists(relativePath)) return [];

  const found: string[] = [];
  const visit = (current: string): void => {
    found.push(current);
    for (const name of readdirSync(toAbs(current))) {
      const child = `${current}/${name}`;
      if (statSync(toAbs(child)).isDirectory()) visit(child);
    }
  };
  visit(relativePath);
  return found;
};

const listPngFiles = (relativePath: string): string[] => {
  if (!exists(relativePath)) return [];

  const found: string[] = [];
  const visit = (current: string): void => {
    for (const name of readdirSync(toAbs(current))) {
      const child = `${current}/${name}`;
      if (statSync(toAbs(child)).isDirectory()) {
        visit(child);
      } else if (child.endsWith('.png')) {
        found.push(child);
      }
    }
  };
  visit(relativePath);
  return found;
};

const checkPng = (relativePath: string): void => {
  const data = readFileSync(toAbs(relativePath));
  const signature = data.subarray(0, 8).toString('hex');
  if (signature !== '89504e470d0a1a0a') {
    addIssue('invalid-png', relativePath, 'bad PNG signature');
    return;
  }

  let offset = 8;
  let foundEnd = false;
  while (offset < data.length) {
    if (offset + 8 > data.length) {
      addIssue('invalid-png', relativePath, 'truncated chunk header');
      return;
    }

    const length = data.readUInt32BE(offset);
    const type = data.subarray(offset + 4, offset + 8).toString('ascii');
    const nextOffset = offset + 12 + length;
    if (nextOffset > data.length) {
      addIssue('invalid-png', relativePath, `truncated ${type} chunk`);
      return;
    }

    offset = nextOffset;
    if (type === 'IEND') {
      foundEnd = true;
      break;
    }
  }

  if (!foundEnd) {
    addIssue('invalid-png', relativePath, 'missing IEND chunk');
  }
};

const unitFrame = (entry: UnitArtEntry, unitId: UnitId, clip: string, index: number): string => {
  return `${entry.directory}/${unitId}_${clip}_${String(index).padStart(2, '0')}.png`;
};

const resourceToFilePath = (resourcePath: string): string => {
  return resourcePath.startsWith('textures/')
    ? `assets/resources/${resourcePath}.png`
    : resourcePath;
};

const checkUnit = (unitId: UnitId, entry: UnitArtEntry): void => {
  checkDirectory(entry.directory);

  for (const star of [1, 2, 3] as const) {
    const explicitStar = entry.starSprites?.[star];
    if (explicitStar) checkFile(resourceToFilePath(explicitStar));
    const filename = entry.stars?.[star];
    if (filename) checkFile(`${entry.directory}/${filename}`);
  }

  if (entry.portrait) checkFile(resourceToFilePath(entry.portrait.startsWith('textures/') ? entry.portrait : `${entry.directory}/${entry.portrait}`));
  if (entry.divineOverride) checkFile(`${entry.directory}/${entry.divineOverride}`);

  for (const frames of [entry.idleFrames, entry.moveFrames, entry.attackFrames, entry.hurtFrames, entry.deathFrames]) {
    for (const frame of frames ?? []) checkFile(resourceToFilePath(frame));
  }

  if (entry.idleFrames || entry.moveFrames || entry.attackFrames || entry.hurtFrames || entry.deathFrames) return;

  for (const clip of clips) {
    for (let index = 1; index <= 5; index += 1) {
      checkFile(unitFrame(entry, unitId, clip, index));
    }
  }
};

const checkEnemy = (enemyId: EnemyId, staticPath: string): void => {
  const directory = staticPath.split('/').slice(0, -1).join('/');
  checkDirectory(directory);
  checkFile(staticPath);

  for (const clip of clips) {
    for (let index = 1; index <= 5; index += 1) {
      checkFile(`${directory}/${enemyId}_${clip}_${String(index).padStart(2, '0')}.png`);
    }
  }
};

for (const directory of listDirectories('assets/resources/textures/units')) {
  checkDirectory(directory);
}
for (const directory of listDirectories('assets/resources/textures/enemies')) {
  checkDirectory(directory);
}
for (const pngFile of listPngFiles('assets/resources/textures')) {
  ensureMeta(pngFile, 'image');
}

for (const [unitId, entry] of Object.entries(ART_RESOURCE_MANIFEST.units) as Array<[UnitId, UnitArtEntry]>) {
  checkUnit(unitId, entry);
}
for (const [enemyId, staticPath] of Object.entries(ART_RESOURCE_MANIFEST.enemies) as Array<[EnemyId, string]>) {
  checkEnemy(enemyId, staticPath);
}

const missingFiles = issues.filter((issue) => issue.kind === 'missing-file');
const missingMetas = issues.filter((issue) => issue.kind === 'missing-meta');
const invalidPngs = issues.filter((issue) => issue.kind === 'invalid-png');

if (missingFiles.length > 0) {
  console.error('Art resource verification failed: missing files');
  for (const issue of missingFiles) console.error(`- ${issue.path}`);
  process.exit(1);
}

if (invalidPngs.length > 0) {
  console.error('Art resource verification failed: invalid PNG files');
  for (const issue of invalidPngs) console.error(`- ${issue.path}: ${issue.detail ?? 'invalid PNG'}`);
  process.exit(1);
}

if (missingMetas.length > 0 && !writeMeta) {
  console.error('Art resource verification failed: missing Cocos meta files');
  for (const issue of missingMetas) console.error(`- ${issue.path}`);
  console.error('Run `npm run verify:art -- --write-meta` to generate deterministic importer-shaped meta files with fresh UUIDs.');
  process.exit(1);
}

if (createdMetaCount > 0) {
  console.log(`Art resources verified. Created ${createdMetaCount} missing .meta files.`);
} else {
  console.log('Art resources verified.');
}
