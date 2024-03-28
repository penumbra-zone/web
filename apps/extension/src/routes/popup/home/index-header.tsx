import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { usePopupNav } from '../../../utils/navigate';
import { PopupPath } from '../paths';
import { NetworksPopover } from '@penumbra-zone/ui/components/ui/networks-popover';
import { useChainIdQuery } from '../../../hooks/chain-id';
import { motion } from 'framer-motion';

export const IndexHeader = () => {
  const navigate = usePopupNav();
  const { chainId } = useChainIdQuery();

  return (
    <header className='top-0 z-40 w-full'>
      <div className='flex items-center justify-between pt-4'>
        <HamburgerMenuIcon
          onClick={() => navigate(PopupPath.SETTINGS)}
          className='size-6 cursor-pointer hover:opacity-50'
        />
        {chainId ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }}
          >
            <NetworksPopover name={chainId} connectIndicator={false} />
          </motion.div>
        ) : (
          <div className='m-[19px]' />
        )}
      </div>
    </header>
  );
};
