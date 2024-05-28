import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { DutchAuctionDescription } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { getHumanReadableInterval } from './get-human-readable-interval';

const APPROX_BLOCK_DURATION_SEC = 5n;

export const getValueView = (amount?: Amount, metadata?: Metadata) =>
  new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount,
        metadata,
      },
    },
  });

export const getEmptyValueView = (metadata: Metadata) =>
  new ValueView({ valueView: { case: 'knownAssetId', value: { metadata } } });

export const getTotalTime = (auction: DutchAuctionDescription) =>
  getHumanReadableInterval(
    Number((auction.endHeight - auction.startHeight) * APPROX_BLOCK_DURATION_SEC),
  );

export const getRemainingTime = (endHeight: bigint, fullSyncHeight?: bigint): string | undefined =>
  fullSyncHeight
    ? getHumanReadableInterval(Number((endHeight - fullSyncHeight) * APPROX_BLOCK_DURATION_SEC))
    : undefined;

export const getTimeTillStart = (
  startHeight: bigint,
  fullSyncHeight?: bigint,
): string | undefined =>
  fullSyncHeight
    ? getHumanReadableInterval(Number((startHeight - fullSyncHeight) * APPROX_BLOCK_DURATION_SEC))
    : undefined;
