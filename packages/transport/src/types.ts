import { MethodInfo, ServiceType } from '@bufbuild/protobuf';

export const INCOMING_GRPC_MESSAGE = 'PENUMBRA_DAPP_GRPC_REQUEST' as const;
export const OUTGOING_GRPC_MESSAGE = 'PENUMBRA_DAPP_GRPC_RESPONSE' as const;

// Gets all request type-names for service (e.g. penumbra.view.v1alpha1.StatusRequest)
export type GrpcRequestTypename<T extends ServiceType> = {
  [K in keyof T['methods']]: T['methods'][K]['I']['typeName'];
}[keyof T['methods']];

// Gets all response types for service (e.g. StatusResponse)
export type GrpcResponse<T extends ServiceType> = {
  [K in keyof T['methods']]: InstanceType<T['methods'][K]['O']>;
}[keyof T['methods']];

// Payload dapp issues to extension
export interface DappMessageRequest<T extends ServiceType> {
  type: typeof INCOMING_GRPC_MESSAGE;
  serviceTypeName: T['typeName'];
  messageTypeName: GrpcRequestTypename<T>;
  sequence: number;
}

export const isDappGrpcRequest = (message: unknown): message is DappMessageRequest<ServiceType> =>
  typeof message === 'object' &&
  message !== null &&
  'type' in message &&
  message.type === INCOMING_GRPC_MESSAGE;

interface BaseResponse<T extends ServiceType> {
  type: typeof OUTGOING_GRPC_MESSAGE;
  serviceTypeName: T['typeName'];
  messageTypeName: GrpcRequestTypename<T>;
  sequence: number;
}

export type ResultResponse<T extends ServiceType> = BaseResponse<T> & { result: GrpcResponse<T> };
export const isResultResponse = <T extends ServiceType>(
  message: unknown,
): message is ResultResponse<T> => isDappGrpcResponse(message) && 'result' in message;

export type StreamResponse<T extends ServiceType> = BaseResponse<T> & {
  stream: { sequence: number; end: boolean };
};
export const isStreamResponse = <T extends ServiceType>(
  message: unknown,
): message is StreamResponse<T> => isDappGrpcResponse(message) && 'stream' in message;

export type ErrorResponse<T extends ServiceType> = BaseResponse<T> & { error: unknown };
export const isErrorResponse = <T extends ServiceType>(
  message: unknown,
): message is ErrorResponse<T> => isDappGrpcResponse(message) && 'error' in message;

// Response from extension back to dapp. Custom GrpcEventTransport will handle this.
export type DappMessageResponse<T extends ServiceType> =
  | ResultResponse<T>
  | ErrorResponse<T>
  | StreamResponse<T>;

export const isDappGrpcResponse = (message: unknown): message is DappMessageResponse<ServiceType> =>
  typeof message === 'object' &&
  message !== null &&
  'type' in message &&
  message.type === OUTGOING_GRPC_MESSAGE;

export interface RequestRecord<T extends ServiceType> {
  resolve: (m: ResultResponse<T> | StreamResponse<T>) => void;
  reject: (e: ErrorResponse<T>) => void;
}

export interface PendingRequests<T extends ServiceType> {
  sequence: number;
  requests: Map<number, RequestRecord<T>>;
}

export type CreateAnyImplMethod = (
  method: MethodInfo & { localName: string; service: ServiceType },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => ((...args: any[]) => any) | null;
