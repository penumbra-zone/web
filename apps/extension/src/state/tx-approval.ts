import { AllSlices, SliceCreator } from './index';
import { MessageResponder } from '@penumbra-zone/types/src/internal-msg/shared';
import { TxApproval } from '@penumbra-zone/types/src/internal-msg/tx-approval';

export interface TxApprovalSlice {
  authorizeRequest?: string;
  transactionViewFromPlan?: string;
  // Holding the message responder function. Service worker will be "awaiting" the call of this.
  responder?: MessageResponder<TxApproval>;
}

export const createTxApprovalSlice: SliceCreator<TxApprovalSlice> = () => ({});

export const txApprovalSelector = (state: AllSlices) => state.txApproval;
