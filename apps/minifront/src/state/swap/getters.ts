import { BalancesResponse } from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';
import {
  AssetIdSchema,
  Metadata,
  MetadataSchema,
} from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';
import { getMetadataFromBalancesResponse } from '@penumbra-zone/getters/balances-response';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { getMetadata } from '@penumbra-zone/getters/value-view';
import { equals } from '@bufbuild/protobuf';

export const balancesResponseAndMetadataAreSameAsset = (
  balancesResponse?: BalancesResponse,
  metadata?: Metadata,
) => {
  const balanceMetadata = getMetadata.optional(balancesResponse?.balanceView);
  return !!balanceMetadata && metadata && equals(MetadataSchema, balanceMetadata, metadata);
};

export const getFirstBalancesResponseNotMatchingMetadata = (
  balancesResponses: BalancesResponse[],
  metadata?: Metadata,
) =>
  balancesResponses.find(
    balancesResponse => !balancesResponseAndMetadataAreSameAsset(balancesResponse, metadata),
  );

export const getFirstBalancesResponseMatchingMetadata = (
  balancesResponses: BalancesResponse[],
  metadata?: Metadata,
) =>
  balancesResponses.find(balancesResponse =>
    balancesResponseAndMetadataAreSameAsset(balancesResponse, metadata),
  );

export const getFirstMetadataNotMatchingBalancesResponse = (
  metadatas: Metadata[],
  balancesResponse: BalancesResponse,
) =>
  metadatas.find(metadata => !balancesResponseAndMetadataAreSameAsset(balancesResponse, metadata));

export const getBalanceByMatchingMetadataAndAddressIndex = (
  balances: BalancesResponse[],
  addressIndex: AddressIndex,
  metadata: Metadata,
) => {
  return balances.find(balance => {
    const balanceViewMetadata = getMetadataFromBalancesResponse.optional(balance);

    return (
      getAddressIndex(balance.accountAddress).account === addressIndex.account &&
      metadata.penumbraAssetId &&
      balanceViewMetadata?.penumbraAssetId &&
      equals(AssetIdSchema, metadata.penumbraAssetId, balanceViewMetadata.penumbraAssetId)
    );
  });
};
