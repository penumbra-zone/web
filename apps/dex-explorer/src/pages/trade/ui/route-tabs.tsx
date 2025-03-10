import { useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Tabs } from '@penumbra-zone/ui/Tabs';
import { Density } from '@penumbra-zone/ui/Density';
import { RouteBook } from './route-book';
import { RouteDepth } from './route-depth';

enum RouteTabsType {
  Book = 'book',
  Depth = 'depth',
}

export const RouteTabs = () => {
  const [parent] = useAutoAnimate();
  const [tab, setTab] = useState<RouteTabsType>(RouteTabsType.Book);

  return (
    <div ref={parent} className='flex flex-col h-full'>
      <div className='flex justify-between gap-2 px-4 lg:pt-2 border-b border-b-other-solidStroke'>
        <Density compact>
          <Tabs
            value={tab}
            actionType='accent'
            onChange={value => setTab(value as RouteTabsType)}
            options={[
              { value: RouteTabsType.Book, label: 'Route Book' },
              { value: RouteTabsType.Depth, label: 'Route Depth' },
            ]}
          />
        </Density>
      </div>

      {tab === RouteTabsType.Book && <RouteBook />}
      {tab === RouteTabsType.Depth && <RouteDepth />}
    </div>
  );
};
