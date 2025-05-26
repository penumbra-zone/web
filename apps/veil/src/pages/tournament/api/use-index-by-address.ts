import { useQuery } from '@tanstack/react-query';
import { Address } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { uint8ArrayToBase64 } from '@penumbra-zone/types/base64';
import { ViewService } from '@penumbra-zone/protobuf';
import { connectionStore } from '@/shared/model/connection';
import { penumbra } from '@/shared/const/penumbra';

export const getIndexByAddress = async (address: Address) => {
  const res = await penumbra.service(ViewService).indexByAddress({ address });
  return res.addressIndex;
};

/**
 * Takes and address and checks if it belongs to user
 */
export const useIndexByAddress = (address?: Address) => {
  const { connected } = connectionStore;
  const addressString = address ? uint8ArrayToBase64(address.inner) : undefined;

  return useQuery({
    enabled: connected && !!addressString,
    queryKey: ['index-by-address', addressString],
    staleTime: Infinity,
    queryFn: async () => {
      if (!address) {
        return null;
      }

      const index = await getIndexByAddress(address);
      return index ?? null;
    },
  });
};
