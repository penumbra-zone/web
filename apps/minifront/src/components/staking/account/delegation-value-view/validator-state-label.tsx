import { ValidatorState_ValidatorStateEnum } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { cn } from '@penumbra-zone/ui/lib/utils';

interface LabelInfo {
  label: string;
  color: string;
}

const validatorStateMap = new Map<ValidatorState_ValidatorStateEnum, LabelInfo>([
  [ValidatorState_ValidatorStateEnum.UNSPECIFIED, { label: 'UNSPECIFIED', color: 'bg-gray-500' }],
  [ValidatorState_ValidatorStateEnum.DEFINED, { label: 'DEFINED', color: 'bg-blue-500' }],
  [ValidatorState_ValidatorStateEnum.INACTIVE, { label: 'INACTIVE', color: 'bg-yellow-600' }],
  [ValidatorState_ValidatorStateEnum.ACTIVE, { label: 'ACTIVE', color: 'bg-green-500' }],
  [ValidatorState_ValidatorStateEnum.JAILED, { label: 'JAILED', color: 'bg-orange-700' }],
  [ValidatorState_ValidatorStateEnum.TOMBSTONED, { label: 'TOMBSTONED', color: 'bg-red-800' }],
  [ValidatorState_ValidatorStateEnum.DISABLED, { label: 'DISABLED', color: 'bg-purple-600' }],
]);

const getStateLabel = (state: ValidatorState_ValidatorStateEnum) =>
  validatorStateMap.get(state) ?? {
    label: 'UNKNOWN',
    color: 'bg-yellow-600',
  };

export const ValidatorStateLabel = ({ state }: { state: ValidatorState_ValidatorStateEnum }) => {
  if (state === ValidatorState_ValidatorStateEnum.ACTIVE) {
    return <></>;
  }

  const { label, color } = getStateLabel(state);
  return (
    <div className={cn('flex items-center justify-center rounded p-1 font-mono -mt-1', color)}>
      {label}
    </div>
  );
};
