import { VolumeAndFees } from '@/shared/database';
import { ChainRegistryClient, Registry } from '@penumbra-labs/registry';
import {
  PositionStateResponse,
  VolumeAndFeesResponse,
  VolumeAndFeesVV,
} from '@/shared/api/server/position/timeline/types.ts';
import { getValueView } from '@/shared/api/server/book/helpers.ts';
import { pnum } from '@penumbra-zone/types/pnum';
import { AssetId, Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getMetadata } from '@penumbra-zone/getters/value-view';
import { getAssetId } from '@penumbra-zone/getters/metadata';

const addValueView = (
  registry: Registry,
  raw: VolumeAndFees,
  asset1: AssetId,
  asset2: AssetId,
): VolumeAndFeesVV => {
  return {
    contextAssetStart: registry.getMetadata(new AssetId({ inner: raw.context_asset_start })),
    contextAssetEnd: registry.getMetadata(new AssetId({ inner: raw.context_asset_end })),
    executionCount: raw.executionCount,
    volume1: getValueView(
      registry,
      new Value({
        amount: pnum(raw.volume1).toAmount(),
        assetId: asset1,
      }),
    ),
    volume2: getValueView(
      registry,
      new Value({
        amount: pnum(raw.volume2).toAmount(),
        assetId: asset2,
      }),
    ),
    fees1: getValueView(
      registry,
      new Value({
        amount: pnum(raw.fees1).toAmount(),
        assetId: asset1,
      }),
    ),
    fees2: getValueView(
      registry,
      new Value({
        amount: pnum(raw.fees2).toAmount(),
        assetId: asset2,
      }),
    ),
  };
};

const getTotals = (
  registry: Registry,
  all: VolumeAndFees[],
  asset1: AssetId,
  asset2: AssetId,
): Omit<VolumeAndFeesVV, 'contextAssetStart' | 'contextAssetEnd'> => {
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
    volume1: getValueView(
      registry,
      new Value({
        amount: pnum(totalRaw.volume1).toAmount(),
        assetId: asset1,
      }),
    ),
    volume2: getValueView(
      registry,
      new Value({
        amount: pnum(totalRaw.volume2).toAmount(),
        assetId: asset2,
      }),
    ),
    fees1: getValueView(
      registry,
      new Value({
        amount: pnum(totalRaw.fees1).toAmount(),
        assetId: asset1,
      }),
    ),
    fees2: getValueView(
      registry,
      new Value({
        amount: pnum(totalRaw.fees2).toAmount(),
        assetId: asset2,
      }),
    ),
  };
};

export const addValueViewsToVolume = async (
  state: PositionStateResponse,
  raw: VolumeAndFees[],
): Promise<VolumeAndFeesResponse> => {
  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  if (!chainId) {
    throw new Error('PENUMBRA_CHAIN_ID is not set');
  }

  const registryClient = new ChainRegistryClient();
  const registry = await registryClient.remote.get(chainId);

  const asset1Metadata = getMetadata(state.reserves1);
  const asset2Metadata = getMetadata(state.reserves2);
  const asset1Id = getAssetId(asset1Metadata);
  const asset2Id = getAssetId(asset2Metadata);

  const volumeAndFees = raw.map(r => addValueView(registry, r, asset1Id, asset2Id));
  const totals = getTotals(registry, raw, asset1Id, asset2Id);

  return {
    asset1: asset1Metadata,
    asset2: asset2Metadata,
    all: volumeAndFees,
    totals,
  };
};
