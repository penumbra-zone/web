import { TransactionPlan } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1/transaction_pb';
import { TransactionPlannerRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { JsonValue } from '@bufbuild/protobuf';
import { IdbConstants } from '@penumbra-zone/types';

import { plan_transaction } from '../wasm';
import { FmdParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { SctParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/sct/v1/sct_pb';
import { GasPrices } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/fee/v1/fee_pb';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

export const planTransaction = async (
    idbConstants: IdbConstants,
    request: TransactionPlannerRequest,
    changeAddress: Address,
    fmdParams: FmdParameters,
    sctParams: SctParameters,
    gasPrices: GasPrices,
    chainId: string,
) => {
    console.log("got here 1");
    const ret = await plan_transaction(
        idbConstants,
        request.toJson(),
        changeAddress.toJson(),
        fmdParams.toJson(),
        sctParams.toJson(),
        gasPrices, // todo: why is this not toJson()? it breaks everything
        chainId,
    );
    console.log("got here 2");
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
