import { PromiseClient } from "@connectrpc/connect";
import { createClient } from "../utils";
import { QueryService } from "@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/dex/v1/dex_connect";
import {
  PositionId,
  Position,
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb";
import { LiquidityPositionQuerierInterface } from "../../types/LiquidityPositionQuerier";

export class LiquidityPositionQuerier implements LiquidityPositionQuerierInterface {
  private readonly client: PromiseClient<typeof QueryService>;

  constructor({ grpcEndpoint }: { grpcEndpoint: string }) {
    this.client = createClient(grpcEndpoint, QueryService);
  }

  async liquidityPositionById(
    positionId: PositionId
  ): Promise<Position | undefined> {
    //console.log('liquidityPositionById', positionId)
    const res = await this.client.liquidityPositionById({ positionId });
    return res.data;
  }
}
