import { useState } from 'react';
import {
  BackIcon,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  FadeTransition,
  Input,
} from '@penumbra-zone/ui';
import { useStore } from '../../../state';
import { generateSelector } from '../../../state/seed-phrase/generate';
import { usePageNav } from '../../../utils/navigate';
import { PagePath } from '../paths';

export const ConfirmBackup = () => {
  const navigate = usePageNav();
  const { validationFields, userAttemptCorrect } = useStore(generateSelector);

  return (
    <FadeTransition>
      <BackIcon className='float-left mb-4' onClick={() => navigate(-1)} />
      <Card className='w-[400px]' gradient>
        <CardHeader className='items-center'>
          <CardTitle className='text-center'>Confirm your recovery passphrase</CardTitle>
          <CardDescription className='text-center'>
            Verify you have made a backup by filling in these positions
          </CardDescription>
        </CardHeader>
        <CardContent className='mt-6 grid gap-6'>
          <div className='flex flex-col gap-4'>
            {validationFields.map(({ word, index }) => (
              <ValidationInput key={index} index={index} word={word} />
            ))}
          </div>
          <Button
            variant='gradient'
            disabled={!userAttemptCorrect()}
            onClick={() => navigate(PagePath.SET_PASSWORD)}
          >
            Next
          </Button>
        </CardContent>
      </Card>
    </FadeTransition>
  );
};

const ValidationInput = ({ word, index }: { word: string; index: number }) => {
  const [text, setText] = useState('');
  const { updateAttempt } = useStore(generateSelector);

  return (
    <div className='flex flex-row items-center justify-center gap-2'>
      <div className='w-7 text-right text-base font-bold'>{index + 1}.</div>
      <Input
        variant={!text.length ? 'default' : text === word ? 'success' : 'error'}
        onChange={({ target: { value } }) => {
          setText(value);
          updateAttempt({ word: value, index });
        }}
      />
    </div>
  );
};
