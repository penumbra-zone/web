import { PositionId, Position, DirectedTradingPair } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb";

export interface LiquidityPositionQuerierInterface {
  liquidityPositionById(id: PositionId): Promise<Position | undefined>;
  liquidityPositionsByPrice(directedTradingPair: DirectedTradingPair, limit: number): Promise<Position[] | undefined>;
}
