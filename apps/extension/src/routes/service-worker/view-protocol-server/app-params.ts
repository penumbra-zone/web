import { services } from '../../../service-worker';
import { ViewReqMessage } from './helpers/generic';
import {
  AppParametersRequest,
  AppParametersResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';

export const isAppParamsRequest = (req: ViewReqMessage): req is AppParametersRequest => {
  return req.getType().typeName === AppParametersRequest.typeName;
};

export const handleAppParamsReq = async (): Promise<AppParametersResponse> => {
  const parameters = await services.querier.app.parameters();
  return new AppParametersResponse({ parameters });
};
