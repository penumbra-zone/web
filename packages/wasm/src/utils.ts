import { load_proving_key as wasmLoadProvingKey } from '@penumbra-zone/wasm-bundler';
import { provingKeys } from '../src/../../types/src/proving-keys';

export const loadLocalBinary = async (filename: string) => {
  const response = await fetch(`bin/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${filename}`);
  }

  return await response.arrayBuffer();
};

export const loadProvingKeys = async () => {
  const promises = provingKeys.map(async ({ file, keyType }) => {
    const response = await loadLocalBinary(file);
    wasmLoadProvingKey(response, keyType);
  });
  await Promise.all(promises);
};
