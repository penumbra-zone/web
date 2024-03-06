import { AnyMessage, MethodKind, ServiceType } from '@bufbuild/protobuf';
import {
  ConnectError,
  HandlerContext,
  MethodImpl,
  MethodImplSpec,
  ServiceImpl,
} from '@connectrpc/connect';

type UnaryImpl = (MethodImplSpec & { kind: MethodKind.Unary })['impl'];
type ServerStreamingImpl = (MethodImplSpec & { kind: MethodKind.ServerStreaming })['impl'];
type ClientStreamingImpl = (MethodImplSpec & { kind: MethodKind.ClientStreaming })['impl'];
type BiDiStreamingImpl = (MethodImplSpec & { kind: MethodKind.BiDiStreaming })['impl'];

const wrapUnaryImpl =
  (methodImplementation: UnaryImpl) => (req: AnyMessage, ctx: HandlerContext) => {
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

const wrapServerStreamingImpl = (methodImplementation: ServerStreamingImpl) =>
  async function* (req: AnyMessage, ctx: HandlerContext) {
    try {
      yield* methodImplementation(req, ctx);
    } catch (e) {
      throw ConnectError.from(e);
    }
  };

const wrapUnhandledImpl =
  (methodImplementation: ClientStreamingImpl | BiDiStreamingImpl, kind: MethodKind) =>
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
): methodImplementation is UnaryImpl => {
  methodImplementation;
  return methodKind === MethodKind.Unary;
};

const isServerStreamingMethodKind = (
  methodKind: MethodKind,
  methodImplementation:
    | ((req: AsyncIterable<AnyMessage>, ctx: HandlerContext) => unknown)
    | ((req: AnyMessage, ctx: HandlerContext) => unknown),
): methodImplementation is ServerStreamingImpl => {
  methodImplementation;
  return methodKind === MethodKind.ServerStreaming;
};

export const rethrowImplErrors = <T extends ServiceType>(
  serviceType: T,
  serviceImpl: ServiceImpl<T>,
): ServiceImpl<T> =>
  Object.fromEntries(
    Object.entries(serviceImpl).map(
      ([methodName, methodImplementation]: [
        string,
        MethodImpl<(typeof serviceType.methods)[string]>,
      ]) => [
        methodName,
        isServerStreamingMethodKind(serviceType.methods[methodName]!.kind, methodImplementation)
          ? wrapServerStreamingImpl(methodImplementation)
          : isUnaryMethodKind(serviceType.methods[methodName]!.kind, methodImplementation)
            ? wrapUnaryImpl(methodImplementation)
            : wrapUnhandledImpl(methodImplementation, serviceType.methods[methodName]!.kind),
      ],
    ),
  ) as ServiceImpl<T>;
