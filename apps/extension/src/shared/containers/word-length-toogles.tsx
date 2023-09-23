import { SeedPhraseLength } from 'penumbra-crypto-ts/src/mnemonic';
import { Toggle } from 'ui';

interface WordLengthTooglesProsp {
  toogleClick: (length: SeedPhraseLength) => void;
  phrase: string[];
}

export const WordLengthToogles = ({ toogleClick, phrase }: WordLengthTooglesProsp) => {
  return (
    <div className='flex items-center justify-center'>
      <div className='flex gap-3 rounded-lg bg-background p-2'>
        <Toggle
          onClick={() => toogleClick(SeedPhraseLength.TWELVE_WORDS)}
          pressed={phrase.length === 12}
        >
          12 words
        </Toggle>
        <Toggle
          onClick={() => toogleClick(SeedPhraseLength.TWENTY_FOUR_WORDS)}
          pressed={phrase.length === 24}
        >
          24 words
        </Toggle>
      </div>
    </div>
  );
};
