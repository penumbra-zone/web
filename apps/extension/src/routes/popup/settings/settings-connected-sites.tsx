import { Button, Input, Popover, PopoverContent, PopoverTrigger } from 'ui/components';
import { FadeTransition, SettingsHeader } from '../../../shared';
import { DotsVerticalIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useMemo, useState } from 'react';

const dapps = ['app.testnet.penumbra.zone', 'testnet.penumbra.zone'];

export const SettingsConnectedSites = () => {
  const [search, setSearch] = useState('');

  const filteredDapps = useMemo(() => {
    if (!search) return dapps;
    return dapps.filter(i => i.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-10'>
        <SettingsHeader title='Connected sites' />
        <div className='mx-auto h-[60px] w-[60px]'>
          <LinkGradientIcon />
        </div>
        <div className='flex flex-col gap-4 px-5'>
          <div className='relative flex w-full items-center justify-center gap-4'>
            <div className='absolute inset-y-0 left-3 flex items-center'>
              <MagnifyingGlassIcon className='h-5 w-5 text-muted-foreground' />
            </div>
            <Input
              className='pl-10'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Dapp name...'
            />
          </div>
          <div className='flex flex-col gap-2'>
            {filteredDapps.map((i, index) => (
              <div
                key={index}
                className='flex items-center justify-between rounded-lg border border-border bg-background p-4'
              >
                <p className='text-base-bold'>{i}</p>
                <Popover>
                  <PopoverTrigger>
                    <DotsVerticalIcon className='h-5 w-5 cursor-pointer hover:opacity-50' />
                  </PopoverTrigger>
                  <PopoverContent align='center' className='w-[120px] p-0 pb-3'>
                    <Button variant='outline' className='flex h-11 w-full justify-start px-5'>
                      Delete
                    </Button>
                    <Button variant='outline' className='flex h-11 w-full justify-start px-5'>
                      Edit
                    </Button>
                  </PopoverContent>
                </Popover>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FadeTransition>
  );
};

const LinkGradientIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60' fill='none'>
    <path
      d='M22.5 17.5C22.5 17.5 17.5 17.5 17.5 17.5C10.5964 17.5 5 23.0964 5 30C5 36.9036 10.5964 42.5 17.5 42.5C17.5 42.5 22.5 42.5 22.5 42.5'
      stroke='url(#paint0_linear_2508_5560)'
      strokeLinecap='round'
    />
    <path d='M20 30H40' stroke='url(#paint1_linear_2508_5560)' strokeLinecap='round' />
    <path
      d='M37.5 42.5C37.5 42.5 42.5 42.5 42.5 42.5C49.4036 42.5 55 36.9036 55 30C55 23.0964 49.4036 17.5 42.5 17.5C42.5 17.5 37.5 17.5 37.5 17.5'
      stroke='url(#paint2_linear_2508_5560)'
      strokeLinecap='round'
    />
    <defs>
      <linearGradient
        id='paint0_linear_2508_5560'
        x1='13.75'
        y1='42.5'
        x2='13.75'
        y2='14.7128'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint1_linear_2508_5560'
        x1='20'
        y1='30'
        x2='42.2297'
        y2='30'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint2_linear_2508_5560'
        x1='46.25'
        y1='17.5'
        x2='46.25'
        y2='45.2872'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
    </defs>
  </svg>
);
