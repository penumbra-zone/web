import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CompressedVideoLogo,
  FadeTransition,
} from 'ui';
import { usePageNav } from '../../../utils/navigate';
import { PagePath } from '../paths';

export const OnboardingStart = () => {
  const navigate = usePageNav();

  return (
    <FadeTransition>
      <CompressedVideoLogo className='mb-10 self-center' />
      <Card className='w-[400px] ' gradient>
        <CardHeader className='items-center'>
          <CardTitle>Explore private trading</CardTitle>
          <CardDescription className='text-center'>
            Securely transact, stake, swap, or marketmake without broadcasting your personal
            information to the world.
          </CardDescription>
        </CardHeader>
        <CardContent className='mt-6 grid gap-4'>
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
    </FadeTransition>
  );
};
