import { Link1Icon, LinkBreak1Icon, MagnifyingGlassIcon, TrashIcon } from '@radix-ui/react-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, FadeTransition, Input } from '@penumbra-zone/ui';
import { LinkGradientIcon } from '../../../icons';
import { SettingsHeader } from '../../../shared';
import { OriginRecord, localExtStorage } from '@penumbra-zone/storage';

import Map from '@penumbra-zone/polyfills/Map.groupBy';

export const SettingsConnectedSites = () => {
  const [search, setSearch] = useState<string>();

  const [sitesFromStorage, setSitesFromStorage] = useState<OriginRecord[]>();

  const loadSitesFromStorage = useCallback(
    async () => setSitesFromStorage(await localExtStorage.get('connectedSites')),
    [],
  );
  useEffect(() => void loadSitesFromStorage(), [loadSitesFromStorage]);

  const discardSiteRecord = useCallback(
    (site: OriginRecord) => {
      if (!sitesFromStorage) return;
      const sitesWithoutRecord = sitesFromStorage.filter(({ origin }) => origin !== site.origin);
      void localExtStorage.set('connectedSites', sitesWithoutRecord);
      setSitesFromStorage(sitesWithoutRecord);
    },
    [sitesFromStorage],
  );

  const filteredByAttitude = useMemo(
    () =>
      Map.groupBy(
        (sitesFromStorage ?? []).filter(site => !search || site.origin.includes(search)),
        ({ attitude }) => attitude,
      ),
    [sitesFromStorage, search],
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
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder='Search by origin...'
            />
          </div>
          <div className='flex flex-col gap-2'>
            {filteredByAttitude
              .get(true)
              ?.map(site => (
                <SiteRecord key={site.origin} site={site} discardSiteRecord={discardSiteRecord} />
              ))}
            {filteredByAttitude
              .get(false)
              ?.map(site => (
                <SiteRecord key={site.origin} site={site} discardSiteRecord={discardSiteRecord} />
              ))}
          </div>
        </div>
      </div>
    </FadeTransition>
  );
};

const ApprovedConnectionIcon = ({ onClick }: { onClick: () => void }) => (
  <Button className='group bg-transparent p-3' onClick={onClick}>
    <Link1Icon className='visible absolute inset-0 text-green-400 group-hover:invisible' />
    <TrashIcon className='invisible absolute inset-0 text-muted-foreground group-hover:visible' />
  </Button>
);
const DeniedConnectionIcon = ({ onClick }: { onClick: () => void }) => (
  <Button className='group bg-transparent p-3' onClick={onClick}>
    <LinkBreak1Icon className='visible absolute inset-0 text-red-400 group-hover:invisible' />
    <TrashIcon className='invisible absolute inset-0 text-muted-foreground group-hover:visible' />
  </Button>
);

const SiteRecord = ({
  site,
  discardSiteRecord,
}: {
  site: OriginRecord;
  discardSiteRecord: (site: OriginRecord) => void;
}) => (
  <div key={site.origin} className='relative w-full'>
    <div className='absolute inset-y-0 right-4 flex cursor-pointer items-center'>
      {site.attitude ? (
        <ApprovedConnectionIcon onClick={() => discardSiteRecord(site)} />
      ) : (
        <DeniedConnectionIcon onClick={() => discardSiteRecord(site)} />
      )}
    </div>
    <div
      className={
        site.attitude ? 'text-primary-foreground' : 'text-muted-foreground underline decoration-red'
      }
    >
      {new URL(site.origin).host}
    </div>
  </div>
);
