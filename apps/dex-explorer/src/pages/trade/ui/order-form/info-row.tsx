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
  toolTip?: string;
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
      <div className='flex items-center justify-between mb-1 last:mb-0 py-1'>
        <Text as='div' small color='text.secondary'>
          {label}
        </Text>
        <div className='flex items-center'>
          <div className='mr-1'>
            {isLoading ? (
              <div className='w-16 h-4'>
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
