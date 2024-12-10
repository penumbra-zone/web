import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { OSMO_VALUE_VIEW, PENUMBRA_VALUE_VIEW } from './value-view.ts';
import { ADDRESS1_VIEW_DECODED, ADDRESS_VIEW_DECODED } from './address-view.ts';

export const PENUMBRA_BALANCE = new BalancesResponse({
  balanceView: PENUMBRA_VALUE_VIEW,
  accountAddress: ADDRESS_VIEW_DECODED,
});

export const PENUMBRA2_BALANCE = new BalancesResponse({
  balanceView: PENUMBRA_VALUE_VIEW,
  accountAddress: ADDRESS1_VIEW_DECODED,
});

export const OSMO_BALANCE = new BalancesResponse({
  balanceView: OSMO_VALUE_VIEW,
  accountAddress: ADDRESS_VIEW_DECODED,
});
