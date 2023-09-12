import { BackIcon } from 'ui/components';
import { usePopupNav } from '../../../utils/navigate';
import { FadeTransition } from '../../../shared';

export const SettingsNetworks = () => {
  const navigate = usePopupNav();
  return (
    <FadeTransition className='flex flex-col items-stretch justify-start'>
      <BackIcon className='absolute top-6 text-foreground' onClick={() => navigate(-1)} />
      <h1 className='border-b border-[rgba(75,75,75,0.50)] pb-2 pt-5 text-center'>Networks</h1>
    </FadeTransition>
  );
};
