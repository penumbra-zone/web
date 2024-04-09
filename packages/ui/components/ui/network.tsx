import { ConditionalWrap } from './conditional-wrap';

export interface NetworkProps {
  name: string;
  connectIndicator?: boolean;
  href?: string;
}

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
          'flex items-center justify-between gap-4 rounded-lg border bg-background px-5 py-[7px] font-bold text-muted-foreground md:px-[25px] xl:px-[18px]'
        }
      >
        {connectIndicator && (
          <div className='-mx-1 h-4 w-1 rounded-sm bg-gradient-to-b from-cyan-400 to-emerald-400'></div>
        )}
        <p className='whitespace-nowrap'>{name}</p>
      </div>
    </ConditionalWrap>
  );
};
