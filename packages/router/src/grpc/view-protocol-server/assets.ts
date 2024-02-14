import type { Impl } from '.';
import { servicesCtx } from '../../ctx';
import { assetPatterns } from '@penumbra-zone/constants';

export const assets: Impl['assets'] = async function* (req, ctx) {
  const services = ctx.values.get(servicesCtx);
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
    pattern: RegExp;
  }[] = [
    {
      includeReq: includeLpNfts,
      pattern: assetPatterns.lpNftPattern,
    },
    {
      includeReq: includeDelegationTokens,
      pattern: assetPatterns.delegationTokenPattern,
    },
    {
      includeReq: includeProposalNfts,
      pattern: assetPatterns.proposalNftPattern,
    },
    {
      includeReq: includeUnbondingTokens,
      pattern: assetPatterns.unbondingTokenPattern,
    },
    {
      includeReq: includeVotingReceiptTokens,
      pattern: assetPatterns.votingReceiptPattern,
    },
    ...includeSpecificDenominations.map(d => ({
      includeReq: true,
      pattern: new RegExp(`^${d.denom}$`),
    })),
  ].filter(i => i.includeReq);

  for await (const metadata of indexedDb.iterateAssetsMetadata()) {
    if (filtered && !patterns.find(p => p.pattern.test(metadata.display))) continue;
    yield { denomMetadata: metadata };
  }
};
