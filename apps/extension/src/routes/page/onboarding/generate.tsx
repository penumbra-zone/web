import { ExclamationTriangleIcon, LockClosedIcon } from '@radix-ui/react-icons';
import { SeedPhraseLength } from '@penumbra-zone/crypto-web/mnemonic';
import { useEffect, useState } from 'react';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { BackIcon } from '@penumbra-zone/ui/components/ui/back-icon';
import { Card, CardContent, CardHeader, CardTitle } from '@penumbra-zone/ui/components/ui/card';
import { CopyToClipboard } from '@penumbra-zone/ui/components/ui/copy-to-clipboard';
import { FadeTransition } from '@penumbra-zone/ui/components/ui/fade-transition';
import { Input } from '@penumbra-zone/ui/components/ui/input';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { useCountdown } from 'usehooks-ts';
import { useStore } from '../../../state';
import { generateSelector } from '../../../state/seed-phrase/generate';
import { usePageNav } from '../../../utils/navigate';
import { PagePath } from '../paths';
import { WordLengthToogles } from '../../../shared/containers/word-length-toogles';

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
  }, [generateRandomSeedPhrase, phrase.length, startCountdown]);

  return (
    <FadeTransition>
      <BackIcon className='float-left mb-4' onClick={() => navigate(-1)} />
      <Card className={cn(phrase.length === 12 ? 'w-[600px]' : 'w-[816px]')} gradient>
        <CardHeader className='items-center'>
          <CardTitle className='font-semibold'>New Recovery Phrase</CardTitle>
        </CardHeader>
        <CardContent className='mt-6 grid gap-4'>
          <div className={cn('grid gap-4', !reveal && 'blur')}>
            <WordLengthToogles toogleClick={generateRandomSeedPhrase} phrase={phrase} />
            <div
              className={cn(
                'grid gap-4 mt-2',
                phrase.length === 12 ? 'grid-cols-3' : 'grid-cols-4',
              )}
            >
              {phrase.map((word, i) => (
                <div className='flex flex-row items-center justify-center gap-2' key={i}>
                  <div className='w-7 text-right text-base font-bold'>{i + 1}.</div>
                  <Input readOnly value={word} className='text-[15px] font-normal leading-[22px]' />
                </div>
              ))}
            </div>
            <CopyToClipboard
              text={phrase.join(' ')}
              label={<span className='font-bold text-muted-foreground'>Copy to clipboard</span>}
              className='m-auto w-48'
              isSuccessCopyText
            />
          </div>
          <div className='mt-2 flex flex-col justify-center gap-4'>
            <div className='flex flex-col gap-1'>
              <p className='flex items-center gap-2 text-rust'>
                <ExclamationTriangleIcon /> Do not share this with anyone
              </p>
              <p>
                Never share your recovery passphrase with anyone, not even Penumbra employees. Your
                phrase grants full access to your funds.
              </p>
            </div>
            <div className='flex flex-col gap-1'>
              <p className='flex items-center gap-2 text-teal'>
                <LockClosedIcon /> Back this up safely
              </p>
              <p>
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
