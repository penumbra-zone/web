import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Tabs } from '@penumbra-zone/ui/Tabs';
import { Density } from '@penumbra-zone/ui/Density';
import { Button } from '@penumbra-zone/ui/Button';
import { Chart } from '../chart';
import { MarketTrades } from './market-trades';
import { MyTrades } from '@/pages/trade/ui/trades/my-trades';

enum TradesTabsType {
  Chart = 'chart',
  MarketTrades = 'market-trades',
  MyTrades = 'my-trades',
}

export const TradesTabs = ({ withChart = false }: { withChart?: boolean }) => {
  const [parent] = useAutoAnimate();

  const [tab, setTab] = useState<TradesTabsType>(
    withChart ? TradesTabsType.Chart : TradesTabsType.MarketTrades,
  );
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => setCollapsed(prev => !prev);

  return (
    <div ref={parent} className='flex flex-col'>
      <div className='flex justify-between items-center px-4 border-b border-b-other-solidStroke'>
        <Density compact>
          <Tabs
            value={tab}
            actionType='accent'
            onChange={value => setTab(value as TradesTabsType)}
            options={
              withChart
                ? [
                    { value: TradesTabsType.Chart, label: 'Chart' },
                    { value: TradesTabsType.MarketTrades, label: 'Market Trades' },
                    { value: TradesTabsType.MyTrades, label: 'My Trades' },
                  ]
                : [
                    { value: TradesTabsType.MarketTrades, label: 'Market Trades' },
                    { value: TradesTabsType.MyTrades, label: 'My Trades' },
                  ]
            }
          />
        </Density>

        {withChart && (
          <Density compact>
            <Button iconOnly icon={collapsed ? ChevronDown : ChevronUp} onClick={toggleCollapsed}>
              Toggle
            </Button>
          </Density>
        )}
      </div>

      {!collapsed && (
        <>
          {withChart && tab === TradesTabsType.Chart && (
            <div className='h-[300px]'>
              <Chart />
            </div>
          )}
          {tab === TradesTabsType.MarketTrades && <MarketTrades />}
          {tab === TradesTabsType.MyTrades && <MyTrades />}
        </>
      )}
    </div>
  );
};
