import { PositionId, Position, DirectedTradingPair, SwapExecution, CandlestickData } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb";

export interface DexQueryServiceClientInterface {
  liquidityPositionById(id: PositionId): Promise<Position | undefined>;
  liquidityPositionsByPrice(directedTradingPair: DirectedTradingPair, limit: number): Promise<Position[] | undefined>;
  arbExecutions(starHheight: number, endHeight: number): Promise<SwapExecutionWithBlockHeight[] | undefined>;
  swapExecutions(startHeight: number, endHeight: number): Promise<SwapExecutionWithBlockHeight[] | undefined>;
  candlestickData(tradingPair: DirectedTradingPair, limit: number, startHeight: number): Promise<CandlestickData[] | undefined>;
}

export interface SwapExecutionWithBlockHeight {
  swapExecution: SwapExecution
  blockHeight: number
}