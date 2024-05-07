import {
  AuctionsResponse,
  BalancesRequest,
  BalancesResponse,
  SpendableNoteRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Impl } from '.';
import {
  AuctionId,
  DutchAuction,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1alpha1/auction_pb';
import { balances } from './balances';
import { getDisplayDenomFromView } from '@penumbra-zone/getters/value-view';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { assetPatterns } from '@penumbra-zone/constants/assets';
import { Any, PartialMessage } from '@bufbuild/protobuf';
import { servicesCtx } from '../ctx/prax';
import { auctionIdFromBech32 } from '@penumbra-zone/bech32m/pauctid';
import { Code, ConnectError, HandlerContext } from '@connectrpc/connect';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';

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

const iterateAuctionsThisUserControls = async function* (
  ctx: HandlerContext,
  accountFilter?: AddressIndex,
) {
  for await (const balancesResponse of balances(new BalancesRequest({ accountFilter }), ctx)) {
    const auctionId = getBech32mAuctionId(balancesResponse);
    if (auctionId) yield auctionId;
  }
};

export const auctions: Impl['auctions'] = async function* (req, ctx) {
  const { includeInactive, queryLatestState, accountFilter } = req;

  if (queryLatestState) {
    throw new ConnectError('`queryLatestState` not yet implemented', Code.Unimplemented);
  }
  if (includeInactive) {
    throw new ConnectError('`includeInactive` not yet implemented', Code.Unimplemented);
  }

  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb } = await services.getWalletServices();

  for await (const auctionId of iterateAuctionsThisUserControls(ctx, accountFilter)) {
    /** @todo: if (req.includeInactive && auctionIsInactive()) continue; */
    const id = new AuctionId(auctionIdFromBech32(auctionId));
    const value = await indexedDb.getAuction(id);

    let noteRecord: SpendableNoteRecord | undefined;
    if (value.noteCommitment) {
      noteRecord = await indexedDb.getSpendableNoteByCommitment(value.noteCommitment);
    }

    let auction: Any | undefined;

    if (value.auction) {
      auction = new Any({
        typeUrl: DutchAuction.typeName,
        value: new DutchAuction({
          description: value.auction,
          /** @todo include state if `queryLatestState` is `true` */
        }).toBinary(),
      });
    }

    yield new AuctionsResponse({
      id,
      auction,
      noteRecord,
    });
  }
};
