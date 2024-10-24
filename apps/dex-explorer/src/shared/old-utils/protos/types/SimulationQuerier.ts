// @ts-nocheck
/* eslint-disable -- disabling this file as this was created before our strict rules */
import {
  SimulateTradeRequest,
  SwapExecution,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

export interface SimulationServiceInterface {
  simulateTrade(request: SimulateTradeRequest): Promise<SwapExecution | undefined>;
}
