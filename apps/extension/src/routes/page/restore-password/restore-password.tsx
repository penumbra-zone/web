import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from 'ui/components';
import { cn } from 'ui/lib/utils';
import { useStore } from '../../../state';
import { importSelector } from '../../../state/seed-phrase/import';
import { usePageNav } from '../../../utils/navigate';
import { PagePath } from '../paths';
import { FadeTransition, ImportForm } from '../../../shared';

export const RestorePassword = () => {
  const navigate = usePageNav();
  const { phrase, phraseIsValid } = useStore(importSelector);

  return (
    <FadeTransition>
      <Card className={cn(phrase.length === 12 ? 'w-[550px]' : 'w-[750px]')} gradient>
        <CardHeader className='items-center'>
          <CardTitle>Reset wallet with recovery phrase</CardTitle>
          <CardDescription>
            Feel free to paste it into the first box and the rest will fill
          </CardDescription>
        </CardHeader>
        <CardContent className='mt-[14px] grid gap-6'>
          <ImportForm />
          <Button
            className='mt-4'
            variant='gradient'
            disabled={!phrase.every(w => w.length > 0) || !phraseIsValid()}
            onClick={() => navigate(PagePath.RESTORE_PASSWORD_SET_PASSWORD)}
          >
            {!phrase.length || !phrase.every(w => w.length > 0)
              ? 'Fill in passphrase'
              : !phraseIsValid()
              ? 'Phrase is invalid'
              : 'Import'}
          </Button>
        </CardContent>
      </Card>
    </FadeTransition>
  );
};
