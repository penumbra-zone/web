import { Services } from '@penumbra-zone/services';

export const existingServices = new Services();
await existingServices.initialize();

/*
 * std router
 */

import { stdRouter } from '@penumbra-zone/router/src/std/router';
const penumbraMessageHandler = (
  message: unknown,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: unknown) => void,
) => (isStdRequest(message) ? stdRouter(message, sendResponse, existingServices) : null);
chrome.runtime.onMessage.addListener(penumbraMessageHandler);

/*
 * adapter to existing router
 */

import { DappMessageRequest } from '@penumbra-zone/router/src/transport-old';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { CustodyProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1alpha1/custody_connect';
import { Query as IbcClientService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/client/v1/query_connect';
import { AnyMessage, JsonValue, Any, ServiceType } from '@bufbuild/protobuf';
import { viewServerRouter } from '@penumbra-zone/router/src/grpc/view-protocol-server/router';
import { custodyServerRouter } from '@penumbra-zone/router/src/grpc/custody/router';
import { ibcClientServerRouter } from '@penumbra-zone/router/src/grpc/ibc-client/router';
import { AnyMessageToJson, iterableToStream } from '@penumbra-zone/transport';
import { typeRegistry } from '@penumbra-zone/types/src/registry';
import { isStdRequest } from '@penumbra-zone/types';

const adaptOldRouter = (service: ServiceType) => {
  console.log('adapting for router...', service.typeName);

  return async (req: JsonValue): Promise<JsonValue | ReadableStream<JsonValue>> => {
    console.log('Entering adapted router', service.typeName, req);
    const packed = Any.fromJson(req, { typeRegistry });
    const unpacked = packed.unpack(typeRegistry)!;
    const sequence = performance.now();

    const messageForRouter = {
      type: 'PENUMBRA_DAPP_GRPC_REQUEST',
      serviceTypeName: service.typeName,
      requestTypeName: unpacked.getType().typeName,
      jsonReq: unpacked.toJson({ typeRegistry }),
      sequence,
    };

    const routerResponse = await new Promise<AnyMessage | AsyncIterable<AnyMessage>>(
      (resolve, reject) => {
        switch (service) {
          case ViewProtocolService:
            viewServerRouter(
              messageForRouter as DappMessageRequest<typeof ViewProtocolService>,
              resolve as (r: unknown) => void,
              existingServices,
            );
            break;
          case IbcClientService:
            ibcClientServerRouter(
              messageForRouter as DappMessageRequest<typeof IbcClientService>,
              resolve as (r: unknown) => void,
              existingServices,
            );
            break;
          case CustodyProtocolService:
            custodyServerRouter(
              messageForRouter as DappMessageRequest<typeof CustodyProtocolService>,
              resolve as (r: unknown) => void,
              existingServices,
            );
            break;
          default:
            reject('unknown service');
        }
      },
    );

    if (Symbol.asyncIterator in routerResponse)
      return iterableToStream(routerResponse).pipeThrough(new AnyMessageToJson());
    else return Any.pack(routerResponse).toJson({ typeRegistry })!;
  };
};

const adapterEntry = {
  [ViewProtocolService.typeName]: adaptOldRouter(ViewProtocolService),
  [IbcClientService.typeName]: adaptOldRouter(IbcClientService),
  [CustodyProtocolService.typeName]: adaptOldRouter(CustodyProtocolService),
} as Record<string, (x: JsonValue) => Promise<JsonValue>>;

/*
 * background connection manager
 */

import { BackgroundConnectionManager } from '@penumbra-zone/transport/src/chrome-runtime';
BackgroundConnectionManager.init({
  known: () => Promise.resolve(true),
  services: () => Promise.resolve(adapterEntry),
});
