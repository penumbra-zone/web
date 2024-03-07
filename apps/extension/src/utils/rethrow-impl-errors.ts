import { AnyMessage, MethodKind, ServiceType } from '@bufbuild/protobuf';
import { ConnectError, ServiceImpl } from '@connectrpc/connect';
import {
  BiDiStreamingImpl,
  ClientStreamingImpl,
  HandlerContext,
  ServerStreamingImpl,
  UnaryImpl,
} from '@connectrpc/connect/dist/cjs/implementation';

const wrapUnaryImpl =
  (methodImplementation: UnaryImpl<AnyMessage, AnyMessage>) =>
  (req: AnyMessage, ctx: HandlerContext) => {
    try {
      const result = methodImplementation(req, ctx);
      if (result instanceof Promise)
        return result.catch(e => {
          throw ConnectError.from(e);
        });
      return result;
    } catch (e) {
      throw ConnectError.from(e);
    }
  };

const wrapServerStreamingImpl = (
  methodImplementation: ServerStreamingImpl<AnyMessage, AnyMessage>,
) =>
  async function* (req: AnyMessage, ctx: HandlerContext) {
    try {
      for await (const result of methodImplementation(req, ctx)) {
        yield result;
      }
    } catch (e) {
      throw ConnectError.from(e);
    }
  };

const wrapUnhandledImpl =
  (
    methodImplementation:
      | ClientStreamingImpl<AnyMessage, AnyMessage>
      | BiDiStreamingImpl<AnyMessage, AnyMessage>,
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
): methodImplementation is UnaryImpl<AnyMessage, AnyMessage> => {
  methodImplementation;
  return methodKind === MethodKind.Unary;
};

const isServerStreamingMethodKind = (
  methodKind: MethodKind,
  methodImplementation:
    | ((req: AsyncIterable<AnyMessage>, ctx: HandlerContext) => unknown)
    | ((req: AnyMessage, ctx: HandlerContext) => unknown),
): methodImplementation is ServerStreamingImpl<AnyMessage, AnyMessage> => {
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
