import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb.js';
import { createGetter } from './utils/create-getter.js';
import { getCase, getMetadata } from './value-view.js';
import { getAssetId, getDisplay } from './metadata.js';

export const getBalanceView = createGetter(
  (balancesResponse?: BalancesResponse) => balancesResponse?.balanceView,
);

export const getAssetIdFromBalancesResponse = getBalanceView.pipe(getMetadata).pipe(getAssetId);

export const getAssetIdFromBalancesResponseOptional = getBalanceView
  .optional()
  .pipe(getMetadata)
  .pipe(getAssetId);

export const getMetadataFromBalancesResponse = getBalanceView.pipe(getMetadata);

export const getDisplayFromBalancesResponse = getMetadataFromBalancesResponse
  .optional()
  .pipe(getDisplay);

export const getMetadataFromBalancesResponseOptional = getBalanceView.optional().pipe(getMetadata);

export const getAddressIndex = createGetter((balancesResponse?: BalancesResponse) =>
  balancesResponse?.accountAddress?.addressView.case === 'decoded'
    ? balancesResponse.accountAddress.addressView.value.index
    : undefined,
);

export const getAmount = createGetter(
  (balancesResponse?: BalancesResponse) => balancesResponse?.balanceView?.valueView.value?.amount,
);

export const getValueViewCaseFromBalancesResponse = getBalanceView.pipe(getCase);
