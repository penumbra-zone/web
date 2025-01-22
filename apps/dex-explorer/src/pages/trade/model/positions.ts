import { makeAutoObservable } from 'mobx';
import { TransactionPlannerRequest } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import {
  Position,
  PositionId,
  PositionState,
  PositionState_PositionStateEnum,
  BareTradingFunction,
  TradingPair,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
import { planBuildBroadcast } from '@/pages/trade/ui/order-form/helpers.tsx';
import { connectionStore } from '@/shared/model/connection';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { isZero } from '@penumbra-zone/types/amount';
import { penumbra } from '@/shared/const/penumbra.ts';
import { ViewService } from '@penumbra-zone/protobuf';
import { openToast } from '@penumbra-zone/ui/Toast';
import { pnum } from '@penumbra-zone/types/pnum';
import { bech32mPositionId, positionIdFromBech32 } from '@penumbra-zone/bech32m/plpid';
import { updatePositionsQuery } from '@/pages/trade/api/positions';
import { BigNumber } from 'bignumber.js';

export interface DisplayPosition {
  id: PositionId;
  idString: string;
  position: Position;
  orders: {
    direction: string;
    amount: ValueView;
    basePrice: ValueView;
    effectivePrice: ValueView;
    baseAsset: CalculatedAsset;
    quoteAsset: CalculatedAsset;
  }[];
  fee: string;
  isWithdrawn: boolean;
  isOpened: boolean;
  isClosed: boolean;
  state: PositionState_PositionStateEnum;
}

export interface CalculatedAsset {
  asset: Metadata;
  exponent: number;
  amount: BigNumber;
  price: BigNumber;
  effectivePrice: BigNumber;
  reserves: Amount;
}

// interface to avoid checking if the nested values exist on a Position
export interface ExecutedPosition {
  phi: {
    component: BareTradingFunction;
    pair: TradingPair;
  };
  nonce: Uint8Array;
  state: PositionState;
  reserves: {
    r1: Amount;
    r2: Amount;
  };
  closeOnFill: boolean;
}

class PositionsStore {
  public loading = false;
  public positionsById = new Map<string, Position>();
  private assets: Metadata[] = [];
  private currentPair: [Metadata, Metadata] | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setLoading(state: boolean) {
    this.loading = state;
  }

  closePositions = async (positions: { id: PositionId; position: Position }[]): Promise<void> => {
    try {
      this.setLoading(true);

      const planReq = new TransactionPlannerRequest({
        positionCloses: positions.map(({ id }) => ({ positionId: id })),
        source: new AddressIndex({ account: connectionStore.subaccount }),
      });

      await planBuildBroadcast('positionClose', planReq);
      await updatePositionsQuery();
    } catch (e) {
      openToast({
        type: 'error',
        message: 'Error with withdraw action',
        description: String(e),
      });
    } finally {
      this.setLoading(false);
    }
  };

  withdrawPositions = async (
    positions: { id: PositionId; position: Position }[],
  ): Promise<void> => {
    try {
      this.setLoading(true);

      // Our goal here is to withdraw all the closed position in this subaccount.
      // Problem:
      // 1. Auto-closing position switch to `Closed` without user input
      // 2. We are building a list of positions to withdraw based on the latest on-chain state.
      // 3. This list might contain position for which we do not yet own an associated closed LP NFT.
      // Solution:
      // 1. Track auto-closing positions that we are going to withdraw
      // 2. Inspect our balance to check if we have an associated opened NFT
      // 3. If that's the case, add a `PositionClose` action to the TPR.
      // Later, we can improve the general explorer data flow, for now we should just ship this and
      // make this flow work. This is, at the moment, the **ONLY** thing that matters.

      // First track all the positions we want to withdraw.
      const positionWithdraws = positions
        .filter(({ position }) => {
          return position.state?.state === PositionState_PositionStateEnum.CLOSED;
        })
        .map(({ id, position }) => ({
          positionId: id,
          tradingPair: position.phi?.pair,
          reserves: position.reserves,
        }));

      // Return early if there's no work to do.
      if (!positionWithdraws.length) {
        return;
      }

      // TODO(jason): not sure if this is duplicating code, feel free to move it out somewhere less disruptive.
      async function asyncIterableToArray<T>(asyncIterable: AsyncIterable<T>): Promise<T[]> {
        const array: T[] = [];
        for await (const item of asyncIterable) {
          array.push(item);
        }
        return array;
      }

      // Query the balance, ignoring the subaccount index for now.
      const balances = await asyncIterableToArray(penumbra.service(ViewService).balances({}));

      // We collect a list of position ids that are currently opened.
      const openedPositionIdStrings = balances
        .filter(
          ({ balanceView }) =>
            balanceView?.valueView.case === 'knownAssetId' &&
            balanceView.valueView.value.metadata?.base.startsWith('lpnft_opened_'),
        )
        .map(
          ({ balanceView }) =>
            (balanceView?.valueView.case === 'knownAssetId' &&
              // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Short-circuits properly
              balanceView.valueView.value.metadata?.base.replace('lpnft_opened_', '')) ||
            '',
        );

      // First, we filter for positions that are closed.
      // Then, we filter for mismatched positions.
      const positionCloses = positions
        .filter(
          // Start by filtering for auto-closing position that are closed on-chain.
          ({ position }) => position.state?.state === PositionState_PositionStateEnum.CLOSED,
        )
        .filter(({ id }) => {
          const idStr = bech32mPositionId(id);
          // Now check if id is in openedPositionIdStrings
          return openedPositionIdStrings.includes(idStr);
        })
        .map(({ id: positionId }) => ({ positionId }));

      const planReq = new TransactionPlannerRequest({
        positionWithdraws,
        positionCloses,
        source: new AddressIndex({ account: connectionStore.subaccount }),
      });

      await planBuildBroadcast('positionWithdraw', planReq);
      await updatePositionsQuery();
    } catch (e) {
      openToast({
        type: 'error',
        message: 'Error with withdraw action',
        description: String(e),
      });
    } finally {
      this.setLoading(false);
    }
  };

  setPositions = (positionsById: Map<string, Position>) => {
    this.positionsById = positionsById;
  };

  setAssets = (assets: Metadata[]) => {
    this.assets = assets;
  };

  setCurrentPair = (baseAsset: Metadata, quoteAsset: Metadata) => {
    this.currentPair = [baseAsset, quoteAsset];
  };

  getOrdersByBaseQuoteAssets = (
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

  getDirectionalOrders = ({
    asset1,
    asset2,
    baseAsset,
    quoteAsset,
  }: {
    asset1: CalculatedAsset;
    asset2: CalculatedAsset;
    baseAsset: Metadata;
    quoteAsset: Metadata;
  }): { direction: string; baseAsset: CalculatedAsset; quoteAsset: CalculatedAsset }[] => {
    const wellOrdered =
      baseAsset.penumbraAssetId?.equals(asset1.asset.penumbraAssetId) &&
      quoteAsset.penumbraAssetId?.equals(asset2.asset.penumbraAssetId);

    const orderFlipped =
      baseAsset.penumbraAssetId?.equals(asset2.asset.penumbraAssetId) &&
      quoteAsset.penumbraAssetId?.equals(asset1.asset.penumbraAssetId);

    // Happy path: we have a "Current pair" view which informs how we should render BASE/QUOTE assets.
    if (wellOrdered) {
      return this.getOrdersByBaseQuoteAssets(asset1, asset2);
    }

    // We check if flipping asset 1 and asset 2 would result in a base/quote match:
    if (orderFlipped) {
      return this.getOrdersByBaseQuoteAssets(asset2, asset1);
    }

    // If it fails, this means that the position we want to render is not on the "Current pair"
    // view. This is the case if we are on the "BTC/USDC" page, and preparing to display a position
    // that is for the "UM/USDY" pair.
    // In that case, we want to handle this by deciding if the position contain a well-known numeraire,
    // or default to canonical ordering since this is both rare and can be filtered at a higher-level
    const asset1IsStablecoin = ['USDC', 'USDY', 'USDT'].includes(asset1.asset.symbol.toUpperCase());
    const asset2IsStablecoin = ['USDC', 'USDY', 'USDT'].includes(asset2.asset.symbol.toUpperCase());

    const asset1IsNumeraire =
      asset1IsStablecoin || ['BTC', 'UM'].includes(asset1.asset.symbol.toUpperCase());
    const asset2IsNumeraire =
      asset2IsStablecoin || ['BTC', 'UM'].includes(asset2.asset.symbol.toUpperCase());

    // If both assets are numeraires, we adjudicate based on priority score:
    if (asset1IsNumeraire && asset2IsNumeraire) {
      // HACK: It's not completely clear that we want to rely on the registry priority
      // score vs. our own local numeraire rule. For example, the registry sets UM as
      // having the highest priority. This means that all the UM pairs will be rendered
      // with UM as the quote asset. Not great for UM/USDC, UM/USDY.
      const asset1HasPriority = asset1.asset.priorityScore > asset2.asset.priorityScore;

      if (asset1IsStablecoin && asset2IsStablecoin) {
        return asset1HasPriority
          ? this.getOrdersByBaseQuoteAssets(asset2, asset1)
          : this.getOrdersByBaseQuoteAssets(asset1, asset2);
      }

      if (asset1IsStablecoin) {
        return this.getOrdersByBaseQuoteAssets(asset2, asset1);
      }

      if (asset2IsStablecoin) {
        return this.getOrdersByBaseQuoteAssets(asset1, asset2);
      }

      return asset1HasPriority
        ? this.getOrdersByBaseQuoteAssets(asset2, asset1)
        : this.getOrdersByBaseQuoteAssets(asset1, asset2);
    }

    // Otherwise, this is simple, if asset 1 is a numeraire then we render it as the quote asset:
    if (asset1IsNumeraire) {
      return this.getOrdersByBaseQuoteAssets(asset2, asset1);
    }

    // Otherwise, if asset 2 is a numeraire we render that one as the quote asset:
    if (asset2IsNumeraire) {
      return this.getOrdersByBaseQuoteAssets(asset1, asset2);
    }

    // It's possible that neither are, which is rare, in that case we use the canonical ordering:
    return this.getOrdersByBaseQuoteAssets(asset1, asset2);
  };

  getOrderValueViews = ({
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
    const effectivePrice = pnum(
      baseAsset.effectivePrice.toString(),
      baseAsset.exponent,
    ).toValueView(quoteAsset.asset);
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

  getCalculatedAssets(position: ExecutedPosition): [CalculatedAsset, CalculatedAsset] {
    const { phi, reserves } = position;
    const { pair, component } = phi;

    const asset1 = this.assets.find(asset => asset.penumbraAssetId?.equals(pair.asset1));
    const asset2 = this.assets.find(asset => asset.penumbraAssetId?.equals(pair.asset2));
    if (!asset1?.penumbraAssetId || !asset2?.penumbraAssetId) {
      throw new Error('No assets found in registry that belong to the trading pair');
    }

    const asset1Exponent = asset1.denomUnits.find(
      denomUnit => denomUnit.denom === asset1.display,
    )?.exponent;
    const asset2Exponent = asset2.denomUnits.find(
      denomUnit => denomUnit.denom === asset2.display,
    )?.exponent;
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
  }

  get displayPositions(): DisplayPosition[] {
    if (!this.assets.length || !this.currentPair) {
      return [];
    }

    return [...this.positionsById.entries()].map(([id, position]) => {
      const { phi, state } = position as ExecutedPosition;
      const { component } = phi;
      const [asset1, asset2] = this.getCalculatedAssets(position as ExecutedPosition);

      if (!this.currentPair) {
        throw new Error('No current pair or assets');
      }

      const [baseAsset, quoteAsset] = this.currentPair;

      // Now that we have computed all the price information using the canonical ordering,
      // we can simply adjust our values if the directed pair is not the same as the canonical one:
      const orders = this.getDirectionalOrders({
        asset1,
        asset2,
        baseAsset,
        quoteAsset,
      }).map(this.getOrderValueViews);

      return {
        id: new PositionId(positionIdFromBech32(id)),
        idString: id,
        position,
        orders,
        fee: `${pnum(component.fee / 100).toFormattedString({ decimals: 2 })}%`,
        // TODO:
        // We do not yet filter `Closed` positions to allow auto-closing position to provide visual
        // feedback about execution. This is probably best later replaced by either a notification, or a
        // dedicated view. Fine for now.
        isWithdrawn: state.state === PositionState_PositionStateEnum.WITHDRAWN,
        isOpened: state.state === PositionState_PositionStateEnum.OPENED,
        isClosed: state.state === PositionState_PositionStateEnum.CLOSED,
        state: state.state,
      };
    });
  }
}

export const positionsStore = new PositionsStore();
