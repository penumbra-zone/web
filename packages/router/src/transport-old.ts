import { JsonValue, ServiceType } from '@bufbuild/protobuf';

export const INCOMING_GRPC_MESSAGE = 'PENUMBRA_DAPP_GRPC_REQUEST' as const;
export const OUTGOING_GRPC_MESSAGE = 'PENUMBRA_DAPP_GRPC_RESPONSE' as const;

export type GrpcRequestTypename<S extends ServiceType> = {
  [K in keyof S['methods']]: S['methods'][K]['I']['typeName'];
}[keyof S['methods']];

export type GrpcResponseTypename<S extends ServiceType> = {
  [K in keyof S['methods']]: S['methods'][K]['O']['typeName'];
}[keyof S['methods']];

// Gets all response types for service (e.g. StatusRequest)
export type GrpcRequest<S extends ServiceType> = {
  [K in keyof S['methods']]: InstanceType<S['methods'][K]['I']>;
}[keyof S['methods']];

// Gets all response types for service (e.g. StatusResponse)
export type GrpcResponse<S extends ServiceType> = {
  [K in keyof S['methods']]: InstanceType<S['methods'][K]['O']>;
}[keyof S['methods']];

// Payload dapp issues to extension
export interface DappMessageRequest<S extends ServiceType> {
  type: typeof INCOMING_GRPC_MESSAGE;
  serviceTypeName: S['typeName'];
  requestTypeName: GrpcRequestTypename<S>;
  jsonReq: JsonValue;
  sequence: number;
}

export const isDappGrpcRequest = <S extends ServiceType>(
  message: unknown,
): message is DappMessageRequest<S> =>
  typeof message === 'object' &&
  message !== null &&
  'type' in message &&
  message.type === INCOMING_GRPC_MESSAGE;
