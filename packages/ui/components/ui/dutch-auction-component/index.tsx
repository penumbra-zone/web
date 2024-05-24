import { DutchAuction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Button } from '../button';
import { ChevronRight } from 'lucide-react';
import { ProgressBar } from './progress-bar';
import { useState } from 'react';
import { cn } from '../../../lib/utils';
import { ExpandedDetails } from './expanded-details';

interface BaseProps {
  dutchAuction: DutchAuction;
  inputMetadata?: Metadata;
  outputMetadata?: Metadata;
  fullSyncHeight?: bigint;
}

interface PropsWithButton extends BaseProps {
  buttonType: 'end' | 'withdraw';
  onClickButton: VoidFunction;
}

interface PropsWithoutButton extends BaseProps {
  buttonType?: undefined;
  onClickButton?: undefined;
}

type Props = PropsWithButton | PropsWithoutButton;

export const DutchAuctionComponent = ({
  dutchAuction,
  inputMetadata,
  outputMetadata,
  fullSyncHeight,
  buttonType,
  onClickButton,
}: Props) => {
  const { description } = dutchAuction;
  if (!description) return null;

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className='flex flex-col gap-2'>
      <div className='flex items-center gap-2'>
        <button className='appearance-none' onClick={() => setIsExpanded(current => !current)}>
          <div className={cn('transition-transform', isExpanded && 'rotate-90')}>
            <ChevronRight size={16} />
          </div>
        </button>

        <ProgressBar
          fullSyncHeight={fullSyncHeight}
          auction={description}
          inputMetadata={inputMetadata}
          outputMetadata={outputMetadata}
          seqNum={dutchAuction.state?.seq}
        />

        <div className='w-[85px] shrink-0'>
          {!!buttonType && (
            <Button size='sm' variant='secondary' className='w-full' onClick={onClickButton}>
              {buttonType === 'end' ? 'End' : 'Withdraw'}
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className='flex gap-2 w-full'>
          <div className='w-4 shrink-0' />

          <ExpandedDetails
            dutchAuction={dutchAuction}
            inputMetadata={inputMetadata}
            outputMetadata={outputMetadata}
            fullSyncHeight={fullSyncHeight}
          />

          <div className='w-[85px] shrink-0' />
        </div>
      )}
    </div>
  );
};
