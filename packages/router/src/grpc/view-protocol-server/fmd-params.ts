import {
  FMDParametersRequest,
  FMDParametersResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { ServicesInterface } from '@penumbra-zone/types';
import { AnyMessage } from '@bufbuild/protobuf';

export const isFmdParamsRequest = (req: AnyMessage): req is FMDParametersRequest => {
  return req.getType().typeName === FMDParametersRequest.typeName;
};

export const handleFmdParamsReq = async (
  services: ServicesInterface,
): Promise<FMDParametersResponse> => {
  const { indexedDb } = await services.getWalletServices();

  const fmdParams = await indexedDb.getFmdParams();
  if (!fmdParams) return new FMDParametersResponse();

  return new FMDParametersResponse({ parameters: fmdParams });
};
