import { useQuery } from '@tanstack/react-query';
import {
  PositionExecutions,
  PositionStateResponse,
  PositionTimelineResponse,
  PositionWithdrawal,
  VolumeAndFeesResponse,
} from '@/shared/api/server/position/timeline/types';
import { apiFetch } from '@/shared/utils/api-fetch.ts';
import {
  PositionExecutionsVV,
  PositionStateVV,
  PositionTimelineResponseVV,
  PositionWithdrawalVV,
  VolumeAndFeesAll,
} from '@/pages/inspect/lp/api/types.ts';
import { Registry } from '@penumbra-labs/registry';
import { registryQueryFn } from '@/shared/api/registry.ts';
import { getValueView } from '@/shared/api/server/book/helpers.ts';

const positionsStateAddVV = (res: PositionStateResponse, registry: Registry): PositionStateVV => {
  return {
    reserves1: getValueView(registry, res.reserves1),
    reserves2: getValueView(registry, res.reserves2),
    unit1: getValueView(registry, res.unit1),
    unit2: getValueView(registry, res.unit2),
    offer1: getValueView(registry, res.offer1),
    offer2: getValueView(registry, res.offer2),
    priceRef1: getValueView(registry, res.priceRef1),
    priceRef2: getValueView(registry, res.priceRef2),
    priceRef1Inv: getValueView(registry, res.priceRef1Inv),
    priceRef2Inv: getValueView(registry, res.priceRef2Inv),
    feeBps: res.feeBps,
    openingHeight: res.openingHeight,
    openingTime: res.openingTime,
    openingTx: res.openingTx,
    closingHeight: res.closingHeight,
    closingTime: res.closingTime,
    closingTx: res.closingTx,
  };
};

const executionsAddVV = (res: PositionExecutions, registry: Registry): PositionExecutionsVV => {
  return {
    items: res.items.map(p => ({
      input: getValueView(registry, p.input),
      output: getValueView(registry, p.output),
      fee: getValueView(registry, p.fee),
      reserves1: getValueView(registry, p.reserves1),
      reserves2: getValueView(registry, p.reserves2),
      contextStart: registry.getMetadata(p.contextStart),
      contextEnd: registry.getMetadata(p.contextEnd),
      time: p.time,
      height: p.height,
    })),
    skipped: res.skipped,
  };
};

const withdrawalsAddVV = (
  res: PositionWithdrawal[],
  registry: Registry,
): PositionWithdrawalVV[] => {
  return res.map(w => ({
    reserves1: getValueView(registry, w.reserves1),
    reserves2: getValueView(registry, w.reserves2),
    time: w.time,
    height: w.height,
    txHash: w.txHash,
  }));
};

const volumeAddVV = (res: VolumeAndFeesResponse, registry: Registry): VolumeAndFeesAll => {
  return {
    asset1: registry.getMetadata(res.asset1),
    asset2: registry.getMetadata(res.asset2),
    totals: {
      volume1: getValueView(registry, res.totals.volume1),
      volume2: getValueView(registry, res.totals.volume2),
      fees1: getValueView(registry, res.totals.fees1),
      fees2: getValueView(registry, res.totals.fees2),
      executionCount: res.totals.executionCount,
    },
    all: res.all.map(v => ({
      volume1: getValueView(registry, v.volume1),
      volume2: getValueView(registry, v.volume2),
      fees1: getValueView(registry, v.fees1),
      fees2: getValueView(registry, v.fees2),
      contextAssetStart: registry.getMetadata(v.contextAssetStart),
      contextAssetEnd: registry.getMetadata(v.contextAssetEnd),
      executionCount: v.executionCount,
    })),
  };
};

const timelineFetch = async (id: string): Promise<PositionTimelineResponseVV> => {
  const result = await apiFetch<PositionTimelineResponse>(
    `/api/position/timeline?positionId=${id}`,
  );

  const registry = await registryQueryFn();

  return {
    state: positionsStateAddVV(result.state, registry),
    executions: executionsAddVV(result.executions, registry),
    withdrawals: withdrawalsAddVV(result.withdrawals, registry),
    volumeAndFees: volumeAddVV(result.volumeAndFees, registry),
  };
};

export const useLpPosition = (id: string) => {
  return useQuery({
    queryKey: ['lpPosition', id],
    retry: 1,
    queryFn: () => timelineFetch(id),
  });
};
