import { BalancesResponse } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { getDisplayDenomFromView, getSymbolFromValueView } from '@penumbra-zone/getters/value-view';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { type BalanceOrMetadata, isBalance, isMetadata } from './helpers';
import { getValueViewCaseFromBalancesResponse } from '@penumbra-zone/getters/balances-response';

export const balanceBySearch =
  (search: string) =>
  (balancesResponse: BalancesResponse): boolean =>
    getValueViewCaseFromBalancesResponse.optional()(balancesResponse) === 'knownAssetId' &&
    (getDisplayDenomFromView(balancesResponse.balanceView)
      .toLocaleLowerCase()
      .includes(search.toLocaleLowerCase()) ||
      getSymbolFromValueView(balancesResponse.balanceView)
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase()));

export const metadataBySearch =
  (search: string) =>
  (asset: Metadata): boolean =>
    asset.display.toLocaleLowerCase().includes(search.toLocaleLowerCase()) ||
    asset.symbol.toLocaleLowerCase().includes(search.toLocaleLowerCase());

export const bySearch =
  (search: string) =>
  (asset: BalanceOrMetadata): boolean => {
    if (isMetadata(asset)) {
      return metadataBySearch(search)(asset);
    }
    if (isBalance(asset)) return balanceBySearch(search)(asset);
    return false;
  };
