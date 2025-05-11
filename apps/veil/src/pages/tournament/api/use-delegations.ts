import { useQuery } from '@tanstack/react-query';
import { ViewService } from '@penumbra-zone/protobuf/penumbra/view/v1/view_connect';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { ValueView } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { DelegationsByAddressIndexRequest_Filter } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { connectionStore } from '@/shared/model/connection';
import { penumbra } from '@/shared/const/penumbra';
import { useRefetchOnNewBlock } from '@/shared/api/compact-block';

export const useAccountDelegations = (disabled?: boolean) => {
  const { connected, subaccount } = connectionStore;

  const query = useQuery<ValueView[]>({
    enabled: connected,
    queryKey: ['delegations-by-address-index', subaccount],
    staleTime: Infinity,
    queryFn: async () => {
      // TODO: revisit the method later as it's not super efficient and other method
      //  could suit the case of checking for non-eligible LQT notes
      const res = await Array.fromAsync(
        penumbra.service(ViewService).delegationsByAddressIndex({
          addressIndex: new AddressIndex({ account: subaccount }),
          filter: DelegationsByAddressIndexRequest_Filter.ALL_ACTIVE_WITH_NONZERO_BALANCES,
        }),
      );

      return res.map(item => item.valueView).filter(item => !!item);
    },
  });

  useRefetchOnNewBlock('delegations-by-address-index', query, disabled);

  return query;
};
