import type { ServiceType } from '@bufbuild/protobuf';
import type { CallOptions, HandlerContext, MethodImpl, PromiseClient } from '@connectrpc/connect';
import { CreateAnyMethodImpl, makeAnyServiceImpl } from './any-impl';

export type ProxyContextHandler = <I>(i: I, ctx: HandlerContext) => [I, CallOptions];

export const noContextHandler: ProxyContextHandler = (i, ctx) => {
  console.warn('unhandled context', ctx);
  return [i, {}];
};

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
 * Creates an implementation of a service type that proxies all requests via a
 * gRPC-web transport.
 *
 * To do this, it iterates over each method in the service type definition,
 * creating a method on the new proxy object with the same name that calls out
 * to the gRPC-web transport. Thus, the returned implementation is basically
 * just a bunch of methods that call out to an RPC endpoint.
 */
export const createProxyImpl = <S extends ServiceType>(
  service: S,
  client: PromiseClient<S>,
  contextHandler = noContextHandler,
) => {
  const makeAnyProxyMethod: CreateAnyMethodImpl<S> = (method, localName) => {
    const clientMethod = client[localName] as (cI: unknown, cOpt: CallOptions) => unknown;
    const impl = (hI: unknown, hCtx: HandlerContext) => {
      const [pI, pOpt] = contextHandler(hI, hCtx);
      return clientMethod(pI, pOpt);
    };
    return impl as MethodImpl<typeof method>;
  };
  return makeAnyServiceImpl(service, makeAnyProxyMethod);
};
