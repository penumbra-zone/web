// @ts-nocheck
/* eslint-disable -- disabling this file as this was created before our strict rules */
import { SwapExecution } from "@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb";
import { BlockInfo, LiquidityPositionEvent } from "../indexer/types/lps";

export interface BlockSummaryData {
  openPositionEvents: LiquidityPositionEvent[];
  closePositionEvents: LiquidityPositionEvent[];
  withdrawPositionEvents: LiquidityPositionEvent[];
  swapExecutions: SwapExecution[];
  arbExecutions: SwapExecution[];
  createdAt: string;
}

export interface BlockDetailedSummaryData {
  openPositionEvents: LiquidityPositionEvent[];
  closePositionEvents: LiquidityPositionEvent[];
  withdrawPositionEvents: LiquidityPositionEvent[];
  otherPositionEvents: LiquidityPositionEvent[];
  swapExecutions: SwapExecution[];
  arbExecutions: SwapExecution[];
  createdAt: string;
}

export type BlockInfoMap = Record<number, BlockInfo>;

export type BlockSummaryMap = Record<number, BlockSummaryData>;
