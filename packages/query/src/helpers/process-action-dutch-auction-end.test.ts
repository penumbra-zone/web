import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { processActionDutchAuctionEnd } from './process-action-dutch-auction-end';
import {
  AssetId,
  Metadata,
  Value,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  ActionDutchAuctionEnd,
  AuctionId,
  DutchAuction,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1alpha1/auction_pb';
import { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';

vi.mock('@penumbra-zone/wasm/auction', () => ({
  getAuctionNftMetadata: () => new Metadata({ display: 'penumbra' }),
}));

describe('processActionDutchAuctionEnd()', () => {
  let auctionQuerier: { auctionStateById: Mock };
  let indexedDb: { saveAssetsMetadata: Mock; upsertAuction: Mock };
  const auctionId = new AuctionId({ inner: new Uint8Array([0, 1, 2, 3]) });
  const action = new ActionDutchAuctionEnd({ auctionId });

  beforeEach(() => {
    auctionQuerier = {
      auctionStateById: vi.fn(),
    };
    indexedDb = {
      saveAssetsMetadata: vi.fn(),
      upsertAuction: vi.fn(),
    };
  });

  it('saves metadata for the ended auction NFT', async () => {
    await processActionDutchAuctionEnd(
      action,
      auctionQuerier,
      indexedDb as unknown as IndexedDbInterface,
    );

    expect(indexedDb.saveAssetsMetadata).toHaveBeenCalledWith(
      expect.objectContaining({ display: 'penumbra' }),
    );
  });

  it('upserts the auction with the sequence number and reserves', async () => {
    const inputAssetId = new AssetId({ inner: new Uint8Array([0, 1, 2, 3]) });
    const outputAssetId = new AssetId({ inner: new Uint8Array([4, 5, 6, 7]) });

    auctionQuerier.auctionStateById.mockResolvedValueOnce(
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
      auctionQuerier,
      indexedDb as unknown as IndexedDbInterface,
    );

    expect(indexedDb.upsertAuction).toHaveBeenCalledWith(auctionId, {
      seqNum: 1n,
      outstandingReserves: {
        input: new Value({ amount: { hi: 0n, lo: 1234n }, assetId: inputAssetId }),
        output: new Value({ amount: { hi: 0n, lo: 5678n }, assetId: outputAssetId }),
      },
    });
  });
});
