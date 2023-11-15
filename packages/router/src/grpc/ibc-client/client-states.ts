import { GrpcRequest } from '@penumbra-zone/transport';
import { Query as IbcClientService } from '@buf/cosmos_ibc.connectrpc_es/ibc/core/client/v1/query_connect';
import {
  QueryClientStatesRequest,
  QueryClientStatesResponse,
} from '@buf/cosmos_ibc.bufbuild_es/ibc/core/client/v1/query_pb';
import { ServicesInterface } from '@penumbra-zone/types';
import { IdentifiedClientState } from '@buf/cosmos_ibc.bufbuild_es/ibc/core/client/v1/client_pb';
import { Any } from '@bufbuild/protobuf';

export const isClientStatesRequest = (
  req: GrpcRequest<typeof IbcClientService>,
): req is QueryClientStatesRequest => {
  return req.getType().typeName === QueryClientStatesRequest.typeName;
};

const removeLeadingSlash = (str: string): string => (str.startsWith('/') ? str.substring(1) : str);

const fixLeadingSlash = ({
  clientId,
  clientState,
}: IdentifiedClientState): IdentifiedClientState => {
  const newIcs = new IdentifiedClientState({ clientId });
  if (clientState) {
    newIcs.clientState = new Any({
      typeUrl: removeLeadingSlash(clientState.typeUrl),
      value: clientState.value,
    });
  }
  return newIcs;
};

export const handleClientStatesReq = async (
  req: QueryClientStatesRequest,
  services: ServicesInterface,
): Promise<QueryClientStatesResponse> => {
  const { clientStates, pagination } = await services.querier.ibcClient.ibcClientStates(req);

  // TODO: Wait for protobuf-es release so we get the bugfix: https://github.com/bufbuild/protobuf-es/pull/618
  // The Any type returned has a leading slash:  /ibc.lightclients.tendermint.v1.ClientState
  // This makes the registry mapping not work. Manually fixing for now.
  const fixedResponse = new QueryClientStatesResponse();
  fixedResponse.clientStates = clientStates.map(fixLeadingSlash);
  if (pagination) {
    fixedResponse.pagination = pagination;
  }
  return fixedResponse;
};
