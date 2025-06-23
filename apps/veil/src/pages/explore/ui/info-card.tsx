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
    <div className='flex flex-col justify-center items-start w-full p-3 desktop:p-6 rounded-lg bg-other-tonal-fill5 backdrop-blur-lg'>
      <Text detail color='text.secondary'>
        {title}
      </Text>
      <div ref={parent} className='flex items-baseline justify-start gap-2 max-h-7 overflow-hidden'>
        {!loading ? (
          children
        ) : (
          <div className='w-24 h-7 py-[2px]'>
            <Skeleton />
          </div>
        )}
      </div>
    </div>
  );
};
