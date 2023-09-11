import {
  BackIcon,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CopyToClipboard,
  Input,
  Toggle,
} from 'ui/components';
import { FadeTransition } from '../../../components/fade-transition';
import { useStore } from '../../../state';
import { useEffect, useState } from 'react';
import { SeedPhraseLength } from 'penumbra-crypto-ts/src/mnemonic';
import { usePageNav } from '../../../utils/navigate';
import { ExclamationTriangleIcon, LockClosedIcon } from '@radix-ui/react-icons';
import { useCountdown } from 'usehooks-ts';
import { PagePath } from '../paths';
import { generateSelector } from '../../../state/seed-phrase/generate';
import { cn } from 'ui/lib/utils';

export const GenerateSeedPhrase = () => {
  const navigate = usePageNav();
  const { phrase, generateRandomSeedPhrase } = useStore(generateSelector);
  const [count, { startCountdown }] = useCountdown({ countStart: 3 });
  const [reveal, setReveal] = useState(false);

  // On render, generate a new seed phrase
  useEffect(() => {
    if (!phrase.length) {
      generateRandomSeedPhrase(SeedPhraseLength.TWELVE_WORDS);
    }
    startCountdown();
  }, []);

  return (
    <FadeTransition>
      <BackIcon className='float-left mb-4' onClick={() => navigate(-1)} />
      <Card className={cn(phrase.length === 12 ? 'w-[550px]' : 'w-[750px]')} gradient>
        <CardHeader className='items-center'>
          <CardTitle>New Recovery Phrase</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-6 mt-[14px]'>
          <div className={cn('grid gap-4', !reveal && 'blur')}>
            <div className='flex items-center justify-center'>
              <div className='flex gap-3 rounded-lg bg-background p-2'>
                <Toggle
                  onClick={() => generateRandomSeedPhrase(SeedPhraseLength.TWELVE_WORDS)}
                  pressed={phrase.length === 12}
                >
                  12 words
                </Toggle>
                <Toggle
                  onClick={() => generateRandomSeedPhrase(SeedPhraseLength.TWENTY_FOUR_WORDS)}
                  pressed={phrase.length === 24}
                >
                  24 words
                </Toggle>
              </div>
            </div>
            <div
              className={cn(
                'grid gap-4 mt-2',
                phrase.length === 12 ? 'grid-cols-3' : 'grid-cols-4',
              )}
            >
              {phrase.map((word, i) => (
                <div className='flex flex-row items-center justify-center gap-2' key={i}>
                  <div className='w-7 text-right text-xl_medium text-headline'>{i + 1}.</div>
                  <Input readOnly value={word} className='text-lg_bold' />
                </div>
              ))}
            </div>
            <CopyToClipboard text={phrase.join(' ')} />
          </div>
          <div className='flex flex-col justify-center gap-4'>
            <div className='flex flex-col gap-1'>
              <p className='flex items-center gap-2 text-lg_bold text-rust'>
                <ExclamationTriangleIcon /> Do not share this with anyone
              </p>
              <p className='text-lg_bold'>
                Never share your recovery passphrase with anyone, not even Penumbra employees. Your
                phrase grants full access to your funds.
              </p>
            </div>
            <div className='flex flex-col gap-1'>
              <p className='flex items-center gap-2 text-lg_bold text-teal'>
                <LockClosedIcon /> Back this up safely
              </p>
              <p className='text-lg_bold'>
                Save to a password manager or keep it in a bank vault. Without the backup, you
                cannot recover your account.
              </p>
            </div>
          </div>
          {reveal ? (
            <Button
              className='mt-4'
              variant='gradient'
              onClick={() => navigate(PagePath.CONFIRM_BACKUP)}
              disabled={count !== 0}
            >
              I have backed this up
            </Button>
          ) : (
            <Button
              className='mt-4'
              variant='gradient'
              onClick={() => setReveal(true)}
              disabled={count !== 0}
            >
              Reveal phrase {count !== 0 && `(${count})`}
            </Button>
          )}
        </CardContent>
      </Card>
    </FadeTransition>
  );
};
