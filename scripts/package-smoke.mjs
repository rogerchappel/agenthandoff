import { spawnSync } from 'node:child_process';
import { lstatSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';

const run = (command, args) => {
  const result = spawnSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
  return result.stdout;
};

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const dist = new URL('../dist/', import.meta.url);
const distPath = new URL('../dist', import.meta.url);
try {
  if (lstatSync(distPath).isSymbolicLink()) {
    throw new Error('dist is a symbolic link');
  }
} catch (error) {
  if (error.code !== 'ENOENT') {
    console.error(`Refusing unsafe package smoke target: ${error.message}`);
    process.exit(1);
  }
}
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
writeFileSync(new URL('stale-package-smoke.txt', dist), 'npm pack must replace this stale tree\n');
const output = run('npm', ['pack', '--dry-run', '--json']);
const [pack] = JSON.parse(output);
const included = new Set(pack.files.map((file) => file.path));

const expected = new Set();
const addPath = (value) => {
  if (typeof value === 'string' && !value.startsWith('#')) {
    expected.add(value.replace(/^\.\//, ''));
  }
};
const walkExports = (value) => {
  if (typeof value === 'string') {
    addPath(value);
  } else if (value && typeof value === 'object') {
    for (const nested of Object.values(value)) {
      walkExports(nested);
    }
  }
};

if (typeof pkg.bin === 'string') {
  addPath(pkg.bin);
} else if (pkg.bin && typeof pkg.bin === 'object') {
  for (const target of Object.values(pkg.bin)) {
    addPath(target);
  }
}
addPath(pkg.main);
addPath(pkg.types);
walkExports(pkg.exports);

const missing = [...expected].filter((file) => !included.has(file));
if (missing.length > 0) {
  console.error('Package tarball is missing declared entrypoints:');
  for (const file of missing) {
    console.error(`- ${file}`);
  }
  process.exit(1);
}

if (included.has('dist/stale-package-smoke.txt')) {
  console.error('Package tarball includes stale build output.');
  process.exit(1);
}

console.log(`Package tarball includes ${expected.size} declared entrypoint(s).`);
