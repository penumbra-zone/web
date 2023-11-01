import { viewClient } from '../clients/grpc';
import { AddressByIndexRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { useQuery } from '@tanstack/react-query';
import { bech32Address } from '@penumbra-zone/types';

type Index = number;
type Address = string;

export type IndexAddrRecord = Record<Index, Address>;

export const useAddresses = (accounts: (number | undefined)[]) => {
  return useQuery({
    queryKey: ['get-addr-index', accounts],
    queryFn: async () => {
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
    },
  });
};

export const useAddress = (account = 0) =>
  useQuery({
    queryKey: ['get-addr-index', account],
    queryFn: async () => {
      const res = await viewClient.addressByIndex({ addressIndex: new AddressIndex({ account }) });
      return res.address!;
    },
  });

export const useEphemeralAddress = (account = 0, options?: { enabled: boolean }) =>
  useQuery({
    queryKey: ['get-addr-ephem', account],
    queryFn: async () => {
      const res = await viewClient.ephemeralAddress({
        addressIndex: new AddressIndex({ account }),
      });
      return res.address!;
    },
    enabled: Boolean(options?.enabled),
  });
