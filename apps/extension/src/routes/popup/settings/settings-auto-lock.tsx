import { FadeTransition, SettingsHeader } from '../../../shared';
import { Button, Input } from 'ui/components';

export const SettingsAutoLock = () => {
  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-10'>
        <SettingsHeader title='Auto-lock timer' />
        <div className='mx-auto h-[60px] w-[60px]'>
          <TimerGradientIcon />
        </div>
        <div className='flex flex-1 flex-col items-start justify-between px-[30px] pb-[30px]'>
          <div className='flex flex-col gap-2'>
            <p className='font-headline text-xl-semibold'>Auto - lock timer (minutes)</p>
            <p className='text-base-bold text-muted-foreground'>
              Set the inactivity time in the coming minutes before Penumbra is blocked.
            </p>
            <Input />
          </div>
          <Button variant='gradient' className='h-11 w-full'>
            Save
          </Button>
        </div>
      </div>
    </FadeTransition>
  );
};

const TimerGradientIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60' fill='none'>
    <path
      d='M16.4687 12.0219C11.0215 16.1282 7.5 22.6529 7.5 30C7.5 42.4264 17.5736 52.5 30 52.5C42.4264 52.5 52.5 42.4264 52.5 30C52.5 17.5736 42.4264 7.5 30 7.5V17.5'
      stroke='url(#paint0_linear_2508_5379)'
      strokeLinecap='round'
    />
    <path d='M30 32.5L20 22.5' stroke='url(#paint1_linear_2508_5379)' strokeLinecap='round' />
    <defs>
      <linearGradient
        id='paint0_linear_2508_5379'
        x1='7.5'
        y1='30'
        x2='57.5169'
        y2='30'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint1_linear_2508_5379'
        x1='20'
        y1='27.5'
        x2='31.1149'
        y2='27.5'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
    </defs>
  </svg>
);
