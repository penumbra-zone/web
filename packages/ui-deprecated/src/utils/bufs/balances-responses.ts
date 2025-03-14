import { BalancesResponseSchema } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { create } from '@bufbuild/protobuf';
import { OSMO_VALUE_VIEW, PENUMBRA_VALUE_VIEW } from './value-view.ts';
import { ADDRESS2_VIEW_DECODED, ADDRESS_VIEW_DECODED } from './address-view.ts';

export const PENUMBRA_BALANCE = create(BalancesResponseSchema, {
  balanceView: PENUMBRA_VALUE_VIEW,
  accountAddress: ADDRESS_VIEW_DECODED,
});

export const PENUMBRA2_BALANCE = create(BalancesResponseSchema, {
  balanceView: PENUMBRA_VALUE_VIEW,
  accountAddress: ADDRESS2_VIEW_DECODED,
});

export const OSMO_BALANCE = create(BalancesResponseSchema, {
  balanceView: OSMO_VALUE_VIEW,
  accountAddress: ADDRESS_VIEW_DECODED,
});
