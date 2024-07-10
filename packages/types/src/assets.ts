import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

// PRICE_RELEVANCE_THRESHOLDS defines how long prices for different asset types remain relevant (in blocks)
// 1 block = 5 seconds, 200 blocks approximately equals 17 minutes
export const PRICE_RELEVANCE_THRESHOLDS = {
  default: 200n,
};

export interface AuctionNftCaptureGroups {
  seqNum: string;
  auctionId: string;
}

export interface IbcCaptureGroups {
  channel: string;
  denom: string;
}

export interface DelegationCaptureGroups {
  id: string;
  idKey: string;
}

export interface UnbondingCaptureGroups {
  startAt: string;
  id: string;
  idKey: string;
}

export interface AssetPatterns {
  auctionNft: RegexMatcher<AuctionNftCaptureGroups>;
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
    if (!match) {
      return undefined;
    }
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
  auctionNft: new RegexMatcher(
    /^auctionnft_(?<seqNum>[0-9]+)_(?<auctionId>pauctid1[a-zA-HJ-NP-Z0-9]+)$/,
  ),
  lpNft: new RegexMatcher(/^lpnft_/),
  delegationToken: new RegexMatcher(
    /^delegation_(?<idKey>penumbravalid1(?<id>[a-zA-HJ-NP-Z0-9]+))$/,
  ),
  proposalNft: new RegexMatcher(/^proposal_/),
  unbondingToken: new RegexMatcher(
    /^unbonding_start_at_(?<startAt>[0-9]+)_(?<idKey>penumbravalid1(?<id>[a-zA-HJ-NP-Z0-9]+))$/,
  ),
  votingReceipt: new RegexMatcher(/^voted_on_/),
  ibc: new RegexMatcher(/^transfer\/(?<channel>channel-\d+)\/(?<denom>.*)/),
};

/**
 * Get the unbonding start height index from the metadata of an unbonding token
 * -- that is, the block height at which unbonding started.
 *
 * For metadata of a non-unbonding token, will return `undefined`.
 */
export const getUnbondingStartHeight = (metadata?: Metadata) => {
  if (!metadata) {
    return undefined;
  }

  const unbondingMatch = assetPatterns.unbondingToken.capture(metadata.display);

  if (unbondingMatch) {
    const { startAt } = unbondingMatch;
    return BigInt(startAt);
  }

  return undefined;
};
