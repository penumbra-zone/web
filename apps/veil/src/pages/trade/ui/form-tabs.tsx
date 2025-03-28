import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Tabs } from '@penumbra-zone/ui/Tabs';
import { Density } from '@penumbra-zone/ui/Density';
import { MarketOrderForm } from './order-form/order-form-market';
import { LimitOrderForm } from './order-form/order-form-limit';
import { RangeLiquidityOrderForm } from './order-form/order-form-range-liquidity';
import { isWhichForm, useOrderFormStore } from './order-form/store/OrderFormStore';
import { observer } from 'mobx-react-lite';

export const FormTabs = observer(() => {
  const [parent] = useAutoAnimate();
  const store = useOrderFormStore();

  return (
    <div ref={parent} className='flex flex-col'>
      <div className='px-4 lg:pt-2 border-b border-b-other-solidStroke'>
        <Density compact>
          <Tabs
            value={store.whichForm}
            actionType='accent'
            onChange={value => {
              if (isWhichForm(value)) {
                store.setWhichForm(value);
              }
            }}
            options={[
              { value: 'Market', label: 'Market' },
              { value: 'Limit', label: 'Limit' },
              { value: 'Range', label: 'Provide Liquidity' },
            ]}
          />
        </Density>
      </div>
      <div className='overflow-y-auto'>
        {store.whichForm === 'Market' && <MarketOrderForm parentStore={store} />}
        {store.whichForm === 'Limit' && <LimitOrderForm parentStore={store} />}
        {store.whichForm === 'Range' && <RangeLiquidityOrderForm parentStore={store} />}
      </div>
    </div>
  );
});
