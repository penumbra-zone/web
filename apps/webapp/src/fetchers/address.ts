import { Address } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { bech32Address } from '@penumbra-zone/types';
import { viewClient } from '../clients/grpc';

type Index = number;
type Bech32Address = string;

export type IndexAddrRecord = Record<Index, Bech32Address>;

export const getAddresses = async (accounts: (number | undefined)[]): Promise<IndexAddrRecord> => {
  const allReqs = accounts.map(getAddressByIndex);

  const responses = await Promise.all(allReqs);
  return responses
    .map((address, i) => {
      return {
        index: accounts[i] ?? 0,
        address: bech32Address(address),
      };
    })
    .reduce<IndexAddrRecord>((acc, curr) => {
      acc[curr.index] = curr.address;
      return acc;
    }, {});
};

export const getAddressByIndex = async (account = 0): Promise<Address> => {
  const { address } = await viewClient.addressByIndex({ addressIndex: { account } });
  if (!address) throw new Error('Address not in getAddressByIndex response');
  return address;
};

export const getEphemeralAddress = async (account = 0): Promise<Address> => {
  const { address } = await viewClient.ephemeralAddress({ addressIndex: { account } });
  if (!address) throw new Error('Address not in getEphemeralAddress response');
  return address;
};

export const getAccountAddr = async (index: number, ephemeral: boolean) => {
  const address = ephemeral ? await getEphemeralAddress(index) : await getAddressByIndex(index);
  const bech32 = bech32Address(address);

  return {
    address: bech32,
    index,
  };
};
