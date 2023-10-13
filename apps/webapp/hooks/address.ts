import { viewClient } from '../clients/grpc';
import { AddressByIndexRequest } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1alpha1/view_pb';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1alpha1/keys_pb';
import { useQuery } from '@tanstack/react-query';
import { uint8ArrayToBase64 } from 'penumbra-types';

interface AddressReqProps {
  account: number | undefined;
}

export const useAddresses = (props: AddressReqProps[]) => {
  return useQuery({
    queryKey: ['get-addr-index', props],
    queryFn: async () => {
      const allTrades = props.map(p => {
        const req = new AddressByIndexRequest();
        if (p.account) req.addressIndex = new AddressIndex({ account: p.account });
        return viewClient.addressByIndex(req);
      });
      const responses = await Promise.all(allTrades);
      return responses.map(res => uint8ArrayToBase64(res.address!.inner));
    },
  });
};
