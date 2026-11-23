import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = process.cwd();
const manifest = JSON.parse(await readFile(join(root, 'package.json'), 'utf8')) as {
  name: string;
  main: string;
  types: string;
  bin: Record<string, string>;
  exports: Record<string, { import: string; types: string }>;
  files: string[];
};

test('package metadata points to published entry points', () => {
  assert.equal(manifest.main, './dist/src/index.js');
  assert.equal(manifest.types, './dist/src/index.d.ts');
  assert.equal(manifest.bin.agenthandoff, './dist/src/cli.js');
  assert.equal(manifest.exports['.']?.import, './dist/src/index.js');
  assert.equal(manifest.exports['.']?.types, './dist/src/index.d.ts');
  for (const path of [manifest.main, manifest.types, manifest.bin.agenthandoff, manifest.exports['.']!.import, manifest.exports['.']!.types]) {
    assert.ok(manifest.files.some((included) => path.startsWith(`./${included}/`)), `${path} is not covered by files`);
  }
});

test('npm pack includes entry points and excludes development files', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'agenthandoff-pack-'));
  try {
    const output = execFileSync('npm', ['pack', '--json', '--pack-destination', temp], { cwd: root, encoding: 'utf8' });
    const [pack] = JSON.parse(output) as [{ files: Array<{ path: string }> }];
    const paths = new Set(pack.files.map(({ path }) => path));
    for (const path of ['package.json', 'README.md', 'LICENSE', 'dist/src/index.js', 'dist/src/index.d.ts', 'dist/src/cli.js', 'examples']) {
      assert.ok([...paths].some((item) => item === path || item.startsWith(`${path}/`)), `packed archive omits ${path}`);
    }
    assert.ok(![...paths].some((path) => path.startsWith('test/')), 'test files should not ship');
    assert.ok(![...paths].some((path) => path.startsWith('.github/')), 'workflow files should not ship');
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});
