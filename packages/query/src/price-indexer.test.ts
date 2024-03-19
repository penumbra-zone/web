import { updatePrices } from './price-indexer';
import { BatchSwapOutputData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { IndexedDbInterface } from '@penumbra-zone/types/src/indexed-db';
import { NUMERAIRE_TOKEN_ID } from '@penumbra-zone/constants/dist/assets';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

describe('update prices', () => {
  let indexedDbMock: IndexedDbInterface;
  const updatePriceMock: Mock = vi.fn();
  const height = 123n;

  beforeEach(() => {
    vi.clearAllMocks();

    indexedDbMock = {
      updatePrice: updatePriceMock,
    } as unknown as IndexedDbInterface;
  });

  it('should update prices correctly for a swapOutput with NUMERAIRE as swapAsset2', async () => {
    const asset1 = new AssetId({ inner: new Uint8Array(12) });
    const swapOutputs: BatchSwapOutputData[] = [
      new BatchSwapOutputData({
        tradingPair: {
          asset1: asset1,
          asset2: NUMERAIRE_TOKEN_ID,
        },
        delta1: { lo: 250n },
        lambda2: { lo: 1200n },
        unfilled1: { lo: 0n },
      }),
    ];

    await updatePrices(indexedDbMock, swapOutputs, height);
    expect(updatePriceMock).toBeCalledTimes(1);
    expect(updatePriceMock).toBeCalledWith(asset1, NUMERAIRE_TOKEN_ID, 4.8, height);
  });

  it('should update prices correctly for a swapOutput with NUMERAIRE as swapAsset1', async () => {
    const asset1 = new AssetId({ inner: new Uint8Array(12) });
    const swapOutputs: BatchSwapOutputData[] = [
      new BatchSwapOutputData({
        tradingPair: {
          asset1: NUMERAIRE_TOKEN_ID,
          asset2: asset1,
        },
        delta2: { lo: 40n },
        lambda1: { lo: 12740n },
        unfilled2: { lo: 0n },
      }),
    ];

    await updatePrices(indexedDbMock, swapOutputs, height);
    expect(updatePriceMock).toBeCalledTimes(1);
    expect(updatePriceMock).toBeCalledWith(asset1, NUMERAIRE_TOKEN_ID, 318.5, height);
  });

  it('should not update prices if delta is zero', async () => {
    const asset1 = new AssetId({ inner: new Uint8Array(12) });
    const swapOutputs: BatchSwapOutputData[] = [
      new BatchSwapOutputData({
        tradingPair: {
          asset1: NUMERAIRE_TOKEN_ID,
          asset2: asset1,
        },
        delta2: { lo: 0n },
        lambda1: { lo: 12740n },
        unfilled2: { lo: 0n },
      }),
    ];

    await updatePrices(indexedDbMock, swapOutputs, height);
    expect(updatePriceMock).toBeCalledTimes(0);
  });

  it('should update prices correctly for partially filled', async () => {
    const asset1 = new AssetId({ inner: new Uint8Array(12) });
    const swapOutputs: BatchSwapOutputData[] = [
      new BatchSwapOutputData({
        tradingPair: {
          asset1: asset1,
          asset2: NUMERAIRE_TOKEN_ID,
        },
        delta1: { lo: 250n },
        lambda2: { lo: 1200n },
        unfilled1: { lo: 100n },
      }),
    ];
    await updatePrices(indexedDbMock, swapOutputs, height);
    expect(updatePriceMock).toBeCalledTimes(1);
    expect(updatePriceMock).toBeCalledWith(asset1, NUMERAIRE_TOKEN_ID, 8, height);
  });

  it('should not update prices if swap is fully unfilled', async () => {
    const asset1 = new AssetId({ inner: new Uint8Array(12) });
    const swapOutputs: BatchSwapOutputData[] = [
      new BatchSwapOutputData({
        tradingPair: {
          asset1: NUMERAIRE_TOKEN_ID,
          asset2: asset1,
        },
        delta2: { lo: 100n },
        lambda1: { lo: 12740n },
        unfilled2: { lo: 100n },
      }),
    ];

    await updatePrices(indexedDbMock, swapOutputs, height);
    expect(updatePriceMock).toBeCalledTimes(0);
  });
});
