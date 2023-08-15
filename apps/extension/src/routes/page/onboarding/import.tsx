import { Card } from '@ui/components';
import { FadeTransition } from '../../../components/fade-transition';
import { BackIcon } from '@ui/components/ui/back-icon';
import { usePageNav } from '../../../utils/navigate';

export const ImportSeedPhrase = () => {
  const navigate = usePageNav();
  return (
    <FadeTransition>
      <BackIcon className='float-left' onClick={() => navigate(-1)} />
      <Card className='w-[450px] p-6' gradient>
        <div>import phrase</div>
      </Card>
    </FadeTransition>
  );
};
