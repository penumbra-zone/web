import { Button, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/components';
import { useNavigate } from 'react-router-dom';
import { PagePath } from '../paths';

export const OnboardingStart = () => {
  const navigate = useNavigate();
  return (
    <>
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
    </>
  );
};
