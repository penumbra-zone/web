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

// Source of truth for regex patterns: https://github.com/penumbra-zone/penumbra/blob/main/crates/core/asset/src/asset/registry.rs
export const assetPatterns: AssetPattens = {
  lpNft: new RegExp(/^lpnft_/),
  delegationToken: new RegExp(
    /.*delegation_(?<bech32IdentityKey>penumbravalid1(?<id>[a-zA-HJ-NP-Z0-9]+))$/,
  ),
  proposalNft: new RegExp(/^proposal_/),
  /**
   * Unbonding tokens have only one denom unit, which is the base denom. Hence
   * the extra `u` at the beginning.
   */
  unbondingToken: new RegExp(
    /.*unbonding_epoch_(?<epoch>[0-9]+)_penumbravalid1(?<id>[a-zA-HJ-NP-Z0-9]+)$/,
  ),
  votingReceipt: new RegExp(/^voted_on_/),
};

export const localAssets: Metadata[] = LocalAssetRegistry.map(a =>
  Metadata.fromJson(a as JsonValue),
);
