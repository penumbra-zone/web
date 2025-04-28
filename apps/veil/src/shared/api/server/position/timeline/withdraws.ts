import { AssetId, Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Selectable } from 'kysely';
import { pnum } from '@penumbra-zone/types/pnum';
import {
  PositionStateResponse,
  PositionWithdrawal,
} from '@/shared/api/server/position/timeline/types.ts';
import { DexExPositionWithdrawals } from '@/shared/database/schema.ts';
import { PositionId } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { pindexer } from '@/shared/database';
import { getAssetIdFromValue } from '@penumbra-zone/getters/value';

const sha256HashStr = async (b: Buffer) =>
  Buffer.from(await crypto.subtle.digest('SHA-256', b)).toString('hex');

const addValue = async (
  raw: Selectable<DexExPositionWithdrawals>,
  assetId1: AssetId,
  assetId2: AssetId,
): Promise<PositionWithdrawal> => {
  return {
    txHash: raw.withdrawal_tx ? await sha256HashStr(raw.withdrawal_tx) : '',
    height: raw.height,
    time: raw.time.toISOString(),
    reserves1: new Value({
      amount: pnum(raw.reserves_1).toAmount(),
      assetId: assetId1,
    }),
    reserves2: new Value({
      assetId: assetId2,
      amount: pnum(raw.reserves_2).toAmount(),
    }),
  };
};

export const addValueViewsToWithdrawals = async (
  id: PositionId,
  state: PositionStateResponse,
): Promise<PositionWithdrawal[]> => {
  const result = await pindexer.getPositionWithdrawals(id);

  const asset1Id = getAssetIdFromValue(state.currentReserves1);
  const asset2Id = getAssetIdFromValue(state.currentReserves2);

  return await Promise.all(result.map(w => addValue(w, asset1Id, asset2Id)));
};
