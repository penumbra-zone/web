import { Card } from '@repo/ui/components/ui/card';
import { cn } from '@repo/ui/lib/utils';
import { GradientHeader } from '@repo/ui/components/ui/gradient-header';
import { EduPanel, eduPanelContent } from './content';
import { motion } from 'framer-motion';

interface HelperCardProps {
  src: string;
  label: string;
  className?: string;
  content: EduPanel;
  layout?: boolean;
}

export const EduInfoCard = ({ src, label, className, content, layout }: HelperCardProps) => {
  return (
    <Card gradient className={cn('p-5 row-span-1', className)} layout={layout}>
      <motion.div layout={layout} className='flex gap-2'>
        <img src={src} alt='icons' className='size-[30px] md:size-8' />
        <GradientHeader>{label}</GradientHeader>
      </motion.div>
      <p className='mt-4 text-muted-foreground md:mt-2'>{eduPanelContent[content]}</p>
    </Card>
  );
};
