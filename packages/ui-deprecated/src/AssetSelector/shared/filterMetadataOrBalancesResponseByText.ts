import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { isMetadata } from './helpers.ts';
import { getMetadataFromBalancesResponse } from '@penumbra-zone/getters/balances-response';

export const filterMetadataOrBalancesResponseByText =
  (textSearch: string) =>
  (value: Metadata | BalancesResponse): boolean => {
    if (!textSearch.trim()) {
      return true;
    }

    const lowerCaseTextSearch = textSearch.toLocaleLowerCase();
    const metadata = isMetadata(value) ? value : getMetadataFromBalancesResponse(value);

    return (
      metadata.name.toLocaleLowerCase().includes(lowerCaseTextSearch) ||
      metadata.display.toLocaleLowerCase().includes(lowerCaseTextSearch) ||
      metadata.base.toLocaleLowerCase().includes(lowerCaseTextSearch) ||
      metadata.symbol.toLocaleLowerCase().includes(lowerCaseTextSearch)
    );
  };
