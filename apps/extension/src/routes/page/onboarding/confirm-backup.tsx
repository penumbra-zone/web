import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '@ui/components';
import { FadeTransition } from '../../../components/fade-transition';
import { BackIcon } from '@ui/components/ui/back-icon';
import { usePageNav } from '../../../utils/navigate';
import { PagePath } from '../paths';
import { useStore } from '../../../state';
import { useState } from 'react';

export const ConfirmBackup = () => {
  const navigate = usePageNav();
  const { validationFields, allCorrect, userValidationAttempt } = useStore(
    (state) => state.onboarding,
  );

  console.log(userValidationAttempt);

  return (
    <FadeTransition>
      <BackIcon className='float-left' onClick={() => navigate(-1)} />
      <Card className='w-[650px] p-6' gradient>
        <CardHeader className='items-center'>
          <CardTitle>Confirm your recovery passphrase</CardTitle>
          <CardDescription className='text-center'>
            Verify you have made a backup by filling in these positions
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <div className='grid grid-cols-3 gap-4'>
            {validationFields.map(({ word, index }) => (
              <ValidationInput key={index} index={index} word={word} />
            ))}
          </div>
          <Button
            variant='gradient'
            disabled={!allCorrect()}
            onClick={() => navigate(PagePath.ONBOARDING_SUCCESS)}
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
  const { updateUserAttempt } = useStore((state) => state.onboarding);

  return (
    <div className='flex flex-row items-center justify-center gap-2'>
      <div className='w-7 text-right'>{index + 1}.</div>
      <Input
        valid={!text.length ? undefined : text === word}
        onChange={({ target: { value } }) => {
          setText(value);
          updateUserAttempt({ word: value, index });
        }}
      />
    </div>
  );
};
