import { PromiseClient } from '@connectrpc/connect';
import { createClient } from '../utils';
import { SimulationService } from '@penumbra-zone/protobuf';
import {
  SimulateTradeRequest,
  SimulateTradeResponse,
} from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';

export class SimulationQuerier {
  private readonly client: PromiseClient<typeof SimulationService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, SimulationService);
  }

  async simulateTrade(request: SimulateTradeRequest): Promise<SimulateTradeResponse> {
    return this.client.simulateTrade(request);
  }
}
