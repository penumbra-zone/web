import { AssetId, Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { pnum } from '@penumbra-zone/types/pnum';
import {
  PositionExecution,
  PositionExecutions,
  PositionStateResponse,
} from '@/shared/api/server/position/timeline/types.ts';
import { ExecutionWithReserves, pindexer } from '@/shared/database';
import { PositionId } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { getAssetIdFromValue } from '@penumbra-zone/getters/value';

const addValue = (
  raw: ExecutionWithReserves,
  assetId1: AssetId,
  assetId2: AssetId,
): PositionExecution => {
  const isAsset1Input = BigInt(raw.execution.delta_1) !== 0n; // Determine trade direction
  const input = isAsset1Input
    ? new Value({
        amount: pnum(raw.execution.delta_1).toAmount(),
        assetId: assetId1,
      })
    : new Value({
        amount: pnum(raw.execution.delta_2).toAmount(),
        assetId: assetId2,
      });

  const output = isAsset1Input
    ? new Value({
        amount: pnum(raw.execution.delta_2).toAmount(),
        assetId: assetId2,
      })
    : new Value({
        amount: pnum(raw.execution.delta_1).toAmount(),
        assetId: assetId1,
      });

  const fee = isAsset1Input
    ? new Value({
        amount: pnum(raw.execution.fee_1).toAmount(),
        assetId: assetId1,
      })
    : new Value({
        amount: pnum(raw.execution.fee_2).toAmount(),
        assetId: assetId2,
      });

  const reserves1 = new Value({
    amount: pnum(raw.reserves.reserves_1).toAmount(),
    assetId: assetId1,
  });

  const reserves2 = new Value({
    amount: pnum(raw.reserves.reserves_2).toAmount(),
    assetId: assetId2,
  });
  const contextStart = new AssetId({
    inner: Uint8Array.from(raw.execution.context_asset_start),
  });
  const contextEnd = new AssetId({ inner: Uint8Array.from(raw.execution.context_asset_end) });

  const time = raw.execution.time.toISOString();
  const height = raw.execution.height;

  return {
    time,
    height,
    input,
    output,
    fee,
    reserves1,
    reserves2,
    contextStart,
    contextEnd,
  };
};

export const getExecutions = async (
  id: PositionId,
  state: PositionStateResponse,
): Promise<PositionExecutions> => {
  const result = await pindexer.getPositionExecutionsWithReserves(id);

  const asset1Id = getAssetIdFromValue(state.reserves1);
  const asset2Id = getAssetIdFromValue(state.reserves2);

  return {
    skipped: result.skippedRows,
    items: result.items.map(i => addValue(i, asset1Id, asset2Id)),
  };
};
