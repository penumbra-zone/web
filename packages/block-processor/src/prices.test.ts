import { deriveAndSavePriceFromBSOD } from './prices';
import { BatchSwapOutputData } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { base64ToUint8Array } from '@penumbra-zone/types/base64';

describe('updatePricesFromSwaps()', () => {
  const updatePriceMock: Mock = vi.fn();
  const height = 123n;
  const numeraireAssetId = new AssetId({
    inner: base64ToUint8Array('reum7wQmk/owgvGMWMZn/6RFPV24zIKq3W6In/WwZgg='),
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update prices correctly for a swapOutput with NUMERAIRE as swapAsset2', async () => {
    const asset1 = new AssetId({ inner: new Uint8Array(12) });
    const swapOutputs: BatchSwapOutputData[] = [
      new BatchSwapOutputData({
        tradingPair: {
          asset1: asset1,
          asset2: numeraireAssetId,
        },
        delta1: { lo: 250n },
        lambda2: { lo: 1200n },
        unfilled1: { lo: 0n },
      }),
    ];

    await deriveAndSavePriceFromBSOD(updatePriceMock, numeraireAssetId, swapOutputs, height);
    expect(updatePriceMock).toBeCalledTimes(1);
    expect(updatePriceMock).toBeCalledWith(asset1, numeraireAssetId, 4.8, height);
  });

  it('should update prices correctly for a swapOutput with NUMERAIRE as swapAsset1', async () => {
    const asset1 = new AssetId({ inner: new Uint8Array(12) });
    const swapOutputs: BatchSwapOutputData[] = [
      new BatchSwapOutputData({
        tradingPair: {
          asset1: numeraireAssetId,
          asset2: asset1,
        },
        delta2: { lo: 40n },
        lambda1: { lo: 12740n },
        unfilled2: { lo: 0n },
      }),
    ];

    await deriveAndSavePriceFromBSOD(updatePriceMock, numeraireAssetId, swapOutputs, height);
    expect(updatePriceMock).toBeCalledTimes(1);
    expect(updatePriceMock).toBeCalledWith(asset1, numeraireAssetId, 318.5, height);
  });

  it('should not update prices if delta is zero', async () => {
    const asset1 = new AssetId({ inner: new Uint8Array(12) });
    const swapOutputs: BatchSwapOutputData[] = [
      new BatchSwapOutputData({
        tradingPair: {
          asset1: numeraireAssetId,
          asset2: asset1,
        },
        delta2: { lo: 0n },
        lambda1: { lo: 12740n },
        unfilled2: { lo: 0n },
      }),
    ];

    await deriveAndSavePriceFromBSOD(updatePriceMock, numeraireAssetId, swapOutputs, height);
    expect(updatePriceMock).toBeCalledTimes(0);
  });

  it('should update prices correctly for partially filled', async () => {
    const asset1 = new AssetId({ inner: new Uint8Array(12) });
    const swapOutputs: BatchSwapOutputData[] = [
      new BatchSwapOutputData({
        tradingPair: {
          asset1: asset1,
          asset2: numeraireAssetId,
        },
        delta1: { lo: 250n },
        lambda2: { lo: 1200n },
        unfilled1: { lo: 100n },
      }),
    ];
    await deriveAndSavePriceFromBSOD(updatePriceMock, numeraireAssetId, swapOutputs, height);
    expect(updatePriceMock).toBeCalledTimes(1);
    expect(updatePriceMock).toBeCalledWith(asset1, numeraireAssetId, 8, height);
  });

  it('should not update prices if swap is fully unfilled', async () => {
    const asset1 = new AssetId({ inner: new Uint8Array(12) });
    const swapOutputs: BatchSwapOutputData[] = [
      new BatchSwapOutputData({
        tradingPair: {
          asset1: numeraireAssetId,
          asset2: asset1,
        },
        delta2: { lo: 100n },
        lambda1: { lo: 12740n },
        unfilled2: { lo: 100n },
      }),
    ];

    await deriveAndSavePriceFromBSOD(updatePriceMock, numeraireAssetId, swapOutputs, height);
    expect(updatePriceMock).toBeCalledTimes(0);
  });
});
