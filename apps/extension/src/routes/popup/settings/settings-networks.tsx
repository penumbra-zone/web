import { Button, Input } from 'ui/components';
import { FadeTransition, SettingsHeader } from '../../../shared';
import { CheckCircledIcon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { useMemo, useState } from 'react';
import { usePopupNav } from '../../../utils/navigate';
import { PopupPath } from '../paths';

const networks = ['penumbra-testnet'];

export const SettingsNetworks = () => {
  const navigate = usePopupNav();
  const [search, setSearch] = useState('');

  const filteredNetworks = useMemo(() => {
    if (!search) return networks;
    return networks.filter(i => i.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-10'>
        <SettingsHeader title='Networks' />
        <div className='mx-auto h-[60px] w-[60px]'>
          <ShareGradientIcon />
        </div>
        <div className='flex flex-col gap-4 px-5'>
          <div className='relative w-full flex items-center justify-center gap-2'>
            <div className='absolute inset-y-0 left-3 flex items-center'>
              <MagnifyingGlassIcon className='w-5 h-5 text-muted-foreground' />
            </div>
            <Input
              className='pl-10'
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Network name...'
            />
          </div>
          <div className='flex flex-col'>
            {filteredNetworks.map((i, index) => (
              <Button
                key={index}
                className='rounded-lg border border-border bg-background flex items-center justify-start gap-3 text-left h-11 px-3'
                onClick={() =>
                  navigate(PopupPath.SETTINGS_NETWORK_NAME.replace(':name', i) as PopupPath)
                }
              >
                <CheckCircledIcon className='h-5 w-5 text-teal' />
                <p className='text-base_bold'>{i}</p>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </FadeTransition>
  );
};

const ShareGradientIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60' fill='none'>
    <path d='M40 20L20 27.5' stroke='url(#paint0_linear_2508_5460)' strokeLinecap='round' />
    <path d='M40 40L20 32.5' stroke='url(#paint1_linear_2508_5460)' strokeLinecap='round' />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M15 35C17.7614 35 20 32.7614 20 30C20 27.2386 17.7614 25 15 25C12.2386 25 10 27.2386 10 30C10 32.7614 12.2386 35 15 35Z'
      stroke='url(#paint2_linear_2508_5460)'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M45 22.5C47.7614 22.5 50 20.2614 50 17.5C50 14.7386 47.7614 12.5 45 12.5C42.2386 12.5 40 14.7386 40 17.5C40 20.2614 42.2386 22.5 45 22.5Z'
      stroke='url(#paint3_linear_2508_5460)'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M45 47.5C47.7614 47.5 50 45.2614 50 42.5C50 39.7386 47.7614 37.5 45 37.5C42.2386 37.5 40 39.7386 40 42.5C40 45.2614 42.2386 47.5 45 47.5Z'
      stroke='url(#paint4_linear_2508_5460)'
    />
    <defs>
      <linearGradient
        id='paint0_linear_2508_5460'
        x1='20'
        y1='23.75'
        x2='42.2297'
        y2='23.75'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint1_linear_2508_5460'
        x1='20'
        y1='36.25'
        x2='42.2297'
        y2='36.25'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint2_linear_2508_5460'
        x1='10'
        y1='30'
        x2='21.1149'
        y2='30'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint3_linear_2508_5460'
        x1='40'
        y1='17.5'
        x2='51.1149'
        y2='17.5'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint4_linear_2508_5460'
        x1='40'
        y1='42.5'
        x2='51.1149'
        y2='42.5'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
    </defs>
  </svg>
);
