import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import { provingKeys } from '@penumbra-zone/types/src/proving-keys';

// TODO: When v0.65.0 launches, change this back to a git tag path
const githubSourceDir =
  'https://github.com/penumbra-zone/penumbra/raw/main/crates/crypto/proof-params/src/gen/';

const binaryFilesDir = path.join('bin');

const downloadProvingKeys = async () => {
  // Check if the bin directory already exists. Subsequent builds will not
  // re-download the keys. To do so, remove the dist directory and rebuild.
  if (fs.existsSync(binaryFilesDir)) return;

  fs.mkdirSync(binaryFilesDir, { recursive: true });

  const promises = provingKeys.map(async ({ file }) => {
    const response = await fetch(`${githubSourceDir}${file}`);
    if (!response.ok) throw new Error(`Failed to fetch ${file}`);

    const buffer = await response.arrayBuffer();

    const outputPath = path.join(binaryFilesDir, file);
    const fileStream = fs.createWriteStream(outputPath, { flags: 'a' });
    fileStream.write(Buffer.from(buffer));
    fileStream.end();
    console.log(`Proving key ${file} downloaded to ${outputPath}`);
  });

  await Promise.all(promises);
};

void downloadProvingKeys();
