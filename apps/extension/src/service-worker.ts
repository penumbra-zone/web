import { Services } from '@penumbra-zone/services';

import { stdRouter } from '@penumbra-zone/router/src/std/router';

export const services = new Services();
await services.initialize();

const penumbraMessageHandler = (
  message: unknown,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: unknown) => void,
) => (isStdRequest(message) ? stdRouter(message, sendResponse, services) : null);

chrome.runtime.onMessage.addListener(penumbraMessageHandler);

import { BackgroundConnectionManager } from '@penumbra-zone/transport/src/chrome-runtime';

// for adapter
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { CustodyProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1alpha1/custody_connect';
import { Query as IbcClientService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/client/v1/query_connect';
import { AnyMessage, JsonValue, Any } from '@bufbuild/protobuf';
import { viewServerRouter } from '@penumbra-zone/router/src/grpc/view-protocol-server/router';
import { custodyServerRouter } from '@penumbra-zone/router/src/grpc/custody/router';
import { ibcClientServerRouter } from '@penumbra-zone/router/src/grpc/ibc-client/router';
import { AnyMessageToJson, iterableToStream } from '@penumbra-zone/transport';
import { typeRegistry } from '@penumbra-zone/types/src/registry';
import { isStdRequest } from '@penumbra-zone/types';

export const existingServices = new Services();
await existingServices.initialize();

const adapt = (
  routerEntryFn:
    | typeof viewServerRouter
    | typeof custodyServerRouter
    | typeof ibcClientServerRouter,
  serviceTypeName: string,
) => {
  console.log('adapting for old router...', serviceTypeName);

  return async (req: JsonValue): Promise<JsonValue | ReadableStream<JsonValue>> => {
    console.log('Entering adapted router', serviceTypeName, req);
    const packed = Any.fromJson(req, { typeRegistry });
    const unpacked = packed.unpack(typeRegistry)!;
    const sequence = performance.now();

    const messageForOldRouter = {
      type: 'PENUMBRA_DAPP_GRPC_REQUEST',
      serviceTypeName,
      requestTypeName: unpacked.getType().typeName,
      jsonReq: unpacked.toJson({ typeRegistry }),
      sequence,
    };

    let captureSuccess: (res: unknown) => void;
    let captureFailure: (u: unknown) => void;
    const promisedResponse = new Promise((resolve, reject) => {
      captureSuccess = resolve;
      captureFailure = reject;
    });
    const captureResponse = (r?: unknown): void => {
      if (r) captureSuccess(r);
      else captureFailure('no response');
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-explicit-any
    (routerEntryFn as any)(messageForOldRouter, captureResponse, existingServices);

    const rawResponse = (await promisedResponse) as {
      result?: AnyMessage;
      iterableResult?: AsyncIterable<AnyMessage>;
    };
    if ('iterableResult' in rawResponse)
      return iterableToStream(rawResponse.iterableResult).pipeThrough(new AnyMessageToJson());
    else if ('result' in rawResponse) return Any.pack(rawResponse.result).toJson({ typeRegistry })!;
    else throw Error('unknown response');
  };
};

const adapterEntry = {
  [ViewProtocolService.typeName]: adapt(viewServerRouter, ViewProtocolService.typeName),
  [CustodyProtocolService.typeName]: adapt(custodyServerRouter, CustodyProtocolService.typeName),
  [IbcClientService.typeName]: adapt(ibcClientServerRouter, IbcClientService.typeName),
} as Record<string, (x: JsonValue) => Promise<JsonValue>>;

BackgroundConnectionManager.init({
  known: () => Promise.resolve(true),
  services: () => Promise.resolve(adapterEntry),
});
