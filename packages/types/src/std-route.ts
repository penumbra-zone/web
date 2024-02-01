// The request sent from the content scripts or popup that is handled by the service worker

import { AwaitedInternalResponse, InternalMessage, ResponseOf } from './internal-msg/shared';

export interface ServiceWorkerRequest<T extends SwRequestMessage> {
  penumbraSwReq: IncomingRequest<T>;
  sequence: number;
}

// The core message sent via content-script/popup
export type IncomingRequest<T> =
  T extends InternalMessage<infer Type, infer Req, unknown>
    ? Req extends undefined
      ? { type: Type }
      : { type: Type; arg: Req }
    : never;

export const isStdRequest = (
  message: unknown,
): message is ServiceWorkerRequest<SwRequestMessage> => {
  return typeof message === 'object' && message !== null && 'penumbraSwReq' in message;
};

// The Response given back to consumer that matches their request
export type ServiceWorkerResponse<T extends SwRequestMessage> = PenumbraResponse<T> | PenumbraError;

export interface PenumbraResponse<T extends SwRequestMessage> {
  penumbraSwRes: AwaitedInternalResponse<T>;
  sequence: number;
}

export interface PenumbraError {
  penumbraSwError: string;
  sequence: number;
}

export const isServiceWorkerResponse = <T extends SwRequestMessage>(
  message: unknown,
): message is ServiceWorkerResponse<T> => {
  return (
    typeof message === 'object' &&
    message !== null &&
    ('penumbraSwRes' in message || 'penumbraSwError' in message)
  );
};

export type SwResponse = ResponseOf<SwRequestMessage>;

/* ========= List all service worker messages here ========= */
export type SwRequestMessage = PingMessage | ClearCacheMessage;

// List all service worker messages that are allowed to be called from dapp
export const allowedDappMessages: SwRequestMessage['type'][] = ['PING'];

export interface PongResponse {
  ack: string;
}
export type PingMessage = InternalMessage<'PING', string, PongResponse>;
export type ClearCacheMessage = InternalMessage<'CLEAR_CACHE', undefined, Promise<void>>;
