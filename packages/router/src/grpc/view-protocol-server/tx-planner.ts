import {
  TransactionPlannerRequest,
  TransactionPlannerResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { getAddressByIndex, TxPlanner } from '@penumbra-zone/wasm-ts';
import {
  Address,
  AddressIndex,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { localExtStorage } from '@penumbra-zone/storage';
import { ViewReqMessage } from './router';
import { ServicesInterface } from '@penumbra-zone/types';

export const isTxPlannerRequest = (msg: ViewReqMessage): msg is TransactionPlannerRequest => {
  return msg.getType().typeName === TransactionPlannerRequest.typeName;
};

// If there are any balances left over, refund back to source. Default to account 0.
const getDefaultAddress = async (req: TransactionPlannerRequest): Promise<Address> => {
  const refundAddrIndex = req.source ?? new AddressIndex({ account: 0 });
  const wallets = await localExtStorage.get('wallets');
  return getAddressByIndex(wallets[0]!.fullViewingKey, refundAddrIndex.account);
};

export const handleTxPlannerReq = async (
  req: TransactionPlannerRequest,
  services: ServicesInterface,
): Promise<TransactionPlannerResponse> => {
  const refundAddr = await getDefaultAddress(req);
  const { indexedDb } = await services.getWalletServices();
  const chainParams = await services.querier.app.chainParams();
  const fmdParams = await indexedDb.getFmdParams();
  if (!fmdParams) throw new Error('Fmd Params not in indexeddb');

  const planner = await TxPlanner.initialize({
    idbConstants: indexedDb.constants(),
    chainParams,
    fmdParams,
  });

  if (req.expiryHeight !== 0n) {
    planner.expiryHeight(req.expiryHeight);
  }

  if (req.memo) {
    req.memo.sender ??= refundAddr;
    planner.memo(req.memo);
  }

  if (req.fee) {
    planner.fee(req.fee);
  }

  for (const o of req.outputs) {
    if (!o.value || !o.address) continue;
    planner.output(o.value, o.address);
  }

  const plan = await planner.plan(refundAddr);
  return new TransactionPlannerResponse({ plan });
};
