import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const requiredFiles = [
  'docs/td-redesign/00-repo-audit-and-goal.md',
  'docs/td-redesign/01-product-gdd-core-loop.md',
  'docs/td-redesign/02-technical-architecture.md',
  'docs/td-redesign/03-art-style-and-ai-asset-pipeline.md',
  'docs/td-redesign/04-hero-character-spec.md',
  'docs/td-redesign/05-enemy-and-boss-spec.md',
  'docs/td-redesign/06-stage-map-and-wave-design.md',
  'docs/td-redesign/07-phase-0-design-lock.md',
  'docs/td-redesign/18-ai-task-prompts.md',
  'docs/td-redesign/20-acceptance-checklists.md',
  'docs/td-redesign/21-stage-0-implementation-notes.md',
];

function assertRule(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`[verify-td-design-docs] ${message}`);
  }
}

for (const relative of requiredFiles) {
  const absolute = join(process.cwd(), relative);
  assertRule(existsSync(absolute), `missing required file: ${relative}`);
  const content = readFileSync(absolute, 'utf8');
  assertRule(content.trim().length > 200, `file is unexpectedly short: ${relative}`);
}

const heroSpec = readFileSync(join(process.cwd(), 'docs/td-redesign/04-hero-character-spec.md'), 'utf8');
for (const keyword of ['弓箭手', '法师', '战士', '骑士', '刺客', '牧师', 'idle', 'attack', 'death', '256x256']) {
  assertRule(heroSpec.includes(keyword), `hero spec should include ${keyword}`);
}

const enemySpec = readFileSync(join(process.cwd(), 'docs/td-redesign/05-enemy-and-boss-spec.md'), 'utf8');
for (const keyword of ['软泥仔', '木盾兵', '火羽蝠', '城门魔像', 'move', 'hit', 'death', '192x192']) {
  assertRule(enemySpec.includes(keyword), `enemy spec should include ${keyword}`);
}

const artSpec = readFileSync(join(process.cwd(), 'docs/td-redesign/03-art-style-and-ai-asset-pipeline.md'), 'utf8');
for (const keyword of ['assets/resources/textures/td', '透明背景', '1280x720', 'manifest', 'verify-td-art-resources']) {
  assertRule(artSpec.includes(keyword), `art pipeline should include ${keyword}`);
}

console.log('[verify-td-design-docs] all required design docs exist');
