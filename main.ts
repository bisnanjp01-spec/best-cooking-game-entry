// main.ts — hands Hearth & Ember in to make.fun.
// Node 22 standard library only. Copies game/ and screenshots/ from this
// repository into the output directory and writes dossier.json there with
// buildDossier from vendor/makefun-game.ts. Deterministic: the same
// repository always writes the same bytes.

import { buildDossier } from './vendor/makefun-game.ts';
import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function copyTreeSorted(srcDir: string, destDir: string): void {
  mkdirSync(destDir, { recursive: true });
  const entries = readdirSync(srcDir).sort();
  for (const name of entries) {
    const src = join(srcDir, name);
    const dest = join(destDir, name);
    const st = statSync(src);
    if (st.isDirectory()) {
      copyTreeSorted(src, dest);
    } else if (st.isFile()) {
      cpSync(src, dest);
    }
  }
}

function main(): void {
  mkdirSync(outputDir, { recursive: true });
  const gameSrc = join(repoRoot, 'game');
  const shotsSrc = join(repoRoot, 'screenshots');
  if (!existsSync(gameSrc)) throw new Error('main.ts: game/ is missing from the repository');
  copyTreeSorted(gameSrc, join(outputDir, 'game'));
  if (existsSync(shotsSrc)) copyTreeSorted(shotsSrc, join(outputDir, 'screenshots'));
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

main();
