import { OriginRecord } from '@penumbra-zone/storage/src/chrome/types';
import { useStore } from '../../../../state';
import { KnownSite } from './known-site';

export const KnownSitesGroup = ({ label, sites }: { label: string; sites: OriginRecord[] }) => {
  const discardKnownSite = useStore(state => state.connectedSites.discardKnownSite);

  return (
    <div>
      <div className='font-headline'>{label}</div>
      <div role='list' className='mt-1 flex flex-col gap-1'>
        {sites.map(site => (
          <KnownSite key={site.origin} site={site} discard={discardKnownSite} />
        ))}
      </div>
    </div>
  );
};
