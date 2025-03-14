import {
  BalancesResponse,
  BalancesResponseSchema,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import { Metadata, MetadataSchema } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import {
  getAddressIndex,
  getMetadataFromBalancesResponse,
} from '@penumbra-zone/getters/balances-response';
import { useEffect } from 'react';
import { equals, isMessage } from '@bufbuild/protobuf';
import { AddressIndexSchema } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

export type BalanceOrMetadata = BalancesResponse | Metadata;

export const isMetadata = (value?: BalanceOrMetadata): value is Metadata =>
  !!value && isMessage(value, MetadataSchema);

export const isBalance = (value?: BalanceOrMetadata): value is BalancesResponse =>
  !!value && isMessage(value, BalancesResponseSchema);

export const mergeBalancesAndAssets = (
  balances: BalancesResponse[] = [],
  assets: Metadata[] = [],
): BalanceOrMetadata[] => {
  const filteredAssets = assets.filter(asset => {
    return !balances.some(balance => {
      const balanceMetadata = getMetadataFromBalancesResponse.optional(balance);
      return !!balanceMetadata && equals(MetadataSchema, balanceMetadata, asset);
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
        const index1 = getAddressIndex.optional(balance);
        const index2 = getAddressIndex.optional(value);
        const metadata1 = getMetadataFromBalancesResponse.optional(balance);
        const metadata2 = getMetadataFromBalancesResponse.optional(value);
        return (
          index1 &&
          index2 &&
          equals(AddressIndexSchema, index1, index2) &&
          metadata1 &&
          metadata2 &&
          equals(MetadataSchema, metadata1, metadata2)
        );
      });
      if (matchedValue && !equals(BalancesResponseSchema, matchedValue, value)) {
        onChange(matchedValue);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- we only want to run this on new balances from ZQuery, so don't include `value` as dependency
  }, [balances]);
};
