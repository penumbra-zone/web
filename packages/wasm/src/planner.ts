import { TransactionPlanSchema } from '@penumbra-zone/protobuf/penumbra/core/transaction/v1/transaction_pb';
import {
  TransactionPlannerRequest,
  TransactionPlannerRequestSchema,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { JsonValue, fromJson, toBinary } from '@bufbuild/protobuf';
import type { IdbConstants } from '@penumbra-zone/types/indexed-db';
import {
  FullViewingKey,
  FullViewingKeySchema,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { AssetId, AssetIdSchema } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { plan_transaction } from '../wasm/index.js';

export const planTransaction = async (
  idbConstants: IdbConstants,
  request: TransactionPlannerRequest,
  fullViewingKey: FullViewingKey,
  gasFeeToken: AssetId,
) => {
  const plan = (await plan_transaction(
    idbConstants,
    toBinary(TransactionPlannerRequestSchema, request),
    toBinary(FullViewingKeySchema, fullViewingKey),
    toBinary(AssetIdSchema, gasFeeToken),
  )) as JsonValue;
  return fromJson(TransactionPlanSchema, plan);
};
