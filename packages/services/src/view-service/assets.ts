import type { Impl } from '.';
import { servicesCtx } from '../ctx/prax';
import { assetPatterns, RegexMatcher } from '@penumbra-zone/types/assets';
import { getAssetPriorityScore } from './util/asset-priority-score';

export const assets: Impl['assets'] = async function* (req, ctx) {
  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();

  const {
    filtered,
    includeLpNfts,
    includeProposalNfts,
    includeDelegationTokens,
    includeUnbondingTokens,
    includeVotingReceiptTokens,
    includeSpecificDenominations,
  } = req;

  const patterns: {
    includeReq: boolean;
    pattern: RegexMatcher<unknown>;
  }[] = [
    {
      includeReq: includeLpNfts,
      pattern: assetPatterns.lpNft,
    },
    {
      includeReq: includeDelegationTokens,
      pattern: assetPatterns.delegationToken,
    },
    {
      includeReq: includeProposalNfts,
      pattern: assetPatterns.proposalNft,
    },
    {
      includeReq: includeUnbondingTokens,
      pattern: assetPatterns.unbondingToken,
    },
    {
      includeReq: includeVotingReceiptTokens,
      pattern: assetPatterns.votingReceipt,
    },
    ...includeSpecificDenominations.map(d => ({
      includeReq: true,
      pattern: new RegexMatcher(new RegExp(`^${d.denom}$`)),
    })),
  ].filter(i => i.includeReq);

  for await (const metadata of indexedDb.iterateAssetsMetadata()) {
    if (filtered && !patterns.find(p => p.pattern.matches(metadata.display))) continue;
    if (!metadata.priorityScore) {
      metadata.priorityScore = getAssetPriorityScore(metadata, indexedDb.stakingTokenAssetId);
    }
    yield { denomMetadata: metadata };
  }
};
