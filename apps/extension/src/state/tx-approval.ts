import { AllSlices, SliceCreator } from './index';
import { TxApprovalResponder } from '../control/popup';

export interface TxApprovalSlice {
  // Is AuthorizeRequest-jsonified. Zustand+Immer does not allow for storing classes and Typescript does not allow for JsValue.
  tx: object | undefined;
  // Holding the message responder function. Service worker will be "awaiting" the call of this.
  responder: TxApprovalResponder | undefined;
}

export const createTxApprovalSlice: SliceCreator<TxApprovalSlice> = () => ({
  tx: undefined,
  responder: undefined,
});

export const TxApprovalSelector = (state: AllSlices) => state.txApproval;
