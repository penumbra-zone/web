import { describe, test } from 'vitest';
import { MockStorageArea } from './test-utils/mock';
import { ExtensionStorage } from './base';
import { LocalStorageState, LocalStorageVersion } from './local';

describe('migrate walletId and fullViewingKey from bech32 string to json stringified', () => {
  const storageArea = new MockStorageArea();

  test('d', async () => {
    new ExtensionStorage<LocalStorageState>(
      storageArea,
      {
        wallets: [
          {
            fullViewingKey:
              'penumbrafullviewingkey1vzfytwlvq067g2kz095vn7sgcft47hga40atrg5zu2crskm6tyyjysm28qg5nth2fqmdf5n0q530jreumjlsrcxjwtfv6zdmfpe5kqsa5lg09',
            label: 'Wallet 1',
            id: 'penumbrawalletid15r7q7qsf3hhsgj0g530n7ng9acdacmmx9ajknjz38dyt90u9gcgsmjre75',
            custody: { encryptedSeedPhrase: { nonce: '', cipherText: '' } },
          },
        ],
        grpcEndpoint: 'mockGrpcEndpoint',
        fullSyncHeight: 222,
        knownSites: [],
      },
      LocalStorageVersion.V1,
      {},
    );
  });
});
