import {
  TransactionPlan,
  TransactionPlannerRequest,
  FullViewingKey,
  AssetId,
} from '@penumbra-zone/protobuf/types';
import { JsonValue } from '@bufbuild/protobuf';
import { plan_transaction } from '../wasm/index.js';
import type { IdbConstants } from '@penumbra-zone/types/indexed-db';

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
