import { Card } from '@penumbra-zone/ui';
import { FilledImage } from '../filled-image';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { EduPanel, eduPanelContent } from './content';

interface HelperCardProps {
  src: string;
  label: string;
  className?: string;
  content: EduPanel;
}

export const EduInfoCard = ({ src, label, className, content }: HelperCardProps) => {
  return (
    <Card gradient className={cn('md:p-4 xl:p-5 row-span-1', className)}>
      <div className='flex gap-2'>
        <FilledImage src={src} alt='icons' className='md:h-[30px] md:w-[30px] xl:h-10 xl:w-10' />
        <p className='bg-text-linear bg-clip-text font-headline md:text-xl  xl:text-2xl md:font-semibold xl:font-bold md:leading-[30px] xl:leading-9 text-transparent'>
          {label}
        </p>
      </div>
      <p className='mt-2 font-normal text-muted-foreground'>{eduPanelContent[content]}</p>
    </Card>
  );
};
