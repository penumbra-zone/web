import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import LocalAssetRegistry from './local-asset-registry.json';
import { JsonValue } from '@bufbuild/protobuf';

export interface AssetPattens {
  lpNft: RegExp;
  delegationToken: RegExp;
  proposalNft: RegExp;
  unbondingToken: RegExp;
  votingReceipt: RegExp;
}

export interface DelegationCaptureGroups {
  id: string;
  bech32IdentityKey: string;
}

export interface UnbondingCaptureGroups {
  epoch: string;
  id: string;
}

/**
 * Call `.test()` on these RegExp patterns to test whether a token is of a given type.
 *
 * NOTE - SECURITY IMPLICATIONS: These RegExps each assert that the given prefix
 * is at the _beginning_ of the string. This ensures that they are
 * differentiated from IBC deposits with the same asset name. Penumbra prefixes
 * IBC deposit assets with the provenance of the token, so that if someone
 * creates a token called, e.g., `delegation_whatever` and sends it to a
 * Penumbra user via IBC, it will show up in Penumbra as
 * `transfer/channel-1234/delegation_whatever`. Thus, asserting that the
 * `delegation_` prefix occurs at the _beginning_ of the string, as we're doing
 * below, ensures that it's actually the type we expect it to be.
 *
 * Source of truth for regex patterns:
 * https://github.com/penumbra-zone/penumbra/blob/main/crates/core/asset/src/asset/registry.rs
 */
export const assetPatterns: AssetPattens = {
  lpNft: new RegExp(/^lpnft_/),
  delegationToken: new RegExp(
    /^delegation_(?<bech32IdentityKey>penumbravalid1(?<id>[a-zA-HJ-NP-Z0-9]+))$/,
  ),
  proposalNft: new RegExp(/^proposal_/),
  /**
   * Unbonding tokens have only one denom unit, which is the base denom. Hence
   * the extra `u` at the beginning.
   */
  unbondingToken: new RegExp(
    /^uunbonding_epoch_(?<epoch>[0-9]+)_penumbravalid1(?<id>[a-zA-HJ-NP-Z0-9]+)$/,
  ),
  votingReceipt: new RegExp(/^voted_on_/),
};

export const localAssets: Metadata[] = LocalAssetRegistry.map(a =>
  Metadata.fromJson(a as JsonValue),
);
