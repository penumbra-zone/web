import {
  Address,
  AddressIndex,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import {
  AddressByIndexRequest,
  EphemeralAddressRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { shortenAddress } from '@penumbra-zone/types';
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
        address: address.altBech32m,
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
  return res.address!;
};

export const getEphemeralAddress = async (account: number): Promise<Address> => {
  const req = new EphemeralAddressRequest({ addressIndex: { account } });
  const res = await viewClient.ephemeralAddress(req);
  return res.address!;
};

export const getAccountAddr = async (index: number, ephemeral: boolean) => {
  const address = ephemeral ? await getEphemeralAddress(index) : await getAddressByIndex(index);

  return {
    address: address.altBech32m,
    preview: shortenAddress(address.altBech32m),
    index,
  };
};
