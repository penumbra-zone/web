import { useNavigate, useLocation } from 'react-router-dom';
import { Tabs } from '@penumbra-zone/ui/Tabs';
import { Density } from '@penumbra-zone/ui/Density';
import { PagePath } from '@shared/const/page';
import { HEADER_LINKS } from './links';

export const DesktopNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentValue = () => {
    // Check if current path matches any header link
    const currentLink = HEADER_LINKS.find(
      link =>
        location.pathname === link.value ||
        (link.value === PagePath.Portfolio.toString() && location.pathname.startsWith('/portfolio')),
    );
    return currentLink?.value ?? PagePath.Portfolio;
  };

  const currentPath = getCurrentValue();

  const tabOptions = HEADER_LINKS.map(link => ({
    value: link.value,
    label: link.label,
  }));

  return (
    <div className='hidden lg:flex'>
      <nav className='rounded-full bg-other-tonalFill5 px-4 py-1 backdrop-blur-xl'>
        <Density slim>
          <Tabs
            value={currentPath}
            onChange={value => navigate(value)}
            options={tabOptions}
            actionType='accent'
          />
        </Density>
      </nav>
    </div>
  );
};
