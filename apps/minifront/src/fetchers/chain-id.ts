import { ViewService } from '@penumbra-zone/protobuf';
import { praxClient } from '../prax';

export const getChainId = async (): Promise<string | undefined> => {
  const { parameters } = await praxClient.service(ViewService).appParameters({});
  return parameters?.chainId;
};
