import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { DutchAuction } from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { Indicator } from './indicator';
import { ClockIcon, HourglassIcon } from 'lucide-react';
import {
  getEmptyValueView,
  getRemainingTime,
  getTimeTillStart,
  getTotalTime,
  getValueView,
} from './helpers';
import { getDescription } from '@penumbra-zone/getters/dutch-auction';

const Separator = () => (
  // For some reason, Tailwind's ESLint config wants to change `border-b-[1px]`
  // to `border-b-DEFAULT`, even though that has a different effect!
  <div className='mx-2 h-px min-w-8 grow border-b-[1px] border-dotted border-light-brown' />
);

export const ProgressBar = ({
  dutchAuction,
  inputMetadata,
  outputMetadata,
  fullSyncHeight,
}: {
  dutchAuction: DutchAuction;
  inputMetadata?: Metadata;
  outputMetadata?: Metadata;
  fullSyncHeight?: bigint;
}) => {
  const seqNum = dutchAuction.state?.seq;
  const description = getDescription(dutchAuction);
  const auctionIsUpcoming =
    seqNum === 0n && !!fullSyncHeight && fullSyncHeight < description.startHeight;
  const auctionIsInProgress =
    seqNum === 0n &&
    !!fullSyncHeight &&
    fullSyncHeight >= description.startHeight &&
    fullSyncHeight <= description.endHeight;

  const input = getValueView(description.input?.amount, inputMetadata);
  const totalTime = getTotalTime(description);
  const remainingTime = getRemainingTime(description.endHeight, fullSyncHeight);
  const timeTillStart = getTimeTillStart(description.startHeight, fullSyncHeight);

  return (
    <div className='relative flex grow items-center justify-between gap-2 overflow-hidden'>
      <ValueViewComponent valueView={input} />

      <div className='relative flex min-h-4 shrink grow items-center overflow-hidden'>
        {!auctionIsUpcoming && (
          <Indicator dutchAuction={dutchAuction} fullSyncHeight={fullSyncHeight} />
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
        <ValueViewComponent valueView={getEmptyValueView(outputMetadata)} showValue={false} />
      )}
    </div>
  );
};
