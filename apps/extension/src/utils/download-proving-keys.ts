import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import { provingKeys } from '@penumbra-zone/wasm/src/proving-keys';

const main = () => {
  const VERSION_TAG = 'v0.68.0';

  const githubSourceDir = `https://github.com/penumbra-zone/penumbra/raw/${VERSION_TAG}/crates/crypto/proof-params/src/gen/`;

  const binDir = path.join('bin');

  console.log('Downloading keys', VERSION_TAG, Object.values(provingKeys).join(', '));

  fs.mkdirSync(binDir, { recursive: true });
  const downloads = Object.values(provingKeys).map(async name => {
    const file = `${name}_pk.bin`;
    const outputPath = path.join(binDir, file);

    // Check if the file already exists
    if (fs.existsSync(outputPath)) {
      console.log(`${file} already downloaded.`);
      return;
    }

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
};

main();
