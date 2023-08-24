import { FadeTransition } from '../../../components/fade-transition';
import { usePageNav } from '../../../utils/navigate';
import { useStore } from '../../../state';
import { BackIcon, Card, CardContent, CardDescription, CardHeader, CardTitle } from 'ui/components';
import { cn } from 'ui/lib/utils';
import { importSelector } from '../../../state/seed-phrase/import';
import { ImportForm } from '../../../components';

export const ImportSeedPhrase = () => {
  const navigate = usePageNav();
  const { phrase } = useStore(importSelector);

  return (
    <FadeTransition>
      <BackIcon className='float-left' onClick={() => navigate(-1)} />
      <Card className={cn('p-6', phrase.length === 12 ? 'w-[550px]' : 'w-[750px]')} gradient>
        <CardHeader className='items-center'>
          <CardTitle>Import wallet with recovery phrase</CardTitle>
          <CardDescription>
            Feel free to paste it into the first box and the rest will fill
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <ImportForm />
        </CardContent>
      </Card>
    </FadeTransition>
  );
};
