import { viewClient } from '../clients/grpc';

export const getChainId = async (): Promise<string> => {
  const res = await viewClient.appParameters({});
  if (!res.parameters?.chainParams) throw new Error('No chain params in response');

  return res.parameters.chainParams.chainId;
};
