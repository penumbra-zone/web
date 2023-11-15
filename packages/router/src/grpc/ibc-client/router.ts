import { createServerRoute, StreamingHandler, UnaryHandler } from '../types';
import {
  DappMessageRequest,
  GrpcRequest,
  GrpcResponse,
  isDappGrpcRequest,
} from '@penumbra-zone/transport';
import { Query as IbcClientService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/client/v1/query_connect';
import { handleClientStatesReq, isClientStatesRequest } from './client-states';

export type IbcClientReqMessage = GrpcRequest<typeof IbcClientService>;
export type IbcClientProtocolRes = GrpcResponse<typeof IbcClientService>;

export const isIbcClientServerReq = (
  message: unknown,
): message is DappMessageRequest<typeof IbcClientService> => {
  return isDappGrpcRequest(message) && message.serviceTypeName === IbcClientService.typeName;
};

export const ibcClientServerUnaryHandler: UnaryHandler<typeof IbcClientService> = async (
  msg,
  services,
): Promise<GrpcResponse<typeof IbcClientService>> => {
  if (isClientStatesRequest(msg)) return handleClientStatesReq(msg, services);

  throw new Error(`Non-supported unary request: ${msg.getType().typeName}`);
};

export const ibcClientServerStreamingHandler: StreamingHandler<typeof IbcClientService> = (
  msg,
): AsyncIterable<IbcClientProtocolRes> => {
  throw new Error(`Non-supported streaming request: ${msg.getType().typeName}`);
};

export const ibcClientServerRouter = createServerRoute(
  IbcClientService,
  ibcClientServerUnaryHandler,
  ibcClientServerStreamingHandler,
);
