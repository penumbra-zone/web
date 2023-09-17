import { usePopupNav } from '../../../utils/navigate';
import { CustomLink, FadeTransition, SettingsHeader } from '../../../shared';
import { PopupPath } from '../paths';

const links = [
  {
    title: 'Recovery passphrase',
    icon: <FileTextIcon />,
    href: PopupPath.SETTINGS_RECOVERY_PASSPHRASE,
  },
  {
    title: 'Full viewing key',
    icon: <KeyIcon />,
    href: PopupPath.SETTINGS_FVK,
  },
  {
    title: 'Spending key',
    icon: <AccountKeyIcon />,
    href: PopupPath.SETTINGS_SK,
  },
];

export const SettingsSecurity = () => {
  const navigate = usePopupNav();
  
  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-10'>
        <SettingsHeader title='Security & Privacy' />
        <div className='mx-auto h-[60px] w-[60px]'>
          <EyeGradientIcon />
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

const EyeGradientIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40' fill='none'>
    <path
      d='M36.6666 20C36.6666 20 31.6666 30 19.9999 30C8.33325 30 3.33325 20 3.33325 20C3.33325 20 8.33325 10 19.9999 10C31.6666 10 36.6666 20 36.6666 20Z'
      stroke='url(#paint0_linear_2508_5614)'
      strokeLinecap='round'
    />
    <circle cx='20' cy='20' r='5' stroke='url(#paint1_linear_2508_5614)' strokeLinecap='round' />
    <path
      d='M5 35.0001L33.3333 6.66675'
      stroke='url(#paint2_linear_2508_5614)'
      strokeLinecap='round'
    />
    <defs>
      <linearGradient
        id='paint0_linear_2508_5614'
        x1='3.33325'
        y1='20'
        x2='40.3828'
        y2='20'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint1_linear_2508_5614'
        x1='15'
        y1='20'
        x2='26.1149'
        y2='20'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint2_linear_2508_5614'
        x1='5'
        y1='20.8334'
        x2='36.4921'
        y2='20.8334'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
    </defs>
  </svg>
);

function KeyIcon() {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'>
      <path d='M17.5 13.3333V10H10' stroke='#BDB8B8' strokeLinecap='round' />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M5.83333 13.3334C7.67428 13.3334 9.16667 11.841 9.16667 10.0001C9.16667 8.15913 7.67428 6.66675 5.83333 6.66675C3.99238 6.66675 2.5 8.15913 2.5 10.0001C2.5 11.841 3.99238 13.3334 5.83333 13.3334Z'
        stroke='#BDB8B8'
      />
      <path d='M14.1666 12.5V10' stroke='#BDB8B8' strokeLinecap='round' />
    </svg>
  );
}

function AccountKeyIcon() {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'>
      <path
        d='M9.20833 16.8166C8.84167 16.5249 8.375 16.1749 8.375 15.6666C10.1417 14.1249 11.8083 12.4666 13.625 10.9833C13.5183 10.5857 13.5034 10.169 13.5813 9.76479C13.6593 9.36057 13.8281 8.97935 14.075 8.64994C14.362 8.25326 14.7682 7.95853 15.2343 7.80865C15.7004 7.65877 16.2022 7.66155 16.6667 7.8166C18.1667 8.4166 18.8583 10.8999 17.375 11.8749C17.0211 12.1162 16.6057 12.2513 16.1776 12.2646C15.7495 12.2779 15.3265 12.1687 14.9583 11.9499C14.3667 12.4583 13.8417 12.9999 13.2917 13.5416'
        stroke='#BDB8B8'
        strokeWidth='1.02'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M9.20825 16.8167C9.60825 16.7183 9.96873 16.5002 10.2416 16.1917'
        stroke='#BDB8B8'
        strokeWidth='1.02'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M11.05 15.3501C11.3549 15.6239 11.6339 15.9251 11.8834 16.2501'
        stroke='#BDB8B8'
        strokeWidth='1.02'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M12.175 14.375C12.3084 14.5333 12.4417 14.6833 12.5834 14.8333'
        stroke='#BDB8B8'
        strokeWidth='1.02'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M14.6084 9.9249C14.626 9.77204 14.6736 9.62415 14.7485 9.48977C14.8235 9.35538 14.9243 9.23715 15.0451 9.14188C15.1659 9.04661 15.3044 8.97618 15.4526 8.93465C15.6007 8.89312 15.7557 8.88131 15.9084 8.8999'
        stroke='#BDB8B8'
        strokeWidth='0.77'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M7.62511 2.19169L7.22511 2.32503C4.35011 3.42503 4.16678 8.89169 7.78345 8.85836C8.43616 8.87836 9.0815 8.7158 9.64684 8.38896C10.2122 8.06212 10.6751 7.58398 10.9834 7.00836C12.1334 4.55836 10.3584 1.50003 7.62511 2.19169Z'
        stroke='#BDB8B8'
        strokeWidth='1.02'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M11.9001 9.99993C11.0001 8.81659 8.7751 8.69992 7.44177 8.94159C6.54469 9.09043 5.69536 9.4487 4.96271 9.98733C4.23006 10.526 3.63475 11.2298 3.2251 12.0416C2.72432 13.0131 2.4266 14.0763 2.3501 15.1666V15.4333'
        stroke='#BDB8B8'
        strokeWidth='1.02'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
      <rect
        x='1.66675'
        y='1.66675'
        width='16.6667'
        height='16.6667'
        stroke='#BDB8B8'
        strokeLinejoin='round'
      />
      <path d='M9.16675 5.83333H14.1667' stroke='#BDB8B8' strokeLinecap='round' />
      <path d='M9.16675 10.0001H14.1667' stroke='#BDB8B8' strokeLinecap='round' />
      <path d='M9.16675 14.1666H14.1667' stroke='#BDB8B8' strokeLinecap='round' />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M5.83333 6.66667C6.29357 6.66667 6.66667 6.29357 6.66667 5.83333C6.66667 5.3731 6.29357 5 5.83333 5C5.3731 5 5 5.3731 5 5.83333C5 6.29357 5.3731 6.66667 5.83333 6.66667Z'
        fill='#BDB8B8'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M5.83333 10.8334C6.29357 10.8334 6.66667 10.4603 6.66667 10.0001C6.66667 9.53984 6.29357 9.16675 5.83333 9.16675C5.3731 9.16675 5 9.53984 5 10.0001C5 10.4603 5.3731 10.8334 5.83333 10.8334Z'
        fill='#BDB8B8'
      />
      <path
        fillRule='evenodd'
        clipRule='evenodd'
        d='M5.83333 14.9999C6.29357 14.9999 6.66667 14.6268 6.66667 14.1666C6.66667 13.7063 6.29357 13.3333 5.83333 13.3333C5.3731 13.3333 5 13.7063 5 14.1666C5 14.6268 5.3731 14.9999 5.83333 14.9999Z'
        fill='#BDB8B8'
      />
    </svg>
  );
}
