import { BigNumber } from 'bignumber.js';
import { describe, expect, it } from 'vitest';
import {
  Position,
  PositionState_PositionStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import {
  Metadata,
  AssetId,
  DenomUnit,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { compareAssetId } from '@/shared/math/position';
import { pnum } from '@penumbra-zone/types/pnum';
import { ExecutedPosition } from './types';
import { GetMetadataByAssetId } from '@/shared/api/assets';
import { getCalculatedAssets } from './get-calculated-assets';
import {
  getDirectionalOrders,
  getOrdersByBaseQuoteAssets,
  getOrderValueViews,
} from './get-display-positions';

describe('position modeling functions', () => {
  const id1 = new Uint8Array(Array(32).fill(0xaa));
  const id2 = new Uint8Array(Array(32).fill(0xbb));
  const id3 = new Uint8Array(Array(32).fill(0xcc));
  const id4 = new Uint8Array(Array(32).fill(0xdd));
  const stableId = new Uint8Array(Array(32).fill(0xee));
  const p1 = 2;
  const p2 = 1;
  const exponent1 = 6;
  const exponent2 = 9;

  const createMetaData = (id: Uint8Array, display: string, exponent: number) => {
    return new Metadata({
      penumbraAssetId: new AssetId({ inner: id }),
      symbol: display,
      display,
      denomUnits: [new DenomUnit({ denom: display, exponent })],
    });
  };

  const metadataWithId1 = createMetaData(id1, 'asset1', exponent1);
  const metadataWithId2 = createMetaData(id2, 'asset2', exponent2);
  const metadataWithId3 = createMetaData(id3, 'asset2', exponent2);
  const metadataWithId4 = createMetaData(id4, 'asset2', exponent2);
  const metadataWithStableCoin = createMetaData(stableId, 'USDC', exponent2);

  const feeBps = 25;

  const createPosition = ({
    r1,
    r2,
    asset1Id = id1,
    asset2Id = id2,
  }: {
    r1: bigint;
    r2: bigint;
    asset1Id?: Uint8Array;
    asset2Id?: Uint8Array;
  }) => {
    return new Position({
      phi: {
        component: {
          fee: feeBps,
          p: {
            lo: BigInt(p1),
            hi: 0n,
          },
          q: {
            lo: BigInt(p2),
            hi: 0n,
          },
        },
        pair: {
          asset1: {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            inner: asset1Id ?? id1,
          },
          asset2: {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            inner: asset2Id ?? id2,
          },
        },
      },
      nonce: new Uint8Array(Array(32).fill(0xcc)),
      state: {
        state: PositionState_PositionStateEnum.OPENED,
        sequence: 0n,
      },
      reserves: {
        r1: {
          lo: r1,
          hi: 0n,
        },
        r2: {
          lo: r2,
          hi: 0n,
        },
      },
      closeOnFill: false,
    });
  };

  const getMetadataByAssetId: GetMetadataByAssetId = assetId => {
    if (!assetId) {
      return undefined;
    }

    const allAssets = [
      metadataWithId1,
      metadataWithId2,
      metadataWithId3,
      metadataWithId4,
      metadataWithStableCoin,
    ];
    return allAssets.find(
      asset => asset.penumbraAssetId && compareAssetId(assetId, asset.penumbraAssetId) === 0,
    );
  };

  describe('getOrdersByBaseQuoteAssets', () => {
    it('should return a buy and sell order when both assets have reserves', () => {
      const position = createPosition({
        r1: 100n,
        r2: 100n,
      });

      const [asset1, asset2] = getCalculatedAssets(
        position as ExecutedPosition,
        getMetadataByAssetId,
      );
      const orders = getOrdersByBaseQuoteAssets(asset1, asset2);
      expect(orders[0]?.direction).toEqual('Buy');
      expect(orders[1]?.direction).toEqual('Sell');
    });

    it('should return a buy order when only the quote asset has reserves', () => {
      const position = createPosition({
        r1: 0n,
        r2: 100n,
      });

      const [asset1, asset2] = getCalculatedAssets(
        position as ExecutedPosition,
        getMetadataByAssetId,
      );
      const orders = getOrdersByBaseQuoteAssets(asset1, asset2);
      expect(orders[0]?.direction).toEqual('Buy');
      expect(orders[1]).toEqual(undefined);
    });

    it('should return a sell order when only the base asset has reserves', () => {
      const position = createPosition({
        r1: 100n,
        r2: 0n,
      });

      const [asset1, asset2] = getCalculatedAssets(
        position as ExecutedPosition,
        getMetadataByAssetId,
      );
      const orders = getOrdersByBaseQuoteAssets(asset1, asset2);
      expect(orders[0]?.direction).toEqual('Sell');
      expect(orders[1]).toEqual(undefined);
    });
  });

  describe('getOrderValueViews', () => {
    it('should return the correct value views for a buy order', () => {
      const position = createPosition({
        r1: 0n,
        r2: pnum(12.123, exponent2).toBigInt(),
      });

      const [asset1, asset2] = getCalculatedAssets(
        position as ExecutedPosition,
        getMetadataByAssetId,
      );
      const orders = getOrdersByBaseQuoteAssets(asset1, asset2);
      const buyOrder = orders[0];

      const valueViews = getOrderValueViews(buyOrder!);

      const basePrice = (p1 / p2) * 10 ** (exponent1 - exponent2);
      const effectivePrice = BigNumber(basePrice)
        .minus(BigNumber(basePrice).times(feeBps).div(10000))
        .toNumber();

      expect(pnum(valueViews.amount).toNumber()).toEqual(
        Number(
          (
            buyOrder!.quoteAsset.amount.toNumber() *
            buyOrder!.quoteAsset.effectivePrice.toNumber() *
            10 ** (exponent2 - exponent1)
          ).toFixed(exponent1),
        ),
      );
      expect(pnum(valueViews.basePrice).toNumber()).toEqual(basePrice);
      expect(pnum(valueViews.effectivePrice).toNumber()).toEqual(effectivePrice);
    });

    it('should return the correct value views for a sell order', () => {
      const position = createPosition({
        r1: pnum(4.567, exponent1).toBigInt(),
        r2: 0n,
      });

      const [asset1, asset2] = getCalculatedAssets(
        position as ExecutedPosition,
        getMetadataByAssetId,
      );
      const orders = getOrdersByBaseQuoteAssets(asset1, asset2);
      const sellOrder = orders[0];

      const valueViews = getOrderValueViews(sellOrder!);
      const basePrice = (p1 / p2) * 10 ** (exponent1 - exponent2);
      const effectivePrice = BigNumber(basePrice)
        .minus(BigNumber(basePrice).times(feeBps).div(10000))
        .toNumber();

      expect(pnum(valueViews.amount).toNumber()).toEqual(4.567);
      expect(pnum(valueViews.basePrice).toNumber()).toEqual(basePrice);
      expect(pnum(valueViews.effectivePrice).toNumber()).toEqual(effectivePrice);
    });
  });

  describe('getDirectionalOrders', () => {
    it('should return with asset 1/2 as base/quote asset when its the provided base/quote assets', () => {
      const position = createPosition({
        r1: 0n,
        r2: 100n,
      });

      const [asset1, asset2] = getCalculatedAssets(
        position as ExecutedPosition,
        getMetadataByAssetId,
      );
      const directionalOrders = getDirectionalOrders({
        asset1,
        asset2,
        baseAsset: metadataWithId1,
        quoteAsset: metadataWithId2,
      });
      const positionOrder = directionalOrders[0]!;

      expect(
        positionOrder.baseAsset.asset.penumbraAssetId?.equals(asset1.asset.penumbraAssetId),
      ).toBe(true);
      expect(
        positionOrder.quoteAsset.asset.penumbraAssetId?.equals(asset2.asset.penumbraAssetId),
      ).toBe(true);
    });

    it('should return with asset 2/1 as base/quote asset when its the provided base/quote assets', () => {
      const position = createPosition({
        r1: 0n,
        r2: 100n,
      });

      const [asset1, asset2] = getCalculatedAssets(
        position as ExecutedPosition,
        getMetadataByAssetId,
      );
      const directionalOrders = getDirectionalOrders({
        asset1,
        asset2,
        baseAsset: metadataWithId2,
        quoteAsset: metadataWithId1,
      });
      const positionOrder = directionalOrders[0]!;

      expect(
        positionOrder.baseAsset.asset.penumbraAssetId?.equals(asset2.asset.penumbraAssetId),
      ).toBe(true);
      expect(
        positionOrder.quoteAsset.asset.penumbraAssetId?.equals(asset1.asset.penumbraAssetId),
      ).toBe(true);
    });

    it('should return with asset 1 as quote asset when asset 1 is a stable coin', () => {
      const position = createPosition({
        r1: 0n,
        r2: 100n,
        asset1Id: stableId,
        asset2Id: id2,
      });

      const [asset1, asset2] = getCalculatedAssets(
        position as ExecutedPosition,
        getMetadataByAssetId,
      );
      const directionalOrders = getDirectionalOrders({
        asset1,
        asset2,
        baseAsset: metadataWithId1,
        quoteAsset: metadataWithId2,
      });
      const positionOrder = directionalOrders[0]!;

      expect(
        positionOrder.baseAsset.asset.penumbraAssetId?.equals(asset2.asset.penumbraAssetId),
      ).toBe(true);
      expect(
        positionOrder.quoteAsset.asset.penumbraAssetId?.equals(asset1.asset.penumbraAssetId),
      ).toBe(true);
    });

    it('should return with asset 2 as quote asset when asset 2 is a stable coin', () => {
      const position = createPosition({
        r1: 0n,
        r2: 100n,
        asset1Id: id1,
        asset2Id: stableId,
      });

      const [asset1, asset2] = getCalculatedAssets(
        position as ExecutedPosition,
        getMetadataByAssetId,
      );
      const directionalOrders = getDirectionalOrders({
        asset1,
        asset2,
        baseAsset: metadataWithId1,
        quoteAsset: metadataWithId2,
      });
      const positionOrder = directionalOrders[0]!;

      expect(
        positionOrder.baseAsset.asset.penumbraAssetId?.equals(asset1.asset.penumbraAssetId),
      ).toBe(true);
      expect(
        positionOrder.quoteAsset.asset.penumbraAssetId?.equals(asset2.asset.penumbraAssetId),
      ).toBe(true);
    });
  });
});
