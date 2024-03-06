import { PenumbraSymbol as penumbra } from '.';

export const getAnyPenumbraPort = async (request?: boolean) => {
  if (!penumbra) throw Error('No Penumbra global (no provider installed)');
  const provider = Object.values(penumbra)[0];
  if (!provider) throw Error('No Penumbra provider available');
  if (request) void provider.request();
  return provider.connect();
};
