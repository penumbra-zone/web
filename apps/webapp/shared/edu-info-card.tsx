import { Card } from 'ui';
import { FilledImage } from './filled-image';
import { cn } from 'ui/lib/utils';

interface HelperCardProps {
  src: string;
  label: string;
  className?: string;
}

export const EduInfoCard = ({ src, label, className }: HelperCardProps) => {
  return (
    <Card gradient className={cn('p-5 row-span-1', className)}>
      <div className='flex gap-2'>
        <FilledImage src={src} alt='icons' className='w-8 h-8' />
        <p className='text-2xl leading-9 font-bold bg-text-linear bg-clip-text text-transparent font-headline'>
          {label}
        </p>
      </div>
      <p className='text-muted-foreground mt-2'>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
        been the industry&apos;s standard dummy text ever since the 1500s, when an unknown printer
        took a galley of type and scrambled it to make a type specimen book. It has survived not
        only five centuries, but also the leap into electronic typesetting, remaining essentially
        unchanged. It was popularised in the 1960s with the release of Letraset learn more
      </p>
    </Card>
  );
};
