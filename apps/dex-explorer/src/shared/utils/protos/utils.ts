import { createPromiseClient, PromiseClient } from '@connectrpc/connect';
import { createGrpcWebTransport } from '@connectrpc/connect-web';
import { ServiceType } from '@bufbuild/protobuf';

export const createClient = <T extends ServiceType>(
  grpcEndpoint: string,
  serviceType: T,
): PromiseClient<T> => {
  const transport = createGrpcWebTransport({
    baseUrl: grpcEndpoint,
  });
  return createPromiseClient(serviceType, transport);
};
