import { Card, CardContent, CardHeader, CardTitle } from '@ui/components';
import { FadeTransition } from '../../../components/fade-transition';

export const OnboardingSuccess = () => {
  return (
    <FadeTransition>
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
