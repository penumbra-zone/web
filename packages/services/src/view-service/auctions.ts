import {
  AuctionsResponseSchema,
  BalancesRequestSchema,
  BalancesResponseSchema,
  SpendableNoteRecord,
} from '@penumbra-zone/protobuf/penumbra/view/v1/view_pb';

import { Impl } from './index.js';
import {
  AuctionIdSchema,
  DutchAuctionSchema,
  DutchAuctionState,
} from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { balances } from './balances.js';
import { getDisplayDenomFromView } from '@penumbra-zone/getters/value-view';
import { ValueViewSchema } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { assetPatterns } from '@penumbra-zone/types/assets';
import { create, MessageInitShape } from '@bufbuild/protobuf';
import { Any, anyPack } from '@bufbuild/protobuf/wkt';
import { servicesCtx } from '../ctx/prax.js';
import { auctionIdFromBech32 } from '@penumbra-zone/bech32m/pauctid';
import { HandlerContext } from '@connectrpc/connect';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

const getBech32mAuctionId = (
  balancesResponse: MessageInitShape<typeof BalancesResponseSchema>,
): string | undefined => {
  if (!balancesResponse.balanceView) {
    return;
  }

  const captureGroups = assetPatterns.auctionNft.capture(
    getDisplayDenomFromView(create(ValueViewSchema, balancesResponse.balanceView)),
  );

  if (!captureGroups) {
    return;
  }

  return captureGroups.auctionId;
};

const isInactive = (seqNum?: bigint) => (seqNum === undefined ? false : seqNum > 0n);

const iterateAuctionsThisUserControls = async function* (
  ctx: HandlerContext,
  accountFilter?: AddressIndex,
) {
  for await (const balancesResponse of balances(
    create(BalancesRequestSchema, { accountFilter }),
    ctx,
  )) {
    const auctionId = getBech32mAuctionId(balancesResponse);
    if (auctionId) {
      yield auctionId;
    }
  }
};

export const auctions: Impl['auctions'] = async function* (req, ctx) {
  const { includeInactive, queryLatestState, accountFilter } = req;

  const services = await ctx.values.get(servicesCtx)();
  const { indexedDb, querier } = await services.getWalletServices();

  for await (const auctionId of iterateAuctionsThisUserControls(ctx, accountFilter)) {
    const id = create(AuctionIdSchema, auctionIdFromBech32(auctionId));
    const value = await indexedDb.getAuction(id);
    if (!includeInactive && isInactive(value.seqNum)) {
      continue;
    }

    let noteRecord: SpendableNoteRecord | undefined;
    if (value.noteCommitment) {
      noteRecord = await indexedDb.getSpendableNoteByCommitment(value.noteCommitment);
    }

    let state: DutchAuctionState | undefined;
    if (queryLatestState) {
      const auction = await querier.auction.auctionStateById(id);
      state = auction?.state;
    }

    let auction: Any | undefined;
    if (!!value.auction || state) {
      const outstandingReserves = await indexedDb.getAuctionOutstandingReserves(id);
      auction = anyPack(
        DutchAuctionSchema,
        create(DutchAuctionSchema, {
          state: state ?? {
            seq: value.seqNum,
            inputReserves: outstandingReserves?.input.amount,
            outputReserves: outstandingReserves?.output.amount,
          },
          description: value.auction,
        }),
      );
    }

    yield create(AuctionsResponseSchema, {
      id,
      auction,
      noteRecord,
      localSeq: value.seqNum,
    });
  }
};
