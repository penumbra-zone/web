import {
  SimulateTradeRequest,
  SwapExecution
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb";

export interface SimulationServiceInterface {
  simulateTrade(
    request: SimulateTradeRequest
  ): Promise<SwapExecution | undefined>;
}
