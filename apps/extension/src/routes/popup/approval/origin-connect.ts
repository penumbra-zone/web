import { OriginApproval } from '@penumbra-zone/types/src/internal-msg/origin-approval';
import { InternalMessageHandler } from '@penumbra-zone/types/src/internal-msg/shared';
import { PopupRequest } from '@penumbra-zone/types/src/internal-msg/popup';
import { useStore } from '../../../state';

export const isOriginApprovalReq = (req: PopupRequest): req is OriginApproval => {
  return req.type === 'ORIGIN-APPROVAL';
};

export const handleOriginApproval: InternalMessageHandler<OriginApproval> = (
  requestOrigin,
  responder,
) => {
  console.log('handleOriginApproval', requestOrigin);
  useStore.setState(state => {
    state.originApproval.requestOrigin = requestOrigin;
    state.originApproval.responder = responder;
  });
};
