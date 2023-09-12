import { SeedPhraseLength } from 'penumbra-crypto-ts/src/mnemonic';
import { useEffect } from 'react';
import { Input } from 'ui/components';
import { cn } from 'ui/lib/utils';
import { useStore } from '../../state';
import { generateSelector } from '../../state/seed-phrase/generate';
import { importSelector } from '../../state/seed-phrase/import';
import { WordLengthToogles } from './word-length-toogles';

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
      <WordLengthToogles toogleClick={setLength} phrase={phrase} />
      <div className={cn('grid gap-4', phrase.length === 12 ? 'grid-cols-3' : 'grid-cols-4')}>
        {phrase.map((_, i) => (
          <ImportInput key={i} index={i} />
        ))}
      </div>
    </>
  );
};

const ImportInput = ({ index }: { index: number }) => {
  const { update, phrase, wordIsValid } = useStore(importSelector);

  return (
    <div className='flex flex-row items-center justify-center gap-2'>
      <div className='w-7 text-right xl_medium font-headline'>{index + 1}.</div>
      <Input
        variant={
          !phrase[index]?.length ? 'default' : wordIsValid(phrase[index]!) ? 'success' : 'error'
        }
        value={phrase[index] ?? ''}
        onChange={({ target: { value } }) => {
          update(value, index);
        }}
      />
    </div>
  );
};
