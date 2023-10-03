import Image from 'next/image';
import { cn } from 'ui/lib/utils';

interface FilledImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const FilledImage = ({ src, alt, className }: FilledImageProps) => {
  return (
    <div className={cn('relative', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        style={{
          objectFit: 'contain',
        }}
      />
    </div>
  );
};
