import { beforeEach, describe, expect, test } from 'vitest';
import { MockStorageArea } from './mock';
import { ExtensionStorage } from './base';
import { flushPromises } from '../utils/test-helpers';

interface MockV1State {
  network: string;
  seedPhrase: string;
  accounts: {
    label: string;
    encryptedSeedPhrase: string;
  }[];
}

interface MockV2State {
  network: string; // stayed the same
  seedPhrase: string[]; // Changed data structure
  accounts: {
    // label: string; // Removed field
    encryptedSeedPhrase: string; // stayed the same
    viewKey: string; // added new field
  }[];
}

interface MockV3State {
  network: string; // stayed the same
  seedPhrase: string[]; // stayed the same
  accounts: {
    encryptedSeedPhrase: string; // stayed the same
    viewKey: string; // added new field
    spendKey: string; // added new field
  }[];
}

enum MockStorageVersion {
  V1 = 'V1',
  V2 = 'V2',
  V3 = 'V3',
}

interface Migrations {
  seedPhrase: {
    [MockStorageVersion.V1]: (old: MockV1State['seedPhrase']) => MockV3State['seedPhrase'];
  };
  accounts: {
    [MockStorageVersion.V1]: (old: MockV1State['accounts']) => MockV3State['accounts'];
    [MockStorageVersion.V2]: (old: MockV2State['accounts']) => MockV3State['accounts'];
  };
}

const migrations: Migrations = {
  seedPhrase: {
    [MockStorageVersion.V1]: (old) => old.split(' '),
  },
  accounts: {
    [MockStorageVersion.V1]: (old) =>
      old.map(({ encryptedSeedPhrase }) => {
        return {
          encryptedSeedPhrase,
          viewKey: 'v3-view-key-abc',
          spendKey: 'v3-view-key-xyz',
        };
      }),
    [MockStorageVersion.V2]: (old) =>
      old.map(({ encryptedSeedPhrase, viewKey }) => {
        return {
          encryptedSeedPhrase,
          viewKey,
          spendKey: 'v3-spend-key-xyz',
        };
      }),
  },
};

describe('Storage migrations', () => {
  let v1ExtStorage: ExtensionStorage<MockV1State>;
  let v2ExtStorage: ExtensionStorage<MockV2State>;
  let v3ExtStorage: ExtensionStorage<MockV3State>;

  beforeEach(() => {
    const storageArea = new MockStorageArea();
    v1ExtStorage = new ExtensionStorage<MockV1State>(
      storageArea,
      {
        network: '',
        seedPhrase: '',
        accounts: [],
      },
      MockStorageVersion.V1,
      migrations,
    );
    v2ExtStorage = new ExtensionStorage<MockV2State>(
      storageArea,
      {
        network: '',
        accounts: [],
        seedPhrase: [],
      },
      MockStorageVersion.V2,
      migrations,
    );
    v3ExtStorage = new ExtensionStorage<MockV3State>(
      storageArea,
      {
        network: '',
        accounts: [],
        seedPhrase: [],
      },
      MockStorageVersion.V3,
      migrations,
    );
  });

  describe('no migrations available', () => {
    test('defaults work fine', async () => {
      const result = await v3ExtStorage.get('network');
      expect(result).toBe('');
    });

    test('gets work fine', async () => {
      await v1ExtStorage.set('network', 'mainnet');
      const result = await v3ExtStorage.get('network');
      expect(result).toBe('mainnet');
    });
  });

  describe('migrations available', () => {
    test('defaults work fine', async () => {
      const result = await v3ExtStorage.get('seedPhrase');
      expect(result).toStrictEqual([]);
    });

    test('get works on a changed data structure', async () => {
      await v1ExtStorage.set('seedPhrase', 'cat dog mouse horse');
      const result = await v3ExtStorage.get('seedPhrase');
      expect(result).toEqual(['cat', 'dog', 'mouse', 'horse']);
    });

    test('get works with removed/added fields', async () => {
      await v1ExtStorage.set('accounts', [{ label: 'account #1', encryptedSeedPhrase: '12345' }]);
      const result1To3 = await v3ExtStorage.get('accounts');
      expect(result1To3).toEqual([
        {
          encryptedSeedPhrase: '12345',
          viewKey: 'v3-view-key-abc',
          spendKey: 'v3-view-key-xyz',
        },
      ]);

      await flushPromises();

      // from a different version, the migration is different
      await v2ExtStorage.set('accounts', [
        { viewKey: 'v2-view-key-efg', encryptedSeedPhrase: '12345' },
      ]);
      const result2To3 = await v3ExtStorage.get('accounts');
      expect(result2To3).toEqual([
        {
          encryptedSeedPhrase: '12345',
          viewKey: 'v2-view-key-efg',
          spendKey: 'v3-spend-key-xyz',
        },
      ]);
    });

    test('multiple get (that may migrate) have no side effects', async () => {
      await v1ExtStorage.set('seedPhrase', 'cat dog mouse horse');
      const resultA = await v3ExtStorage.get('seedPhrase');
      const resultB = await v3ExtStorage.get('seedPhrase');
      const resultC = await v3ExtStorage.get('seedPhrase');
      expect(resultA).toEqual(resultB);
      expect(resultB).toEqual(resultC);
      expect(resultA).toEqual(resultC);
    });
  });
});
