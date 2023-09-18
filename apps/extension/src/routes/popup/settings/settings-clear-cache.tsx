import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { FadeTransition, SettingsHeader } from '../../../shared';
import { Button } from 'ui/components';

// Clearing cache should:
//  - Delete indexeddb database
//  - Restart block sync
//  - Redirect to popup index
export const SettingsClearCache = () => {
  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-10'>
        <SettingsHeader title='Clear cache' />
        <div className='mx-auto h-[60px] w-[60px]'>
          <TrashGradientIcon />
        </div>
        <div className='flex flex-1 flex-col items-start justify-between px-[30px] pb-[30px]'>
          <div className='flex flex-col items-center gap-2'>
            <p className='font-headline text-xl-semibold'>Are you sure?</p>
            <p className='text-center text-base-bold text-muted-foreground'>
              Do you really want to clear cache? All local data will be deleted and
              resynchronized.
            </p>
            <p className='mt-4 flex items-center gap-2 font-headline text-xl-semibold text-rust'>
              <ExclamationTriangleIcon className='h-[30px] w-[30px] text-rust' /> You private keys
              won’t be lost!
            </p>
          </div>
          <Button variant='gradient' className='h-11 w-full'>
            Confirm
          </Button>
        </div>
      </div>
    </FadeTransition>
  );
};

const TrashGradientIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60' fill='none'>
    <path d='M47.5 15H12.5' stroke='url(#paint0_linear_2508_5412)' strokeLinecap='round' />
    <path d='M35 12.5H25' stroke='url(#paint1_linear_2508_5412)' strokeLinecap='round' />
    <path
      d='M15 25V52.5H45C45 50 45 25 45 25'
      stroke='url(#paint2_linear_2508_5412)'
      strokeLinecap='round'
    />
    <defs>
      <linearGradient
        id='paint0_linear_2508_5412'
        x1='12.5'
        y1='15'
        x2='51.402'
        y2='15'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint1_linear_2508_5412'
        x1='25'
        y1='12.5'
        x2='36.1149'
        y2='12.5'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint2_linear_2508_5412'
        x1='15'
        y1='38.75'
        x2='48.3446'
        y2='38.75'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
    </defs>
  </svg>
);
