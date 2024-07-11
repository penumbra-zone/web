import { TransactionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb.js';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { JsonValue } from '@bufbuild/protobuf';
import { plan_transaction } from '../wasm/index.js';
import type { IdbConstants } from '@penumbra-zone/types/indexed-db';
import { FullViewingKey } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb.js';
import { AssetId } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb.js';

export const planTransaction = async (
  idbConstants: IdbConstants,
  request: TransactionPlannerRequest,
  fullViewingKey: FullViewingKey,
  gasFeeToken: AssetId,
) => {
  const plan = (await plan_transaction(
    idbConstants,
    request.toBinary(),
    fullViewingKey.toBinary(),
    gasFeeToken.toBinary(),
  )) as JsonValue;
  return TransactionPlan.fromJson(plan);
};
