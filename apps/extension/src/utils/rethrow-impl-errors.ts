import { AnyMessage, MethodKind, ServiceType } from '@bufbuild/protobuf';
import { ConnectError, ServiceImpl } from '@connectrpc/connect';
import {
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
        return (result as Promise<unknown>).catch(e => {
          throw ConnectError.from(e);
        });
      return result;
    } catch (e) {
      throw ConnectError.from(e);
    }
  };

const wrapStreamingImpl = (methodImplementation: ServerStreamingImpl<AnyMessage, AnyMessage>) =>
  async function* (req: AnyMessage, ctx: HandlerContext) {
    try {
      for await (const result of methodImplementation(req, ctx)) {
        yield result;
      }
    } catch (e) {
      throw ConnectError.from(e);
    }
  };

const isUnaryMethodKind = (
  methodKind: MethodKind,
  methodImplementation: (req: AnyMessage, ctx: HandlerContext) => unknown,
): methodImplementation is UnaryImpl<AnyMessage, AnyMessage> => methodKind === MethodKind.Unary;

const isServerStreamingMethodKind = (
  methodKind: MethodKind,
  methodImplementation: (req: AnyMessage, ctx: HandlerContext) => unknown,
): methodImplementation is ServerStreamingImpl<AnyMessage, AnyMessage> =>
  methodKind === MethodKind.ServerStreaming;

export const rethrowImplErrors = <T extends ServiceType>(
  serviceType: T,
  serviceImpl: ServiceImpl<T>,
): ServiceImpl<T> =>
  Object.fromEntries(
    Object.entries(serviceImpl).map(([methodName, methodImplementation]) => [
      methodName,
      isServerStreamingMethodKind(serviceType.methods[methodName]!.kind, methodImplementation)
        ? wrapStreamingImpl(methodImplementation)
        : isUnaryMethodKind(serviceType.methods[methodName]!.kind, methodImplementation)
          ? wrapUnaryImpl(methodImplementation)
          : (req: AnyMessage, ctx: HandlerContext) => {
              throw new Error(
                `Attempted to call a method whose \`kind\` is ${serviceType.methods[methodName]?.kind}`,
              );
              // return methodImplementation(req, ctx);
            },
    ]),
  ) as ServiceImpl<T>;
