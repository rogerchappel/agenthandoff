import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
  return result.stdout;
};

const root = dirname(fileURLToPath(import.meta.url));
const project = join(root, '..');
const pkg = JSON.parse(readFileSync(join(project, 'package.json'), 'utf8'));
const temp = mkdtempSync(join(tmpdir(), 'agenthandoff-package-smoke-'));
try {
  const stage = join(temp, 'package');
  mkdirSync(join(stage, 'dist'), { recursive: true });
  cpSync(join(project, 'dist'), join(stage, 'dist'), { recursive: true });
  writeFileSync(join(stage, 'dist/stale-package-smoke.txt'), 'npm pack must exclude this stale tree\n');
  const stagedPkg = { ...pkg, scripts: {} };
  delete stagedPkg.devDependencies;
  delete stagedPkg.engines;
  writeFileSync(join(stage, 'package.json'), JSON.stringify(stagedPkg));
  for (const entry of ['examples', 'README.md', 'LICENSE', 'SECURITY.md', 'CHANGELOG.md', 'CONTRIBUTING.md']) {
    const source = join(project, entry);
    if (existsSync(source)) cpSync(source, join(stage, entry), { recursive: true });
  }
  const env = { ...process.env, npm_config_cache: join(temp, 'cache') };
  const archive = run('npm', ['pack', '--json'], { cwd: stage, env }).trim();
  const [pack] = JSON.parse(archive);
  const tarball = join(stage, pack.filename);
  const listing = run('tar', ['-tzf', tarball]);
  const included = new Set(listing.split(/\r?\n/).filter(Boolean).map((path) => path.replace(/^package\//, '')));

  const expected = new Set();
  const addPath = (value) => {
    if (typeof value === 'string' && !value.startsWith('#')) expected.add(value.replace(/^\.\//, ''));
  };
  const walkExports = (value) => {
    if (typeof value === 'string') addPath(value);
    else if (value && typeof value === 'object') for (const nested of Object.values(value)) walkExports(nested);
  };
  if (typeof pkg.bin === 'string') addPath(pkg.bin);
  else if (pkg.bin && typeof pkg.bin === 'object') for (const target of Object.values(pkg.bin)) addPath(target);
  addPath(pkg.main);
  addPath(pkg.types);
  walkExports(pkg.exports);

  const missing = [...expected].filter((file) => !included.has(file));
  if (missing.length > 0) {
    console.error('Package tarball is missing declared entrypoints:');
    for (const file of missing) console.error(`- ${file}`);
    process.exitCode = 1;
  } else {
    console.log(`Package tarball includes ${expected.size} declared entrypoint(s).`);
  }
  if (included.has('dist/stale-package-smoke.txt')) {
    console.error('Package tarball includes stale build output.');
    process.exitCode = 1;
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
}
