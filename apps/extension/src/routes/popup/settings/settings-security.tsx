import { BackIcon } from 'ui/components';
import { FadeTransition } from '../../../components';
import { usePopupNav } from '../../../utils/navigate';

export const SettingsSecurity = () => {
  const navigate = usePopupNav();
  return (
    <FadeTransition className='flex flex-col items-stretch justify-start'>
      <BackIcon className='absolute top-6 text-foreground' onClick={() => navigate(-1)} />
      <h1 className='border-b border-[rgba(75,75,75,0.50)] pb-2 pt-5 text-center'>
        Security & Privacy
      </h1>
    </FadeTransition>
  );
};
