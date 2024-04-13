import { PromiseClient } from "@connectrpc/connect";
import { createClient } from "../utils";
import { QueryService } from "@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/core/component/dex/v1/dex_connect";
import {
  PositionId,
  Position,
  DirectedTradingPair,
} from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb";
import { LiquidityPositionQuerierInterface } from "../../types/LiquidityPositionQuerier";
import { Readable } from "stream";

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

  async liquidityPositionsByPrice(
    tradingPair: DirectedTradingPair,
    limit: number
  ): Promise<Position[] | undefined> {
    const res = await this.client.liquidityPositionsByPrice({
      tradingPair,
      limit: BigInt(limit),
    });

    if (!res[Symbol.asyncIterator]) {
      console.error("Received:", res);
      throw new Error(
        "Received an unexpected response type from the server, expected an async iterable."
      );
    }

    const positions: Position[] = [];
    console.log("res:", res);
    // Res is Symbol(Symbol.asyncIterator)]: [Function: [Symbol.asyncIterator]]
    for await (const position of res as Readable) {
      positions.push(position);
    }
    return positions;
  }
}
