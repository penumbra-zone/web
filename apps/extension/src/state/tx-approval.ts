import { AllSlices, SliceCreator } from './index';
import { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1alpha1/custody_pb';
import { Jsonified } from '@penumbra-zone/types';
import { MessageResponder } from '@penumbra-zone/types/src/internal-msg/shared';
import { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { TxApproval } from '@penumbra-zone/types/src/internal-msg/tx-approval';

export interface TxApprovalSlice {
  authorizeRequest?: Jsonified<AuthorizeRequest>;
  transactionViewFromPlan?: Jsonified<TransactionView>;
  // Holding the message responder function. Service worker will be "awaiting" the call of this.
  responder?: MessageResponder<TxApproval>;
}

export const createTxApprovalSlice: SliceCreator<TxApprovalSlice> = () => ({});

export const txApprovalSelector = (state: AllSlices) => state.txApproval;
