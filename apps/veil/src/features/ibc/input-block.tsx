import { ReactNode } from 'react';
import { Text } from '@penumbra-zone/ui/Text';

interface Validation {
  type: 'error' | 'warning';
  issue: string;
  checkFn: () => boolean;
}

interface InputBlockProps {
  label: string;
  children: ReactNode;
  className?: string;
  value?: string;
  validations?: Validation[];
}

export const InputBlock = ({
  label,
  children,
  className = '',
  validations = [],
  value,
}: InputBlockProps) => {
  const errors = validations.filter(v => v.checkFn());

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className='mb-2'>
        <Text color='text.primary'>{label}</Text>
      </div>

      <div className={`rounded-md border ${errors.length ? 'border-red-500' : 'border-border'}`}>
        {children}
      </div>

      {errors.map((error, i) => (
        <Text key={i} color='destructive.light'>
          {error.issue}
        </Text>
      ))}
    </div>
  );
};
