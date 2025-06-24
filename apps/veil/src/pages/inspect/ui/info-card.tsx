import { useAutoAnimate } from '@formkit/auto-animate/react';
import type { ReactNode } from 'react';
import { Text } from '@penumbra-zone/ui/Text';

export interface InfoCardProps {
  title: string;
  children: ReactNode;
}

export const InfoCard = ({ title, children }: InfoCardProps) => {
  const [parent] = useAutoAnimate();

  return (
    <div className='flex w-full flex-col items-start justify-center rounded-lg bg-other-tonal-fill5 p-3 backdrop-blur-lg desktop:p-6'>
      <Text detail color='text.secondary'>
        {title}
      </Text>
      <div ref={parent} className='flex items-baseline justify-start gap-2 max-h-7 overflow-hidden'>
        {children}
      </div>
    </div>
  );
};
