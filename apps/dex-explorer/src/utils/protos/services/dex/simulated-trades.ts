import { PromiseClient } from "@connectrpc/connect";
import { createClient } from "../utils";
import { SimulationService } from "@penumbra-zone/protobuf";
import { SimulationServiceInterface } from "../../types/SimulationQuerier";
import { SimulateTradeRequest, SimulateTradeResponse, SwapExecution } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb";

export class SimulationQuerier implements SimulationServiceInterface {
  private readonly client: PromiseClient<typeof SimulationService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, SimulationService);
  }

  async simulateTrade(request: SimulateTradeRequest): Promise<SwapExecution | undefined> {
    const res = await this.client.simulateTrade(request);
    return res.output;
  }

}
