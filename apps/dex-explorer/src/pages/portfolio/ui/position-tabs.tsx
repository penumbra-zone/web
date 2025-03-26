import { useState } from 'react';
import { Card } from '@penumbra-zone/ui/Card';
import { Tabs } from '@penumbra-zone/ui/Tabs';
import { Density } from '@penumbra-zone/ui/Density';
import { PortfolioOpenPositions } from './open-positions';
import { PortfolioClosedPositions } from './closed-positions';
import { PortfolioTransactions } from './transactions';

enum PortfolioTab {
  OpenPositions = 'Open Positions',
  ClosedPositions = 'Closed Positions',
  History = 'History',
}

export const PortfolioPositionTabs = () => {
  const [tab, setTab] = useState(PortfolioTab.OpenPositions);

  return (
    <Card>
      <div className='p-3'>
        <div className='w-full mb-4 border-b border-b-other-tonalStroke'>
          <Density compact>
            <Tabs
              value={tab}
              actionType='accent'
              onChange={value => setTab(value as PortfolioTab)}
              options={[
                { value: PortfolioTab.OpenPositions, label: PortfolioTab.OpenPositions },
                { value: PortfolioTab.ClosedPositions, label: PortfolioTab.ClosedPositions },
                { value: PortfolioTab.History, label: PortfolioTab.History },
              ]}
            />
          </Density>
        </div>

        {tab === PortfolioTab.OpenPositions && <PortfolioOpenPositions />}

        {tab === PortfolioTab.ClosedPositions && <PortfolioClosedPositions />}

        {tab === PortfolioTab.History && <PortfolioTransactions />}
      </div>
    </Card>
  );
};
