import { Input } from 'ui/components';
import { useStore } from '../state';
import { importSelector } from '../state/seed-phrase/import';

export const ImportInput = ({ index }: { index: number }) => {
  const { update, phrase, wordIsValid } = useStore(importSelector);

  return (
    <div className='flex flex-row items-center justify-center gap-2'>
      <div className='w-7 text-right'>{index + 1}.</div>
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
