#!/usr/bin/env pnpm tsx
/// <reference types="node" />

import fs from 'node:fs/promises';
import path from 'node:path';
import url from 'node:url';
import { version as pkgVersion } from './package.json';
import { curlKeys } from './util/curl';
import { fileExists } from './util/file';
import { checkoutKeys } from './util/git';
import { stderr as console, stdout } from './util/io';
import { check, readChecksums, writeChecksums } from './util/sha';

const monorepoRoot = await import('workspace-root').then(
  ({ workspaceRoot }) => workspaceRoot(),
  () => null,
);

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const clonePath = path.resolve(__dirname, 'penumbra');
const penumbraGh = new URL('https://github.com/penumbra-zone/penumbra/');
const releaseManifestPath = 'releases/latest/download/dist-manifest.json';
const repoPath = 'crates/crypto/proof-params/src/gen';
const versionDefault = 'v' + pkgVersion;

const a = [undefined, ...process.argv];
const o = {
  check: !a.includes('--no-check') || a.includes('--checksums'),
  download: !a.includes('--no-download'),
  checksums: a[a.indexOf('--checksums') + 1],
  clobber: a.includes('--clobber') || a.includes('--force'),
  latest: a.includes('--latest'),
  output: a[a.indexOf('--output') + 1],
  source: a[a.indexOf('--source') + 1],
  version: a[a.indexOf('--version') + 1],
};

const gitTag = o.latest
  ? await fetch(new URL(releaseManifestPath, penumbraGh)).then(async response => {
      const manifest: unknown = await response.json();
      if (
        !manifest ||
        typeof manifest !== 'object' ||
        !('announcement_tag' in manifest) ||
        typeof manifest['announcement_tag'] !== 'string'
      )
        throw new Error('Unable to identify release version tag');
      return manifest['announcement_tag'];
    })
  : o.version || versionDefault;

if (gitTag !== versionDefault) console.log('Using keys version', gitTag);

const ghRepoRoot = new URL(`raw/${gitTag}/`, penumbraGh);

let keySource = new URL(repoPath, ghRepoRoot);

if (o.source)
  keySource = URL.canParse(o.source)
    ? new URL(o.source)
    : url.pathToFileURL(path.resolve(o.source));

const outDir = path.resolve(o.output ?? path.join(monorepoRoot ?? __dirname, 'keys', gitTag));
const checksumsPath = path.resolve(o.checksums ?? path.join(__dirname, `${gitTag}.sha256`));

if (!(await fileExists(checksumsPath))) {
  if (o.source || o.checksums || gitTag === versionDefault)
    throw new Error(`Checksums ${checksumsPath} not found`);
  else if (o.latest || o.version) {
    await checkoutKeys(penumbraGh.href, clonePath, gitTag, repoPath);
    const gen = path.join(clonePath, repoPath);
    const clonedKeyFiles = (await fs.readdir(gen)).filter(f => f.endsWith('_pk.bin'));
    await writeChecksums(checksumsPath, clonedKeyFiles, gen);
    keySource = url.pathToFileURL(path.resolve(clonePath, repoPath));
  }
}

const checksums = await readChecksums(checksumsPath);
const keyFiles = checksums.map(([_, name]) => name);

if (!o.download) console.log('Skipping download');
else await curlKeys(keyFiles, keySource.href, outDir, o.clobber);

if (!o.check) console.log('Skipping integrity check');
else {
  const checks = check(checksums, outDir);
  await Promise.allSettled(checks);
  await Promise.all(checks).catch(() => console.log('Integrity check failed.'));
}
