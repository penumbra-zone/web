import { ViewReqMessage } from './router';
import { AuthorizeAndBuildRequest, AuthorizeAndBuildResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { handleOffscreen } from '../../../../../apps/extension/src/routes/offscreen/window-management';

export const isAuthBuildRequest = (req: ViewReqMessage): req is AuthorizeAndBuildRequest => {
  return req.getType().typeName === AuthorizeAndBuildRequest.typeName;
};

export const handleAuthBuildReq = async (
  req: AuthorizeAndBuildRequest,
): Promise<void> => { // change to AuthorizeAndBuildResponse
    await handleOffscreen(req);
};