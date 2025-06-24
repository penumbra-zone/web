import { ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import { Text } from '@penumbra-zone/ui/Text';
import { Icon } from '@penumbra-zone/ui/Icon';
import { Tooltip } from '@penumbra-zone/ui/Tooltip';
import { Skeleton } from '@/shared/ui/skeleton';
import { InfoIcon } from 'lucide-react';

interface InfoRowProps {
  label: string;
  isLoading?: boolean;
  value?: string | number;
  valueColor?: 'success' | 'error';
  toolTip?: ReactNode;
}

const getValueColor = (valueColor: InfoRowProps['valueColor']) => {
  if (valueColor === 'success') {
    return 'success.light';
  }
  if (valueColor === 'error') {
    return 'destructive.main';
  }
  return 'text.primary';
};

export const InfoRow = observer(
  ({ label, isLoading, value, valueColor, toolTip }: InfoRowProps) => {
    return (
      <div className='mb-1 flex items-center justify-between py-1 last:mb-0'>
        <Text as='div' small color='text.secondary'>
          {label}
        </Text>
        <div className='flex items-center'>
          <div className='mr-1'>
            {isLoading ? (
              <div className='h-4 w-16'>
                <Skeleton />
              </div>
            ) : (
              <Text as='div' small color={getValueColor(valueColor)}>
                {value}
              </Text>
            )}
          </div>
          {toolTip && (
            <Tooltip message={toolTip}>
              <Icon IconComponent={InfoIcon} size='sm' color='text.primary' />
            </Tooltip>
          )}
        </div>
      </div>
    );
  },
);
