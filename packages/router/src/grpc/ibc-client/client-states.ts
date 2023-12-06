import {
  QueryClientStatesRequest,
  QueryClientStatesResponse,
} from '@buf/cosmos_ibc.bufbuild_es/ibc/core/client/v1/query_pb';
import { ServicesInterface } from '@penumbra-zone/types';
import { GrpcRequest } from '@penumbra-zone/transport';
import { Query as IbcClientService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/client/v1/query_connect';

export const isClientStatesRequest = (
  req: GrpcRequest<typeof IbcClientService>,
): req is QueryClientStatesRequest => {
  return req.getType().typeName === QueryClientStatesRequest.typeName;
};

// TODO: Remove when grpc proxing ready
export const handleClientStatesReq = async (
  req: QueryClientStatesRequest,
  services: ServicesInterface,
): Promise<QueryClientStatesResponse> => {
  return services.querier.ibcClient.ibcClientStates(req);
};
