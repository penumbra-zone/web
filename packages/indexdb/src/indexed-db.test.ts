import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { IndexedDb } from './indexed-db';
import {
  AssetId,
  DenomMetadata,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/crypto/v1alpha1/crypto_pb';
import { base64ToUint8Array } from 'penumbra-types';

const denomMetadataA = new DenomMetadata({
  symbol: 'usdc',
  penumbraAssetId: new AssetId({ altBaseDenom: 'usdc', inner: base64ToUint8Array('dXNkYw==') }),
});

const denomMetadataB = new DenomMetadata({
  symbol: 'dai',
  penumbraAssetId: new AssetId({ altBaseDenom: 'dai', inner: base64ToUint8Array('ZGFp') }),
});

describe('IndexedDb', () => {
  beforeEach(() => {
    new IDBFactory(); // wipes indexDB state
  });

  const testInitialProps = { chainId: 'test', accountAddr: 'penumbra123xyz', dbVersion: 1 };

  describe('initializing', () => {
    it('sets up as expected in initialize()', async () => {
      const db = await IndexedDb.initialize(testInitialProps);
      await expect(db.getLastBlockSynced()).resolves.not.toThrow();
    });

    // TODO: after https://github.com/penumbra-zone/web/issues/30 is resolved, re-enable test
    it.skip('different chain ids result in different databases', async () => {
      const testnetDb = await IndexedDb.initialize(testInitialProps);
      const mainnetDb = await IndexedDb.initialize({ ...testInitialProps, chainId: 'mainnet' });

      await testnetDb.saveAssetsMetadata(denomMetadataA);
      await mainnetDb.saveAssetsMetadata(denomMetadataB);

      expect(await testnetDb.getAssetsMetadata(denomMetadataA.penumbraAssetId!.inner)).toBe(
        denomMetadataA,
      );
      expect(await mainnetDb.getAssetsMetadata(denomMetadataB.penumbraAssetId!.inner)).toBe(
        denomMetadataB,
      );
    });

    it('same version uses same db', async () => {
      const dbA = await IndexedDb.initialize(testInitialProps);
      await dbA.saveAssetsMetadata(denomMetadataA);

      const dbB = await IndexedDb.initialize(testInitialProps);
      expect((await dbB.getAssetsMetadata(denomMetadataA.penumbraAssetId!.inner))?.name).toBe(
        denomMetadataA.name,
      );
    });
  });

  // TODO: Write tests for each asset
});
