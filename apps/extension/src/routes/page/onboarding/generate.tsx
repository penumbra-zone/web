import { Card } from '@ui/components';
import { OnboardingCard } from '../../../components/onboarding-card';
import { useNavigate } from 'react-router-dom';
import { BackIcon } from '@ui/components/ui/back-icon';

export const GenerateSeedPhrase = () => {
  const navigate = useNavigate();

  return (
    <OnboardingCard>
      <BackIcon className='float-left' onClick={() => navigate(-1)} />
      <Card className='w-[450px] p-6' gradient>
        <div>generate phrase</div>
      </Card>
    </OnboardingCard>
  );
};
