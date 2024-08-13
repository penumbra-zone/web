import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { AddressView } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
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
