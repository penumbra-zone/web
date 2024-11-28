'use client';

import cn from 'clsx';
import { PairInfo } from './pair-info';
import { Chart } from './chart';
import { RouteTabs } from './route-tabs';
import { TradesTabs } from './trades-tabs';
import { HistoryTabs } from './history-tabs';
import { FormTabs } from './form-tabs';

export const TradePage = () => {
  return (
    <div
      className={cn(
        'grid w-full border-t border-t-other-solidStroke overflow-x-hidden',
        // mobile grid
        'grid-cols-[100%] grid-rows-[auto,auto,auto,auto,auto]',
        // tablet grid (600px)
        'tablet:grid-cols-[50%,50%] tablet:grid-rows-[auto,auto,auto,auto]',
        // desktop grid (>900px)
        'desktop:grid-cols-[1fr,1fr,300px] desktop:grid-rows-[auto,652px,auto,auto]',
        // large grid (>1200px)
        'lg:grid-cols-[1fr,320px,320px] lg:grid-rows-[auto,660px,auto]',
        // extra large grid (>1600px)
        'xl:grid-cols-[1fr,320px,320px] xl:grid-rows-[auto,660px,auto]',
      )}
    >
      <div className='row-start-1 tablet:col-span-2 desktop:col-span-3 xl:col-span-1 border-b border-b-other-solidStroke xl:border-r xl:border-r-other-solidStroke'>
        <PairInfo />
      </div>

      <div className='desktop:block desktop:row-start-2 desktop:col-span-2 lg:col-span-1 border-b border-b-other-solidStroke desktop:border-r desktop:border-r-other-solidStroke'>
        <Chart />
      </div>

      <div className='row-start-3 tablet:col-start-2 desktop:row-start-2 desktop:col-start-3 desktop:row-span-2 lg:row-span-1 xl:row-span-2 border-b border-b-other-solidStroke desktop:border-l desktop:border-l-other-solidStroke'>
        <FormTabs />
      </div>

      <div className='row-start-4 tablet:row-start-3 lg:row-start-2 lg:col-start-2 xl:row-start-1 xl:row-span-2 border-b border-b-other-solidStroke tablet:border-r tablet:border-r-other-solidStroke lg:border-r-0'>
        <RouteTabs />
      </div>

      <div className='row-start-2 tablet:col-span-2 desktop:hidden border-b border-b-other-solidStroke'>
        <TradesTabs withChart />
      </div>
      <div className='hidden desktop:block desktop:row-start-3 desktop:col-start-2 lg:col-start-3 desktop:border-b desktop:border-b-other-solidStroke lg:border-l lg:border-l-other-solidStroke'>
        <TradesTabs />
      </div>

      <div className='row-start-5 tablet:row-start-4 tablet:col-span-2 desktop:col-span-3 lg:row-start-3 lg:col-start-1 lg:col-span-2 border-b border-b-other-solidStroke'>
        <HistoryTabs />
      </div>
    </div>
  );
};
