import { Text } from '../../Text';
import { ActionWrapper } from '../shared/wrapper';

export interface UnknownActionProps {
  label: string;
  opaque?: boolean;
}

export const UnknownAction = ({ label = 'Unknown action', opaque }: UnknownActionProps) => {
  return (
    <ActionWrapper opaque={opaque} title={label}>
      <Text smallTechnical color='text.secondary'>
        Unimplemented
      </Text>
    </ActionWrapper>
  );
};
