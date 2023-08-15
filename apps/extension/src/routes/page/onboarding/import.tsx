import { Card } from '@ui/components';
import { OnboardingCard } from '../../../components/onboarding-card';
import { BackIcon } from '@ui/components/ui/back-icon';
import { useNavigate } from 'react-router-dom';

export const ImportSeedPhrase = () => {
  const navigate = useNavigate();
  return (
    <OnboardingCard>
      <BackIcon className='float-left' onClick={() => navigate(-1)} />
      <Card className='w-[450px] p-6'>
        <div>import phrase</div>
      </Card>
    </OnboardingCard>
  );
};
