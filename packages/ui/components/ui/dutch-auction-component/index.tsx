import { DutchAuction } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/auction/v1/auction_pb';
import { Metadata } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/asset/v1/asset_pb';
import { Button } from '../button';
import { ChevronRight } from 'lucide-react';
import { ProgressBar } from './progress-bar';
import { useId, useState } from 'react';
import { cn } from '../../../lib/utils';
import { ExpandedDetails } from './expanded-details';
import { AnimatePresence, motion } from 'framer-motion';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const rowId = useId();

  const { description } = dutchAuction;
  if (!description) return null;

  return (
    <motion.div className='flex flex-col gap-2 bg-charcoal' layout='position'>
      <div className='flex items-center gap-2'>
        <button
          className='group flex w-full appearance-none items-center gap-2 overflow-hidden'
          onClick={() => setIsExpanded(current => !current)}
          aria-label={isExpanded ? 'Collapse this row' : 'Expand this row'}
          aria-expanded={isExpanded}
          id={rowId}
        >
          <div className={cn('transition-transform', isExpanded && 'rotate-90')}>
            <ChevronRight size={16} />
          </div>

          <ProgressBar
            fullSyncHeight={fullSyncHeight}
            auction={description}
            inputMetadata={inputMetadata}
            outputMetadata={outputMetadata}
            seqNum={dutchAuction.state?.seq}
          />
        </button>

        <div className='w-[85px] shrink-0'>
          {!!buttonType && (
            <Button size='sm' variant='secondary' className='w-full' onClick={onClickButton}>
              {buttonType === 'end' ? 'End' : 'Withdraw'}
            </Button>
          )}
        </div>
      </div>

      <AnimatePresence mode='popLayout'>
        {isExpanded && (
          <motion.div
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            layout
            className='flex w-full origin-top gap-2'
          >
            <div className='w-4 shrink-0' />

            <ExpandedDetails
              dutchAuction={dutchAuction}
              inputMetadata={inputMetadata}
              outputMetadata={outputMetadata}
              fullSyncHeight={fullSyncHeight}
            />

            <div className='w-[85px] shrink-0' />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
