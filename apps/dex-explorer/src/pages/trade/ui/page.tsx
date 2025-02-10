'use client';

import cn from 'clsx';
import { PairInfo } from './pair-info';
import { Chart } from './chart';
import { RouteTabs } from './route-tabs';
import { TradesTabs } from './trades-tabs';
import { HistoryTabs } from './history-tabs';
import { FormTabs } from './form-tabs';
import { useEffect, useState } from 'react';

const sharedStyle = 'w-full border-t border-t-other-solidStroke overflow-x-hidden';

// extra large grid (>1600px)
const XlLayout = () => {
  return (
    <div className={cn(sharedStyle, 'hidden xl:grid xl:grid-cols-[1fr,320px]')}>
      <div className='flex flex-col'>
        <div className='grid grid-cols-[1fr,1fr,320px]'>
          <div className='col-span-2 grid grid-rows-[auto,1fr]'>
            <div className='border-b border-b-other-solidStroke border-r border-r-other-solidStroke'>
              <PairInfo />
            </div>
            <div className='border-r border-r-other-solidStroke'>
              <Chart />
            </div>
          </div>
          <RouteTabs />
        </div>
        <div className='border-t border-t-other-solidStroke'>
          <HistoryTabs />
        </div>
      </div>
      <div className='flex flex-col gap-4 border-l border-l-other-solidStroke'>
        <FormTabs />
        <div className='border-t border-t-other-solidStroke'>
          <TradesTabs />
        </div>
      </div>
    </div>
  );
};

// large grid (>1200px)
const LLayout = () => {
  return (
    <div className={cn(sharedStyle, 'hidden lg:grid xl:hidden lg:grid-cols-[1fr,320px]')}>
      <div className='col-span-2 border-b border-b-other-solidStroke border-r border-r-other-solidStroke'>
        <PairInfo />
      </div>
      <div className='flex flex-col gap-2'>
        <div className='grid grid-cols-[1fr,1fr,320px]'>
          <div className='col-span-2 border-r border-r-other-solidStroke'>
            <Chart />
          </div>
          <RouteTabs />
        </div>
        <div className='border-t border-t-other-solidStroke'>
          <HistoryTabs />
        </div>
      </div>
      <div className='flex flex-col gap-4 border-l border-l-other-solidStroke'>
        <FormTabs />
        <div className='border-t border-t-other-solidStroke'>
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
      className={cn(sharedStyle, 'hidden desktop:grid lg:hidden desktop:grid-cols-[1fr,1fr,320px]')}
    >
      <div className='col-span-3 border-b border-b-other-solidStroke border-r border-r-other-solidStroke'>
        <PairInfo />
      </div>
      <div className='flex flex-col gap-2 col-span-2'>
        <div className='grid grid-cols-[1fr,1fr] grid-rows-[auto,1fr]'>
          <div className='col-span-2 h-[650px] border-b border-b-other-solidStroke'>
            <Chart />
          </div>
          <RouteTabs />
          <div className='border-l border-l-other-solidStroke'>
            <TradesTabs />
          </div>
        </div>
      </div>
      <div className='border-l border-l-other-solidStroke'>
        <FormTabs />
      </div>
      <div className='col-span-3 border-t border-t-other-solidStroke'>
        <HistoryTabs />
      </div>
    </div>
  );
};

// tablet grid (600px)
const TabletLayout = () => {
  return (
    <div
      className={cn(sharedStyle, 'hidden tablet:grid desktop:hidden tablet:grid-cols-[1fr,1fr]')}
    >
      <div className='col-span-2 border-b border-b-other-solidStroke'>
        <PairInfo />
      </div>
      <div className='col-span-2 border-b border-b-other-solidStroke'>
        <TradesTabs withChart />
      </div>
      <RouteTabs />
      <div className='border-l border-l-other-solidStroke'>
        <FormTabs />
      </div>
      <div className='col-span-2 border-t border-t-other-solidStroke'>
        <HistoryTabs />
      </div>
    </div>
  );
};

// mobile grid (<600px)
const MobileLayout = () => {
  return (
    <div className={cn(sharedStyle, 'hidden mobile:grid tablet:hidden mobile:grid-cols-[1fr]')}>
      <div className='border-b border-b-other-solidStroke'>
        <PairInfo />
      </div>
      <div className='border-b border-b-other-solidStroke'>
        <TradesTabs withChart />
      </div>
      <div className='border-b border-b-other-solidStroke'>
        <FormTabs />
      </div>
      <div className='border-b border-b-other-solidStroke'>
        <RouteTabs />
      </div>
      <HistoryTabs />
    </div>
  );
};

export const TradePage = () => {
  const [width, setWidth] = useState(1366);

  useEffect(() => {
    const resize = () => {
      setWidth(document.body.clientWidth);
    };

    window.addEventListener('resize', resize);
    resize();

    return () => {
      window.removeEventListener('resize', resize);
    };
  }, []);

  if (width >= 1600) {
    return <XlLayout />;
  }

  if (width >= 1200) {
    return <LLayout />;
  }

  if (width >= 900) {
    return <DesktopLayout />;
  }

  if (width >= 600) {
    return <TabletLayout />;
  }

  return <MobileLayout />;
};
