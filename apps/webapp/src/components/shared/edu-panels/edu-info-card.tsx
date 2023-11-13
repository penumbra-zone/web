import { Card } from '@penumbra-zone/ui';
import { cn } from '@penumbra-zone/ui/lib/utils.ts';
import { EduPanel, eduPanelContent } from './content.ts';

interface HelperCardProps {
  src: string;
  label: string;
  className?: string;
  content: EduPanel;
}

export const EduInfoCard = ({ src, label, className, content }: HelperCardProps) => {
  return (
    <Card gradient className={cn('p-5 row-span-1', className)}>
      <div className='flex gap-2'>
        <img src={src} alt='icons' className='h-[30px] w-[30px] md:h-8 md:w-8' />
        <p className='bg-text-linear bg-clip-text font-headline text-xl leading-[30px] font-semibold md:text-2xl md:font-bold md:leading-9 text-transparent'>
          {label}
        </p>
      </div>
      <p className='mt-4 md:mt-2 text-muted-foreground'>{eduPanelContent[content]}</p>
    </Card>
  );
};
