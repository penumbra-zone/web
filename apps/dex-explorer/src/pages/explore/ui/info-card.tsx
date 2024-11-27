import type { ReactNode } from 'react';
import { Text } from '@penumbra-zone/ui/Text';

export interface InfoCardProps {
  title: string;
  children: ReactNode;
}

export const InfoCard = ({ title, children }: InfoCardProps) => {
  return (
    <div className='flex flex-col justify-center items-start w-full p-3 desktop:p-6 rounded-lg bg-other-tonalFill5 backdrop-blur-lg'>
      <Text detail color='text.secondary'>
        {title}
      </Text>
      <div className='flex items-baseline justify-start gap-2'>{children}</div>
    </div>
  );
};
