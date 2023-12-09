import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';

const githubSourceDir =
  'https://github.com/penumbra-zone/penumbra/raw/main/crates/crypto/proof-params/src/gen/';

const provingKeyFiles = [
  { file: 'spend_pk.bin' },
  { file: 'output_pk.bin' },
  { file: 'swap_pk.bin' },
  { file: 'swapclaim_pk.bin' },
  { file: 'nullifier_derivation_pk.bin' },
  { file: 'delegator_vote_pk.bin' },
  { file: 'undelegateclaim_pk.bin' },
];

const binaryFilesDir = path.join('dist/bin');

const downloadProvingKeys = async () => {
  // Check if the bin directory already exists. Subsequent builds will not
  // re-download the keys. To do so, remove the dist directory and rebuild.
  if (fs.existsSync(binaryFilesDir)) return;

  fs.mkdirSync(binaryFilesDir, { recursive: true });

  const promises = provingKeyFiles.map(async ({ file }) => {
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

downloadProvingKeys();
