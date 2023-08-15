import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/components';
import { useNavigate } from 'react-router-dom';
import { PagePath } from '../paths';
import { Logo } from '@ui/components/ui/logo';
import { OnboardingCard } from '../../../components/onboarding-card';

export const OnboardingStart = () => {
  const navigate = useNavigate();

  return (
    <OnboardingCard>
      <Logo className='mb-12 self-center' />
      <Card className='w-[450px] p-6'>
        <CardHeader className='items-center'>
          <CardTitle>Explore private trading</CardTitle>
          <CardDescription className='text-center'>
            Securely transact, stake, swap, or marketmake without broadcasting your personal
            information to the world.
          </CardDescription>
        </CardHeader>
        <CardContent className='grid gap-4'>
          <Button
            variant='gradient'
            className='w-full'
            onClick={() => navigate(PagePath.GENERATE_SEED_PHRASE)}
          >
            Create a new wallet
          </Button>
          <Button
            variant='secondary'
            className='w-full'
            onClick={() => navigate(PagePath.IMPORT_SEED_PHRASE)}
          >
            Import existing wallet
          </Button>
        </CardContent>
      </Card>
    </OnboardingCard>
  );
};
