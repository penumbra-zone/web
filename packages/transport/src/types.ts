import { MethodInfo, ServiceType } from '@bufbuild/protobuf';

export const INCOMING_GRPC_MESSAGE = 'PENUMBRA_DAPP_GRPC_REQUEST' as const;
export const OUTGOING_GRPC_MESSAGE = 'PENUMBRA_DAPP_GRPC_RESPONSE' as const;

// Gets all request type-names for service (e.g. penumbra.view.v1alpha1.StatusRequest)
export type GrpcRequestTypename<S extends ServiceType> = {
  [K in keyof S['methods']]: S['methods'][K]['I']['typeName'];
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
export interface DappMessageRequest<S extends ServiceType, M extends GrpcRequest<S>> {
  type: typeof INCOMING_GRPC_MESSAGE;
  serviceTypeName: S['typeName'];
  requestTypeName: GrpcRequestTypename<S>;
  requestMethod: M;
  sequence: number;
}

export const isDappGrpcRequest = <S extends ServiceType>(
  message: unknown,
): message is DappMessageRequest<S, GrpcRequest<S>> =>
  typeof message === 'object' &&
  message !== null &&
  'type' in message &&
  message.type === INCOMING_GRPC_MESSAGE;

interface BaseResponse<S extends ServiceType> {
  type: typeof OUTGOING_GRPC_MESSAGE;
  serviceTypeName: S['typeName'];
  requestTypeName: GrpcRequestTypename<S>; // TODO: Should change to response name? Do we need this?
  sequence: number;
}

export type ResultResponse<S extends ServiceType> = BaseResponse<S> & { result: GrpcResponse<S> };
export const isResultResponse = <S extends ServiceType>(
  message: unknown,
): message is ResultResponse<S> => isDappGrpcResponse(message) && 'result' in message;

export type StreamResponse<S extends ServiceType> = BaseResponse<S> & {
  stream: { value: GrpcResponse<S>; done: false } | { done: true };
};
export const isStreamResponse = <S extends ServiceType>(
  message: unknown,
): message is StreamResponse<S> => isDappGrpcResponse(message) && 'stream' in message;

export type ErrorResponse<S extends ServiceType> = BaseResponse<S> & { error: string };
export const isErrorResponse = <S extends ServiceType>(
  message: unknown,
): message is ErrorResponse<S> => isDappGrpcResponse(message) && 'error' in message;

// Response from extension back to dapp. Custom GrpcEventTransport will handle this.
export type DappMessageResponse<S extends ServiceType> =
  | ResultResponse<S>
  | ErrorResponse<S>
  | StreamResponse<S>;

export const isDappGrpcResponse = (message: unknown): message is DappMessageResponse<ServiceType> =>
  typeof message === 'object' &&
  message !== null &&
  'type' in message &&
  message.type === OUTGOING_GRPC_MESSAGE;

export interface RequestRecord<S extends ServiceType> {
  resolve: (m: ResultResponse<S> | StreamResponse<S>) => void;
  reject: (e: ErrorResponse<S>) => void; // To propagate correctly, it must be of type `ConnectError` when thrown
}

export interface PendingRequests<S extends ServiceType> {
  sequence: number;
  requests: Map<number, RequestRecord<S>>;
}

export type CreateAnyImplMethod = (
  method: MethodInfo & { localName: string; service: ServiceType },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => ((...args: any[]) => any) | null;
