'use client';

import { Card } from '@penumbra-zone/ui/Card';
import { PairSelector } from './pair-selector';
import { RouteBook } from './route-book';
import { Chart } from './chart';

export const TradePage = () => {
  return (
    <div>
      <div className='flex gap-2'>
        <PairSelector />
      </div>

      <div className='flex flex-wrap lg:gap-2'>
        <div className='w-full lg:w-auto lg:flex-grow mb-2'>
          <Card title='Chart'>
            <Chart height={512} />
          </Card>
        </div>
        <div className='w-full sm:w-1/2 sm:pr-1 lg:w-[336px] lg:pr-0 mb-2'>
          <Card title='Route Book'>
            <RouteBook />
          </Card>
        </div>
        <div className='w-full sm:w-1/2 sm:pl-1 lg:w-[304px] lg:pl-0 mb-2'>
          <Card title='Order Form'>
            <div className='h-[512px]'>-</div>
          </Card>
        </div>
      </div>
      <div className='flex flex-wrap lg:gap-2'>
        <div className='w-full lg:w-auto lg:flex-grow mb-2'>
          <Card title='Positions'>
            <div className='h-[256px]'>-</div>
          </Card>
        </div>
        <div className='w-full sm:w-1/2 sm:pr-1 lg:w-[336px] lg:pr-0 mb-2'>
          <Card title='Market Trades'>
            <div className='h-[256px]'>-</div>
          </Card>
        </div>
        <div className='w-full sm:w-1/2 sm:pl-1 lg:w-[304px] lg:pl-0 mb-2'>
          <Card title='Assets'>
            <div className='h-[256px]'>-</div>
          </Card>
        </div>
      </div>
    </div>
  );
};
