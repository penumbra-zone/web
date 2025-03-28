import {
  BareTradingFunction,
  Position,
  PositionId,
  PositionState,
  PositionState_PositionStateEnum,
  TradingPair,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { Metadata, ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@penumbra-zone/protobuf/penumbra/core/num/v1/num_pb';
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
  sortValues: {
    type: string;
    tradeAmount: number;
    effectivePrice: number;
    basePrice: number;
    feeTier: number;
    positionId: string;
  };
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
