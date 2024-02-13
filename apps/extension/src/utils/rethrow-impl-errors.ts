import { ConnectError } from '@connectrpc/connect';

const wrapUnaryImpl =
  (methodImplementation: (...args: unknown[]) => unknown) =>
  (...args: unknown[]) => {
    try {
      const result = methodImplementation(...args);
      if (result instanceof Promise)
        return (result as Promise<unknown>).catch(e => {
          throw ConnectError.from(e);
        });
      return result;
    } catch (e) {
      throw ConnectError.from(e);
    }
  };

const wrapStreamingImpl = (methodImplementation: (...args: unknown[]) => AsyncIterable<unknown>) =>
  async function* (...args: unknown[]) {
    try {
      for await (const result of methodImplementation(...args)) {
        yield result;
      }
    } catch (e) {
      throw ConnectError.from(e);
    }
  };

export const rethrowImplErrors = <
  ServiceImplementation extends Record<string, (...args: unknown[]) => unknown>,
>(
  serviceImpl: ServiceImplementation,
) =>
  Object.fromEntries(
    Object.entries(serviceImpl).map(([methodName, methodImplementation]) => [
      methodName,
      methodImplementation.constructor.name === 'GeneratorFunction' ||
      methodImplementation.constructor.name === 'AsyncGeneratorFunction'
        ? wrapStreamingImpl(methodImplementation)
        : wrapUnaryImpl(methodImplementation),
    ]),
  ) as ServiceImplementation;
