import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { processActionDutchAuctionEnd } from './dutch-auction';
import {
  AssetId,
  Metadata,
  Value,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  ActionDutchAuctionEnd,
  AuctionId,
  DutchAuction,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import type { PenumbraDb } from '@penumbra-zone/idb';

vi.mock('@penumbra-zone/wasm/auction', () => ({
  getAuctionNftMetadata: () => new Metadata({ display: 'penumbra' }),
}));

describe('processActionDutchAuctionEnd()', () => {
  const auctionStateById = vi.fn();
  let indexedDb: {
    saveAssetsMetadata: Mock;
    upsertAuction: Mock;
    addAuctionOutstandingReserves: Mock;
  };
  const auctionId = new AuctionId({ inner: new Uint8Array([0, 1, 2, 3]) });
  const action = new ActionDutchAuctionEnd({ auctionId });

  beforeEach(() => {
    indexedDb = {
      saveAssetsMetadata: vi.fn(),
      upsertAuction: vi.fn(),
      addAuctionOutstandingReserves: vi.fn(),
    };
  });

  it('saves metadata for the ended auction NFT', async () => {
    await processActionDutchAuctionEnd(
      action,
      auctionStateById,
      indexedDb as unknown as PenumbraDb,
    );

    expect(indexedDb.saveAssetsMetadata).toHaveBeenCalledWith(
      expect.objectContaining({ display: 'penumbra' }),
    );
  });

  it('upserts the auction with the sequence number', async () => {
    const inputAssetId = new AssetId({ inner: new Uint8Array([0, 1, 2, 3]) });
    const outputAssetId = new AssetId({ inner: new Uint8Array([4, 5, 6, 7]) });

    auctionStateById.mockResolvedValueOnce(
      new DutchAuction({
        state: {
          inputReserves: { hi: 0n, lo: 1234n },
          outputReserves: { hi: 0n, lo: 5678n },
        },
        description: {
          input: {
            amount: { hi: 0n, lo: 6912n },
            assetId: inputAssetId,
          },
          outputId: outputAssetId,
        },
      }),
    );

    await processActionDutchAuctionEnd(
      action,
      auctionStateById,
      indexedDb as unknown as PenumbraDb,
    );

    expect(indexedDb.upsertAuction).toHaveBeenCalledWith(auctionId, {
      seqNum: 1n,
    });
  });

  it('adds the auction reserves', async () => {
    const inputAssetId = new AssetId({ inner: new Uint8Array([0, 1, 2, 3]) });
    const outputAssetId = new AssetId({ inner: new Uint8Array([4, 5, 6, 7]) });

    auctionStateById.mockResolvedValueOnce(
      new DutchAuction({
        state: {
          inputReserves: { hi: 0n, lo: 1234n },
          outputReserves: { hi: 0n, lo: 5678n },
        },
        description: {
          input: {
            amount: { hi: 0n, lo: 6912n },
            assetId: inputAssetId,
          },
          outputId: outputAssetId,
        },
      }),
    );

    await processActionDutchAuctionEnd(
      action,
      auctionStateById,
      indexedDb as unknown as PenumbraDb,
    );

    expect(indexedDb.addAuctionOutstandingReserves).toHaveBeenCalledWith(auctionId, {
      input: new Value({ amount: { hi: 0n, lo: 1234n }, assetId: inputAssetId }),
      output: new Value({ amount: { hi: 0n, lo: 5678n }, assetId: outputAssetId }),
    });
  });
});
