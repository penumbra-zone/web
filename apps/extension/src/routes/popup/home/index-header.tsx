import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { usePopupNav } from '../../../utils/navigate';
import { PopupPath } from '../paths';
import { Network } from '@penumbra-zone/ui/components/ui/network';
import { useChainIdQuery } from '../../../hooks/chain-id';
import { motion } from 'framer-motion';
import { useStore } from '../../../state';

export const IndexHeader = () => {
  const navigate = usePopupNav();
  const { chainId } = useChainIdQuery();
  const statusPageUrl = useStore(state => state.network.grpcEndpoint);

  return (
    <header className='top-0 z-40 w-full'>
      <div className='flex items-center justify-between gap-4 pt-4'>
        <HamburgerMenuIcon
          onClick={() => navigate(PopupPath.SETTINGS)}
          className='size-6 shrink-0 cursor-pointer hover:opacity-50'
        />
        {chainId ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }}
            className='overflow-hidden'
          >
            <Network name={chainId} connectIndicator={false} href={statusPageUrl} />
          </motion.div>
        ) : (
          <div className='m-[19px]' />
        )}
      </div>
    </header>
  );
};
