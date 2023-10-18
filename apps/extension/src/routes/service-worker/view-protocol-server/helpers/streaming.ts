import {
  DappMessageRequest,
  GrpcRequestTypename,
  OUTGOING_GRPC_MESSAGE,
  StreamResponse,
} from 'penumbra-transport';
import { ServiceType } from '@bufbuild/protobuf';

// export type StreamingMethods<S extends ServiceType> = {
//   [K in keyof S['methods']]: S['methods'][K] extends { kind: typeof MethodKind.ServerStreaming }
//     ? S['methods'][K]['I']
//     : never;
// }[keyof S['methods']];
//
// export type StreamingMethodTypes<S extends ServiceType> = {
//   [K in keyof S['methods']]: S['methods'][K] extends { kind: typeof MethodKind.ServerStreaming }
//     ? S['methods'][K]['I']['typeName']
//     : never;
// }[keyof S['methods']][];
//
// type ViewStreams = StreamingMethodTypes<typeof ViewProtocolService>;

export type GrpcResponse<S extends ServiceType> = {
  [K in keyof S['methods']]: InstanceType<S['methods'][K]['O']>;
}[keyof S['methods']];

export const isStreamingMethod = <S extends ServiceType>(
  req: DappMessageRequest<S>,
  streamingMethodNames: GrpcRequestTypename<S>[],
): boolean => {
  return streamingMethodNames.includes(req.requestTypeName);
};

export const streamResponse = <S extends ServiceType>(
  req: DappMessageRequest<S>,
  result: { value: GrpcResponse<S>; done: false } | { done: true },
): StreamResponse<S> => {
  return {
    type: OUTGOING_GRPC_MESSAGE,
    sequence: req.sequence,
    requestTypeName: req.requestTypeName,
    serviceTypeName: req.serviceTypeName,
    stream: result,
  };
};
