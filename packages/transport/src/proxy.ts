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
