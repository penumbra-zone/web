import { AllSlices, SliceCreator } from './index';

//type SendResponseCallback = Parameters<Parameters<chrome.runtime.ExtensionMessageEvent['addListener']>[0]>[2];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SendResponseCallback = (response?: any) => void;

export interface ApprovalSlice {
  pending: string | undefined;
  setPending: (request: string) => void;

  attitude: boolean | undefined;
  setAttitude: (attitude: boolean) => void;

  sendResponse: SendResponseCallback | undefined;
  setSendResponse: (sendResponse: SendResponseCallback) => void;
}

export const createApprovalSlice: SliceCreator<ApprovalSlice> = (set, get) => {
  return {
    pending: undefined,
    attitude: undefined,
    sendResponse: undefined,

    setAttitude: (attitude: boolean) => {
      set(state => {
        state.approval.attitude = attitude;
      });
    },

    setPending: (request: string) => {
      set(state => {
        state.approval.pending = request;
      });
    },

    setSendResponse: (sendResponse: SendResponseCallback) => {
      console.log('setSendResponse', sendResponse);
      const existingSendResponse = get().approval.sendResponse;
      if (existingSendResponse) console.warn('Overwriting existing sendResponse callback?');
      set(state => {
        state.approval.sendResponse = sendResponse;
      });
    },
  };
};

export const approvalSelector = (state: AllSlices) => state.approval;
export const pendingSelector = (state: AllSlices) => state.approval.pending;
export const attitudeSelector = (state: AllSlices) => state.approval.attitude;
export const sendResponseSelector = (state: AllSlices) => state.approval.sendResponse;
