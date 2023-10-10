import { services } from '../../../service-worker';
import {
  ChainParametersRequest,
  ChainParametersResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewReqMessage } from './helpers/generic';

export const isChainParamsRequest = (req: ViewReqMessage): req is ChainParametersRequest => {
  return req.getType().typeName === ChainParametersRequest.typeName;
};

export const handleChainParamsReq = async (): Promise<ChainParametersResponse> => {
  const parameters = await services.querier.app.chainParameters();
  return new ChainParametersResponse({ parameters });
};
