import { BackIcon, Card, CardContent, CardDescription, CardHeader, CardTitle } from 'ui/components';
import { cn } from 'ui/lib/utils';
import { FadeTransition, ImportForm } from '../../components';
import { useStore } from '../../state';
import { importSelector } from '../../state/seed-phrase/import';

export const RestorePassword = () => {
  const { phrase } = useStore(importSelector);

  return (
    <FadeTransition>
      <BackIcon
        className='float-left'
        onClick={() =>
          // reload page to main route after back click, needed to clean up url
          window.location.replace(chrome.runtime.getURL('page.html'))
        }
      />
      <Card className={cn('p-6', phrase.length === 12 ? 'w-[550px]' : 'w-[750px]')} gradient>
        <CardHeader className='items-center'>
          <CardTitle>Reset wallet with recovery phrase</CardTitle>
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
