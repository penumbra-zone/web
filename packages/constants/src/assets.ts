import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import LocalAssetRegistry from './local-asset-registry.json';
import { JsonValue } from '@bufbuild/protobuf';

export const localAssets: Metadata[] = LocalAssetRegistry.map(a =>
  Metadata.fromJson(a as JsonValue),
);

export const NUMERAIRE_DENOMS: string[] = ['test_usd', 'usdc'];
export const NUMERAIRES: Metadata[] = localAssets.filter(m => NUMERAIRE_DENOMS.includes(m.display));

export const PRICE_RELEVANCE_THRESHOLDS = {
  delegationToken: 719,
  default: 200,
};
export const STAKING_TOKEN = 'penumbra';
export const STAKING_TOKEN_METADATA = localAssets.find(
  metadata => metadata.display === STAKING_TOKEN,
)!;

export interface IbcCaptureGroups {
  channel: string;
  denom: string;
}

export interface DelegationCaptureGroups {
  id: string;
  bech32IdentityKey: string;
}

export interface UnbondingCaptureGroups {
  startAt: string;
  id: string;
  bech32IdentityKey: string;
}

export interface AssetPatterns {
  lpNft: RegexMatcher;
  delegationToken: RegexMatcher<DelegationCaptureGroups>;
  proposalNft: RegexMatcher;
  unbondingToken: RegexMatcher<UnbondingCaptureGroups>;
  votingReceipt: RegexMatcher;
  ibc: RegexMatcher<IbcCaptureGroups>;
}

export class RegexMatcher<T = never> {
  constructor(private readonly regex: RegExp) {}

  matches(str: string): boolean {
    return this.regex.exec(str) !== null;
  }

  capture(str: string): T | undefined {
    const match = this.regex.exec(str);
    if (!match) return undefined;
    return match.groups as unknown as T;
  }
}

/**
 * Call `.matches()` on these RegExp patterns to test whether a token is of a given type.
 * Call `.capture()` to grab the content by its capture groups (if present)
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
export const assetPatterns: AssetPatterns = {
  lpNft: new RegexMatcher(/^lpnft_/),
  delegationToken: new RegexMatcher(
    /^delegation_(?<bech32IdentityKey>penumbravalid1(?<id>[a-zA-HJ-NP-Z0-9]+))$/,
  ),
  proposalNft: new RegexMatcher(/^proposal_/),
  unbondingToken: new RegexMatcher(
    /^unbonding_start_at_(?<startAt>[0-9]+)_(?<bech32IdentityKey>penumbravalid1(?<id>[a-zA-HJ-NP-Z0-9]+))$/,
  ),
  votingReceipt: new RegexMatcher(/^voted_on_/),
  ibc: new RegexMatcher(/^transfer\/(?<channel>channel-\d+)\/(?<denom>.*)/),
};
