import { readFile, rm, symlink } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Astro 6 uses Vite 7, but the lockfile also installs Vite 8 for Tailwind.
// Resolve both integrations through Astro's already verified Vite installation.
// Only generated node_modules is changed; package declarations stay untouched.
const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const astroRequire = createRequire(require.resolve('astro/package.json'));
const astroVite = dirname(astroRequire.resolve('vite/package.json'));
const sharedVite = resolve(root, 'node_modules/vite');
const version = async (directory) => JSON.parse(await readFile(resolve(directory, 'package.json'), 'utf8')).version;
const expectedVersion = await version(astroVite);
const sharedVersion = await version(sharedVite);

if (!expectedVersion.startsWith('7.')) {
  throw new Error('Review the Vite compatibility helper when upgrading Astro.');
}
if (sharedVersion !== expectedVersion) {
  if (astroVite === sharedVite) throw new Error('Cannot resolve a separate compatible Vite installation.');
  await rm(sharedVite, { recursive: true, force: true });
  const windows = process.platform === 'win32';
  await symlink(windows ? astroVite : relative(dirname(sharedVite), astroVite), sharedVite, windows ? 'junction' : 'dir');
}
console.log(`Astro and Tailwind use Vite ${expectedVersion}.`);
