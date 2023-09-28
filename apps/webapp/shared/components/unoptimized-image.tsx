import Image, { ImageProps } from 'next/image';

export const UnoptimizedImage = (props: ImageProps) => {
  return <Image {...props} alt={props.alt} unoptimized />;
};
