import {
  DappMessageRequest,
  ErrorResponse,
  GrpcResponse,
  isDappGrpcRequest,
  OUTGOING_GRPC_MESSAGE,
  ResultResponse,
} from 'penumbra-transport';
import {
  ChainParametersRequest,
  ChainParametersResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { services } from '../../../service-worker';

export type ViewProtocolReq = DappMessageRequest<typeof ViewProtocolService>;
export type ViewProtocolRes = GrpcResponse<typeof ViewProtocolService>;

export const isViewServerReq = (message: unknown): message is ViewProtocolReq => {
  return isDappGrpcRequest(message) && message.serviceTypeName === ViewProtocolService.typeName;
};

export const viewServerRouter = (
  req: DappMessageRequest<typeof ViewProtocolService>,
  sender: chrome.runtime.MessageSender,
) => {
  const id = sender.tab!.id!; // Guaranteed as request is from dapp

  (async function () {
    const result = await viewServerRootHandler(req);
    return chrome.tabs.sendMessage(id, {
      type: OUTGOING_GRPC_MESSAGE,
      sequence: req.sequence,
      messageTypeName: req.messageTypeName,
      serviceTypeName: req.serviceTypeName,
      result,
    } satisfies ResultResponse<typeof ViewProtocolService>);
  })().catch(e => {
    void chrome.tabs.sendMessage(id, {
      type: OUTGOING_GRPC_MESSAGE,
      sequence: req.sequence,
      messageTypeName: req.messageTypeName,
      serviceTypeName: req.serviceTypeName,
      error: e as unknown,
    } satisfies ErrorResponse<typeof ViewProtocolService>);
  });
};

const viewServerRootHandler = async (req: ViewProtocolReq): Promise<ViewProtocolRes> => {
  switch (req.messageTypeName) {
    case ChainParametersRequest.typeName: {
      const parameters = await services.controllers.obliviousQuerier.chainParameters();
      return new ChainParametersResponse({ parameters });
    }
    default:
      throw new Error(`Non-supported request type: ${JSON.stringify(req.messageTypeName)}`);
  }
};
