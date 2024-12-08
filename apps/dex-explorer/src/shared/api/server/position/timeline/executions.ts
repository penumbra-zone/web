import { ChainRegistryClient, Registry } from '@penumbra-labs/registry';
import { AssetId, Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getValueView } from '../../book/helpers';
import { pnum } from '@penumbra-zone/types/pnum';
import {
  PositionExecution,
  PositionExecutions,
  PositionStateResponse,
} from '@/shared/api/server/position/timeline/types.ts';
import { getAssetIdFromValueView } from '@penumbra-zone/getters/value-view';
import { ExecutionWithReserves } from '@/shared/database';

const addValueView = (
  registry: Registry,
  raw: ExecutionWithReserves,
  assetId1: AssetId,
  assetId2: AssetId,
): PositionExecution => {
  const isAsset1Input = BigInt(raw.execution.delta_1) !== 0n; // Determine trade direction
  const input = isAsset1Input
    ? getValueView(
        registry,
        new Value({
          amount: pnum(raw.execution.delta_1).toAmount(),
          assetId: assetId1,
        }),
      )
    : getValueView(
        registry,
        new Value({
          amount: pnum(raw.execution.delta_2).toAmount(),
          assetId: assetId2,
        }),
      );

  const output = isAsset1Input
    ? getValueView(
        registry,
        new Value({
          amount: pnum(raw.execution.delta_2).toAmount(),
          assetId: assetId2,
        }),
      )
    : getValueView(
        registry,
        new Value({
          amount: pnum(raw.execution.delta_1).toAmount(),
          assetId: assetId1,
        }),
      );

  const fee = isAsset1Input
    ? getValueView(
        registry,
        new Value({
          amount: pnum(raw.execution.fee_1).toAmount(),
          assetId: assetId1,
        }),
      )
    : getValueView(
        registry,
        new Value({
          amount: pnum(raw.execution.fee_2).toAmount(),
          assetId: assetId2,
        }),
      );

  const reserves1 = getValueView(
    registry,
    new Value({
      amount: pnum(raw.reserves.reserves_1).toAmount(),
      assetId: assetId1,
    }),
  );

  const reserves2 = getValueView(
    registry,
    new Value({
      amount: pnum(raw.reserves.reserves_2).toAmount(),
      assetId: assetId2,
    }),
  );

  const assetIdCxtStart = new AssetId({
    inner: Uint8Array.from(raw.execution.context_asset_start),
  });
  const assetIdCxtEnd = new AssetId({ inner: Uint8Array.from(raw.execution.context_asset_end) });
  const contextStart = registry.getMetadata(assetIdCxtStart);
  const contextEnd = registry.getMetadata(assetIdCxtEnd);

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

export const addValueViewsToExecutions = async (
  state: PositionStateResponse,
  raw: { items: ExecutionWithReserves[]; skippedRows: number },
): Promise<PositionExecutions> => {
  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  if (!chainId) {
    throw new Error('PENUMBRA_CHAIN_ID is not set');
  }
  const registryClient = new ChainRegistryClient();
  const registry = await registryClient.remote.get(chainId);

  const asset1Id = getAssetIdFromValueView(state.reserves1);
  const asset2Id = getAssetIdFromValueView(state.reserves2);

  return {
    skipped: raw.skippedRows,
    items: raw.items.map(i => addValueView(registry, i, asset1Id, asset2Id)),
  };
};
