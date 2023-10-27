import { FadeTransition } from '@penumbra-zone/ui';
import { LinkGradientIcon } from '../../../../icons';
import { SettingsHeader } from '../../../../shared';
import { ConnectedSitesActionPopover } from './connected-sites-action-popover';
import { useStore } from '../../../../state';
import { connectedSitesSelector } from '../../../../state/connected-sites';

export const SettingsConnectedSites = () => {
  const { all } = useStore(connectedSitesSelector);

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-6'>
        <SettingsHeader title='Connected sites' />
        <div className='mx-auto h-20 w-20'>
          <LinkGradientIcon />
        </div>
        <div className='flex flex-col gap-2 px-[30px]'>
          {all.map(origin => (
            <div
              key={origin}
              className='flex items-center justify-between rounded-lg border bg-background px-3 py-[14px]'
            >
              <a href={origin} target='_blank' rel='noreferrer noopener'>
                {origin}
              </a>
              <ConnectedSitesActionPopover origin={origin} />
            </div>
          ))}
        </div>
      </div>
    </FadeTransition>
  );
};
