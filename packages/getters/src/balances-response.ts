import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { createGetter } from './utils/create-getter';
import { getMetadata } from './value-view';
import { getAssetId, getDisplay } from './metadata';

export const getBalanceView = createGetter(
  (balancesResponse?: BalancesResponse) => balancesResponse?.balanceView,
);

export const getAssetIdFromBalancesResponseOptional = getBalanceView
  .optional()
  .pipe(getMetadata)
  .pipe(getAssetId);

export const getDisplayFromBalancesResponse = getBalanceView
  .pipe(getMetadata)
  .optional()
  .pipe(getDisplay);

export const getAddressIndex = createGetter((balancesResponse?: BalancesResponse) =>
  balancesResponse?.accountAddress?.addressView.case === 'decoded'
    ? balancesResponse.accountAddress.addressView.value.index
    : undefined,
);

export const getAmount = createGetter(
  (balancesResponse?: BalancesResponse) => balancesResponse?.balanceView?.valueView.value?.amount,
);
