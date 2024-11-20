import { useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Tabs } from '@penumbra-zone/ui/Tabs';
import { Density } from '@penumbra-zone/ui/Density';
import { Toggle } from '@penumbra-zone/ui/Toggle';
import { Text } from '@penumbra-zone/ui/Text';
import { Positions } from './positions';
import { History } from './history';

enum HistoryTabsType {
  Positions = 'positions',
  History = 'history',
}

export const HistoryTabs = () => {
  const [parent] = useAutoAnimate();
  const [tab, setTab] = useState<HistoryTabsType>(HistoryTabsType.Positions);
  const [showAll, setShowAll] = useState(false);

  return (
    <div ref={parent} className='flex flex-col'>
      <div className='flex justify-between gap-2 px-4 border-b border-b-other-solidStroke'>
        <Density medium>
          <Tabs
            value={tab}
            actionType='accent'
            onChange={value => setTab(value as HistoryTabsType)}
            options={[
              { value: HistoryTabsType.Positions, label: 'Positions' },
              { value: HistoryTabsType.History, label: 'History' },
            ]}
          />
        </Density>

        <label className='flex gap-2 h-[42px] items-center py-2 text-text-secondary cursor-pointer'>
          <Text small>Show all</Text>
          <Toggle label='Show all' value={showAll} onChange={setShowAll} />
        </label>
      </div>

      {tab === HistoryTabsType.Positions && <Positions />}
      {tab === HistoryTabsType.History && <History />}
    </div>
  );
};
