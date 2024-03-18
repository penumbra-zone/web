import type { Impl } from '.';
import { servicesCtx } from '../../ctx/prax';
import { assetPatterns } from '@penumbra-zone/constants/src/assets';

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
      pattern: new RegExp(`^${d.denom}$`),
    })),
  ].filter(i => i.includeReq);

  for await (const metadata of indexedDb.iterateAssetsMetadata()) {
    if (filtered && !patterns.find(p => p.pattern.test(metadata.display))) continue;
    yield { denomMetadata: metadata };
  }
};
