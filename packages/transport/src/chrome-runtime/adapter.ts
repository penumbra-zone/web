import { ConnectError, Code as ConnectErrorCode } from '@connectrpc/connect';
import {
  Any,
  IMessageTypeRegistry,
  JsonValue,
  MethodInfo,
  MethodKind,
  ServiceType,
} from '@bufbuild/protobuf';
import {
  ConnectRouter,
  ConnectRouterOptions,
  ContextValues,
  createConnectRouter,
} from '@connectrpc/connect';
import {
  CommonTransportOptions,
  UniversalHandler,
  UniversalHandlerFn,
  UniversalServerRequest,
  createAsyncIterable,
  createUniversalHandlerClient,
} from '@connectrpc/connect/protocol';
import { createTransport } from '@connectrpc/connect/protocol-connect';

import { MessageToJson, iterableToStream } from '../stream';

// see https://github.com/connectrpc/connect-es/pull/925
// hopefully also simplifies transport call soon
type MethodType = MethodInfo & { service: { typeName: string } };

type ChromeRuntimeRequest = JsonValue;
type ChromeRuntimeResponse = JsonValue | ReadableStream<JsonValue>;
export type ChromeRuntimeHandlerFn = (r: ChromeRuntimeRequest) => Promise<ChromeRuntimeResponse>;

export interface ChromeRuntimeAdapterOptions {
  router?: Omit<ConnectRouterOptions, keyof typeof forceRouterOptions>;
  transport?: Omit<CommonTransportOptions, keyof typeof forceTransportOptions>;

  routes: (router: ConnectRouter) => void;
  typeRegistry: IMessageTypeRegistry;
  createRequestContext: (
    h: UniversalServerRequest,
  ) => Promise<UniversalServerRequest & { contextValues: ContextValues }>;
}

// from createRouterTransport
const forceRouterOptions = {
  connect: true,
  grpc: false,
  grpcWeb: false,
};

// from createRouterTransport
const forceTransportOptions = {
  httpClient: null as never,
  baseUrl: 'https://in-memory',
  useBinaryFormat: true,
  acceptCompression: [],
  sendCompression: null,
  compressMinBytes: Number.MAX_SAFE_INTEGER,
  readMaxBytes: Number.MAX_SAFE_INTEGER,
  writeMaxBytes: Number.MAX_SAFE_INTEGER,
};

/**
 * This creates returns a simple service entry function.
 *
 * You should provide a context function that creates all the context required
 * by the implementations to which you are routing.
 *
 * The returned handler accepts 'Any'-packed json message requests, hopefully
 * annotated with types present in your provided typeRegistry, hopefully mapping
 * to endpoints present in your router.
 *
 * The entry function will respond with a single message or a ReadableStream.
 */
export const connectChromeRuntimeAdapter = (
  opt: ChromeRuntimeAdapterOptions,
): ChromeRuntimeHandlerFn => {
  // TODO: could we generate a typeRegistry? should we forward to router, transport?
  const typeRegistry = opt.typeRegistry;

  const routerOpts: ConnectRouterOptions = {
    ...opt.router,
    ...forceRouterOptions,
  };

  const router = createConnectRouter(routerOpts);
  opt.routes(router);

  /**
   * We're creating a router transport to provide service entry.  Some of this
   * is very much like what happens in createRouterTransport, but we can't use
   * createRouterTransport because it does not provide any ContextValues to the
   * router.
   *
   * Connectrpc enforces a separation between client-side ContextValues and
   * server-side ContextValues, even though they use the same types. You can't
   * simply provide contextValues to a client's CallOptions - those are only for
   * Interceptors running in your client-side Transport. They won't be forwarded
   * to the server.
   *
   * Server framework adapters are responsible for applying context values to
   * the implemenation. Normally, this would be a simple parameter in a call to
   * the function connectNodeAdapter.  But, we're not using node.
   *
   * And unfortunately, createUniversalHandlerClient which createRouterTransport
   * uses internally doesn't pass a context parameter at all when it calls a
   * handler - meaning every HandlerContext has no contextValues. So the only
   * way to get context to the implementation is to either createHandlerContext
   * yourself and call the Impl directly, or createContextValues yourself and
   * call the router directly.
   *
   * I've chosen to reimplement the simple createRouterTransport, but wrap the
   * router's handlers, inserting contextValues into the requests made by the
   * UniversalClient. At request time, this kind of context injector only has
   * access to data present in the UniversalServerRequest.
   *
   * It is probably ideal to write a real adapter, but in then we must deal more
   * directly with connectrpc's expectations of operating as an http server. It
   * seems that a router transport is the endorsed way to route local services.
   *
   * See https://github.com/connectrpc/connect-es/blob/main/packages/connect-node/src/node-universal-handler.ts
   */
  const injectRequestContext = createUniversalHandlerClient(
    router.handlers.map((handler: UniversalHandler): UniversalHandler => {
      // disaggregate the handler into actual function and keyed attributes
      const handlerFn = handler as UniversalHandlerFn;
      const handlerMeta = Object.fromEntries(
        Object.entries(handler) as [keyof UniversalHandler, unknown][],
      ) as { [k in keyof UniversalHandler]: UniversalHandler[k] };
      // wrap the handler function to generate and apply context
      const wrappedFn: UniversalHandlerFn = req =>
        opt.createRequestContext(req).then(handlerFn, error => {
          // it's convenient to log and rethrow here
          console.warn('Handler Error', handler.name, error);
          throw error;
        });
      // replace attributes onto the wrapped handler
      return Object.assign(wrappedFn, handlerMeta);
    }),
  );

  // TODO: alternatively, we could have the channelClient provide a requestPath
  const I_MethodType = new Map<string, MethodType>(
    router.handlers.map(({ method, service }) => [
      method.I.typeName,
      { ...method, service: { typeName: service.typeName } },
    ]),
  );

  // TODO: interceptors?
  const transport = createTransport({
    // order matters :)
    interceptors: [],
    ...opt.transport,
    ...forceTransportOptions,
    httpClient: injectRequestContext,
  });

  // TODO: sender, origin?
  return async function chromeRuntimeHandler(message: ChromeRuntimeRequest) {
    const request = Any.fromJson(message, { typeRegistry }).unpack(typeRegistry)!;
    const requestType = request.getType();

    const methodType = I_MethodType.get(requestType.typeName);
    if (!methodType)
      throw new ConnectError(`Method ${requestType.typeName} not found`, ConnectErrorCode.NotFound);

    let response;
    switch (methodType.kind) {
      case MethodKind.Unary:
        response = await transport.unary(
          // only uses service.typeName, so this cast is ok
          methodType.service as ServiceType,
          methodType satisfies MethodInfo,
          undefined, // TODO abort
          undefined, // TODO timeout
          undefined, // TODO headers
          request,
        );
        break;
      case MethodKind.ServerStreaming:
        response = await transport.stream(
          // only uses service.typeName, so this cast is ok
          methodType.service as ServiceType,
          methodType satisfies MethodInfo,
          undefined, // TODO abort
          undefined, // TODO timeout
          undefined, // TODO headers
          createAsyncIterable([request]),
        );
        break;
      default:
        throw new ConnectError(
          `Unimplemented method kind ${methodType.kind}`,
          ConnectErrorCode.Unimplemented,
        );
    }

    if (response.stream)
      return iterableToStream(response.message).pipeThrough(new MessageToJson(typeRegistry));
    else return Any.pack(response.message).toJson({ typeRegistry });
  };
};
