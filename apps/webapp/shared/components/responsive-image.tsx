import Image from 'next/image';
import { cn } from 'ui/lib/utils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const ResponsiveImage = ({ src, alt, className }: ResponsiveImageProps) => {
  return (
    <div className={cn('relative', className)}>
      <Image src={src} alt={alt} layout='fill' objectFit='cover' />
    </div>
  );
};
