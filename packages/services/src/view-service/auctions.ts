import { ValueView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import {
  AuctionId,
  DutchAuction,
  DutchAuctionState,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { AddressIndex } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/keys/v1/keys_pb';
import {
  AuctionsResponse,
  BalancesRequest,
  BalancesResponse,
  SpendableNoteRecord,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/view/v1/view_pb';
import { Any, PartialMessage } from '@bufbuild/protobuf';
import { HandlerContext } from '@connectrpc/connect';
import { auctionIdFromBech32 } from '@penumbra-zone/bech32m/pauctid';
import { getDisplayDenomFromView } from '@penumbra-zone/getters/value-view';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { Impl } from '.';
import { idbCtx, querierCtx } from '../ctx/prax';
import { balances } from './balances';

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

  const idb = await ctx.values.get(idbCtx)();
  const querier = await ctx.values.get(querierCtx)();

  for await (const auctionId of iterateAuctionsThisUserControls(ctx, accountFilter)) {
    const id = new AuctionId(auctionIdFromBech32(auctionId));
    const value = await idb.getAuction(id);
    if (!includeInactive && isInactive(value.seqNum)) continue;

    let noteRecord: SpendableNoteRecord | undefined;
    if (value.noteCommitment) {
      noteRecord = await idb.getSpendableNoteByCommitment(value.noteCommitment);
    }

    let state: DutchAuctionState | undefined;
    if (queryLatestState) {
      const auction = await querier.auction.auctionStateById(id);
      state = auction?.state;
    }

    let auction: Any | undefined;
    if (!!value.auction || state) {
      const outstandingReserves = await idb.getAuctionOutstandingReserves(id);
      auction = new Any({
        typeUrl: DutchAuction.typeName,
        value: new DutchAuction({
          state: state ?? {
            seq: value.seqNum,
            inputReserves: outstandingReserves?.input.amount,
            outputReserves: outstandingReserves?.output.amount,
          },
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
