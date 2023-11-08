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
        {/*<FilledImage src={src} alt='icons' className='h-8 w-8' />*/}
        <p className='bg-text-linear bg-clip-text font-headline text-2xl font-bold leading-9 text-transparent'>
          {label}
        </p>
      </div>
      <p className='mt-2 text-muted-foreground'>{eduPanelContent[content]}</p>
    </Card>
  );
};
