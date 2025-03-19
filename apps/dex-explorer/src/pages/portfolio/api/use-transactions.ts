import { useInfiniteQuery } from '@tanstack/react-query';
import { TransactionInfo } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { ViewService } from '@penumbra-zone/protobuf';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { penumbra } from '@/shared/const/penumbra';

const BASE_LIMIT = 20;
const BASE_PAGE = 0;

export const useTransactions = (subaccount = 0) => {
  return useInfiniteQuery<TransactionInfo[]>({
    queryKey: ['txs', subaccount],
    initialPageParam: BASE_PAGE,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      return lastPage.length ? (lastPageParam as number) + 1 : undefined;
    },
    queryFn: async ({ pageParam }) => {
      const res = await Array.fromAsync(penumbra.service(ViewService).transactionInfo({}));

      // Filters and maps the array at the same time
      const reduced = res.reduce<TransactionInfo[]>((accum, tx) => {
        const addresses = tx.txInfo?.perspective?.addressViews;

        if (
          !tx.txInfo ||
          !addresses?.some(address => getAddressIndex.optional(address)?.account === subaccount)
        ) {
          return accum;
        }

        // TODO: filter out ics20Withdrawal actions. Remove after the issue is fixed: https://github.com/penumbra-zone/web/issues/2109
        if (
          tx.txInfo.transaction?.body?.actions.some(
            action => action.action.case === 'ics20Withdrawal',
          )
        ) {
          return accum;
        }

        accum.push(tx.txInfo);
        return accum;
      }, []);

      // TODO: implement sorting by height in the ViewService, and use `limitAsync` here after it
      reduced.sort((a, b) => Number(a.height - b.height));

      const offset = BASE_LIMIT * (pageParam as number);
      return reduced.slice(offset, offset + BASE_LIMIT);
    },
  });
};
