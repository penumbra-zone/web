import { load_proving_key as wasmLoadProvingKey } from '@penumbra-zone/wasm-bundler';

export const loadLocalBinary = async (filename: string) => {
  const response = await fetch(`bin/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${filename}`);
  }

  return await response.arrayBuffer();
};

export const loadProvingKey = async (file: string, keyType: string) => {
  const response = await loadLocalBinary(file);
  wasmLoadProvingKey(response, keyType);
};
