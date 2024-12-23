import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '../penumbra';

export const getChainId = async (): Promise<string | undefined> => {
  const { parameters } = await penumbra.service(ViewService).appParameters({});
  return parameters?.chainId;
};
