import { useEffect } from 'react';
import { Button, Toggle } from 'ui/components';
import { usePageNav } from '../utils/navigate';
import { useStore } from '../state';
import { importSelector } from '../state/seed-phrase/import';
import { generateSelector } from '../state/seed-phrase/generate';
import { SeedPhraseLength } from 'penumbra-crypto-ts/src/mnemonic';
import { ImportInput } from './import-input';
import { PagePath } from '../routes/page/paths';
import { cn } from 'ui/lib/utils';

export const ImportForm = () => {
  const navigate = usePageNav();
  const { phrase, setLength, phraseIsValid } = useStore(importSelector);
  const { cleanup } = useStore(generateSelector);

  useEffect(() => {
    if (!phrase.length) {
      setLength(SeedPhraseLength.TWELVE_WORDS);
    }
    cleanup(); // Ensures no competing state from generate path
  }, []);

  return (
    <>
      <div className='flex items-center justify-center'>
        <div className='flex gap-3 rounded-xl bg-black p-2'>
          <Toggle
            onClick={() => setLength(SeedPhraseLength.TWELVE_WORDS)}
            pressed={phrase.length === 12}
          >
            12 words
          </Toggle>
          <Toggle
            onClick={() => setLength(SeedPhraseLength.TWENTY_FOUR_WORDS)}
            pressed={phrase.length === 24}
          >
            24 words
          </Toggle>
        </div>
      </div>
      <div className={cn('grid gap-4', phrase.length === 12 ? 'grid-cols-3' : 'grid-cols-4')}>
        {phrase.map((_, i) => (
          <ImportInput key={i} index={i} />
        ))}
      </div>
      <Button
        className='mt-4'
        variant='gradient'
        disabled={!phrase.every(w => w.length > 0) || !phraseIsValid()}
        onClick={() => navigate(PagePath.SET_PASSWORD)}
      >
        {!phrase.length || !phrase.every(w => w.length > 0)
          ? 'Fill in passphrase'
          : !phraseIsValid()
          ? 'Phrase is invalid'
          : 'Import'}
      </Button>
    </>
  );
};
