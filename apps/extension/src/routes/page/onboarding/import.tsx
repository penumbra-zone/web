import { Card } from '@ui/components';
import { FadeTransition } from '../../../components/fade-transition';
import { BackIcon } from '@ui/components/ui/back-icon';
import { useNavigate } from 'react-router-dom';

export const ImportSeedPhrase = () => {
  const navigate = useNavigate();
  return (
    <FadeTransition>
      <BackIcon className='float-left' onClick={() => navigate(-1)} />
      <Card className='w-[450px] p-6' gradient>
        <div>import phrase</div>
      </Card>
    </FadeTransition>
  );
};
