import {
  AuctionsResponse,
  BalancesRequest,
  BalancesResponse,
  SpendableNoteRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Impl } from '.';
import { DutchAuctionDescription } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1alpha1/auction_pb';
import { balances } from './balances';
import { getDisplayDenomFromView } from '@penumbra-zone/getters/value-view';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { assetPatterns } from '@penumbra-zone/constants/assets';
import { PartialMessage } from '@bufbuild/protobuf';
import { servicesCtx } from '../ctx/prax';
import { bech32mAuctionId } from '@penumbra-zone/bech32m/pauctid';
import { Code, ConnectError } from '@connectrpc/connect';

const getBech32mAuctionId = (
  balancesResponse: PartialMessage<BalancesResponse>,
): string | undefined => {
  if (!balancesResponse.balanceView) return;

  const captureGroups = assetPatterns.auctionNft.capture(
    getDisplayDenomFromView(new ValueView(balancesResponse.balanceView)),
  );

  if (!captureGroups) return;

  return captureGroups.auctionId;
};

export const auctions: Impl['auctions'] = async function* (req, ctx) {
  const { includeInactive, queryLatestState, accountFilter } = req;

  if (queryLatestState) {
    throw new ConnectError('`queryLatestState` not yet implemented', Code.Unimplemented);
  }

  if (includeInactive) {
    throw new ConnectError('`includeInactive` not yet implemented', Code.Unimplemented);
  }

  const bech32mAuctionIds = new Set<string>();
  for await (const balancesResponse of balances(new BalancesRequest({ accountFilter }), ctx)) {
    const auctionId = getBech32mAuctionId(balancesResponse);
    if (!auctionId) continue;

    bech32mAuctionIds.add(auctionId);
  }

  if (!bech32mAuctionIds.size) return;

  const services = ctx.values.get(servicesCtx);
  const { indexedDb } = await services.getWalletServices();

  for await (const { id, value } of indexedDb.iterateAuctions()) {
    if (!bech32mAuctionIds.has(bech32mAuctionId(id))) continue;

    /** @todo: if (req.includeInactive && auctionIsInactive()) continue; */

    let noteRecord: SpendableNoteRecord | undefined;
    if (value.noteCommitment) {
      noteRecord = await indexedDb.getSpendableNoteByCommitment(value.noteCommitment);
    }

    yield new AuctionsResponse({
      id,
      auction: {
        typeUrl: DutchAuctionDescription.typeName,
        value: value.auction?.toBinary(),
      },
      noteRecord,
    });
  }
};
