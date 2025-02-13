import {
  AuctionId,
  DutchAuction,
} from '@penumbra-zone/protobuf/penumbra/core/component/auction/v1/auction_pb';
import { Metadata } from '@penumbra-zone/protobuf/penumbra/core/asset/v1/asset_pb';
import { Button } from '@penumbra-zone/ui/Button';
import { ChevronRight } from 'lucide-react';
import { ProgressBar } from './progress-bar';
import { useState } from 'react';
import { cn } from '../../utils/cn';
import { ExpandedDetails } from './expanded-details';
import { AnimatePresence, motion } from 'framer-motion';
import { AddressIndex } from '@penumbra-zone/protobuf/penumbra/core/keys/v1/keys_pb';

interface BaseProps {
  auctionId?: AuctionId;
  dutchAuction: DutchAuction;
  inputMetadata?: Metadata;
  outputMetadata?: Metadata;
  addressIndex?: AddressIndex;
  fullSyncHeight?: bigint;
  /**
   * If this will be in a list of other `<DutchAuctionComponent />`s, and some
   * of them will have buttons, set this to `true` to render a blank placeholder
   * space if there are no buttons, to ensure even layout.
   */
  renderButtonPlaceholder?: boolean;
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
  auctionId,
  dutchAuction,
  inputMetadata,
  outputMetadata,
  addressIndex,
  fullSyncHeight,
  buttonType,
  onClickButton,
  renderButtonPlaceholder = false,
}: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { description } = dutchAuction;
  if (!description) {
    return null;
  }

  return (
    <motion.div layout='position' className='flex flex-col gap-2'>
      <div className='flex items-center gap-2'>
        <button
          className='group flex w-full appearance-none items-center gap-2 overflow-hidden'
          onClick={() => setIsExpanded(current => !current)}
          aria-label={isExpanded ? 'Collapse this row' : 'Expand this row'}
          aria-expanded={isExpanded}
        >
          <div className={cn('transition-transform', isExpanded && 'rotate-90')}>
            <ChevronRight size={16} />
          </div>

          <ProgressBar
            fullSyncHeight={fullSyncHeight}
            dutchAuction={dutchAuction}
            inputMetadata={inputMetadata}
            outputMetadata={outputMetadata}
          />
        </button>

        {buttonType && (
          <div className='w-[85px] shrink-0'>
            <Button onClick={onClickButton}>{buttonType === 'end' ? 'End' : 'Withdraw'}</Button>
          </div>
        )}

        {!buttonType && renderButtonPlaceholder && <div className='w-[85px] shrink-0' />}
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
              auctionId={auctionId}
              dutchAuction={dutchAuction}
              inputMetadata={inputMetadata}
              outputMetadata={outputMetadata}
              fullSyncHeight={fullSyncHeight}
              addressIndex={addressIndex}
            />

            {renderButtonPlaceholder && <div className='w-[85px] shrink-0' />}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
