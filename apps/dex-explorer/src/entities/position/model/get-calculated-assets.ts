import { pnum } from '@penumbra-zone/types/pnum';
import { GetMetadataByAssetId } from '@/shared/api/assets';
import { CalculatedAsset, ExecutedPosition } from './types';
import { getDisplayDenomExponent } from '@penumbra-zone/getters/metadata';

/** Takes a Position and returns the assets involved in the position with their calculated value */
export const getCalculatedAssets = (
  position: ExecutedPosition,
  getMetadataByAssetId: GetMetadataByAssetId,
): [CalculatedAsset, CalculatedAsset] => {
  const { phi, reserves } = position;
  const { pair, component } = phi;

  const asset1 = getMetadataByAssetId(pair.asset1);
  const asset2 = getMetadataByAssetId(pair.asset2);
  if (!asset1?.penumbraAssetId || !asset2?.penumbraAssetId) {
    throw new Error('No assets found in registry that belong to the trading pair');
  }

  const asset1Exponent = getDisplayDenomExponent.optional(asset1);
  const asset2Exponent = getDisplayDenomExponent.optional(asset2);
  if (!asset1Exponent || !asset2Exponent) {
    throw new Error('No exponents found for assets');
  }

  const { p, q } = component;
  const { r1, r2 } = reserves;

  // Positions specifying a trading pair between `asset_1:asset_2`.
  // This ordering can conflict with the higher level base/quote.
  // First, we compute the exchange rate between asset_1 and asset_2:
  const asset1Price = pnum(p).toBigNumber().dividedBy(pnum(q).toBigNumber());
  // Then, we compoute the exchange rate between asset_2 and asset_1.
  const asset2Price = pnum(q).toBigNumber().dividedBy(pnum(p).toBigNumber());
  // We start tracking the reserves for each assets:
  const asset1ReserveAmount = pnum(r1, asset1Exponent).toBigNumber();
  const asset2ReserveAmount = pnum(r2, asset2Exponent).toBigNumber();
  // Next, we compute the fee percentage for the position.
  // We are given a fee recorded in basis points, with an implicit 10^4 scaling factor.
  const f = component.fee;
  // This means that for 0 <= f < 10_000 (0% < f < 100%), the fee percentage is defined by:
  const gamma = (10_000 - f) / 10_000;
  // We use it to compute the effective price i.e, the price inclusive of fees in each directions,
  // in the case of the first rate this is: price * gamma, such that:
  const asset1EffectivePrice = asset1Price.times(pnum(gamma).toBigNumber());
  // in the case of the second, we apply it as an inverse:
  const asset2EffectivePrice = asset2Price.dividedBy(pnum(gamma).toBigNumber());

  return [
    {
      asset: asset1,
      exponent: asset1Exponent,
      amount: asset1ReserveAmount,
      price: asset1Price,
      effectivePrice: asset1EffectivePrice,
      reserves: reserves.r1,
    },
    {
      asset: asset2,
      exponent: asset2Exponent,
      amount: asset2ReserveAmount,
      price: asset2Price,
      effectivePrice: asset2EffectivePrice,
      reserves: reserves.r2,
    },
  ];
};
