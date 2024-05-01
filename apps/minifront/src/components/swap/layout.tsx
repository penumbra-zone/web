import { RestrictMaxWidth } from '../shared/restrict-max-width';
import { Tab, Tabs } from '../shared/tabs';
import { PagePath } from '../metadata/paths';
import { usePagePath } from '../../fetchers/page-path';
import { Outlet } from 'react-router-dom';

const TABS: Tab[] = [
  {
    title: 'Swap',
    enabled: true,
    href: PagePath.SWAP,
  },
  {
    title: 'Auction',
    enabled: false,
    href: PagePath.SWAP_AUCTION,
  },
];

export const SwapLayout = () => {
  const pathname = usePagePath<(typeof TABS)[number]['href']>();

  return (
    <RestrictMaxWidth>
      <div className='flex justify-center'>
        {/** @todo: Remove this conditional when we launch auctions */}
        {TABS[1]!.enabled && <Tabs tabs={TABS} activeTab={pathname} />}
      </div>

      <Outlet />
    </RestrictMaxWidth>
  );
};
