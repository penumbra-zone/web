import { IMessageTypeRegistry, JsonValue, MethodInfo, ServiceType } from '@bufbuild/protobuf';

export const INCOMING_GRPC_MESSAGE = 'PENUMBRA_DAPP_GRPC_REQUEST' as const;
export const OUTGOING_GRPC_MESSAGE = 'PENUMBRA_DAPP_GRPC_RESPONSE' as const;

// Gets all request type-names for service (e.g. penumbra.view.v1alpha1.StatusRequest)
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

interface BaseResponse<S extends ServiceType> {
  type: typeof OUTGOING_GRPC_MESSAGE;
  serviceTypeName: S['typeName'];
  requestTypeName: GrpcRequestTypename<S>;
  sequence: number;
}

export type UnaryResponse<S extends ServiceType> = BaseResponse<S> & {
  result: JsonValue;
  responseTypeName: GrpcResponseTypename<S>;
};

export const isUnaryResponse = <S extends ServiceType>(
  message: unknown,
): message is UnaryResponse<S> => isDappGrpcResponse(message) && 'result' in message;

export const unaryResponseMsg = <S extends ServiceType>(
  req: DappMessageRequest<S>,
  result: GrpcResponse<S>,
  typeRegistry: IMessageTypeRegistry,
): UnaryResponse<S> => {
  return {
    type: OUTGOING_GRPC_MESSAGE,
    sequence: req.sequence,
    serviceTypeName: req.serviceTypeName,
    requestTypeName: req.requestTypeName,
    responseTypeName: result.getType().typeName,
    result: result.toJson({ typeRegistry }),
  };
};

interface StreamResponseValue<S extends ServiceType> {
  value: JsonValue;
  responseTypeName: GrpcResponseTypename<S>;
  done: false;
}

export type StreamResponse<S extends ServiceType> = BaseResponse<S> & {
  stream: StreamResponseValue<S> | { done: true };
};

export const streamResponseMsg = <S extends ServiceType>(
  req: DappMessageRequest<S>,
  result: { value: GrpcResponse<S>; done: false } | { done: true },
  typeRegistry: IMessageTypeRegistry,
): StreamResponse<S> => {
  const streamResponse =
    'value' in result
      ? {
          value: result.value.toJson({ typeRegistry }),
          responseTypeName: result.value.getType().typeName,
          done: result.done,
        }
      : result;

  return {
    type: OUTGOING_GRPC_MESSAGE,
    sequence: req.sequence,
    requestTypeName: req.requestTypeName,
    serviceTypeName: req.serviceTypeName,
    stream: streamResponse,
  };
};

export const isStreamResponse = <S extends ServiceType>(
  message: unknown,
): message is StreamResponse<S> => isDappGrpcResponse(message) && 'stream' in message;

export type ErrorResponse<S extends ServiceType> = BaseResponse<S> & { error: string };
export const isErrorResponse = <S extends ServiceType>(
  message: unknown,
): message is ErrorResponse<S> => isDappGrpcResponse(message) && 'error' in message;

export const errorResponseMsg = <S extends ServiceType>(
  req: DappMessageRequest<S>,
  error: unknown,
): ErrorResponse<S> => {
  return {
    type: OUTGOING_GRPC_MESSAGE,
    sequence: req.sequence,
    requestTypeName: req.requestTypeName,
    serviceTypeName: req.serviceTypeName,
    error: String(error),
  };
};

// Response from extension back to dapp. Custom GrpcEventTransport will handle this.
export type DappMessageResponse<S extends ServiceType> =
  | UnaryResponse<S>
  | ErrorResponse<S>
  | StreamResponse<S>;

export const isDappGrpcResponse = (message: unknown): message is DappMessageResponse<ServiceType> =>
  typeof message === 'object' &&
  message !== null &&
  'type' in message &&
  message.type === OUTGOING_GRPC_MESSAGE;

export const isServiceGrpcResponse = <S extends ServiceType>(
  s: S,
  message: unknown,
): message is DappMessageResponse<S> =>
  typeof message === 'object' &&
  message !== null &&
  'type' in message &&
  message.type === OUTGOING_GRPC_MESSAGE &&
  'serviceTypeName' in message &&
  message.serviceTypeName === s.typeName;

export interface RequestRecord<S extends ServiceType> {
  resolve: (m: UnaryResponse<S> | StreamResponse<S>) => void;
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
