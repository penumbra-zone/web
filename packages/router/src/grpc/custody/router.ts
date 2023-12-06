import { createServerRoute, StreamingHandler, UnaryHandler } from '../types';
import {
  DappMessageRequest,
  GrpcRequest,
  GrpcResponse,
  isDappGrpcRequest,
} from '../../transport-old';

import { CustodyProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/custody/v1alpha1/custody_connect';
import { handleAuthorizeReq, isAuthorizeRequest } from './authorize';

export type CustodyReqMessage = GrpcRequest<typeof CustodyProtocolService>;
export type CustodyProtocolRes = GrpcResponse<typeof CustodyProtocolService>;

export const isCustodyServerReq = (
  message: unknown,
): message is DappMessageRequest<typeof CustodyProtocolService> => {
  return isDappGrpcRequest(message) && message.serviceTypeName === CustodyProtocolService.typeName;
};

export const custodyServerUnaryHandler: UnaryHandler<typeof CustodyProtocolService> = async (
  msg,
): Promise<GrpcResponse<typeof CustodyProtocolService>> => {
  if (isAuthorizeRequest(msg)) return handleAuthorizeReq(msg);

  throw new Error(`Non-supported unary request: ${(msg as CustodyReqMessage).getType().typeName}`);
};

export const custodyServerStreamingHandler: StreamingHandler<typeof CustodyProtocolService> = (
  msg,
): AsyncIterable<CustodyProtocolRes> => {
  throw new Error(`Non-supported streaming request: ${msg.getType().typeName}`);
};

export const custodyServerRouter = createServerRoute(
  CustodyProtocolService,
  custodyServerUnaryHandler,
  custodyServerStreamingHandler,
);
