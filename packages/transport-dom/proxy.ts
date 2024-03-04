import type { ServiceType } from '@bufbuild/protobuf';
import type { CallOptions, HandlerContext, MethodImpl, PromiseClient } from '@connectrpc/connect';
import { CreateAnyMethodImpl, makeAnyServiceImpl } from './any-impl';

export type ProxyContextHandler = <I>(i: I, ctx: HandlerContext) => [I, CallOptions];

/**
 * ConnectRPC expects hosts to use context values to convey non-request data and
 * interfaces. Every implementation likely needs context if it's more complex
 * than a simple pure function.
 *
 * If you're proxying a remote service, the context is all on the remote server,
 * and handled there. If you're mutating the request or response, you may have
 * your own implementation 'between' the client and the server, and that
 * implementation may require context.
 *
 * This stub handler is used by default if no other is provided. It logs a
 * warning to encourage the developer to be aware of the context feature, and
 * provide a handler if necessary, or replace this one with a silent stub.
 */
export const noContextHandler: ProxyContextHandler = (i, ctx) => {
  console.warn('unhandled context', ctx);
  return [i, {}];
};

/**
 * This simple context handler forwards basic context like abort controllers,
 * headers, and timeout to the proxied client. This is not likely to be very
 * useful but is a good starting point if you are going to implement your own.
 */
export const simpleContextHandler: ProxyContextHandler = (i, ctx) => {
  const opt = {
    contextValues: ctx.values,
    signal: ctx.signal,
    headers: ctx.requestHeader,
    timeoutMs: ctx.timeoutMs(),
  } as CallOptions;
  return [i, opt];
};

/**
 * Creates a proxy implementation of a service, suitable for hosting in a
 * ConnectRouter, from a given service type definition and a matching client to
 * some other host of the service.
 *
 * To do this, it iterates over each method in the service type definition,
 * creating a method on the proxy impl that calls the provided client.
 *
 * You can provide a contextHandler function to modify any request.
 */
export const createProxyImpl = <S extends ServiceType>(
  service: S,
  client: PromiseClient<S>,
  contextHandler = noContextHandler,
) => {
  const makeAnyProxyMethod: CreateAnyMethodImpl<S> = (method, localName) => {
    const clientMethod = client[localName] as (cI: unknown, cOpt: CallOptions) => unknown;
    const impl = (hI: unknown, hCtx: HandlerContext) => clientMethod(...contextHandler(hI, hCtx));
    return impl as MethodImpl<typeof method>;
  };
  return makeAnyServiceImpl(service, makeAnyProxyMethod);
};
