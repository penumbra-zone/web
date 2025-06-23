import { useRouter } from 'next/navigation';
import { Tabs } from '@penumbra-zone/ui/Tabs';
import { Density } from '@penumbra-zone/ui/Density';
import { HEADER_LINKS } from './links';
import { useBasePath } from '@/shared/const/pages.ts';

export const DesktopNav = () => {
  const currentPath = useBasePath();
  const router = useRouter();

  return (
    <nav className='hidden rounded-full bg-other-tonal-fill5 px-4 py-1 backdrop-blur-xl lg:flex'>
      <Density slim>
        <Tabs
          value={currentPath}
          onChange={value => router.push(value)}
          options={HEADER_LINKS}
          actionType='accent'
        />
      </Density>
    </nav>
  );
};
