import Image from 'next/image';
import { cn } from 'ui/lib/utils';

interface FilledImageProps {
  src: string;
  alt: string;
  className?: string;
}

// https://nextjs.org/docs/pages/api-reference/components/image#responsive-image-with-fill

//If you don't know the aspect ratio, you will need to set the fill prop and set position: relative on the parent. Optionally, you can set object-fit style depending on the desired stretch vs crop behavior

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
