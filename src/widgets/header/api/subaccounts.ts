import {
  AddressView,
  AddressView_Decoded,
  AddressIndex,
} from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { useQuery } from '@tanstack/react-query';
import { ViewService } from '@penumbra-zone/protobuf';
import { penumbra } from '@/shared/const/penumbra';
import { useBalances } from '@/shared/api/balances';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

const fetchQuery = async (balances: BalancesResponse[]): Promise<AddressView[]> => {
  const service = penumbra.service(ViewService);

  // Include main account for fresh wallets to display address view
  let accountIndexes: number[] = [0];

  for (const balance of balances) {
    if (
      balance.accountAddress?.addressView.case === 'decoded' &&
      balance.accountAddress.addressView.value.index?.account !== undefined
    ) {
      accountIndexes.push(balance.accountAddress.addressView.value.index.account);
    }
  }

  // Filter by unique account indices
  accountIndexes = accountIndexes.filter((value, index, self) => self.indexOf(value) === index);

  return Promise.all(
    accountIndexes.map(async index => {
      const response = await service.addressByIndex({ addressIndex: { account: index } });

      return new AddressView({
        addressView: {
          case: 'decoded',
          value: new AddressView_Decoded({
            address: response.address,
            index: new AddressIndex({ account: index }),
          }),
        },
      });
    }),
  );
};

export const useSubaccounts = () => {
  // Query account balances from view service
  const { data: balances, isLoading: balanceLoading } = useBalances();

  const query = useQuery({
    // 'balances' cache query to enable refecthing balances
    queryKey: ['view-service-accounts', balances],
    queryFn: () => {
      if (!balances) {
        return [];
      }
      return fetchQuery(balances);
    },
    enabled: !balanceLoading,
  });

  // Combines loading states from balances and subaccounts to prevent
  // flickering during balance refetches
  const isLoading = balanceLoading || query.isLoading;

  return {
    ...query,
    isLoading,
  };
};
