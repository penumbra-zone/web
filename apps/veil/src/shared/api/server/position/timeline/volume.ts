import { pindexer, VolumeAndFees } from '@/shared/database';
import {
  PositionStateResponse,
  VolumeAndFeesResponse,
  VolumeAndFeesValue,
} from '@/shared/api/server/position/timeline/types.ts';
import { pnum } from '@penumbra-zone/types/pnum';
import { AssetId, Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { PositionId } from '@penumbra-zone/protobuf/penumbra/core/component/dex/v1/dex_pb';
import { getAssetIdFromValue } from '@penumbra-zone/getters/value';

const addValue = (raw: VolumeAndFees, asset1: AssetId, asset2: AssetId): VolumeAndFeesValue => {
  return {
    contextAssetStart: new AssetId({ inner: raw.context_asset_start }),
    contextAssetEnd: new AssetId({ inner: raw.context_asset_end }),
    executionCount: raw.executionCount,
    volume1: new Value({
      amount: pnum(raw.volume1).toAmount(),
      assetId: asset1,
    }),
    volume2: new Value({
      amount: pnum(raw.volume2).toAmount(),
      assetId: asset2,
    }),
    fees1: new Value({
      amount: pnum(raw.fees1).toAmount(),
      assetId: asset1,
    }),
    fees2: new Value({
      amount: pnum(raw.fees2).toAmount(),
      assetId: asset2,
    }),
  };
};

const getTotals = (
  all: VolumeAndFees[],
  asset1: AssetId,
  asset2: AssetId,
): Omit<VolumeAndFeesValue, 'contextAssetStart' | 'contextAssetEnd'> => {
  const totalRaw = all.reduce(
    (acc, curr) => {
      return {
        volume1: acc.volume1 + pnum(curr.volume1).toBigInt(),
        volume2: acc.volume2 + pnum(curr.volume2).toBigInt(),
        fees1: acc.fees1 + pnum(curr.fees1).toBigInt(),
        fees2: acc.fees2 + pnum(curr.fees2).toBigInt(),
        executionCount: acc.executionCount + curr.executionCount,
      };
    },
    {
      volume1: 0n,
      volume2: 0n,
      fees1: 0n,
      fees2: 0n,
      executionCount: 0,
    },
  );

  return {
    executionCount: totalRaw.executionCount,
    volume1: new Value({
      amount: pnum(totalRaw.volume1).toAmount(),
      assetId: asset1,
    }),
    volume2: new Value({
      amount: pnum(totalRaw.volume2).toAmount(),
      assetId: asset2,
    }),
    fees1: new Value({
      amount: pnum(totalRaw.fees1).toAmount(),
      assetId: asset1,
    }),
    fees2: new Value({
      amount: pnum(totalRaw.fees2).toAmount(),
      assetId: asset2,
    }),
  };
};

export const addValueToVolume = async (
  id: PositionId,
  state: PositionStateResponse,
): Promise<VolumeAndFeesResponse> => {
  const result = await pindexer.getPositionVolumeAndFees(id);

  const asset1 = getAssetIdFromValue(state.currentReserves1);
  const asset2 = getAssetIdFromValue(state.currentReserves2);

  const volumeAndFees = result.map(r => addValue(r, asset1, asset2));
  const totals = getTotals(result, asset1, asset2);

  return {
    asset1,
    asset2,
    all: volumeAndFees,
    totals,
  };
};
