import { Text } from '@penumbra-zone/ui/Text';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { ArrowLeftRight } from 'lucide-react';
import { Icon } from '@penumbra-zone/ui/Icon';
import { Density } from '@penumbra-zone/ui/Density';
import { useLpPosition } from '@/pages/inspect/lp/api/position.ts';
import { useLpIdInUrl } from '@/pages/inspect/ui/result.tsx';
import { Skeleton } from '@/shared/ui/skeleton.tsx';
import { PositionStateVV } from '@/pages/inspect/lp/api/types.ts';

const DataBody = ({ state }: { state: PositionStateVV }) => {
  return (
    <>
      <div className='flex items-start justify-between gap-2'>
        <div className='flex flex-col gap-2'>
          <Text color='text.secondary'>Fee Tier</Text>
          <Text color='text.primary'>{state.feeBps / 100}%</Text>
        </div>
      </div>

      <div className='flex items-start justify-between gap-8'>
        {/* Column 1: Current Reserves */}
        <div className='flex flex-col gap-2'>
          <Text color='text.secondary'>Current Reserves</Text>
          <div className='flex flex-col gap-6'>
            <ValueViewComponent valueView={state.currentReserves1} abbreviate={false} />
            <ValueViewComponent valueView={state.currentReserves2} abbreviate={false} />
          </div>
        </div>

        {/* Column 2: Sell Offers */}
        <div className='flex flex-col gap-2'>
          <Text color='text.secondary'>Sell Offer</Text>
          <div className='flex flex-col gap-6'>
            <div className='flex items-center gap-2'>
              <Icon IconComponent={ArrowLeftRight} color='text.primary' size='lg' />
              <ValueViewComponent
                valueView={state.offer2}
                abbreviate={false}
                priority='secondary'
              />
            </div>
            <div className='flex items-center gap-2'>
              <Icon IconComponent={ArrowLeftRight} color='text.primary' size='lg' />
              <ValueViewComponent
                valueView={state.offer1}
                abbreviate={false}
                priority='secondary'
              />
            </div>
          </div>
        </div>

        {/* Column 3: Prices */}
        <div className='flex flex-col gap-2'>
          <Text color='text.secondary'>Prices</Text>
          <Density compact>
            <div className='flex flex-col gap-2'>
              <div className='flex flex-col'>
                <div className='flex items-center'>
                  <ValueViewComponent valueView={state.unit1} context='table' />
                  <Text color='text.secondary'>=</Text>
                  <ValueViewComponent valueView={state.priceRef1Inv} context='table' />
                </div>
                <div className='flex items-center'>
                  <ValueViewComponent valueView={state.unit2} context='table' />
                  <Text color='text.secondary'>=</Text>
                  <ValueViewComponent valueView={state.priceRef1} context='table' />
                </div>
              </div>
              <div className='flex flex-col'>
                <div className='flex items-center'>
                  <ValueViewComponent valueView={state.unit1} context='table' />
                  <Text color='text.secondary'>=</Text>
                  <ValueViewComponent valueView={state.priceRef2} context='table' />
                </div>
                <div className='flex items-center'>
                  <ValueViewComponent valueView={state.unit2} context='table' />
                  <Text color='text.secondary'>=</Text>
                  <ValueViewComponent valueView={state.priceRef2Inv} context='table' />
                </div>
              </div>
            </div>
          </Density>
        </div>
      </div>
    </>
  );
};

const LoadingState = () => {
  return (
    <>
      {/* Fee Tier Section */}
      <div className='mx-auto mb-6 flex w-full max-w-[1000px] items-start justify-between gap-4'>
        <div className='h-6 w-1/3' aria-hidden='true'>
          <Skeleton />
        </div>
      </div>

      {/* Main Content Sections */}
      <div className='mx-auto flex w-full max-w-[1000px] items-start justify-between gap-12'>
        {/* Column 1: Current Reserves */}
        <div className='flex flex-1 flex-col gap-4'>
          {/* Skeleton for "Current Reserves" Label */}
          <div className='h-6 w-1/2' aria-hidden='true'>
            <Skeleton />
          </div>

          <div className='flex flex-col gap-8'>
            {/* Skeletons for Reserves Values */}
            <div className='h-8 w-full' aria-hidden='true'>
              <Skeleton />
            </div>
            <div className='h-8 w-full' aria-hidden='true'>
              <Skeleton />
            </div>
          </div>
        </div>

        {/* Column 2: Sell Offers */}
        <div className='flex flex-1 flex-col gap-4'>
          {/* Skeleton for "Sell Offer" Label */}
          <div className='h-6 w-1/2' aria-hidden='true'>
            <Skeleton />
          </div>

          <div className='flex flex-col gap-8'>
            {/* Sell Offer Rows */}
            <div className='flex items-center gap-4'>
              {/* Skeleton for Icon */}
              <div className='h-8 w-8 rounded-full' aria-hidden='true'>
                <Skeleton />
              </div>

              {/* Skeleton for Offer Value */}
              <div className='h-8 flex-1' aria-hidden='true'>
                <Skeleton />
              </div>
            </div>

            <div className='flex items-center gap-4'>
              <div className='h-8 w-8 rounded-full' aria-hidden='true'>
                <Skeleton />
              </div>

              <div className='h-8 flex-1' aria-hidden='true'>
                <Skeleton />
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Prices */}
        <div className='flex flex-1 flex-col gap-4'>
          {/* Skeleton for "Prices" Label */}
          <div className='h-6 w-1/3' aria-hidden='true'>
            <Skeleton />
          </div>

          <div className='flex flex-col gap-4'>
            {/* Price Sets */}
            <div className='flex items-center gap-4'>
              {/* Skeleton for Unit */}
              <div className='h-8 flex-1' aria-hidden='true'>
                <Skeleton />
              </div>

              {/* Skeleton for Equal Sign */}
              <div className='h-6 w-6' aria-hidden='true'>
                <Skeleton />
              </div>

              {/* Skeleton for Price Reference */}
              <div className='h-8 flex-1' aria-hidden='true'>
                <Skeleton />
              </div>
            </div>

            <div className='mt-4 flex items-center gap-4'>
              <div className='h-8 flex-1' aria-hidden='true'>
                <Skeleton />
              </div>

              <div className='h-6 w-6' aria-hidden='true'>
                <Skeleton />
              </div>

              <div className='h-8 flex-1' aria-hidden='true'>
                <Skeleton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const StateDetails = () => {
  const id = useLpIdInUrl();
  const { data, isLoading } = useLpPosition(id);

  return (
    <div className='flex flex-col gap-2'>
      <Text xxl color='base.white'>
        Liquidity Position
      </Text>
      <Text color='text.secondary' truncate>
        {id}
      </Text>
      {isLoading && <LoadingState />}
      {data && <DataBody state={data.state} />}
    </div>
  );
};
