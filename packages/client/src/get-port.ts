import { PenumbraSymbol } from './global';

// Used to connect to other Penumbra wallets
export const getAnyPenumbraPort = async (request?: boolean) => {
  const penumbra = window[PenumbraSymbol];
  if (!penumbra) throw Error('No Penumbra global (no provider installed)');

  const provider = Object.values(penumbra)[0];
  if (!provider) throw Error('No Penumbra provider available');

  if (request) void provider.request();
  return provider.connect();
};
