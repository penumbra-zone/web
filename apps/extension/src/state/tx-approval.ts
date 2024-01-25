import type { TransactionView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import type { AuthorizeRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/custody/v1alpha1/custody_pb';
import type { Jsonified, Stringified } from '@penumbra-zone/types';
import { AllSlices, SliceCreator } from './index';
import { MessageResponder } from '@penumbra-zone/types/src/internal-msg/shared';
import { TxApproval } from '@penumbra-zone/types/src/internal-msg/tx-approval';

export interface TxApprovalSlice {
  authorizeRequest?: Stringified<Jsonified<AuthorizeRequest>>;
  transactionViewFromPlan?: Stringified<Jsonified<TransactionView>>;
  // Holding the message responder function. Service worker will be "awaiting" the call of this.
  responder?: MessageResponder<TxApproval>;
}

export const createTxApprovalSlice: SliceCreator<TxApprovalSlice> = () => ({});

export const txApprovalSelector = (state: AllSlices) => state.txApproval;
