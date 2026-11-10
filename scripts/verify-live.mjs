import { createHash } from 'node:crypto';
import { appendFile, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, priceListInfo } from '../src/data/site.ts';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const homepage = await readFile(resolve(root, 'index.html'));
const styles = [...homepage.toString().matchAll(/href="(\/_astro\/[^"?#]+\.css)"/g)].map(match => match[1]);
if (!styles.length) throw new Error('The build does not reference a stylesheet.');
const files = [
  { path: '/', file: 'index.html', type: 'text/html' },
  ...styles.map(path => ({ path, file: path.slice(1), type: 'text/css' })),
  { path: priceListInfo.pdfPath, file: priceListInfo.pdfPath.slice(1), type: 'application/pdf' },
];
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const hostname = new URL(site.url).hostname.replace(/^www\./, '');
const allowedHosts = new Set([hostname, `www.${hostname}`]);

async function request(initial) {
  let url = initial;
  for (let redirects = 0; redirects <= 5; redirects++) {
    if (url.protocol !== 'https:' || !allowedHosts.has(url.hostname) || url.username || url.password) {
      throw new Error('Live checks allow only HTTPS on the configured domain and its www host.');
    }
    const response = await fetch(url, {
      headers: { 'Cache-Control': 'no-cache' },
      signal: AbortSignal.timeout(30_000),
      redirect: 'manual',
    });
    if (![301, 302, 303, 307, 308].includes(response.status)) return response;
    const location = response.headers.get('location');
    if (!location) throw new Error('The public website returned a redirect without a destination.');
    await response.body?.cancel();
    url = new URL(location, url);
  }
  throw new Error('The public website redirected too many times.');
}

async function verify() {
for (const item of files) {
  const url = new URL(item.path, site.url);
  if (url.protocol !== 'https:') throw new Error('Live checks require HTTPS.');
  url.searchParams.set('deployment', process.env.GITHUB_SHA || 'verification');
  const response = await request(url);
  if (response.status !== 200) throw new Error(`Live check failed for ${item.path}: HTTP ${response.status}.`);
  if (!(response.headers.get('content-type') || '').toLowerCase().includes(item.type)) {
    throw new Error(`Live check failed for ${item.path}: unexpected content type.`);
  }
  const actual = Buffer.from(await response.arrayBuffer());
  const expected = await readFile(resolve(root, item.file));
  if (hash(actual) !== hash(expected)) {
    throw new Error(`Live check failed for ${item.path}: the public file differs from this build. Check the domain destination, document root and caches.`);
  }
  console.log(`Verified HTTPS response and build contents: ${item.path}`);
}
}

try {
  await verify();
} catch (error) {
  const cause = error.cause?.code;
  const code = typeof cause === 'string' && /^[A-Z0-9_]+$/.test(cause) ? ` (${cause})` : '';
  const message = `Public HTTPS verification: ${error.message}${code}`;
  const escaped = message.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
  console.error(`::error title=Public website verification::${escaped}`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, `\n### Public website verification failed\n\n${message}\n`);
  }
  process.exitCode = 1;
}
