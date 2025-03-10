import { useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Tabs } from '@penumbra-zone/ui/Tabs';
import { Density } from '@penumbra-zone/ui/Density';
import { Toggle } from '@penumbra-zone/ui/Toggle';
import { Text } from '@penumbra-zone/ui/Text';
import Positions from './positions';

enum PositionsTabsType {
  MY_POSITIONS = 'MY_POSITIONS',
}

export const HistoryTabs = () => {
  const [parent] = useAutoAnimate();
  const [tab, setTab] = useState<PositionsTabsType>(PositionsTabsType.MY_POSITIONS);
  const [showInactive, setshowInactive] = useState(false);

  return (
    <div ref={parent} className='flex flex-col w-screen desktop:w-auto'>
      <div className='flex justify-between gap-2 px-4 border-b border-b-other-solidStroke'>
        <Density compact>
          <Tabs
            value={tab}
            actionType='accent'
            onChange={value => setTab(value as PositionsTabsType)}
            options={[{ value: PositionsTabsType.MY_POSITIONS, label: 'My Positions' }]}
          />
        </Density>

        <label className='flex gap-2 h-[42px] items-center py-2 text-text-secondary cursor-pointer'>
          <Text small>Show Inactive</Text>
          <Toggle label='Show Inactive' value={showInactive} onChange={setshowInactive} />
        </label>
      </div>

      <Positions showInactive={showInactive} />
    </div>
  );
};
