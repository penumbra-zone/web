import { Card } from '@penumbra-zone/ui';
import { cn } from '@penumbra-zone/ui/lib/utils.ts';
import { EduPanel, eduPanelContent } from './content';
import { ReactNode } from 'react';

interface HelperCardProps {
  src: string;
  label: string;
  className?: string;
  content?: EduPanel;
  children?: ReactNode;
}

export const EduInfoCard = ({ src, label, className, content, children }: HelperCardProps) => {
  return (
    <Card gradient className={cn('p-5 row-span-1', className)}>
      <div className='flex gap-2'>
        <img src={src} alt='icons' className='size-[30px] md:size-8' />
        <p className='bg-text-linear bg-clip-text font-headline text-xl font-semibold leading-[30px] text-transparent md:text-2xl md:font-bold md:leading-9'>
          {label}
        </p>
      </div>
      <p className='mt-4 text-muted-foreground md:mt-2'>
        {content ? eduPanelContent[content] : children}
      </p>
    </Card>
  );
};
