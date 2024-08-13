import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  getAddressIndex,
  getMetadataFromBalancesResponseOptional,
} from '@penumbra-zone/getters/balances-response';
import { useEffect } from 'react';

export type BalanceOrMetadata = BalancesResponse | Metadata;

export const isMetadata = (asset: BalancesResponse | Metadata): asset is Metadata => {
  return asset.getType().typeName === Metadata.typeName;
};

export const isBalance = (asset: BalancesResponse | Metadata): asset is BalancesResponse => {
  return asset.getType().typeName === BalancesResponse.typeName;
};

export const mergeBalancesAndAssets = (
  balances: BalancesResponse[] = [],
  assets: Metadata[] = [],
): BalanceOrMetadata[] => {
  const filteredAssets = assets.filter(asset => {
    return !balances.some(balance => {
      const balanceMetadata = getMetadataFromBalancesResponseOptional(balance);
      return balanceMetadata?.equals(asset);
    });
  });
  return [...balances, ...filteredAssets];
};

// When `balances` change, emit new value of the selected balance: match by address index and asset metadata
export const useSyncSelectedBalance = ({
  balances,
  onChange,
  value,
}: {
  balances?: BalancesResponse[];
  value?: BalancesResponse;
  onChange: (selection: BalancesResponse) => void;
}) => {
  useEffect(() => {
    if (value) {
      const matchedValue = balances?.find(balance => {
        return (
          getAddressIndex.optional()(balance)?.equals(getAddressIndex.optional()(value)) &&
          getMetadataFromBalancesResponseOptional(balance)?.equals(
            getMetadataFromBalancesResponseOptional(value),
          )
        );
      });
      if (matchedValue && !matchedValue.equals(value)) {
        onChange(matchedValue);
      }
    }
    // we only want to run this on new balances from ZQuery, so don't include `value` as dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [balances]);
};
