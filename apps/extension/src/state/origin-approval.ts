import { ConnectError } from '@connectrpc/connect';
import { PopupType, OriginApproval } from '../message/popup';
import { AllSlices, SliceCreator } from '.';
import { InternalRequest, InternalResponse } from '@penumbra-zone/types/src/internal-msg/shared';
import { errorToJson } from '@connectrpc/connect/protocol-connect';
import { UserChoice } from '@penumbra-zone/types/src/user-choice';

export interface OriginApprovalSlice {
  responder?: (m: InternalResponse<OriginApproval>) => void;
  favIconUrl?: string;
  title?: string;
  requestOrigin?: string;
  choice?: UserChoice;

  acceptRequest: (
    req: InternalRequest<OriginApproval>,
    responder: (m: InternalResponse<OriginApproval>) => void,
  ) => void;

  setChoice: (attitute: UserChoice) => void;

  sendResponse: () => void;
}

export const createOriginApprovalSlice = (): SliceCreator<OriginApprovalSlice> => (set, get) => ({
  setChoice: (choice: UserChoice) => {
    set(state => {
      state.originApproval.choice = choice;
    });
  },

  acceptRequest: ({ request: { origin: requestOrigin, favIconUrl, title } }, responder) => {
    const existing = get().originApproval;
    if (existing.requestOrigin ?? existing.responder ?? existing.choice != null)
      throw new Error('Another request is still pending');

    set(state => {
      state.originApproval.favIconUrl = favIconUrl;
      state.originApproval.title = title && !title.startsWith(requestOrigin) ? title : undefined;
      state.originApproval.requestOrigin = requestOrigin;
      state.originApproval.responder = responder;
    });
  },

  sendResponse: () => {
    const { responder, choice, requestOrigin } = get().originApproval;

    if (!responder) throw new Error('No responder');

    try {
      if (choice === undefined || !requestOrigin) throw new Error('Missing response data');
      responder({
        type: PopupType.OriginApproval,
        data: {
          choice,
          origin: requestOrigin,
        },
      });
    } catch (e) {
      responder({
        type: PopupType.OriginApproval,
        error: errorToJson(ConnectError.from(e), undefined),
      });
    } finally {
      set(state => {
        state.originApproval.responder = undefined;
        state.originApproval.choice = undefined;
        state.originApproval.requestOrigin = undefined;
        state.originApproval.favIconUrl = undefined;
        state.originApproval.title = undefined;
      });
    }
  },
});

export const originApprovalSelector = (state: AllSlices) => state.originApproval;
