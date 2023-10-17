import { ViewReqMessage } from './helpers/generic';
import {
  AuthorizeAndBuildRequest,
  AuthorizeAndBuildResponse,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { offscreenClient } from '../../offscreen/types';
import { handleOffscreen } from '../../offscreen/window-management';

export const isAuthBuildRequest = (req: ViewReqMessage): req is AuthorizeAndBuildRequest => {
  return req.getType().typeName === AuthorizeAndBuildRequest.typeName;
};

export const handleAuthBuildReq = async (
  req: AuthorizeAndBuildRequest,
): Promise<AuthorizeAndBuildResponse> => {
  return handleOffscreen(offscreenClient.authAndBuild(req));
};
