import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { create } from '@bufbuild/protobuf';
import { BalancesResponseSchema } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { AddressViewSchema } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { zeroValueView } from './zero-value-view';

/**
 * Transforms an asset metadata to a `BalanceResponse` with a zero balance on account 0.
 */
export const emptyBalanceResponse = (metadata: Metadata, accountIndex = 0) => {
  return create(BalancesResponseSchema, {
    balanceView: zeroValueView(metadata),
    accountAddress: create(AddressViewSchema, {
      addressView: {
        case: 'decoded',
        value: {
          index: { account: accountIndex },
        },
      },
    }),
  });
};
