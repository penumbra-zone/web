import { useNavigate } from 'react-router-dom';
import { Tabs } from '@penumbra-zone/ui-deprecated/Tabs';
import { Density } from '@penumbra-zone/ui-deprecated/Density';
import { getV2Link } from '../get-v2-link.ts';
import { usePagePath } from '../../../fetchers/page-path.ts';
import { HEADER_LINKS } from './links.ts';
import { PagePath } from '../../metadata/paths.ts';

export const DesktopNav = () => {
  const pagePath = usePagePath();
  const navigate = useNavigate();

  // Use Portfolio tab value for both Dashboard and Transactions pages
  const getActiveTabValue = (path: PagePath) => {
    if (path === PagePath.TRANSACTIONS) {
      return getV2Link(PagePath.DASHBOARD);
    }
    return getV2Link(path);
  };

  return (
    <nav className='hidden lg:flex rounded-full bg-other-tonalFill5 px-4 py-1 backdrop-blur-xl'>
      <Density compact>
        <Tabs
          value={getActiveTabValue(pagePath)}
          onChange={value => navigate(value)}
          options={HEADER_LINKS}
          actionType='accent'
        />
      </Density>
    </nav>
  );
};
