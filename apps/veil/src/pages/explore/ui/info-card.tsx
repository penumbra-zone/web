import { useAutoAnimate } from '@formkit/auto-animate/react';
import type { ReactNode } from 'react';
import { Text } from '@penumbra-zone/ui/Text';
import { Skeleton } from '@/shared/ui/skeleton';

export interface InfoCardProps {
  title: string;
  children: ReactNode;
  loading?: boolean;
}

export const InfoCard = ({ title, children, loading }: InfoCardProps) => {
  const [parent] = useAutoAnimate();

  return (
    <div className='flex w-full flex-col items-start justify-center rounded-lg bg-other-tonal-fill5 p-3 backdrop-blur-lg desktop:p-6'>
      <Text detail color='text.secondary'>
        {title}
      </Text>
      <div ref={parent} className='flex max-h-7 items-baseline justify-start gap-2 overflow-hidden'>
        {!loading ? (
          children
        ) : (
          <div className='h-7 w-24 py-[2px]'>
            <Skeleton />
          </div>
        )}
      </div>
    </div>
  );
};
