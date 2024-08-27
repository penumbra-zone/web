import { useNavigate } from 'react-router-dom';
import { Tabs } from '@repo/ui/Tabs';
import { Density } from '@repo/ui/Density';
import { getV2Link } from '../get-v2-link.ts';
import { PagePath } from '../../metadata/paths.ts';
import { usePagePath } from '../../../fetchers/page-path.ts';

const TABS_OPTIONS = [
  { label: 'Dashboard', value: getV2Link(PagePath.DASHBOARD) },
  { label: 'Shield', value: getV2Link(PagePath.IBC) },
  { label: 'Transfer', value: getV2Link(PagePath.SEND) },
  { label: 'Swap', value: getV2Link(PagePath.SWAP) },
  { label: 'Stake', value: getV2Link(PagePath.STAKING) },
];

export const DesktopNav = () => {
  const pagePath = usePagePath();
  const navigate = useNavigate();

  return (
    <nav className='hidden rounded-full bg-other-tonalFill5 px-4 py-1 backdrop-blur-xl lg:flex'>
      <Density compact>
        <Tabs
          value={getV2Link(pagePath)}
          onChange={value => navigate(value)}
          options={TABS_OPTIONS}
          actionType='accent'
        />
      </Density>
    </nav>
  )
}
