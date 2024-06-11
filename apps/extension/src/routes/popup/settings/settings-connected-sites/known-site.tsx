import { OriginRecord } from '../../../../storage/types';
import { UserChoice } from '@penumbra-zone/types/user-choice';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { TrashIcon } from 'lucide-react';
import { DisplayOriginURL } from '../../../../shared/components/display-origin-url';

export const KnownSite = ({
  site,
  discard,
}: {
  site: OriginRecord;
  discard: (d: OriginRecord) => Promise<void>;
}) => {
  return (
    <div key={site.origin} role='listitem' className='flex items-center justify-between'>
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

      <div className='flex items-center gap-2'>
        <Button
          aria-description='Remove'
          className='h-auto bg-transparent'
          onClick={() => void discard(site)}
        >
          <TrashIcon className='text-muted-foreground' size={16} />
        </Button>
      </div>
    </div>
  );
};
