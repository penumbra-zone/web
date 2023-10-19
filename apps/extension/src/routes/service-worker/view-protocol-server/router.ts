import {
  createServerRoute,
  UnaryHandler,
  ViewProtocolRes,
  ViewReqMessage,
} from './helpers/generic';
import { GrpcRequest, GrpcResponse } from 'penumbra-transport';
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

export const viewServerUnaryHandler: UnaryHandler<typeof ViewProtocolService> = async (
  msg: GrpcRequest<typeof ViewProtocolService>,
): Promise<GrpcResponse<typeof ViewProtocolService>> => {
  if (isAppParamsRequest(msg)) return handleAppParamsReq();
  else if (isAddressRequest(msg)) return handleAddressReq(msg);
  else if (isWalletIdRequest(msg)) return handleWalletIdReq();
  else if (isTxInfoByHashRequest(msg)) return handleTxInfoByHashReq(msg);
  else if (isTxPlannerRequest(msg)) return handleTxPlannerReq(msg);

  throw new Error(`Non-supported unary request: ${(msg as ViewReqMessage).getType().typeName}`);
};

export const viewServerStreamingHandler = (msg: ViewReqMessage): AsyncIterable<ViewProtocolRes> => {
  if (isBalancesRequest(msg)) return handleBalancesReq(msg);
  else if (isTransactionInfoRequest(msg)) return handleTransactionInfoReq(msg);
  else if (isStatusStreamRequest(msg)) return handleStatusReq(msg);
  else if (isAssetsRequest(msg)) return handleAssetsReq(msg);

  throw new Error(`Non-supported streaming request: ${msg.getType().typeName}`);
};

export const viewServerRouter = createServerRoute(
  ViewProtocolService,
  viewServerUnaryHandler,
  viewServerStreamingHandler,
);
