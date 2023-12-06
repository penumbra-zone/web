import {
  AppParametersRequest,
  AppParametersResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { AnyMessage } from '@bufbuild/protobuf';
import { ServicesInterface } from '@penumbra-zone/types';

export const isAppParamsRequest = (req: AnyMessage): req is AppParametersRequest => {
  return req.getType().typeName === AppParametersRequest.typeName;
};

export const handleAppParamsReq = async (
  services: ServicesInterface,
): Promise<AppParametersResponse> => {
  const parameters = await services.querier.app.appParams();
  return new AppParametersResponse({ parameters });
};
