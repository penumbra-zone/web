import {
  QueryClientStatesRequest,
  QueryClientStatesResponse,
} from '@buf/cosmos_ibc.bufbuild_es/ibc/core/client/v1/query_pb';
import { ServicesInterface } from '@penumbra-zone/types';
import { AnyMessage } from '@bufbuild/protobuf';

export const isClientStatesRequest = (req: AnyMessage): req is QueryClientStatesRequest => {
  return req.getType().typeName === QueryClientStatesRequest.typeName;
};

// TODO: Remove when grpc proxing ready
export const handleClientStatesReq = async (
  req: QueryClientStatesRequest,
  services: ServicesInterface,
): Promise<QueryClientStatesResponse> => {
  return services.querier.ibcClient.ibcClientStates(req);
};
