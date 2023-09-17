import { FadeTransition, SettingsHeader } from '../../../shared';

export const SettingsConnectedSites = () => {
  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-10'>
        <SettingsHeader title='Connected sites' />
      </div>
    </FadeTransition>
  );
};
