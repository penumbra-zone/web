import { Services } from '@penumbra-zone/services';

import type { JsonValue } from '@bufbuild/protobuf';
import { BackgroundConnectionManager } from '@penumbra-zone/transport/src/chrome-runtime/background-connection-manager';

import { createContextValues } from '@connectrpc/connect';
import { servicesCtx, extLocalCtx } from '@penumbra-zone/router/src/ctx';
import { adaptServiceImpl } from '@penumbra-zone/transport/src/chrome-runtime/adapter';
import { createPromiseClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { CustodyProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1alpha1/custody_connect';
import { Query as IbcClientService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/client/v1/query_connect';
import custodyImpl from '@penumbra-zone/router/src/grpc/custody';
import viewImpl from '@penumbra-zone/router/src/grpc/view-protocol-server';

import { isStdRequest } from '@penumbra-zone/types';
import { stdRouter } from '@penumbra-zone/router/src/std/router';

// this context provides all non-request information to handlers
const contextValues = createContextValues();
const extLocal = contextValues.get(extLocalCtx);
const grpcEndpoint = await extLocal.get('grpcEndpoint');

const servicesConfig = {
  grpcEndpoint,
  getWallet: async () => {
    const wallets = await extLocal.get('wallets');
    if (!wallets.length) throw new Error('No wallets connected');
    const { fullViewingKey, id } = wallets[0]!;
    return { walletId: id, fullViewingKey };
  },
};

const services = contextValues.set(servicesCtx, new Services(servicesConfig)).get(servicesCtx);
await services.initialize();

const penumbraMessageHandler = (
  message: unknown,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: unknown) => void,
) => {
  if (!isStdRequest(message)) return;
  stdRouter(message, sendResponse, services);
  return true;
};

chrome.runtime.onMessage.addListener(penumbraMessageHandler);

const adaptView = adaptServiceImpl(ViewProtocolService, viewImpl);
const adaptCustody = adaptServiceImpl(CustodyProtocolService, custodyImpl);
const adaptIbc = adaptServiceImpl(
  IbcClientService,
  {},
  createPromiseClient(IbcClientService, createGrpcWebTransport({ baseUrl: grpcEndpoint })),
);

const adapterEntry = {
  [ViewProtocolService.typeName]: (req: JsonValue) => adaptView(req, { contextValues }),
  [CustodyProtocolService.typeName]: (req: JsonValue) => adaptCustody(req, { contextValues }),
  [IbcClientService.typeName]: (req: JsonValue) => adaptIbc(req, { contextValues }),
} as Record<string, (x: JsonValue) => Promise<JsonValue | ReadableStream<JsonValue>>>;

/*
 * init background connection manager, with above entry functions
 */
BackgroundConnectionManager.init(adapterEntry);
