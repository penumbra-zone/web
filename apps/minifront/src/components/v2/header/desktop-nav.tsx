import { useNavigate } from 'react-router-dom';
import { Tabs } from '@penumbra-zone/ui-deprecated/Tabs';
import { Density } from '@penumbra-zone/ui-deprecated/Density';
import { getV2Link } from '../get-v2-link.ts';
import { usePagePath } from '../../../fetchers/page-path.ts';
import { HEADER_LINKS } from './links.ts';

export const DesktopNav = () => {
  const pagePath = usePagePath();
  const navigate = useNavigate();

  return (
    <nav className='hidden rounded-full bg-v2-other-tonalFill5 px-4 py-1 backdrop-blur-xl lg:flex'>
      <Density compact>
        <Tabs
          value={getV2Link(pagePath)}
          onChange={value => navigate(value)}
          options={HEADER_LINKS}
          actionType='accent'
        />
      </Density>
    </nav>
  );
};
