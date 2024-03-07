import { Link1Icon, LinkBreak1Icon, MagnifyingGlassIcon, TrashIcon } from '@radix-ui/react-icons';
import { useCallback, useEffect } from 'react';
import { Button, FadeTransition, Input } from '@penumbra-zone/ui';
import { LinkGradientIcon } from '../../../icons';
import { SettingsHeader } from '../../../shared';
import { OriginRecord } from '@penumbra-zone/storage';
import { DisplayOriginURL } from '../../../shared/components/display-origin-url';
import { UserChoice } from '@penumbra-zone/types/src/user-choice';
import { useStore } from '../../../state';
import { connectedSitesSelector } from '../../../state/connected-sites';

export const SettingsConnectedSites = () => {
  const {
    filter,
    approvedSites,
    deniedSites,
    ignoredSites,
    setFilter,
    discardKnownSite,
    loadKnownSites,
  } = useStore(connectedSitesSelector);

  useEffect(() => void loadKnownSites(), [loadKnownSites]);

  const discard = useCallback(
    (site: OriginRecord) => {
      void (async () => {
        await discardKnownSite(site);
        await loadKnownSites();
      })();
    },
    [discardKnownSite, loadKnownSites],
  );

  return (
    <FadeTransition>
      <div className='flex min-h-[100vh] w-[100vw] flex-col gap-6'>
        <SettingsHeader title='Connected sites' />
        <div className='mx-auto size-20'>
          <LinkGradientIcon />
        </div>
        <div className='flex flex-col gap-4 px-[30px]'>
          <div className='relative flex w-full items-center justify-center gap-4'>
            <div className='absolute inset-y-0 left-3 flex items-center'>
              <MagnifyingGlassIcon className='size-5 text-muted-foreground' />
            </div>
            <Input
              className='pl-10'
              value={filter}
              onChange={e => setFilter(e.target.value)}
              placeholder='Search by origin...'
            />
          </div>
          <div className='flex flex-col gap-2'>
            {approvedSites.length ? (
              <>
                <div className='mt-2 text-muted-foreground'>Approved sites</div>
                {approvedSites.map(site => (
                  <SiteRecord key={site.origin} site={site} discard={discard} />
                ))}
              </>
            ) : null}
            {deniedSites.length ? (
              <>
                <div className='mt-2 text-muted-foreground'>Denied sites</div>
                {deniedSites.map(site => (
                  <SiteRecord key={site.origin} site={site} discard={discard} />
                ))}
              </>
            ) : null}
            {ignoredSites.length ? (
              <>
                <div className='mt-2 text-muted-foreground'>Ignored sites</div>
                {ignoredSites.map(site => (
                  <SiteRecord key={site.origin} site={site} discard={discard} />
                ))}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </FadeTransition>
  );
};

const SiteRecord = ({
  site,
  discard,
}: {
  site: OriginRecord;
  discard: (d: OriginRecord) => void;
}) => (
  <div key={site.origin} className='relative my-1 w-full'>
    <div className='absolute inset-y-0 right-0 flex items-center'>
      <Button
        aria-description='Remove'
        className='group bg-transparent p-3'
        onClick={() => discard(site)}
      >
        {site.choice === UserChoice.Approved ? (
          <Link1Icon
            aria-description='Connected'
            className='visible absolute text-green-400 group-hover:invisible'
          />
        ) : (
          <LinkBreak1Icon
            aria-description='Denied'
            className='visible absolute text-red-400 group-hover:invisible'
          />
        )}
        <TrashIcon className='invisible absolute text-muted-foreground group-hover:visible' />
      </Button>
    </div>
    {site.choice === UserChoice.Approved ? (
      <a
        href={site.origin}
        target='_blank'
        rel='noreferrer'
        className='text-primary-foreground decoration-green hover:underline'
      >
        <DisplayOriginURL url={new URL(site.origin)} />
      </a>
    ) : (
      <span className='cursor-default text-muted-foreground line-through decoration-red'>
        <DisplayOriginURL url={new URL(site.origin)} />
      </span>
    )}
  </div>
);
