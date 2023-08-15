import { Button, Card, CardContent, CardHeader, CardTitle } from '@ui/components';
import { FadeTransition } from '../../../components/fade-transition';
import { BackIcon } from '@ui/components/ui/back-icon';
import { useStore } from '../../../state';
import { useEffect } from 'react';
import { SeedPhraseLength } from 'penumbra-crypto-ts/src/mnemonic';
import { usePageNav } from '../../../utils/navigate';
import { PagePath } from '../paths';

export const GenerateSeedPhrase = () => {
  const navigate = usePageNav();
  const { seedPhrase, generateRandomSeedPhrase } = useStore((state) => state.onboarding);

  // On render, generate a new seed phrase
  useEffect(() => {
    if (!seedPhrase.length) {
      generateRandomSeedPhrase(SeedPhraseLength.TWELVE_WORDS);
    }
  }, []);

  return (
    <FadeTransition>
      <BackIcon className='float-left' onClick={() => navigate(-1)} />
      <Card className='w-[650px] p-6' gradient>
        <CardHeader className='items-center'>
          <CardTitle>New Recovery Phrase</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <p> ⚠️ Do not share this with anyone</p>
          <div>
            <Button onClick={() => generateRandomSeedPhrase(SeedPhraseLength.TWELVE_WORDS)}>
              12 words
            </Button>
            <Button onClick={() => generateRandomSeedPhrase(SeedPhraseLength.TWENTY_FOUR_WORDS)}>
              24 words
            </Button>
          </div>
          <div>
            {seedPhrase.map((word, i) => (
              <p key={i}>{word}</p>
            ))}
          </div>
          <p>Copy to clipboard</p>
          <Button variant='gradient' onClick={() => navigate(PagePath.CONFIRM_BACKUP)}>
            I have backed this up
          </Button>
        </CardContent>
      </Card>
    </FadeTransition>
  );
};
