import { AddressViewComponent } from '@penumbra-zone/ui-deprecated/AddressViewComponent';
import { create } from '@bufbuild/protobuf';
import { BalancesByAccount } from '../../../../state/shared';
import { AddressViewSchema } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { useMemo } from 'react';

export const TableTitle = ({ account }: { account: BalancesByAccount }) => {
  const addressView = useMemo(
    () =>
      create(AddressViewSchema, {
        addressView: {
          case: 'decoded',
          value: {
            address: account.address,
            index: { account: account.account },
          },
        },
      }),
    [account.address, account.account],
  );

  return <AddressViewComponent addressView={addressView} />;
};
