import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { IndexedDb } from './indexed-db';
import {
  AssetId,
  DenomMetadata,
  DenomUnit,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/crypto/v1alpha1/crypto_pb';

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

      await testnetDb.saveLastBlockSynced(12n);
      await mainnetDb.saveLastBlockSynced(67n);

      expect(await testnetDb.getLastBlockSynced()).toBe(12n);
      expect(await mainnetDb.getLastBlockSynced()).toBe(67n);
    });

    it('same version uses same db', async () => {
      const dbA = await IndexedDb.initialize(testInitialProps);
      await dbA.saveLastBlockSynced(12n);

      const dbB = await IndexedDb.initialize(testInitialProps);
      expect(await dbB.getLastBlockSynced()).toBe(12n);
    });
  });

  // TODO: Write tests for each asset
  describe('assets', () => {
    it('gets and puts as expected', async () => {
      const db = await IndexedDb.initialize(testInitialProps);

      const assetId = new AssetId();
      // TODO: Let's replace this with real data after we do a live request
      const metadata = new DenomMetadata({
        symbol: 'usdc',
        description: 'stable coin',
        denomUnits: [new DenomUnit({ denom: 'usdc', exponent: 18, aliases: [] })],
        base: 'string',
        display: 'usdc',
        name: 'circle usdc',
        uri: 'usdc:uri',
        uriHash: '0x2489dfaoj23f',
        penumbraAssetId: assetId,
      });
      await db.saveAssetsMetadata(metadata);

      const result = await db.getAssetsMetadata(assetId.inner);
      expect(result).toBeDefined();
      expect(result?.symbol).toEqual(metadata.symbol);
      expect(result?.penumbraAssetId).toEqual(assetId);
    });
  });
});
