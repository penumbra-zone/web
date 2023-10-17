import { AwaitedResponse, IncomingRequest } from '../service-worker/extension/types';
import { AuthBuildMessage } from './auth-build';
import { AuthorizeAndBuildRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';

export type OffscreenMessage = AuthBuildMessage;

export interface OffscreenRequest<T extends OffscreenMessage> {
  offscreenReq: IncomingRequest<T>;
}

// The Response given back to consumer that matches their request
export type OffscreenResponse<T extends OffscreenMessage> =
  | {
      penumbraOffscreenRes: AwaitedResponse<T>;
    }
  | { penumbraOffscreenError: string };

export const isOffscreenRequest = (
  message: unknown,
): message is OffscreenRequest<OffscreenMessage> => {
  return typeof message === 'object' && message !== null && 'offscreenReq' in message;
};

export const offscreenClient = {
  authAndBuild: (arg: AuthorizeAndBuildRequest) =>
    sendOffscreenMessage<AuthBuildMessage>({ type: 'AUTH_AND_BUILD', arg }),
};

export const sendOffscreenMessage = async <T extends OffscreenMessage>(
  req: IncomingRequest<T>,
): Promise<AwaitedResponse<T>['data']> => {
  const res = await chrome.runtime.sendMessage<OffscreenRequest<T>, OffscreenResponse<T>>({
    offscreenReq: req,
  });
  if ('penumbraOffscreenRes' in res) {
    return res.penumbraOffscreenRes.data;
  } else {
    throw new Error(res.penumbraOffscreenError);
  }
};
