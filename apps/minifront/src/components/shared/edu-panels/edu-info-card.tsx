import { Card } from '@penumbra-zone/ui/components/ui/card';
import { cn } from '@penumbra-zone/ui/lib/utils';
import { GradientHeader } from '@penumbra-zone/ui/components/ui/gradient-header';
import { EduPanel, eduPanelContent } from './content';

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
        <img src={src} alt='icons' className='size-[30px] md:size-8' />
        <GradientHeader>{label}</GradientHeader>
      </div>
      <p className='mt-4 text-muted-foreground md:mt-2'>{eduPanelContent[content]}</p>
    </Card>
  );
};
