import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { AddressView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import { zeroValueView } from './zero-value-view';

/**
 * Transforms an asset metadata to a `BalanceResponse` with a zero balance on account 0.
 */
export const emptyBalanceResponse = (metadata: Metadata) => {
  return new BalancesResponse({
    balanceView: zeroValueView(metadata),
    accountAddress: new AddressView({
      addressView: {
        case: 'decoded',
        value: {
          index: { account: 0 },
        },
      },
    }),
  });
};
