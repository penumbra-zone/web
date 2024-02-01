import { viewClient } from '../clients/grpc';

export const getChainId = async (): Promise<string> => {
  const { parameters } = await viewClient.appParameters({});
  if (!parameters?.chainId) throw new Error('No chainId in response');

  return parameters.chainId;
};
