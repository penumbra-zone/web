import { Card } from '@penumbra-zone/ui';
import { FilledImage } from './filled-image';
import { cn } from '@penumbra-zone/ui/lib/utils';

interface HelperCardProps {
  src: string;
  label: string;
  className?: string;
  text?: string;
}

export const EduInfoCard = ({ src, label, className, text }: HelperCardProps) => {
  const defaultText = `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`;

  return (
    <Card gradient className={cn('p-5 row-span-1', className)}>
      <div className='flex gap-2'>
        <FilledImage src={src} alt='icons' className='h-8 w-8' />
        <p className='bg-text-linear bg-clip-text font-headline text-2xl font-bold leading-9 text-transparent'>
          {label}
        </p>
      </div>
      <p className='mt-2 text-muted-foreground'>
        {text || defaultText}
      </p>
    </Card>
  );
};
