import { ReactNode } from 'react';
import cn from 'clsx';
import { Text } from '@penumbra-zone/ui/Text';
import { Density } from '@penumbra-zone/ui/Density';
import { CopyToClipboardButton } from '@penumbra-zone/ui/CopyToClipboardButton';

export interface InfoRowProps {
  label: ReactNode;
  info: ReactNode;
  copyText?: string;
}

export const InfoRow = ({ label, copyText, info }: InfoRowProps) => {
  return (
    <div className={cn('flex items-center gap-2 text-text-secondary')}>
      {typeof label === 'string' ? <Text detailTechnical>{label}</Text> : label}

      <div className='h-px grow border-t border-dashed border-other-tonalStroke stroke-1' />

      {typeof info === 'string' ? <Text detailTechnical>{info}</Text> : info}

      {copyText && (
        <Density slim>
          <div className='size-4 [&>button]:text-neutral-light'>
            <CopyToClipboardButton text={copyText} />
          </div>
        </Density>
      )}
    </div>
  );
};
