import { BalancesResponse, Metadata, AddressIndex } from '@penumbra-zone/protobuf/types';
import { getMetadataFromBalancesResponseOptional } from '@penumbra-zone/getters/balances-response';
import { getAddressIndex } from '@penumbra-zone/getters/address-view';
import { getMetadata } from '@penumbra-zone/getters/value-view';

export const balancesResponseAndMetadataAreSameAsset = (
  balancesResponse?: BalancesResponse,
  metadata?: Metadata,
) => getMetadata.optional()(balancesResponse?.balanceView)?.equals(metadata);

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
    const balanceViewMetadata = getMetadataFromBalancesResponseOptional(balance);

    return (
      getAddressIndex(balance.accountAddress).account === addressIndex.account &&
      metadata.penumbraAssetId?.equals(balanceViewMetadata?.penumbraAssetId)
    );
  });
};
