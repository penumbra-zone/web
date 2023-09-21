import { services } from '../../../service-worker';
import {
  ChainParametersRequest,
  ChainParametersResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { DappMessageRequest } from 'penumbra-transport';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { ViewProtocolReq } from './helpers/generic';

export type ChainParamsReq = DappMessageRequest<typeof ViewProtocolService, ChainParametersRequest>;
export const isChainParamsRequest = (req: ViewProtocolReq): req is ChainParamsReq => {
  return req.requestTypeName === ChainParametersRequest.typeName;
};

export const handleChainParamsReq = async (): Promise<ChainParametersResponse> => {
  const parameters = await services.controllers.querier.app.chainParameters();
  return new ChainParametersResponse({ parameters });
};
