import { DutchAuction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { ValueViewComponent } from '../tx/view/value';
import {
  Metadata,
  ValueView,
} from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Amount } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/num/v1/num_pb';
import { Button } from '../button';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Reserves } from './reserves';
import { ProgressBar } from './progress-bar';
import { useState } from 'react';
import { cn } from '../../../lib/utils';
import { ExpandedDetails } from './expanded-details';

const getValueView = (amount?: Amount, metadata?: Metadata) =>
  new ValueView({
    valueView: {
      case: 'knownAssetId',
      value: {
        amount,
        metadata,
      },
    },
  });

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

  const input = getValueView(description.input?.amount, inputMetadata);
  const maxOutput = getValueView(description.maxOutput, outputMetadata);
  const minOutput = getValueView(description.minOutput, outputMetadata);
  const [isExpanded, setIsExpanded] = useState(false);
  const seqNum = dutchAuction.state?.seq ?? 0n;

  return (
    <div className='flex flex-col gap-2'>
      {/* <div className='flex items-center justify-between'>
        <div>
          <ValueViewComponent view={input} />
        </div>

        <ArrowRight />

        <div className='flex w-min flex-wrap justify-end gap-2'>
          <div className='flex items-center gap-2'>
            <span className='text-nowrap text-muted-foreground'>Max:</span>
            <ValueViewComponent view={maxOutput} />
          </div>
          <div className='flex items-center gap-2'>
            <span className='text-nowrap text-muted-foreground'>Min:</span>
            <ValueViewComponent view={minOutput} />
          </div>
        </div>
      </div> */}

      <div className='flex items-center gap-2'>
        <button className='appearance-none' onClick={() => setIsExpanded(current => !current)}>
          <div className={cn('transition-transform', isExpanded && 'rotate-90')}>
            <ChevronRight size={16} />
          </div>
        </button>

        <ProgressBar
          fullSyncHeight={fullSyncHeight}
          auction={description}
          input={input}
          inputMetadata={inputMetadata}
          outputMetadata={outputMetadata}
          seqNum={dutchAuction.state?.seq}
        />

        <div className='w-[85px] shrink-0'>
          {seqNum <= 1n && (
            <Button size='sm' variant='secondary' className='w-full'>
              {seqNum === 0n ? 'End' : 'Claim'}
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className='flex gap-2 w-full'>
          <div className='w-4 shrink-0' />

          <ExpandedDetails
            description={description}
            inputMetadata={inputMetadata}
            outputMetadata={outputMetadata}
            fullSyncHeight={fullSyncHeight}
          />

          <div className='w-[85px] shrink-0' />
        </div>
      )}

      <Reserves
        dutchAuction={dutchAuction}
        inputMetadata={inputMetadata}
        outputMetadata={outputMetadata}
      />
      {/*
      {buttonType === 'withdraw' && (
        <div className='self-end'>
          <Button variant='gradient' size='md' onClick={onClickButton}>
            Withdraw funds
          </Button>
        </div>
      )}

      {buttonType === 'end' && (
        <div className='self-end'>
          <Button variant='destructiveSecondary' size='md' onClick={onClickButton}>
            End auction
          </Button>
        </div>
      )} */}
    </div>
  );
};
