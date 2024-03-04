import { TransactionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { JsonValue } from '@bufbuild/protobuf';
import { IdbConstants } from '@penumbra-zone/types';

import { plan_transaction } from '../wasm';

export const planTransaction = async (
  idbConstants: IdbConstants,
  request: TransactionPlannerRequest,
  fullViewingKey: string,
) => {
  console.log('got here 1');
  const ret = await plan_transaction(idbConstants, request.toJson(), fullViewingKey);
  console.log('got here 2');
  /*
    const jsonPlan = (await plan_transaction(
        idbConstants,
        request,
        changeAddress,
        fmdParams,
        sctParams,
        gasPrices,
        chainId,
    )) as JsonValue;
    */
  const jsonPlan = ret as JsonValue;

  return TransactionPlan.fromJson(jsonPlan);
};
