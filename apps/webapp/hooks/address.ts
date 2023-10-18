import { viewClient } from '../clients/grpc';
import { AddressByIndexRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { useQuery } from '@tanstack/react-query';
import { bech32Address } from 'penumbra-types';
import { UseQueryResult } from '@tanstack/react-query/src/types';

interface AddressReqProps {
  account: number | undefined;
}

export interface AddrQueryReturn {
  index: number;
  address: string;
}

export const useAddresses = (props: AddressReqProps[]): UseQueryResult<AddrQueryReturn[]> => {
  return useQuery({
    queryKey: ['get-addr-index', props],
    queryFn: async () => {
      const allTrades = props.map(p => {
        const req = new AddressByIndexRequest();
        if (p.account) req.addressIndex = new AddressIndex({ account: p.account });
        return viewClient.addressByIndex(req);
      });

      const responses = await Promise.all(allTrades);
      return responses.map((res, i) => {
        const address = bech32Address(res.address!);
        return {
          index: props[i]?.account ?? 0,
          address,
        };
      });
    },
  });
};
