import type { Impl } from '.';
import { servicesCtx } from '../../ctx';

export const assets: Impl['assets'] = async function* (req, ctx) {
  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();
  const allMetadata = await indexedDb.getAllAssetsMetadata();

  const responses = allMetadata.map(denomMetadata => ({ denomMetadata }));

  const {
    filtered,
    includeLpNfts,
    includeProposalNfts,
    includeDelegationTokens,
    includeUnbondingTokens,
    includeVotingReceiptTokens,
    includeSpecificDenominations,
  } = req;

  const patterns = [
    {
      includeReq: includeLpNfts,
      pattern: 'lpnft_',
      strictEqual: false,
    },
    {
      includeReq: includeDelegationTokens,
      pattern: 'delegation_',
      strictEqual: false,
    },
    {
      includeReq: includeProposalNfts,
      pattern: 'proposal_',
      strictEqual: false,
    },
    {
      includeReq: includeUnbondingTokens,
      pattern: 'unbonding_',
      strictEqual: false,
    },
    {
      includeReq: includeVotingReceiptTokens,
      pattern: 'voted_on_',
      strictEqual: false,
    },
    ...includeSpecificDenominations.map(d => ({
      includeReq: true,
      pattern: d.denom,
      strictEqual: true,
    })),
  ].filter(i => i.includeReq);

  yield* !filtered
    ? responses
    : responses.filter(asset =>
        patterns.find(p =>
          p.strictEqual
            ? p.pattern === asset.denomMetadata.display
            : asset.denomMetadata.display.includes(p.pattern),
        ),
      );
};
