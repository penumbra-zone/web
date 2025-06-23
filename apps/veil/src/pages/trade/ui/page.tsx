'use client';

import cn from 'clsx';
import { useViewport } from '@/shared/utils/use-viewport';
import { PairInfo } from './pair-info';
import { Chart } from './chart';
import { RouteTabs } from './route-tabs';
import { TradesTabs } from './trades';
import { HistoryTabs } from './history-tabs';
import { FormTabs } from './form-tabs';

const sharedStyle = 'w-full border-t border-t-other-solid-stroke overflow-x-hidden';

// extra large grid (>1600px)
const XlLayout = () => {
  return (
    <div className={cn(sharedStyle, 'hidden xl:grid xl:grid-cols-[1fr_320px]')}>
      <div className='flex flex-col'>
        <div className='grid grid-cols-[1fr_1fr_320px]'>
          <div className='col-span-2 grid grid-rows-[auto_1fr]'>
            <div className='border-r border-b border-r-other-solid-stroke border-b-other-solid-stroke'>
              <PairInfo />
            </div>
            <div className='border-r border-r-other-solid-stroke'>
              <Chart />
            </div>
          </div>
          <RouteTabs />
        </div>
        <div className='border-t border-t-other-solid-stroke'>
          <HistoryTabs />
        </div>
      </div>
      <div className='flex flex-col gap-4 border-l border-l-other-solid-stroke'>
        <FormTabs />
        <div className='border-t border-t-other-solid-stroke'>
          <TradesTabs />
        </div>
      </div>
    </div>
  );
};

// large grid (>1200px)
const LLayout = () => {
  return (
    <div className={cn(sharedStyle, 'hidden lg:grid lg:grid-cols-[1fr_320px] xl:hidden')}>
      <div className='col-span-2 border-r border-b border-r-other-solid-stroke border-b-other-solid-stroke'>
        <PairInfo />
      </div>
      <div className='flex flex-col gap-2'>
        <div className='grid grid-cols-[1fr_1fr_320px]'>
          <div className='col-span-2 border-r border-r-other-solid-stroke'>
            <Chart />
          </div>
          <RouteTabs />
        </div>
        <div className='border-t border-t-other-solid-stroke'>
          <HistoryTabs />
        </div>
      </div>
      <div className='flex flex-col gap-4 border-l border-l-other-solid-stroke'>
        <FormTabs />
        <div className='border-t border-t-other-solid-stroke'>
          <TradesTabs />
        </div>
      </div>
    </div>
  );
};

// desktop grid (>900px)
const DesktopLayout = () => {
  return (
    <div
      className={cn(sharedStyle, 'hidden desktop:grid desktop:grid-cols-[1fr_1fr_320px] lg:hidden')}
    >
      <div className='col-span-3 border-r border-b border-r-other-solid-stroke border-b-other-solid-stroke'>
        <PairInfo />
      </div>
      <div className='col-span-2 flex flex-col gap-2'>
        <div className='grid grid-cols-[1fr_1fr] grid-rows-[auto_1fr]'>
          <div className='col-span-2 h-[650px] border-b border-b-other-solid-stroke'>
            <Chart />
          </div>
          <RouteTabs />
          <div className='border-l border-l-other-solid-stroke'>
            <TradesTabs />
          </div>
        </div>
      </div>
      <div className='border-l border-l-other-solid-stroke'>
        <FormTabs />
      </div>
      <div className='col-span-3 border-t border-t-other-solid-stroke'>
        <HistoryTabs />
      </div>
    </div>
  );
};

// tablet grid (600px)
const TabletLayout = () => {
  return (
    <div
      className={cn(sharedStyle, 'hidden tablet:grid tablet:grid-cols-[1fr_1fr] desktop:hidden')}
    >
      <div className='col-span-2 border-b border-b-other-solid-stroke'>
        <PairInfo />
      </div>
      <div className='col-span-2 border-b border-b-other-solid-stroke'>
        <TradesTabs withChart />
      </div>
      <RouteTabs />
      <div className='border-l border-l-other-solid-stroke'>
        <FormTabs />
      </div>
      <div className='col-span-2 border-t border-t-other-solid-stroke'>
        <HistoryTabs />
      </div>
    </div>
  );
};

// mobile grid (<600px)
const MobileLayout = () => {
  return (
    <div className={cn(sharedStyle, 'hidden mobile:grid mobile:grid-cols-[1fr] tablet:hidden')}>
      <div className='border-b border-b-other-solid-stroke'>
        <PairInfo />
      </div>
      <div className='border-b border-b-other-solid-stroke'>
        <TradesTabs withChart />
      </div>
      <div className='border-b border-b-other-solid-stroke'>
        <FormTabs />
      </div>
      <div className='border-b border-b-other-solid-stroke'>
        <RouteTabs />
      </div>
      <HistoryTabs />
    </div>
  );
};

export const TradePage = () => {
  const viewport = useViewport();

  return {
    mobile: <MobileLayout />,
    tablet: <TabletLayout />,
    desktop: <DesktopLayout />,
    lg: <LLayout />,
    xl: <XlLayout />,
  }[viewport];
};
