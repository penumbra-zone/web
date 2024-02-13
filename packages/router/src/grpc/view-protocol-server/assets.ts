import type { Impl } from '.';
import { servicesCtx } from '../../ctx';
import { assetPatterns } from '@penumbra-zone/constants';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';

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

  // NOTE: https://github.com/penumbra-zone/web/issues/495
  //      Results collected a temp workaround until issue is resolved.
  const assets: { denomMetadata: Metadata }[] = [];
  for await (const metadata of indexedDb.iterateAssetsMetadata()) {
    if (filtered && !patterns.find(p => p.pattern.test(metadata.display))) continue;
    assets.push({ denomMetadata: metadata });
  }

  for (const asset of assets) {
    yield asset;
  }
};
