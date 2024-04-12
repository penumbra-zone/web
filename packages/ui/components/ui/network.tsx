import { ExternalLink } from 'lucide-react';
import { ConditionalWrap } from './conditional-wrap';

export interface NetworkProps {
  name: string;
  connectIndicator?: boolean;
  href?: string;
}

/**
 * Displays the network (chain ID) we're connected to, as well as an optional
 * connection indicator and a link to the frontend.
 */
export const Network = ({ name, href, connectIndicator = true }: NetworkProps) => {
  return (
    <ConditionalWrap
      condition={!!href}
      wrap={children => (
        <a href={href} target='_blank' rel='noreferrer'>
          {children}
        </a>
      )}
    >
      <div
        className={
          'flex items-center gap-4 rounded-lg border bg-background px-5 py-[7px] font-bold text-muted-foreground md:px-[25px] xl:px-[18px]'
        }
      >
        {connectIndicator && (
          <div className='h-4 w-1 shrink-0 rounded-sm bg-gradient-to-b from-cyan-400 to-emerald-400'></div>
        )}
        <p className='grow truncate whitespace-nowrap'>{name}</p>

        {href && <ExternalLink size={16} className='shrink-0' />}
      </div>
    </ConditionalWrap>
  );
};
