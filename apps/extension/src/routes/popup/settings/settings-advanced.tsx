import { FadeTransition } from '../../../components';
import { BackIcon } from 'ui/components';
import { usePageNav } from '../../../utils/navigate';

export const SettingsAdvanced = () => {
  const navigate = usePageNav();
  return (
    <FadeTransition className='flex flex-col items-stretch justify-start'>
      <BackIcon className='absolute bg-red top-6' onClick={() => navigate(-1)} />
      <h1 className='pt-5 pb-2 border-b text-center'>Advanced</h1>
    </FadeTransition>
  );
};
