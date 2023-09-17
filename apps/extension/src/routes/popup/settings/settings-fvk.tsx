import { useState } from 'react';
import { FadeTransition, PasswordInput, SettingsHeader } from '../../../shared';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { Button, CopyToClipboard } from 'ui/components';
import { useStore } from '../../../state';
import { passwordSelector } from '../../../state/password';

export const SettingsFVK = () => {
  const { isPassword } = useStore(passwordSelector);

  const [input, setInputValue] = useState('');
  const [enteredIncorrect, setEnteredIncorrect] = useState(false);
  const [fvk, setFVK] = useState('');

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    void (async function () {
      if (await isPassword(input)) {
        // add logic to get fvk
        setFVK(
          'penumbrafullviewingkey1wek2qjnzraq4qqjs9g7t8xu06c7affzntsl37pgcnhrq7dd8fuydgc9k53j64hfyfjrftkwmnjlhyjr6pdm22dkj25a8j49t00gp2qce0cteq',
        );
      } else {
        setEnteredIncorrect(true);
      }
    })();
  };

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-10'>
        <SettingsHeader title='Full Viewing Key' />
        <div className='mx-auto h-[60px] w-[60px]'>
          <KeyGradientIcon />
        </div>
        <form
          className='flex flex-1 flex-col items-start justify-between px-[30px] pb-[30px]'
          onSubmit={submit}
        >
          <div className='flex flex-col gap-4'>
            {!fvk ? (
              <PasswordInput
                passwordValue={input}
                label={
                  <p className='font-headline text-xl_semiBold text-muted-foreground'>Password</p>
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
              <div className='break-all rounded-lg border border-border bg-background p-4 text-base_bold text-muted-foreground'>
                {fvk}
              </div>
            )}
            {fvk && (
              <CopyToClipboard
                text={fvk}
                label={
                  <p className='font-headline text-base_bold text-muted-foreground'>
                    Copy to clipboard
                  </p>
                }
                className='m-auto mb-2 w-48'
                isSuccessCopyText
              />
            )}
            <p className='mb-2 flex items-center gap-2 text-base_bold text-rust'>
              <span>
                <ExclamationTriangleIcon />
              </span>
              Warning: never reveal this key. Anyone with your keys can steal any assets held in
              your account.
            </p>
          </div>
          {!fvk ? (
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

const KeyGradientIcon = () => (
  <svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40' fill='none'>
    <path d='M35 26.6667V20H20' stroke='url(#paint0_linear_2508_5843)' strokeLinecap='round' />
    <path
      fill-rule='evenodd'
      clip-rule='evenodd'
      d='M11.6667 26.6666C15.3486 26.6666 18.3333 23.6818 18.3333 19.9999C18.3333 16.318 15.3486 13.3333 11.6667 13.3333C7.98477 13.3333 5 16.318 5 19.9999C5 23.6818 7.98477 26.6666 11.6667 26.6666Z'
      stroke='url(#paint1_linear_2508_5843)'
    />
    <path d='M28.3334 25V20' stroke='url(#paint2_linear_2508_5843)' strokeLinecap='round' />
    <defs>
      <linearGradient
        id='paint0_linear_2508_5843'
        x1='20'
        y1='23.3333'
        x2='36.6723'
        y2='23.3333'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint1_linear_2508_5843'
        x1='5'
        y1='19.9999'
        x2='19.8198'
        y2='19.9999'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint2_linear_2508_5843'
        x1='26.6667'
        y1='23.3333'
        x2='30.3717'
        y2='23.3333'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
    </defs>
  </svg>
);
