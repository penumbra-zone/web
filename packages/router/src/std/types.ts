// The request sent from the content scripts or popup that is handled by the service worker
import { SwRequestMessage } from './router';

export interface ServiceWorkerRequest<T extends SwRequestMessage> {
  penumbraSwReq: IncomingRequest<T>;
  sequence: number;
}

// The core message sent via content-script/popup
export type IncomingRequest<T> = T extends SwMessage<infer Type, infer Req, unknown>
  ? Req extends undefined
    ? { type: Type }
    : { type: Type; arg: Req }
  : never;

// The Response given back to consumer that matches their request
export type ServiceWorkerResponse<T extends SwRequestMessage> = PenumbraResponse<T> | PenumbraError;

export interface PenumbraResponse<T extends SwRequestMessage> {
  penumbraSwRes: AwaitedResponse<T>;
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

// The base interface that service worker functions should implement
export interface SwMessage<Type extends string, Req, Res> {
  type: Type;
  request: Req;
  response: Res;
}

// Meant as a helper to annotate service worker functions
// Creates a function: (request) => response out of `SwMessage`
export type SwMessageHandler<M extends SwMessage<string, unknown, unknown>> =
  M['request'] extends undefined ? () => M['response'] : (request: M['request']) => M['response'];

// The awaitable outputs of the handlers
export type Responses<T> = T extends SwMessage<string, unknown, infer Res> ? Res : never;
export type SwResponse = Responses<SwRequestMessage>;

// The awaited response sent back to requestor
export type AwaitedResponse<T> = T extends SwMessage<infer Type, unknown, infer Res>
  ? { type: Type; data: Awaited<Res> }
  : never;
