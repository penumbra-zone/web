import { fullViewingKeyFromBech32m } from '@penumbra-zone/bech32m/penumbrafullviewingkey';
import { walletIdFromBech32m } from '@penumbra-zone/bech32m/penumbrawalletid';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';

const innerBinToV2JsonString = (k: { inner: Uint8Array }) =>
  JSON.stringify({
    inner: uint8ArrayToBase64(k.inner),
  });

interface V1Wallet {
  fullViewingKey: `penumbrafullviewingkey1${string}`;
  id: `penumbrawalletid1${string}`;
  label: unknown;
  custody: unknown;
}

// V1 wallets contain bech32m
const isV1Wallet = (data: unknown): data is V1Wallet =>
  typeof data === 'object' &&
  data !== null &&
  'label' in data &&
  'custody' in data &&
  'fullViewingKey' in data &&
  'id' in data &&
  typeof data.fullViewingKey === 'string' &&
  data.fullViewingKey.startsWith('penumbrafullviewingkey1') &&
  typeof data.id === 'string' &&
  data.id.startsWith('penumbrawalletid1');

export const migrate = async () => {
  console.log('migration 1_2');

  const allData = await chrome.storage.local.get();

  // migration 0_1 is a special case, and may have already migrated us to 2
  if (allData['storageVersion'] === 2) return;

  if (Array.isArray(allData['wallets']) && !allData['wallets'].every(isV1Wallet))
    throw new TypeError('unexpected wallet schema');

  // V2 wallets contain protojson
  const wallets =
    allData['wallets'] && Array.isArray(allData['wallets']) && allData['wallets'].every(isV1Wallet)
      ? allData['wallets'].map(({ fullViewingKey, id, label, custody }) => ({
          fullViewingKey: innerBinToV2JsonString(fullViewingKeyFromBech32m(fullViewingKey)),
          id: innerBinToV2JsonString(walletIdFromBech32m(id)),
          label,
          custody,
        }))
      : undefined;

  const migrated = {
    ...allData,
    wallets,
    storageVersion: 2,
  };

  await chrome.storage.local.set(migrated);
};
