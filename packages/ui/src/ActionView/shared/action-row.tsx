import { ReactNode } from 'react';
import cn from 'clsx';
import { detailTechnical } from '../../utils/typography';
import { CopyToClipboardButton } from '../../CopyToClipboardButton';
import { Density } from '../../Density';

export interface ActionRowProps {
  label: ReactNode;
  info: ReactNode;
  copyText?: string;
}

export const ActionRow = ({ label, copyText, info }: ActionRowProps) => {
  return (
    <div className={cn('flex items-center gap-2 text-text-secondary', detailTechnical)}>
      {label}
      <div className='h-px grow border-t border-dashed border-other-tonal-stroke stroke-1' />
      {info}

      {copyText && (
        <Density key='swap-claim' slim>
          <div className='size-4 [&>button]:text-neutral-light'>
            <CopyToClipboardButton text={copyText} />
          </div>
        </Density>
      )}
    </div>
  );
};
