import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import { provingKeys } from '@penumbra-zone/types/src/proving-keys';

const VERSION_TAG = 'v0.68.0';

const githubSourceDir = `https://github.com/penumbra-zone/penumbra/raw/${VERSION_TAG}/crates/crypto/proof-params/src/gen/`;

const binDir = path.join('bin');

console.log('Downloading keys', VERSION_TAG, provingKeys.map(({ file }) => file).join(', '));

fs.mkdirSync(binDir, { recursive: true });
const downloads = provingKeys.map(async ({ file }) => {
  const outputPath = path.join(binDir, file);
  const downloadPath = new URL(`${githubSourceDir}${file}`);

  const response = await fetch(downloadPath);
  if (!response.ok) throw new Error(`Failed to fetch ${file}`);

  const fileStream = fs.createWriteStream(outputPath, { flags: 'w' });
  fileStream.write(Buffer.from(await response.arrayBuffer()));
  fileStream.end().close(() => {
    const size = fs.statSync(outputPath).size;
    const sizeMB = size / 1024 / 1024;
    console.log(`Downloaded ${sizeMB.toFixed(2)}MiB ${outputPath}`);
  });
});

void Promise.allSettled(downloads);
