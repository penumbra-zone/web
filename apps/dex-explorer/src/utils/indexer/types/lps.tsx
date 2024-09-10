// @ts-nocheck
/* eslint-disable -- disabling this file as this was created before our strict rules */
export interface LiquidityPositionEvent {
  block_height: number;
  event_id: number; // ! Needed for sorting
  block_id: number;
  tx_id: number;
  type: string;
  tx_hash: string;
  created_at: string;
  index: number;
  lpevent_attributes: {
    positionId: {
      inner: string;
    };
    reserves1?: {
      hi?: number;
      lo?: number;
    };
    reserves2?: {
      hi?: number;
      lo?: number;
    };
    tradingFee?: number;
    tradingPair?: {
      asset1: {
        inner: string;
      };
      asset2: {
        inner: string;
      };
    };
  };
}

export interface PositionExecutionEvent {
  block_height: number;
  event_id: number; // ! Needed for sorting
  block_id: number;
  tx_id: number;
  type: string;
  tx_hash: string;
  created_at: string;
  index: number;
  execution_event_attributes: {
    positionId: {
      inner: string;
    };
    reserves1?: {
      hi?: number;
      lo?: number;
    };
    reserves2?: {
      hi?: number;
      lo?: number;
    };
    tradingFee?: number;
    tradingPair?: {
      asset1: {
        inner: string;
      };
      asset2: {
        inner: string;
      };
    };
  };
}

export interface BlockInfo {
  height: number,
  created_at: string,
}
