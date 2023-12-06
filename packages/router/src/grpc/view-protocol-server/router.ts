import { createServerRoute, StreamingHandler, UnaryHandler } from '../types';
import {
  DappMessageRequest,
  GrpcRequest,
  GrpcResponse,
  isDappGrpcRequest,
} from '../../transport-old';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { handleAppParamsReq, isAppParamsRequest } from './app-params';
import { handleAddressReq, isAddressRequest } from './address';
import { handleWalletIdReq, isWalletIdRequest } from './wallet-id';
import { handleTxInfoByHashReq, isTxInfoByHashRequest } from './tx-info-by-hash';
import { handleTxPlannerReq, isTxPlannerRequest } from './tx-planner';
import { handleBalancesReq, isBalancesRequest } from './balances';
import { handleTransactionInfoReq, isTransactionInfoRequest } from './tx-info';
import { handleStatusReq, isStatusStreamRequest } from './status-stream';
import { handleAssetsReq, isAssetsRequest } from './assets';
import { handleWitnessBuildReq, isWitnessBuildRequest } from './witness-build';
import { handleBroadcastReq, isBroadcastRequest } from './broadcast';
import { handleEphemeralAddrReq, isEphemeralAddrRequest } from './ephemeral-addr';
import { handleStatusRequest, isStatusRequest } from './status';
import { handleNotesReq, isNotesRequest } from './notes';
import { handleIndexByAddressReq, isIndexByAddressRequest } from './index-by-address';
import { handleFmdParamsReq, isFmdParamsRequest } from './fmd-params';
import { handleNoteByCommitmentReq, isNoteByCommitmentRequest } from './note-by-commitment';
import { handleNullifierStatusReq, isNullifierStatusRequest } from './nullifier-status';

export type ViewReqMessage = GrpcRequest<typeof ViewProtocolService>;
export type ViewProtocolRes = GrpcResponse<typeof ViewProtocolService>;

export const isViewServerReq = (
  message: unknown,
): message is DappMessageRequest<typeof ViewProtocolService> => {
  return isDappGrpcRequest(message) && message.serviceTypeName === ViewProtocolService.typeName;
};

export const viewServerUnaryHandler: UnaryHandler<typeof ViewProtocolService> = async (
  msg,
  services,
): Promise<GrpcResponse<typeof ViewProtocolService>> => {
  if (isAppParamsRequest(msg)) return handleAppParamsReq(services);
  else if (isAddressRequest(msg)) return handleAddressReq(msg);
  else if (isWalletIdRequest(msg)) return handleWalletIdReq();
  else if (isTxInfoByHashRequest(msg)) return handleTxInfoByHashReq(msg, services);
  else if (isTxPlannerRequest(msg)) return handleTxPlannerReq(msg, services);
  else if (isWitnessBuildRequest(msg)) return handleWitnessBuildReq(msg, services);
  else if (isBroadcastRequest(msg)) return handleBroadcastReq(msg);
  else if (isEphemeralAddrRequest(msg)) return handleEphemeralAddrReq(msg);
  else if (isStatusRequest(msg)) return handleStatusRequest(msg, services);
  else if (isIndexByAddressRequest(msg)) return handleIndexByAddressReq(msg);
  else if (isFmdParamsRequest(msg)) return handleFmdParamsReq(services);
  else if (isNoteByCommitmentRequest(msg)) return handleNoteByCommitmentReq(msg, services);
  else if (isNullifierStatusRequest(msg)) return handleNullifierStatusReq(msg, services);

  throw new Error(`Non-supported unary request: ${(msg as ViewReqMessage).getType().typeName}`);
};

export const viewServerStreamingHandler: StreamingHandler<typeof ViewProtocolService> = (
  msg,
  services,
): AsyncIterable<ViewProtocolRes> => {
  if (isBalancesRequest(msg)) return handleBalancesReq(msg, services);
  else if (isTransactionInfoRequest(msg)) return handleTransactionInfoReq(msg, services);
  else if (isStatusStreamRequest(msg)) return handleStatusReq(msg, services);
  else if (isAssetsRequest(msg)) return handleAssetsReq(msg, services);
  else if (isNotesRequest(msg)) return handleNotesReq(msg, services);

  throw new Error(`Non-supported streaming request: ${msg.getType().typeName}`);
};

export const viewServerRouter = createServerRoute(
  ViewProtocolService,
  viewServerUnaryHandler,
  viewServerStreamingHandler,
);
