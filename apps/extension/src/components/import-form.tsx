import { useEffect } from 'react';
import { Toggle } from 'ui/components';
import { useStore } from '../state';
import { importSelector } from '../state/seed-phrase/import';
import { generateSelector } from '../state/seed-phrase/generate';
import { SeedPhraseLength } from 'penumbra-crypto-ts/src/mnemonic';
import { ImportInput } from './import-input';
import { cn } from 'ui/lib/utils';

export const ImportForm = () => {
  const { phrase, setLength } = useStore(importSelector);
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
    </>
  );
};
