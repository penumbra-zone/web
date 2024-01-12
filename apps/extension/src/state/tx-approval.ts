import { AllSlices, SliceCreator } from './index';
import { MessageResponder } from '@penumbra-zone/types/src/internal-msg/shared';
import { TxApproval } from '@penumbra-zone/types/src/internal-msg/tx-approval';

export interface TxApprovalSlice {
  // Is AuthorizeRequest-jsonified. Zustand+Immer does not allow for storing classes and Typescript does not allow for JsValue.
  authorizeRequest: object | undefined;
  // Holding the message responder function. Service worker will be "awaiting" the call of this.
  responder: MessageResponder<TxApproval> | undefined;
}

export const createTxApprovalSlice: SliceCreator<TxApprovalSlice> = () => ({
  authorizeRequest: undefined,
  responder: undefined,
});

export const TxApprovalSelector = (state: AllSlices) => state.txApproval;
