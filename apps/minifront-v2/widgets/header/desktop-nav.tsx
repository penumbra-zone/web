import { useNavigate } from 'react-router-dom';
import { Tabs } from '../../../../packages/ui-deprecated/src/Tabs';
import { Density } from '../../../../packages/ui-deprecated/src/Density';
import { getV2Link } from '../../../minifront/src/components/v2/get-v2-link.ts';
import { usePagePath } from '../../../minifront/src/fetchers/page-path.ts';
import { HEADER_LINKS } from './links.ts';
import { PagePath } from '../../../minifront/src/components/metadata/paths.ts';

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
    <nav className='hidden rounded-full bg-other-tonalFill5 px-4 py-1 backdrop-blur-xl lg:flex'>
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
