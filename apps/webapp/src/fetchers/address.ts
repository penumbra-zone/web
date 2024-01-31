import {
  Address,
  AddressIndex,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import {
  AddressByIndexRequest,
  EphemeralAddressRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
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

export const getAddressByIndex = async (account: number | undefined): Promise<Address> => {
  const req = new AddressByIndexRequest();
  if (account) req.addressIndex = new AddressIndex({ account });
  const res = await viewClient.addressByIndex(req);
  if (!res.address) throw new Error('Address not in getAddressByIndex response');
  return res.address;
};

export const getEphemeralAddress = async (account: number): Promise<Address> => {
  const req = new EphemeralAddressRequest({ addressIndex: { account } });
  const res = await viewClient.ephemeralAddress(req);
  if (!res.address) throw new Error('Address not in getEphemeralAddress response');
  return res.address;
};

export const getAccountAddr = async (index: number, ephemeral: boolean) => {
  const address = ephemeral ? await getEphemeralAddress(index) : await getAddressByIndex(index);
  const bech32 = bech32Address(address);

  return {
    address: bech32,
    index,
  };
};
