import { Result } from './types';
import { viewClient } from '../../../../clients';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

export const getResultFromBech32mAddress = async (
  bech32mAddress: string,
): Promise<Result | undefined> => {
  try {
    const { addressIndex } = await viewClient.indexByAddress({
      address: new Address({ altBech32m: bech32mAddress }),
    });

    if (!addressIndex) return { belongsToWallet: false };

    return {
      addressIndexAccount: addressIndex.account,
      belongsToWallet: true,
      ibc: !!addressIndex.randomizer.length,
    };
  } catch {
    return undefined;
  }
};
