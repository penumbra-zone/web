import { load_proving_key as wasmLoadProvingKey } from '../wasm';
import { ProvingKey } from './proving-keys';

export const loadLocalBinary = async (filename: string) => {
  const response = await fetch(`bin/${filename}`);
  if (!response.ok) {
    throw new Error(`Failed to load ${filename}`);
  }

  return await response.arrayBuffer();
};

export const loadProvingKey = async (provingKey: ProvingKey) => {
  const response = await loadLocalBinary(provingKey.file);
  wasmLoadProvingKey(response, provingKey.keyType);
};
