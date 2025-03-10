/* eslint-disable -- this file doesn't have to support all regular eslint rules */

import { type SpawnOptionsWithoutStdio, spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { argv, exit } from 'node:process';
import url, { URL } from 'node:url';

// ----- utils
const usage = (reason?: string) => {
  console.warn(reason);
  console.warn(
    `Usage: ${basename(argv[1] as string)} <tarball0.tgz> [tarball1.tgz] [tarball2.tgz] ...`,
  );
  console.warn("Each tarball should have an accompanying 'package.json' in the same directory.");
  return 1;
};

const cmd = (exec: string, args?: string[], options?: SpawnOptionsWithoutStdio) =>
  new Promise<void>((resolve, reject) => {
    console.log(exec, ...(args ?? []));
    const run = spawn(exec, args ?? [], { ...options, stdio: 'inherit' });
    run.on('error', reject);
    run.on('exit', code => (code ? exit(code) : resolve()));
  });

const readJson = async (fileUrl: URL): Promise<unknown> =>
  JSON.parse((await fs.readFile(fileUrl)).toString());

const isPackageJsonWithName = (packageJson: unknown): packageJson is { name: string } =>
  typeof packageJson === 'object' &&
  packageJson !== null &&
  'name' in packageJson &&
  typeof packageJson.name === 'string';

// ----- main

const tarballs = argv.slice(2);

if (!tarballs.length) exit(usage('Missing tarball filenames'));
if (!tarballs.every(fn => fn.endsWith('.tgz')))
  exit(usage("Tarball filenames must end with '.tgz'"));

// absolute file URLs
const tarballUrls = tarballs.map(tarball => url.pathToFileURL(resolve(tarball)));

// create record of package name to tarball path
const overrides: Record<string, URL> = Object.fromEntries(
  await Promise.all(
    tarballUrls.map(async tarballUrl => {
      // TODO: the correct package.json is inside the tarball

      const tarballPackageJson = await readJson(
        // assume package.json exists in same directory as the tarball
        // (default behavior of npm pack)
        new URL('package.json', tarballUrl),
      );

      if (!isPackageJsonWithName(tarballPackageJson))
        throw new TypeError(`Invalid package.json adjacent to ${tarballUrl}`);

      return [tarballPackageJson.name, tarballUrl];
    }),
  ),
);

for (const [name, tarballUrl] of Object.entries(overrides)) {
  await cmd('pnpm', ['pkg', 'set', `pnpm.overrides.${name}=${tarballUrl}`]);
  await cmd('pnpm', ['pkg', 'set', `pnpm.peerDependencyRules.allowAny[].=${name}`]);
}

await cmd('pnpm', ['install']);
