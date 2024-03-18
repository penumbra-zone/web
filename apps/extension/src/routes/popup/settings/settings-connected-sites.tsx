import { Link1Icon, LinkBreak1Icon, MagnifyingGlassIcon, TrashIcon } from '@radix-ui/react-icons';
import { useEffect } from 'react';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { FadeTransition } from '@penumbra-zone/ui/components/ui/fade-transition';
import { Input } from '@penumbra-zone/ui/components/ui/input';
import { LinkGradientIcon } from '../../../icons/link-gradient';
import { SettingsHeader } from '../../../shared/components/settings-header';
import { OriginRecord } from '@penumbra-zone/storage/src/chrome/local';
import { DisplayOriginURL } from '../../../shared/components/display-origin-url';
import { useStore } from '../../../state';
import { connectedSitesSelector } from '../../../state/connected-sites';
import { UserChoice } from '@penumbra-zone/types/src/user-choice';

export const SettingsConnectedSites = () => {
  const {
    filter,
    knownSites,
    approvedSites,
    deniedSites,
    ignoredSites,
    noFilterMatch,
    setFilter,
    discardKnownSite,
    loadKnownSites,
  } = useStore(connectedSitesSelector);

  useEffect(() => void loadKnownSites(), [loadKnownSites]);

  const discard = (site: OriginRecord) => void discardKnownSite(site);

  return (
    <FadeTransition>
      <div className='flex min-h-screen w-screen flex-col gap-6'>
        <SettingsHeader title='Connected sites' />
        <div className='mx-auto size-20'>
          <LinkGradientIcon />
        </div>
        <div className='px-[30px]'>
          <div className='relative my-5 flex w-full items-center justify-center'>
            <div className='absolute inset-y-0 left-3 flex items-center'>
              <MagnifyingGlassIcon className='size-5 text-muted-foreground' />
            </div>
            <Input
              disabled={!knownSites.length}
              variant={filter && noFilterMatch ? 'warn' : null}
              className='pl-10'
              onChange={e => setFilter(e.target.value)}
              placeholder='Search by origin...'
            />
          </div>
          <div className='text-muted-foreground'>
            {!knownSites.length ? (
              <div className='py-[2em] text-center text-lg font-bold'>no known sites</div>
            ) : filter && noFilterMatch ? (
              <div className='py-[2em] text-center text-lg font-bold text-yellow-500'>
                all known sites filtered
              </div>
            ) : (
              <>
                {!!approvedSites.length && (
                  <>
                    <div className='ml-4 font-headline'>Approved sites</div>
                    <div role='list'>
                      {approvedSites.map(site => (
                        <SiteRecord key={site.origin} site={site} discard={discard} />
                      ))}
                    </div>
                  </>
                )}
                {!!deniedSites.length && (
                  <>
                    {!!approvedSites.length && <hr className='my-2' />}
                    <div className='ml-4 font-headline'>Denied sites</div>
                    <div role='list'>
                      {deniedSites.map(site => (
                        <SiteRecord key={site.origin} site={site} discard={discard} />
                      ))}
                    </div>
                  </>
                )}
                {!!ignoredSites.length && (
                  <>
                    {!!(approvedSites.length || deniedSites.length) && <hr className='my-2' />}
                    <div className='ml-4 font-headline'>Ignored sites</div>
                    <div role='list'>
                      {ignoredSites.map(site => (
                        <SiteRecord key={site.origin} site={site} discard={discard} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
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
  <div key={site.origin} role='listitem' className='relative my-1 w-full'>
    <div className='absolute inset-y-0 right-0 flex items-center'>
      <Button
        aria-description='Remove'
        className='group bg-transparent p-3'
        onClick={() => discard(site)}
      >
        {site.choice === UserChoice.Approved && (
          <Link1Icon
            aria-description='Connected'
            className='visible absolute text-green-400 group-hover:invisible'
          />
        )}
        {site.choice === UserChoice.Denied && (
          <LinkBreak1Icon
            aria-description='Denied'
            className='visible absolute group-hover:invisible'
          />
        )}
        {site.choice === UserChoice.Ignored && (
          <LinkBreak1Icon
            aria-description='Ignored'
            className='visible absolute text-red-400 group-hover:invisible'
          />
        )}
        <TrashIcon className='invisible absolute text-muted-foreground group-hover:visible' />
      </Button>
    </div>
    {site.choice === UserChoice.Approved && (
      <a
        href={site.origin}
        target='_blank'
        rel='noreferrer'
        className='decoration-green hover:underline'
      >
        <DisplayOriginURL url={new URL(site.origin)} />
      </a>
    )}
    {site.choice === UserChoice.Denied && (
      <span className='brightness-75'>
        <DisplayOriginURL url={new URL(site.origin)} />
      </span>
    )}
    {site.choice === UserChoice.Ignored && (
      <span className='line-through decoration-red decoration-wavy brightness-75'>
        <DisplayOriginURL url={new URL(site.origin)} />
      </span>
    )}
  </div>
);
