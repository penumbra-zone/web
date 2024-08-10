import { ServiceType } from '@bufbuild/protobuf';
import { usePenumbra } from './use-penumbra.js';
import { QueryOptions, useQuery, UseQueryResult } from '@tanstack/react-query';
import { PromiseClient } from '@connectrpc/connect';

export const usePenumbraQuery = <S extends ServiceType>(
  serviceType: S,
): PenumbraQuerier<S> | undefined => {
  const penumbra = usePenumbra();

  if (!penumbra.transport) {
    return;
  }

  const wrappedMethods = Object.keys(serviceType.methods).map(
    <N extends keyof S['methods']>(methodName: N) => {
      const serviceClient = penumbra.service(serviceType);

      const queryFn: QueryOptions['queryFn'] = ({ meta }) => {
        const {
          params: [input, options],
        } = meta as { params: Parameters<PromiseClient<S>[N]> };
        const response = serviceClient[methodName](input as never, options);

        if (Symbol.asyncIterator in response) {
          return Array.fromAsync(response);
        } else {
          return response;
        }
      };

      const useMethodQuery: PenumbraQuerierMethod<S, N> = (queryOptions, ...params) =>
        useQuery({
          ...queryOptions,
          queryKey: [serviceType.typeName, methodName, params],
          queryFn,
          meta: { params },
        });

      return [methodName, useMethodQuery] as const;
    },
  );

  return Object.fromEntries(wrappedMethods) as PenumbraQuerier<S>;
};

type PromiseClientMethod<S extends ServiceType, M extends keyof S['methods']> = PromiseClient<S>[M];

type PenumbraQuerierMethod<S extends ServiceType, M extends keyof S['methods']> = (
  queryOptions: Omit<QueryOptions, 'queryFn' | 'queryKey' | 'meta'>,
  ...args: Parameters<PromiseClientMethod<S, M>>
) => UsePenumbraQueryResult<S, M>;

type UsePenumbraQueryResult<S extends ServiceType, M extends keyof S['methods']> = UseQueryResult<
  ReturnType<PromiseClientMethod<S, M>>
>;

type PenumbraQuerier<S extends ServiceType> = {
  [localName in keyof S['methods']]: PenumbraQuerierMethod<S, localName>;
};
