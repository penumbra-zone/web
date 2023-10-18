import { services } from '../../../service-worker';
import {
  AppParametersRequest,
  AppParametersResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ViewProtocolService } from '@buf/penumbra-zone_penumbra.connectrpc_es/penumbra/view/v1alpha1/view_connect';
import { GrpcRequest } from 'penumbra-transport';

export const isAppParamsRequest = (
  req: GrpcRequest<typeof ViewProtocolService>,
): req is AppParametersRequest => {
  return req.getType().typeName === AppParametersRequest.typeName;
};

export const handleAppParamsReq = async (): Promise<AppParametersResponse> => {
  const parameters = await services.querier.app.appParams();
  return new AppParametersResponse({ parameters });
};
