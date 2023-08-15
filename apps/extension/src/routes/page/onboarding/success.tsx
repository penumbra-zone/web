import { Card, CardContent, CardHeader, CardTitle } from '@ui/components';
import { FadeTransition } from '../../../components/fade-transition';
import { BackIcon } from '@ui/components/ui/back-icon';
import { usePageNav } from '../../../utils/navigate';

export const OnboardingSuccess = () => {
  const navigate = usePageNav();

  return (
    <FadeTransition>
      <BackIcon className='float-left' onClick={() => navigate(-1)} />
      <Card className='w-[650px] p-6' gradient>
        <CardHeader className='items-center'>
          <CardTitle>New Recovery Phrase</CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <p>Account Created! 🎉</p>
          <p>Animation?</p>
          <p>Link to dapp</p>
        </CardContent>
      </Card>
    </FadeTransition>
  );
};
