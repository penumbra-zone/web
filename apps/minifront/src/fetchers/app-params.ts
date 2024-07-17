import { AppParameters } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/app/v1/app_pb';
import { viewClient } from '../clients';

export const getAppParameters = async (): Promise<AppParameters | undefined> => {
  const { parameters } = await viewClient.appParameters({});
  return parameters;
};
