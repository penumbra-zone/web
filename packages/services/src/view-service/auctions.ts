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
  DutchAuctionState,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { balances } from './balances';
import { getDisplayDenomFromView } from '@penumbra-zone/getters/value-view';
import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { Any, PartialMessage } from '@bufbuild/protobuf';
import { servicesCtx } from '../ctx/prax';
import { auctionIdFromBech32 } from '@penumbra-zone/bech32m/pauctid';
import { HandlerContext } from '@connectrpc/connect';
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

const isInactive = (seqNum?: bigint) => (seqNum === undefined ? false : seqNum > 0n);

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

  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb, querier } = await services.getWalletServices();

  for await (const auctionId of iterateAuctionsThisUserControls(ctx, accountFilter)) {
    const id = new AuctionId(auctionIdFromBech32(auctionId));
    const value = await indexedDb.getAuction(id);
    if (!includeInactive && isInactive(value.seqNum)) continue;

    let noteRecord: SpendableNoteRecord | undefined;
    if (value.noteCommitment) {
      noteRecord = await indexedDb.getSpendableNoteByCommitment(value.noteCommitment);
    }

    let state: DutchAuctionState | undefined;
    if (queryLatestState) state = (await querier.auction.auctionStateById(id))?.state;

    let auction: Any | undefined;
    if (!!value.auction || state) {
      auction = new Any({
        typeUrl: DutchAuction.typeName,
        value: new DutchAuction({
          state: state ?? { seq: value.seqNum },
          description: value.auction,
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
