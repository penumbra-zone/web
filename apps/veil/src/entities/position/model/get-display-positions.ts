import {
  Position,
  PositionId,
  PositionState_PositionStateEnum,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { positionIdFromBech32 } from '@penumbra-zone/bech32m/plpid';
import { pnum } from '@penumbra-zone/types/pnum';
import { GetMetadataByAssetId } from '@/shared/api/assets';
import { isZero } from '@penumbra-zone/types/amount';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { isNumeraireSymbol, isStablecoinSymbol } from '@/shared/utils/is-symbol';
import { getCalculatedAssets } from './get-calculated-assets';
import { CalculatedAsset, DisplayPosition, ExecutedPosition } from './types';
import { stateToString } from './state-to-string';

export const getOrdersByBaseQuoteAssets = (
  baseAsset: CalculatedAsset,
  quoteAsset: CalculatedAsset,
): { direction: string; baseAsset: CalculatedAsset; quoteAsset: CalculatedAsset }[] => {
  if (!isZero(baseAsset.reserves) && !isZero(quoteAsset.reserves)) {
    return [
      {
        direction: 'Buy',
        baseAsset,
        quoteAsset,
      },
      {
        direction: 'Sell',
        baseAsset,
        quoteAsset,
      },
    ];
  }

  if (!isZero(baseAsset.reserves) && isZero(quoteAsset.reserves)) {
    return [
      {
        direction: 'Sell',
        baseAsset,
        quoteAsset,
      },
    ];
  }

  if (isZero(baseAsset.reserves) && !isZero(quoteAsset.reserves)) {
    return [
      {
        direction: 'Buy',
        baseAsset,
        quoteAsset,
      },
    ];
  }

  return [
    {
      direction: '',
      baseAsset,
      quoteAsset,
    },
    {
      direction: '',
      baseAsset: baseAsset,
      quoteAsset: quoteAsset,
    },
  ];
};

export const getDirectionalOrders = ({
  asset1,
  asset2,
  baseAsset,
  quoteAsset,
}: {
  asset1: CalculatedAsset;
  asset2: CalculatedAsset;
  baseAsset?: Metadata;
  quoteAsset?: Metadata;
}): { direction: string; baseAsset: CalculatedAsset; quoteAsset: CalculatedAsset }[] => {
  if (baseAsset && quoteAsset) {
    const wellOrdered =
      baseAsset.penumbraAssetId?.equals(asset1.asset.penumbraAssetId) &&
      quoteAsset.penumbraAssetId?.equals(asset2.asset.penumbraAssetId);

    const orderFlipped =
      baseAsset.penumbraAssetId?.equals(asset2.asset.penumbraAssetId) &&
      quoteAsset.penumbraAssetId?.equals(asset1.asset.penumbraAssetId);

    // Happy path: we have a "Current pair" view which informs how we should render BASE/QUOTE assets.
    if (wellOrdered) {
      return getOrdersByBaseQuoteAssets(asset1, asset2);
    }

    // We check if flipping asset 1 and asset 2 would result in a base/quote match:
    if (orderFlipped) {
      return getOrdersByBaseQuoteAssets(asset2, asset1);
    }
  }

  // If it fails, this means that the position we want to render is not on the "Current pair"
  // view. This is the case if we are on the "BTC/USDC" page, and preparing to display a position
  // that is for the "UM/USDY" pair.
  // In that case, we want to handle this by deciding if the position contain a well-known numeraire,
  // or default to canonical ordering since this is both rare and can be filtered at a higher-level
  const asset1IsStablecoin = isStablecoinSymbol(asset1.asset.symbol);
  const asset2IsStablecoin = isStablecoinSymbol(asset2.asset.symbol);

  const asset1IsNumeraire = asset1IsStablecoin || isNumeraireSymbol(asset1.asset.symbol);
  const asset2IsNumeraire = asset2IsStablecoin || isNumeraireSymbol(asset2.asset.symbol);

  // If both assets are numeraires, we adjudicate based on priority score:
  if (asset1IsNumeraire && asset2IsNumeraire) {
    // HACK: It's not completely clear that we want to rely on the registry priority
    // score vs. our own local numeraire rule. For example, the registry sets UM as
    // having the highest priority. This means that all the UM pairs will be rendered
    // with UM as the quote asset. Not great for UM/USDC, UM/USDY.
    const asset1HasPriority = asset1.asset.priorityScore > asset2.asset.priorityScore;

    if (asset1IsStablecoin && asset2IsStablecoin) {
      return asset1HasPriority
        ? getOrdersByBaseQuoteAssets(asset2, asset1)
        : getOrdersByBaseQuoteAssets(asset1, asset2);
    }

    if (asset1IsStablecoin) {
      return getOrdersByBaseQuoteAssets(asset2, asset1);
    }

    if (asset2IsStablecoin) {
      return getOrdersByBaseQuoteAssets(asset1, asset2);
    }

    return asset1HasPriority
      ? getOrdersByBaseQuoteAssets(asset2, asset1)
      : getOrdersByBaseQuoteAssets(asset1, asset2);
  }

  // Otherwise, this is simple, if asset 1 is a numeraire then we render it as the quote asset:
  if (asset1IsNumeraire) {
    return getOrdersByBaseQuoteAssets(asset2, asset1);
  }

  // Otherwise, if asset 2 is a numeraire we render that one as the quote asset:
  if (asset2IsNumeraire) {
    return getOrdersByBaseQuoteAssets(asset1, asset2);
  }

  // It's possible that neither are, which is rare, in that case we use the canonical ordering:
  return getOrdersByBaseQuoteAssets(asset1, asset2);
};

export const getOrderValueViews = ({
  direction,
  baseAsset,
  quoteAsset,
}: {
  direction: string;
  baseAsset: CalculatedAsset;
  quoteAsset: CalculatedAsset;
}) => {
  // We want to render two main piece of information to the user, assuming their unit of account is the quote asset:
  // - the price i.e, the number of unit of *quote assets* necessary to obtain a unit of base asset.
  // - the trade amount i.e, the amount of *base assets* that the position is either seeking to purchase or sell.
  const effectivePrice = pnum(baseAsset.effectivePrice.toString(), baseAsset.exponent).toValueView(
    quoteAsset.asset,
  );
  const basePrice = pnum(baseAsset.price.toString(), baseAsset.exponent).toValueView(
    quoteAsset.asset,
  );

  // This is the trade amount (in base asset) that the position seeks to SELL or BUY.
  const amount =
    direction === 'Sell'
      ? // We are selling the base asset to obtain the quote asset, so we can simply use the current reserves.
        pnum(baseAsset.amount.toString(), baseAsset.exponent).toValueView(baseAsset.asset)
      : // We are buying the base asset, we need to convert the quantity of quote asset that we have provisioned.
        pnum(
          quoteAsset.amount.times(quoteAsset.effectivePrice).toString(),
          quoteAsset.exponent,
        ).toValueView(baseAsset.asset);

  return {
    direction,
    baseAsset,
    quoteAsset,
    amount,
    basePrice,
    effectivePrice,
  };
};

export interface GetDisplayPositionsArgs {
  positions: Map<string, Position>[] | undefined;
  getMetadataByAssetId: GetMetadataByAssetId;
  asset1Filter?: Metadata;
  asset2Filter?: Metadata;
  stateFilter?: PositionState_PositionStateEnum[];
}

/**
 * Takes the result of `usePositions` query and adapts it to UI
 * by filtering positions by status/metadata, mapping into a better format, and sorting them.
 */
export const getDisplayPositions = ({
  positions,
  getMetadataByAssetId,
  asset1Filter,
  asset2Filter,
  stateFilter,
}: GetDisplayPositionsArgs): DisplayPosition[] => {
  // take the array of Map and reduce it to an array of entries
  const entries =
    positions?.reduce<[string, Position][]>((accum, current) => {
      return accum.concat([...current.entries()]);
    }, []) ?? [];

  // adapt each position to a DisplayPosition
  const mapped = entries.map<DisplayPosition | undefined>(([id, position]) => {
    const { phi, state } = position as ExecutedPosition;
    const { component, pair } = phi;
    const assetId1 = pair.asset1;
    const assetId2 = pair.asset2;

    if (stateFilter?.length && !stateFilter.some(filter => filter === state.state)) {
      return undefined;
    }

    if (
      asset1Filter?.penumbraAssetId &&
      !assetId1?.equals(asset1Filter.penumbraAssetId) &&
      !assetId2?.equals(asset1Filter.penumbraAssetId)
    ) {
      return undefined;
    }

    if (
      asset2Filter?.penumbraAssetId &&
      !assetId2?.equals(asset2Filter.penumbraAssetId) &&
      !assetId1?.equals(asset2Filter.penumbraAssetId)
    ) {
      return undefined;
    }

    try {
      const [asset1, asset2] = getCalculatedAssets(
        position as ExecutedPosition,
        getMetadataByAssetId,
      );

      // Now that we have computed all the price information using the canonical ordering,
      // we can simply adjust our values if the directed pair is not the same as the canonical one:
      const orders = getDirectionalOrders({
        asset1,
        asset2,
        baseAsset: asset1Filter,
        quoteAsset: asset2Filter,
      }).map(getOrderValueViews);

      const isOpened = state.state === PositionState_PositionStateEnum.OPENED;
      const isClosed = state.state === PositionState_PositionStateEnum.CLOSED;
      const isWithdrawn = state.state === PositionState_PositionStateEnum.WITHDRAWN;
      const fee = `${pnum(component.fee / 100).toFormattedString({ decimals: 2 })}%`;

      return {
        id: new PositionId(positionIdFromBech32(id)),
        idString: id,
        position,
        orders,
        isOpened,
        isClosed,
        isWithdrawn,
        state: state.state,
        fee: `${pnum(component.fee / 100).toFormattedString({ decimals: 2 })}%`,
        sortValues: {
          positionId: id,
          type: isOpened
            ? (orders[0]?.direction ?? stateToString(state.state))
            : stateToString(state.state),
          tradeAmount: isWithdrawn ? 0 : pnum(orders[0]?.amount).toNumber(),
          effectivePrice: isClosed || isWithdrawn ? 0 : pnum(orders[0]?.effectivePrice).toNumber(),
          basePrice: isClosed || isWithdrawn ? 0 : pnum(orders[0]?.basePrice).toNumber(),
          feeTier: isClosed || isWithdrawn ? 0 : Number(fee.replace('%', '')),
        },
      };
    } catch (_) {
      return undefined;
    }
  });

  return mapped.filter(Boolean) as DisplayPosition[];
};
