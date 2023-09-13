import { CopyIcon, DownloadIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { Button, CopyToClipboard } from 'ui/components';
import { FadeTransition, PasswordInput, SettingsHeader } from '../../../shared';
import { useStore } from '../../../state';
import { passwordSelector } from '../../../state/password';

export const SettingsPassphrase = () => {
  const { isPassword } = useStore(passwordSelector);

  const [input, setInputValue] = useState('');
  const [enteredIncorrect, setEnteredIncorrect] = useState(false);
  const [phrase, setPhrase] = useState<string[]>([]);

  const getSeedPhrase = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    void (async function () {
      if (await isPassword(input)) {
        // add logic to get seed
        setPhrase([
          'aware',
          'midnight',
          'urge',
          'hint',
          'refuse',
          'quote',
          'marriage',
          'health',
          'ugly',
          'coffee',
          'pretty',
          'occur',
        ]);
      } else {
        setEnteredIncorrect(true);
      }
    })();
  };

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-10'>
        <SettingsHeader title='Recovery Passphrase' />
        <div className='mx-auto h-[60px] w-[60px]'>
          <TextEditGradientIcon />
        </div>
        <form
          className='flex flex-1 flex-col items-start justify-between px-[30px] pb-[30px]'
          onSubmit={getSeedPhrase}
        >
          <div className='flex flex-col gap-4'>
            <p className='text-base_bold text-muted-foreground'>
              If you change browser or switch to another computer, you will need this recovery
              passphrase to access your accounts.
            </p>
            <p className='mb-2 flex items-center gap-2 text-base_bold text-rust'>
              <ExclamationTriangleIcon /> Don’t share this phrase with anyone
            </p>
            {!phrase.length ? (
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
              <div className='flex flex-col gap-2'>
                <p className='font-headline text-xl_semiBold'>Recovery secret phrase</p>
                <div className='mb-[6px] grid grid-cols-3 gap-4 rounded-lg border borde˝r-border bg-background p-5'>
                  {phrase.map((word, i) => (
                    <div className='flex' key={i}>
                      <p className='w-5 text-left text-base_bold text-muted-foreground'>{i + 1}.</p>
                      <p className='text-base_bold text-muted-foreground'>{word}</p>
                    </div>
                  ))}
                </div>
                <div className='flex gap-[18px]'>
                  <CopyToClipboard
                    className='h-9 w-[50%] rounded-lg bg-teal font-headline text-base_semiBold text-muted opacity-80 hover:no-underline hover:opacity-50'
                    label={
                      <p className='flex items-center gap-2 text-base_semiBold'>
                        <CopyIcon /> Copy
                      </p>
                    }
                    text={phrase.join(' ')}
                  />
                  <Button className='h-9 w-[50%] bg-sand opacity-80 hover:opacity-50'>
                    <p className='flex items-center gap-2 text-base_semiBold'>
                      <DownloadIcon /> CSV
                    </p>
                  </Button>
                </div>
              </div>
            )}
          </div>
          {!phrase.length ? (
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

const TextEditGradientIcon = () => (
  <svg width='40' height='40' viewBox='0 0 40 40' fill='none' xmlns='http://www.w3.org/2000/svg'>
    <rect
      x='3.3335'
      y='3.33325'
      width='33.3333'
      height='33.3333'
      stroke='url(#paint0_linear_2508_5717)'
      strokeLinejoin='round'
    />
    <path
      d='M18.3335 11.6667H28.3335'
      stroke='url(#paint1_linear_2508_5717)'
      strokeLinecap='round'
    />
    <path
      d='M18.3335 19.9999H28.3335'
      stroke='url(#paint2_linear_2508_5717)'
      strokeLinecap='round'
    />
    <path
      d='M18.3335 28.3334H28.3335'
      stroke='url(#paint3_linear_2508_5717)'
      strokeLinecap='round'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M11.6667 13.3333C12.5871 13.3333 13.3333 12.5871 13.3333 11.6667C13.3333 10.7462 12.5871 10 11.6667 10C10.7462 10 10 10.7462 10 11.6667C10 12.5871 10.7462 13.3333 11.6667 13.3333Z'
      fill='url(#paint4_linear_2508_5717)'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M11.6667 21.6666C12.5871 21.6666 13.3333 20.9204 13.3333 19.9999C13.3333 19.0794 12.5871 18.3333 11.6667 18.3333C10.7462 18.3333 10 19.0794 10 19.9999C10 20.9204 10.7462 21.6666 11.6667 21.6666Z'
      fill='url(#paint5_linear_2508_5717)'
    />
    <path
      fillRule='evenodd'
      clipRule='evenodd'
      d='M11.6667 30.0001C12.5871 30.0001 13.3333 29.2539 13.3333 28.3334C13.3333 27.4129 12.5871 26.6667 11.6667 26.6667C10.7462 26.6667 10 27.4129 10 28.3334C10 29.2539 10.7462 30.0001 11.6667 30.0001Z'
      fill='url(#paint6_linear_2508_5717)'
    />
    <defs>
      <linearGradient
        id='paint0_linear_2508_5717'
        x1='3.3335'
        y1='19.9999'
        x2='40.383'
        y2='19.9999'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint1_linear_2508_5717'
        x1='18.3335'
        y1='11.6667'
        x2='29.4484'
        y2='11.6667'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint2_linear_2508_5717'
        x1='18.3335'
        y1='19.9999'
        x2='29.4484'
        y2='19.9999'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint3_linear_2508_5717'
        x1='18.3335'
        y1='28.3334'
        x2='29.4484'
        y2='28.3334'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint4_linear_2508_5717'
        x1='10'
        y1='11.6667'
        x2='13.705'
        y2='11.6667'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint5_linear_2508_5717'
        x1='10'
        y1='19.9999'
        x2='13.705'
        y2='19.9999'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
      <linearGradient
        id='paint6_linear_2508_5717'
        x1='10'
        y1='28.3334'
        x2='13.705'
        y2='28.3334'
        gradientUnits='userSpaceOnUse'
      >
        <stop stopColor='#8BE4D9' stopOpacity='0.7' />
        <stop offset='0.526042' stopColor='#C8B880' stopOpacity='0.7' />
        <stop offset='1' stopColor='#FF902F' stopOpacity='0.6' />
      </linearGradient>
    </defs>
  </svg>
);
