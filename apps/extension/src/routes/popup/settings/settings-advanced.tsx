import { TimerIcon, TrashIcon } from '@radix-ui/react-icons';
import { CustomLink, FadeTransition, SettingsHeader } from '../../../shared';
import { usePopupNav } from '../../../utils/navigate';
import { PopupPath } from '../paths';

const links = [
  {
    title: 'Auto-lock timer',
    icon: <TimerIcon className='h-5 w-5 text-muted-foreground' />,
    href: PopupPath.SETTINGS_AUTO_LOCK,
  },
  {
    title: 'Clear cache',
    icon: <TrashIcon className='h-5 w-5 text-muted-foreground' />,
    href: PopupPath.SETTINGS_CLEAR_CACHE,
  },
];

export const SettingsAdvanced = () => {
  const navigate = usePopupNav();

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-4'>
        <SettingsHeader title='Advanced' />
        <div className='mx-auto h-[60px] w-[60px] mb-6'>
          <DashboardGradientIcon />
        </div>
        <div className='flex flex-1 flex-col items-start gap-2 px-[30px]'>
          {links.map(i => (
            <CustomLink
              key={i.href}
              title={i.title}
              icon={i.icon}
              onClick={() => navigate(i.href)}
            />
          ))}
        </div>
      </div>
    </FadeTransition>
  );
};

const DashboardGradientIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60' fill='none'>
    <rect
      x='7.5'
      y='7.5'
      width='17.5'
      height='17.5'
      stroke='url(#paint0_linear_2508_5326)'
      strokeLinejoin='round'
    />
    <rect
      x='35'
      y='7.5'
      width='17.5'
      height='17.5'
      stroke='url(#paint1_linear_2508_5326)'
      strokeLinejoin='round'
    />
    <rect
      x='7.5'
      y='35'
      width='17.5'
      height='17.5'
      stroke='url(#paint2_linear_2508_5326)'
      strokeLinejoin='round'
    />
    <rect
      x='35'
      y='35'
      width='17.5'
      height='17.5'
      stroke='url(#paint3_linear_2508_5326)'
      strokeLinejoin='round'
    />
    <defs>
      <linearGradient
        id='paint0_linear_2508_5326'
        x1='7.5'
        y1='16.25'
        x2='26.951'
        y2='16.25'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint1_linear_2508_5326'
        x1='35'
        y1='16.25'
        x2='54.451'
        y2='16.25'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint2_linear_2508_5326'
        x1='7.5'
        y1='43.75'
        x2='26.951'
        y2='43.75'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint3_linear_2508_5326'
        x1='35'
        y1='43.75'
        x2='54.451'
        y2='43.75'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
    </defs>
  </svg>
);
