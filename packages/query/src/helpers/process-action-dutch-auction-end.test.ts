import { Mock, beforeEach, describe, expect, it, vi } from 'vitest';
import { processActionDutchAuctionEnd } from './process-action-dutch-auction-end.js';
import { AssetId, Metadata, Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  ActionDutchAuctionEnd,
  AuctionId,
  DutchAuction,
} from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { IndexedDbInterface } from '@penumbra-zone/types/indexed-db';

const inner0123 = Uint8Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));
const inner4567 = Uint8Array.from({ length: 32 }, () => Math.floor(Math.random() * 256));

vi.mock('@penumbra-zone/wasm/auction', () => ({
  getAuctionNftMetadata: () =>
    Metadata.fromJson({
      penumbraAssetId: { inner: 'ARpgNbcWB8SkCuCBjlTsW8eDmEqeJQGWYDhbUk3Q1pc=' },
      display: 'test',
    }),
}));

describe('processActionDutchAuctionEnd()', () => {
  let auctionQuerier: { auctionStateById: Mock };
  let indexedDb: {
    saveAssetsMetadata: Mock;
    upsertAuction: Mock;
    addAuctionOutstandingReserves: Mock;
  };
  const auctionId = new AuctionId({ inner: inner0123 });
  const action = new ActionDutchAuctionEnd({ auctionId });

  beforeEach(() => {
    auctionQuerier = {
      auctionStateById: vi.fn(),
    };
    indexedDb = {
      saveAssetsMetadata: vi.fn(),
      upsertAuction: vi.fn(),
      addAuctionOutstandingReserves: vi.fn(),
    };
  });

  it('saves metadata for the ended auction NFT', async () => {
    await processActionDutchAuctionEnd(
      action,
      auctionQuerier,
      indexedDb as unknown as IndexedDbInterface,
    );

    expect(indexedDb.saveAssetsMetadata).toHaveBeenCalledWith(
      expect.objectContaining({ display: 'test' }),
    );
  });

  it('upserts the auction with the sequence number', async () => {
    const inputAssetId = new AssetId({ inner: inner0123 });
    const outputAssetId = new AssetId({ inner: inner4567 });

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
    });
  });

  it('adds the auction reserves', async () => {
    const inputAssetId = new AssetId({ inner: inner0123 });
    const outputAssetId = new AssetId({ inner: inner4567 });

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

    expect(indexedDb.addAuctionOutstandingReserves).toHaveBeenCalledWith(auctionId, {
      input: new Value({ amount: { hi: 0n, lo: 1234n }, assetId: inputAssetId }),
      output: new Value({ amount: { hi: 0n, lo: 5678n }, assetId: outputAssetId }),
    });
  });
});
