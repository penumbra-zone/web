import { Link1Icon, LinkBreak1Icon, MagnifyingGlassIcon, TrashIcon } from '@radix-ui/react-icons';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { Input } from '@penumbra-zone/ui/components/ui/input';
import { LinkGradientIcon } from '../../../icons/link-gradient';
import { OriginRecord } from '@penumbra-zone/storage/src/chrome/types';
import { DisplayOriginURL } from '../../../shared/components/display-origin-url';
import { AllSlices, useStore } from '../../../state';
import { UserChoice } from '@penumbra-zone/types/src/user-choice';
import { SettingsScreen } from './settings-screen';
import { useStoreShallow } from '../../../utils/use-store-shallow';
import { noFilterMatchSelector, sitesSelector } from '../../../state/connected-sites';

const settingsConnectedSitesSelector = (state: AllSlices) => ({
  filter: state.connectedSites.filter,
  setFilter: state.connectedSites.setFilter,
  discardKnownSite: state.connectedSites.discardKnownSite,
  loadKnownSites: state.connectedSites.loadKnownSites,
});

export const SettingsConnectedSites = () => {
  const { filter, setFilter, discardKnownSite } = useStoreShallow(settingsConnectedSitesSelector);
  const { approvedSites, deniedSites, ignoredSites, knownSites } = useStoreShallow(sitesSelector);
  const noFilterMatch = useStore(noFilterMatchSelector);

  return (
    <SettingsScreen title='Connected sites' IconComponent={LinkGradientIcon}>
      <div className='relative mt-5 flex w-full items-center justify-center'>
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
                    <SiteRecord key={site.origin} site={site} discard={discardKnownSite} />
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
                    <SiteRecord key={site.origin} site={site} discard={discardKnownSite} />
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
                    <SiteRecord key={site.origin} site={site} discard={discardKnownSite} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </SettingsScreen>
  );
};

const SiteRecord = ({
  site,
  discard,
}: {
  site: OriginRecord;
  discard: (d: OriginRecord) => Promise<void>;
}) => (
  <div key={site.origin} role='listitem' className='relative my-1 w-full'>
    <div className='absolute inset-y-0 right-0 flex items-center'>
      <Button
        aria-description='Remove'
        className='group bg-transparent p-3'
        onClick={() => void discard(site)}
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
