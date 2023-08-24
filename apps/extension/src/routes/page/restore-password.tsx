import { BackIcon, Card, CardContent, CardDescription, CardHeader, CardTitle } from 'ui/components';
import { cn } from 'ui/lib/utils';
import { FadeTransition, ImportForm } from '../../components';
import { useStore } from '../../state';
import { importSelector } from '../../state/seed-phrase/import';
import { passwordSelector } from '../../state/password';
import { useEffect } from 'react';

export const RestorePassword = () => {
  const { phrase } = useStore(importSelector);
  const { hashedPassword } = useStore(passwordSelector);

  const replaceUrl = () => window.location.replace(chrome.runtime.getURL('page.html'));

  useEffect(() => {
    // redirect to index route after login from other tabs or popup, needed to clean up url
    if (hashedPassword) replaceUrl();
  }, [hashedPassword]);

  return (
    <FadeTransition>
      <BackIcon
        className='float-left'
        // redirect to login route after back click, needed to clean up url
        onClick={replaceUrl}
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
