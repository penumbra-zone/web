import { AllSlices, SliceCreator } from './index';
import { MessageResponder } from '@penumbra-zone/types/src/internal-msg/shared';
import { OriginApproval } from '@penumbra-zone/types/src/internal-msg/origin-approval';

export interface OriginApprovalSlice {
  requestOrigin?: string;
  // Holding the message responder function. Service worker will be "awaiting" the call of this.
  responder?: MessageResponder<OriginApproval>;
}

export const createOriginApprovalSlice: SliceCreator<OriginApprovalSlice> = () => ({});

export const originApprovalSelector = (state: AllSlices) => state.originApproval;
