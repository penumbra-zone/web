import { AddressOwnershipInfo } from './types';
import { viewClient } from '../../../../clients';
import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

export const getAddressOwnershipInfoFromBech32mAddress = async (
  bech32mAddress: string,
): Promise<AddressOwnershipInfo | undefined> => {
  if (!bech32mAddress) return undefined;

  try {
    const { addressIndex } = await viewClient.indexByAddress({
      address: new Address({ altBech32m: bech32mAddress }),
    });

    if (!addressIndex) return { isValidAddress: true, belongsToWallet: false };

    return {
      addressIndexAccount: addressIndex.account,
      belongsToWallet: true,
      isEphemeral: !!addressIndex.randomizer.length,
      isValidAddress: true,
    };
  } catch {
    return { isValidAddress: false };
  }
};
