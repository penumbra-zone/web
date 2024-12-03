import { useState } from 'react';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Tabs } from '@penumbra-zone/ui/Tabs';
import { Density } from '@penumbra-zone/ui/Density';
import { MarketOrderForm } from './order-form/order-form-market';
import { RangeLiquidityOrderForm } from './order-form/order-form-range-liquidity';

enum FormTabsType {
  Market = 'market',
  Limit = 'limit',
  Range = 'range',
}

export const FormTabs = () => {
  const [parent] = useAutoAnimate();
  const [tab, setTab] = useState<FormTabsType>(FormTabsType.Market);

  return (
    <div ref={parent} className='h-full flex flex-col'>
      <div className='px-4 lg:pt-2 border-b border-b-other-solidStroke'>
        <Density medium>
          <Tabs
            value={tab}
            actionType='accent'
            onChange={value => setTab(value as FormTabsType)}
            options={[
              { value: FormTabsType.Market, label: 'Market' },
              { value: FormTabsType.Limit, label: 'Limit' },
              { value: FormTabsType.Range, label: 'Range Liquidity' },
            ]}
          />
        </Density>
      </div>

      <div className='overflow-y-auto'>
        {tab === FormTabsType.Market && <MarketOrderForm />}
        {tab === FormTabsType.Limit && (
          <div className='h-[380px] p-4 text-text-secondary'>Limit order form</div>
        )}
        {tab === FormTabsType.Range && <RangeLiquidityOrderForm />}
      </div>
    </div>
  );
};
