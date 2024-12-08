import { ChainRegistryClient, Registry } from '@penumbra-labs/registry';
import { AssetId, Value } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { getValueView } from '../../book/helpers';
import { Selectable } from 'kysely';
import { pnum } from '@penumbra-zone/types/pnum';
import {
  PositionStateResponse,
  PositionWithdrawal,
} from '@/shared/api/server/position/timeline/types.ts';
import { DexExPositionWithdrawals } from '@/shared/database/schema.ts';
import { getAssetIdFromValueView } from '@penumbra-zone/getters/value-view';
import { sha256HashStr } from '@penumbra-zone/crypto-web/sha256';

const addValueView = async (
  registry: Registry,
  raw: Selectable<DexExPositionWithdrawals>,
  assetId1: AssetId,
  assetId2: AssetId,
): Promise<PositionWithdrawal> => {
  return {
    txHash: raw.withdrawal_tx ? await sha256HashStr(raw.withdrawal_tx) : '',
    height: raw.height,
    time: raw.time.toISOString(),
    reserves1: getValueView(
      registry,
      new Value({
        amount: pnum(raw.reserves_1).toAmount(),
        assetId: assetId1,
      }),
    ),
    reserves2: getValueView(
      registry,
      new Value({
        assetId: assetId2,
        amount: pnum(raw.reserves_2).toAmount(),
      }),
    ),
  };
};

export const addValueViewsToWithdrawals = async (
  state: PositionStateResponse,
  raw: Selectable<DexExPositionWithdrawals>[],
): Promise<PositionWithdrawal[]> => {
  const chainId = process.env['PENUMBRA_CHAIN_ID'];
  if (!chainId) {
    throw new Error('PENUMBRA_CHAIN_ID is not set');
  }
  const registryClient = new ChainRegistryClient();
  const registry = await registryClient.remote.get(chainId);

  const asset1Id = getAssetIdFromValueView(state.reserves1);
  const asset2Id = getAssetIdFromValueView(state.reserves2);

  return await Promise.all(raw.map(w => addValueView(registry, w, asset1Id, asset2Id)));
};
