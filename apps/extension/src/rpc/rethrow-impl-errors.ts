import { AnyMessage, MethodKind, ServiceType } from '@bufbuild/protobuf';
import { ConnectError, HandlerContext, MethodImplSpec, ServiceImpl } from '@connectrpc/connect';

type Implementation<K extends MethodKind> = (MethodImplSpec & {
  kind: K;
})['impl'];

const wrapUnaryImpl =
  (methodImplementation: Implementation<MethodKind.Unary>) =>
  (req: AnyMessage, ctx: HandlerContext) => {
    try {
      const result = methodImplementation(req, ctx);
      if (result instanceof Promise)
        return result.catch((e: unknown) => {
          if (process.env['NODE_ENV'] === 'development') console.debug(ctx.method.name, req, e);
          throw ConnectError.from(e);
        });
      return result;
    } catch (e) {
      if (process.env['NODE_ENV'] === 'development') console.debug(ctx.method.name, req, e);
      throw ConnectError.from(e);
    }
  };

const wrapServerStreamingImpl = (
  methodImplementation: Implementation<MethodKind.ServerStreaming>,
) =>
  async function* (req: AnyMessage, ctx: HandlerContext) {
    try {
      for await (const result of methodImplementation(req, ctx)) {
        yield result;
      }
    } catch (e) {
      if (process.env['NODE_ENV'] === 'development') console.debug(ctx.method.name, req, e);
      throw ConnectError.from(e);
    }
  };

const wrapUnhandledImpl =
  (
    methodImplementation: Implementation<MethodKind.ClientStreaming | MethodKind.BiDiStreaming>,
    kind: MethodKind,
  ) =>
  (req: AsyncIterable<AnyMessage>, ctx: HandlerContext) => {
    console.warn(
      `Attempted to call a method whose \`kind\` is ${MethodKind[kind]}. This method kind is not wrapped by \`rethrowImplErrors\`; thus, its errors may get swallowed and rethrown as "internal error." To fix this, extend \`rethrowImplErrors\` to cover the \`${MethodKind[kind]}\` case.`,
    );
    return methodImplementation(req, ctx);
  };

const isUnaryMethodKind = (
  methodKind: MethodKind,
  methodImplementation:
    | ((req: AsyncIterable<AnyMessage>, ctx: HandlerContext) => unknown)
    | ((req: AnyMessage, ctx: HandlerContext) => unknown),
): methodImplementation is Implementation<MethodKind.Unary> => {
  methodImplementation;
  return methodKind === MethodKind.Unary;
};

const isServerStreamingMethodKind = (
  methodKind: MethodKind,
  methodImplementation:
    | ((req: AsyncIterable<AnyMessage>, ctx: HandlerContext) => unknown)
    | ((req: AnyMessage, ctx: HandlerContext) => unknown),
): methodImplementation is Implementation<MethodKind.ServerStreaming> => {
  methodImplementation;
  return methodKind === MethodKind.ServerStreaming;
};

export const rethrowImplErrors = <T extends ServiceType>(
  serviceType: T,
  serviceImpl: Partial<ServiceImpl<T>>,
): Partial<ServiceImpl<T>> => {
  const entries = Object.entries(serviceImpl).map(([methodName, methodImplementation]) => {
    const methodKind = serviceType.methods[methodName]!.kind;
    const wrappedMethodImpl = isServerStreamingMethodKind(methodKind, methodImplementation!)
      ? wrapServerStreamingImpl(methodImplementation)
      : isUnaryMethodKind(methodKind, methodImplementation!)
        ? wrapUnaryImpl(methodImplementation)
        : wrapUnhandledImpl(methodImplementation!, methodKind);
    return [methodName, wrappedMethodImpl];
  });
  return Object.fromEntries(entries) as Partial<ServiceImpl<T>>;
};
