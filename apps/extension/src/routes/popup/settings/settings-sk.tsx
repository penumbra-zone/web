import { useState } from 'react';
import { FadeTransition, PasswordInput, SettingsHeader } from '../../../shared';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Button, CopyToClipboard } from 'ui/components';
import { useStore } from '../../../state';
import { passwordSelector } from '../../../state/password';

export const SettingsSK = () => {
  const { isPassword } = useStore(passwordSelector);

  const [input, setInputValue] = useState('');
  const [enteredIncorrect, setEnteredIncorrect] = useState(false);
  const [sk, setSK] = useState('');

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    void (async function () {
      if (await isPassword(input)) {
        // add logic to get sk
        setSK('penumbraspendkey1cl9w3jkauut4fj42wu5ypc5yzgwd4y3ge6yrn6lfvp625yf0sezsl58vlx');
      } else {
        setEnteredIncorrect(true);
      }
    })();
  };

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-10'>
        <SettingsHeader title='Spending Key' />
        <div className='mx-auto h-[60px] w-[60px]'>
          <AccountKeyIcon />
        </div>
        <form
          className='flex flex-1 flex-col items-start justify-between px-[30px] pb-[30px]'
          onSubmit={submit}
        >
          <div className='flex flex-col gap-4'>
            {!sk ? (
              <PasswordInput
                passwordValue={input}
                label={
                  <p className='font-headline text-xl-semibold text-muted-foreground'>Password</p>
                }
                onChange={e => {
                  setInputValue(e.target.value);
                  setEnteredIncorrect(false);
                }}
                validations={[
                  {
                    type: 'error',
                    error: 'wrong password',
                    checkFn: (txt: string) => Boolean(txt) && enteredIncorrect,
                  },
                ]}
              />
            ) : (
              <div className='break-all rounded-lg border border-border bg-background p-4 text-base-bold text-muted-foreground'>
                {sk}
              </div>
            )}
            {sk && (
              <CopyToClipboard
                text={sk}
                label={
                  <p className='font-headline text-base-bold text-muted-foreground'>
                    Copy to clipboard
                  </p>
                }
                className='m-auto mb-2 w-48'
                isSuccessCopyText
              />
            )}
            <p className='mb-2 flex items-center gap-2 text-base-bold text-rust'>
              <span>
                <ExclamationTriangleIcon />
              </span>
              Warning: never reveal this key. Anyone with your keys can steal any assets held in
              your account.
            </p>
          </div>
          {!sk ? (
            <Button variant='gradient' className='h-11 w-full' type='submit'>
              Confirm
            </Button>
          ) : (
            <></>
          )}
        </form>
      </div>
    </FadeTransition>
  );
};

const AccountKeyIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40' fill='none'>
    <path
      d='M18.4167 33.6334C17.6833 33.0501 16.75 32.3501 16.75 31.3334C20.2833 28.2501 23.6167 24.9334 27.25 21.9668C27.0366 21.1716 27.0068 20.3383 27.1627 19.5298C27.3186 18.7214 27.6562 17.9589 28.15 17.3001C28.7241 16.5068 29.5363 15.9173 30.4686 15.6175C31.4009 15.3178 32.4045 15.3234 33.3333 15.6334C36.3333 16.8334 37.7167 21.8001 34.75 23.7501C34.0422 24.2325 33.2114 24.5029 32.3552 24.5295C31.499 24.5561 30.653 24.3377 29.9167 23.9001C28.7333 24.9168 27.6833 26.0001 26.5833 27.0834'
      stroke='url(#paint0_linear_2508_5894)'
      strokeWidth='1.02'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M18.4167 33.6333C19.2167 33.4365 19.9377 33.0005 20.4834 32.3833'
      stroke='url(#paint1_linear_2508_5894)'
      strokeWidth='1.02'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M22.1001 30.7C22.7098 31.2475 23.2677 31.85 23.7668 32.5'
      stroke='url(#paint2_linear_2508_5894)'
      strokeWidth='1.02'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M24.3501 28.75C24.6168 29.0667 24.8834 29.3667 25.1668 29.6667'
      stroke='url(#paint3_linear_2508_5894)'
      strokeWidth='1.02'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M29.2166 19.8501C29.2517 19.5443 29.3469 19.2485 29.4968 18.9798C29.6467 18.711 29.8483 18.4745 30.09 18.284C30.3316 18.0935 30.6086 17.9526 30.9049 17.8695C31.2012 17.7865 31.5111 17.7629 31.8166 17.8001'
      stroke='url(#paint4_linear_2508_5894)'
      strokeWidth='0.77'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M15.25 4.38339L14.45 4.65005C8.69998 6.85005 8.33332 17.7834 15.5667 17.7167C16.8721 17.7567 18.1628 17.4316 19.2934 16.7779C20.4241 16.1242 21.3499 15.168 21.9667 14.0167C24.2667 9.11672 20.7167 3.00005 15.25 4.38339Z'
      stroke='url(#paint5_linear_2508_5894)'
      strokeWidth='1.02'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M23.7999 20.0001C21.9999 17.6334 17.55 17.4001 14.8833 17.8834C13.0891 18.1811 11.3905 18.8976 9.92517 19.9749C8.45987 21.0522 7.26925 22.4598 6.44995 24.0834C5.44839 26.0264 4.85296 28.1529 4.69995 30.3334V30.8668'
      stroke='url(#paint6_linear_2508_5894)'
      strokeWidth='1.02'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <defs>
      <linearGradient
        id='paint0_linear_2508_5894'
        x1='16.75'
        y1='24.5151'
        x2='38.5888'
        y2='24.5151'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint1_linear_2508_5894'
        x1='18.4167'
        y1='33.0083'
        x2='20.7138'
        y2='33.0083'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint2_linear_2508_5894'
        x1='22.1001'
        y1='31.6'
        x2='23.9526'
        y2='31.6'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint3_linear_2508_5894'
        x1='24.3501'
        y1='29.2083'
        x2='25.2578'
        y2='29.2083'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint4_linear_2508_5894'
        x1='29.2166'
        y1='18.8165'
        x2='32.1064'
        y2='18.8165'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint5_linear_2508_5894'
        x1='10.1355'
        y1='10.9523'
        x2='24.0765'
        y2='10.9523'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint6_linear_2508_5894'
        x1='4.69995'
        y1='24.2716'
        x2='25.9293'
        y2='24.2716'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
    </defs>
  </svg>
);
