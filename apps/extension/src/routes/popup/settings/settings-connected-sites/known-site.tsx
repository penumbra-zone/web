import { OriginRecord } from '@penumbra-zone/storage/src/chrome/types';
import { UserChoice } from '@penumbra-zone/types/src/user-choice';
import { Button } from '@penumbra-zone/ui/components/ui/button';
import { Link1Icon, LinkBreak1Icon } from '@radix-ui/react-icons';
import { TrashIcon } from 'lucide-react';
import { DisplayOriginURL } from '../../../../shared/components/display-origin-url';

export const KnownSite = ({
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
