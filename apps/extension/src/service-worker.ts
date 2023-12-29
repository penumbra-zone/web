import { Services } from '@penumbra-zone/services';
import { localExtStorage } from '@penumbra-zone/storage';

import {
  servicesCtx,
  //chromePortCtx, chromeSenderCtx, requestIdCtx,
} from '@penumbra-zone/router/src/ctx';

import { BackgroundConnectionManager } from '@penumbra-zone/transport/src/chrome-runtime/background-connection-manager';
import { createProxyImpl } from '@penumbra-zone/transport/src/proxy';

import { ConnectRouter, createContextValues, createPromiseClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';

import { Query as IbcClientService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/client/v1/query_connect';
import { CustodyProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1alpha1/custody_connect';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';

import custodyImpl from '@penumbra-zone/router/src/grpc/custody';
import viewImpl from '@penumbra-zone/router/src/grpc/view-protocol-server';

import { stdRouter } from '@penumbra-zone/router/src/std/router';
import { isStdRequest } from '@penumbra-zone/types';

import { typeRegistry } from '@penumbra-zone/types/src/registry';
import { adaptChromeRuntime } from '@penumbra-zone/transport/src/chrome-runtime/adapter';

const grpcEndpoint = await localExtStorage.get('grpcEndpoint');
const servicesConfig = {
  grpcEndpoint,
  getWallet: async () => {
    const wallets = await localExtStorage.get('wallets');
    if (!wallets.length) throw new Error('No wallets connected');
    const { fullViewingKey, id } = wallets[0]!;
    return { walletId: id, fullViewingKey };
  },
};
const services = new Services(servicesConfig);
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

const ibcImpl = createProxyImpl(
  IbcClientService,
  createPromiseClient(IbcClientService, createGrpcWebTransport({ baseUrl: grpcEndpoint })),
);

const chromeRuntimeHandler = adaptChromeRuntime({
  typeRegistry,
  routes: (router: ConnectRouter) => {
    router.service(CustodyProtocolService, custodyImpl);
    router.service(ViewProtocolService, viewImpl);
    router.service(IbcClientService, ibcImpl);
  },
  createRequestContext: req => {
    const contextValues = req.contextValues ?? createContextValues();
    contextValues.set(servicesCtx, services);
    //ctx.set(requestIdCtx, requestId);
    //ctx.set(chromeSenderCtx, sender);
    //ctx.set(chromePortCtx, port);
    return Promise.resolve({ ...req, contextValues });
  },
});

BackgroundConnectionManager.init(chromeRuntimeHandler);
