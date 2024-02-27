import { PositionId, Position } from "@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/dex/v1/dex_pb";

export interface LiquidityPositionQuerierInterface {
  liquidityPositionById(id: PositionId): Promise<Position | undefined>;
}
