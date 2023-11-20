import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import {
  AddressByIndexRequest,
  EphemeralAddressRequest,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { bech32Address } from '@penumbra-zone/types';
import { viewClient } from '../clients/grpc';

type Index = number;
type Address = string;

export type IndexAddrRecord = Record<Index, Address>;

export const getAddresses = async (accounts: (number | undefined)[]): Promise<IndexAddrRecord> => {
  const allReqs = accounts.map(account => {
    const req = new AddressByIndexRequest();
    if (account) req.addressIndex = new AddressIndex({ account });
    return viewClient.addressByIndex(req);
  });

  const responses = await Promise.all(allReqs);
  return responses
    .map((res, i) => {
      const address = bech32Address(res.address!);
      return {
        index: accounts[i] ?? 0,
        address,
      };
    })
    .reduce<IndexAddrRecord>((acc, curr) => {
      acc[curr.index] = curr.address;
      return acc;
    }, {});
};

export const getAddressByIndex = async (account: number): Promise<string> => {
  const req = new AddressByIndexRequest();
  req.addressIndex = new AddressIndex({ account });
  const res = await viewClient.addressByIndex(req);

  return bech32Address(res.address!);
};

export const getEphemeralAddress = async (account: number): Promise<string> => {
  const req = new EphemeralAddressRequest();
  req.addressIndex = new AddressIndex({ account });
  const res = await viewClient.ephemeralAddress(req);

  return bech32Address(res.address!);
};
