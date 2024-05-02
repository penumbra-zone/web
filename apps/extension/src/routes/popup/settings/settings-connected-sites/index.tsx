import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Input } from '@penumbra-zone/ui/components/ui/input';
import { LinkGradientIcon } from '../../../../icons/link-gradient';
import { OriginRecord } from '@penumbra-zone/storage/chrome/types';
import { AllSlices, useStore } from '../../../../state';
import { UserChoice } from '@penumbra-zone/types/user-choice';
import { SettingsScreen } from '../settings-screen';
import { useStoreShallow } from '../../../../utils/use-store-shallow';
import { allSitesFilteredOutSelector } from '../../../../state/connected-sites';
import { KnownSitesGroup } from './known-sites-group';

const settingsConnectedSitesSelector = (state: AllSlices) => ({
  filter: state.connectedSites.filter,
  setFilter: state.connectedSites.setFilter,
  knownSites: state.connectedSites.knownSites,
});

const getGroupedSites = (knownSites: OriginRecord[], filter?: string) => {
  const groupedSites = Map.groupBy(knownSites, ({ choice }) => choice);
  const filterFn = (site: OriginRecord) => !filter || site.origin.includes(filter);

  return {
    approvedSites: groupedSites.get(UserChoice.Approved)?.filter(filterFn) ?? [],
    deniedSites: groupedSites.get(UserChoice.Denied)?.filter(filterFn) ?? [],
    ignoredSites: groupedSites.get(UserChoice.Ignored)?.filter(filterFn) ?? [],
  };
};

export const SettingsConnectedSites = () => {
  const { filter, setFilter, knownSites } = useStoreShallow(settingsConnectedSitesSelector);
  const allSitesFilteredOut = useStore(allSitesFilteredOutSelector);
  const { approvedSites, deniedSites, ignoredSites } = getGroupedSites(knownSites, filter);

  return (
    <SettingsScreen title='Connected sites' IconComponent={LinkGradientIcon}>
      <div className='relative mt-5 flex w-full items-center justify-center'>
        <div className='absolute inset-y-0 left-3 flex items-center'>
          <MagnifyingGlassIcon className='size-5 text-muted-foreground' />
        </div>
        <Input
          disabled={!knownSites.length}
          variant={allSitesFilteredOut ? 'warn' : null}
          className='pl-10'
          onChange={e => setFilter(e.target.value)}
          placeholder='Search by origin...'
        />
      </div>
      <div className='text-muted-foreground'>
        {!knownSites.length ? (
          <div className='py-[2em] text-center text-lg font-bold'>no known sites</div>
        ) : allSitesFilteredOut ? (
          <div className='py-[2em] text-center text-lg font-bold text-yellow-500'>
            all known sites filtered
          </div>
        ) : (
          <div className='mt-4 flex flex-col gap-4'>
            {!!approvedSites.length && (
              <KnownSitesGroup label='Approved sites' sites={approvedSites} />
            )}
            {!!deniedSites.length && <KnownSitesGroup label='Denied sites' sites={deniedSites} />}
            {!!ignoredSites.length && (
              <>
                {!!(approvedSites.length || deniedSites.length) && <hr className='my-2' />}
                <KnownSitesGroup label='Ignored sites' sites={ignoredSites} />
              </>
            )}
          </div>
        )}
      </div>
    </SettingsScreen>
  );
};
