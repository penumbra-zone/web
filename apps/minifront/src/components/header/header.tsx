import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getChainId } from '../../fetchers/chain-id';
import { PagePath } from '../metadata/paths';
import { MenuBar } from './menu/menu';
import { CondensedBlockSyncStatus } from '@penumbra-zone/ui/components/ui/block-sync-status/condensed';
import { AllSlices } from '../../state';
import { useStoreShallow } from '../../utils/use-store-shallow';
import { TestnetBanner } from '@penumbra-zone/ui/components/ui/testnet-banner';

export const Header = () => {
  const { fullSyncHeight, latestKnownBlockHeight, error } =
    useStoreShallow(syncStatusSectionSelector);
  const [chainId, setChainId] = useState<string | undefined>();

  useEffect(() => {
    void getChainId().then(id => setChainId(id));
  }, []);

  return (
    <header className='w-full overflow-hidden bg-gradient-to-t from-transparent to-black to-40% pb-[3em]'>
      <TestnetBanner chainId={chainId} />
      <CondensedBlockSyncStatus
        fullSyncHeight={fullSyncHeight ? Number(fullSyncHeight) : undefined}
        latestKnownBlockHeight={latestKnownBlockHeight ? Number(latestKnownBlockHeight) : undefined}
        error={error}
      />
      <div className='flex w-full flex-col items-center justify-between overflow-hidden px-6 md:h-[82px] md:flex-row md:gap-12 md:px-12'>
        <HeaderLogo />
        <MenuBar />
      </div>
    </header>
  );
};

const HeaderLogo = () => (
  <div className='relative inset-x-0 mb-[30px] md:mb-0'>
    <img
      src='./penumbra-logo.svg'
      alt='Penumbra logo'
      className='absolute inset-x-0 top-[-75px] mx-auto h-[141px] w-[136px] rotate-[320deg] md:left-[-100px] md:top-[-140px] md:mx-0 md:size-[234px]'
    />
    <Link to={PagePath.INDEX}>
      <img src='./logo.svg' alt='Penumbra' className='relative mt-[20px] h-4 w-[171px] md:mt-0' />
    </Link>
  </div>
);

const syncStatusSectionSelector = (state: AllSlices) => ({
  fullSyncHeight: state.status.fullSyncHeight,
  latestKnownBlockHeight: state.status.latestKnownBlockHeight,
  error: state.status.error,
});
