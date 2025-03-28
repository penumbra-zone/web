import { useQuery } from '@tanstack/react-query';
import { connectionStore } from '@/shared/model/connection';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { DUMMY_VALUE_VIEW } from '@/pages/tournament/api/dummy';

export const useTotalRewards = () => {
  return useQuery<ValueView>({
    queryKey: ['my-total-rewards'],
    enabled: connectionStore.connected,
    queryFn: async () => {
      // TODO: use backend API to fetch, filter, and sort rewards
      return new Promise(resolve => {
        setTimeout(() => {
          resolve(DUMMY_VALUE_VIEW);
        }, 1000);
      });
    },
  });
};
