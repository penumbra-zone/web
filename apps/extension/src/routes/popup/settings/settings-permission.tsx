import { FadeTransition } from 'ui';
import { SettingsHeader } from '../../../shared';

export const SettingsPermission = () => {
  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-10'>
        <SettingsHeader title='Permissions' />
      </div>
    </FadeTransition>
  );
};
