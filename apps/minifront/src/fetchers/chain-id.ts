import { viewClient } from '../clients';

export const getChainId = async (): Promise<string | undefined> => {
  const { parameters } = await viewClient.appParameters({});
  return parameters?.chainId;
};
