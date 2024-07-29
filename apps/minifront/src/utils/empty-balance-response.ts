import { Metadata, BalancesResponse, AddressView } from '@penumbra-zone/protobuf/types';
import { zeroValueView } from './zero-value-view';

/**
 * Transforms an asset metadata to a `BalanceResponse` with a zero balance on account 0.
 */
export const emptyBalanceResponse = (metadata: Metadata, accountIndex = 0) => {
  return new BalancesResponse({
    balanceView: zeroValueView(metadata),
    accountAddress: new AddressView({
      addressView: {
        case: 'decoded',
        value: {
          index: { account: accountIndex },
        },
      },
    }),
  });
};
