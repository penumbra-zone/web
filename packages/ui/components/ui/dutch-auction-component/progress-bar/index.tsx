import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '../../tx/view/value';
import { DutchAuctionDescription } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { Separator } from '../../separator';
import { getProgress } from '../get-progress';
import { Indicator } from './indicator';
import { ClockIcon, HourglassIcon } from 'lucide-react';
import {
  getEmptyValueView,
  getRemainingTime,
  getTimeTillStart,
  getTotalTime,
  getValueView,
} from './helpers';

export const ProgressBar = ({
  auction,
  inputMetadata,
  outputMetadata,
  fullSyncHeight,
  seqNum,
}: {
  auction: DutchAuctionDescription;
  inputMetadata?: Metadata;
  outputMetadata?: Metadata;
  fullSyncHeight?: bigint;
  seqNum?: bigint;
}) => {
  const progress = getProgress(auction.startHeight, auction.endHeight, fullSyncHeight);

  const auctionEnded =
    (!!seqNum && seqNum > 0n) || (!!fullSyncHeight && fullSyncHeight >= auction.endHeight);
  const auctionIsUpcoming = !!fullSyncHeight && fullSyncHeight < auction.startHeight;
  const auctionIsInProgress =
    !!fullSyncHeight &&
    fullSyncHeight >= auction.startHeight &&
    fullSyncHeight <= auction.endHeight;

  const input = getValueView(auction.input?.amount, inputMetadata);
  const totalTime = getTotalTime(auction);
  const remainingTime = getRemainingTime(auction.endHeight, fullSyncHeight);
  const timeTillStart = getTimeTillStart(auction.startHeight, fullSyncHeight);

  return (
    <div className='relative flex grow items-center justify-between gap-2 overflow-hidden'>
      <ValueViewComponent view={input} size='sm' />

      <div className='relative flex min-h-4 shrink grow items-center overflow-hidden'>
        {seqNum !== undefined && !auctionIsUpcoming && (
          <div className='absolute' style={{ left: `max(${progress * 100}% - 16px, 0px)` }}>
            <Indicator icon={auctionEnded ? 'checkmark' : 'arrow'} />
          </div>
        )}

        <Separator />

        {auctionIsUpcoming && (
          <>
            <div className='flex shrink items-center gap-2 truncate text-xs text-light-brown group-hover:text-muted-foreground'>
              <div className='flex items-center gap-1'>
                <ClockIcon size={12} />
                <span className='truncate pt-[3px]'>starts in ~{timeTillStart}</span>
              </div>

              <div className='flex items-center gap-1'>
                <HourglassIcon size={12} />
                <span className='truncate pt-[3px]'>lasts ~{totalTime}</span>
              </div>
            </div>

            <Separator />
          </>
        )}

        {auctionIsInProgress && (
          <>
            <div className='flex items-center gap-1 truncate text-xs text-light-brown group-hover:text-muted-foreground'>
              <HourglassIcon size={12} />

              <span className='truncate pt-[3px]'>
                ~{remainingTime && <>{remainingTime} of</>} ~{totalTime} remaining
              </span>
            </div>

            <Separator />
          </>
        )}
      </div>

      {outputMetadata && (
        <ValueViewComponent view={getEmptyValueView(outputMetadata)} size='sm' showValue={false} />
      )}
    </div>
  );
};
