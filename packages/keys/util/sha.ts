import { createHash } from 'node:crypto';
import fsP from 'node:fs/promises';
import path from 'node:path';
import { stdout, stderr as console } from './io';

export const writeChecksums = (writePath: string, filePaths: string[], cwd?: string) =>
  fsP.writeFile(
    writePath,
    filePaths
      .map(
        name =>
          // sha256 + two spaces + bare filename
          `${shaDigest(cwd ? path.join(cwd, name) : name)}  ${name}`,
      )
      .join('\n'),
  );

export const readChecksums = (manifestPath: string) =>
  fsP.readFile(manifestPath).then(manifest =>
    manifest
      .toString()
      .split('\n')
      .filter(id => id) // remove blank lines
      .map((line: string): [string, string] => {
        const [_line, sha256sum, name] = line.match(/^([0-9a-f]{64}) {2}([a-z_]+_pk.bin)$/)!;
        return [sha256sum, name];
      }),
  );

const shaDigest = (filePath: string) =>
  fsP.readFile(filePath).then(keyData => createHash('sha256').update(keyData).digest('hex'));

export const check = (sums: [string, string][], checkDir: string) =>
  sums.map(async ([expectSha, name]) => {
    const filePath = path.resolve(checkDir, name);
    const checkSha = await shaDigest(filePath);
    if (expectSha === checkSha) {
      console.log(`${name}: OK`);
      stdout.log(filePath);
    } else {
      console.log(`${name}: FAILED`);
      process.exitCode ??= 0;
      process.exitCode++;
      throw new Error(`Digest of ${name} is ${checkSha} and does not match expected ${expectSha}`);
    }
  });
