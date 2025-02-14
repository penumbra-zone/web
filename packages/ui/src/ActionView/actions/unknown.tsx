import { Text } from '../../Text';
import { ActionWrapper } from './wrapper';

export interface UnknownActionProps {
  label: string;
  opaque?: boolean;
}

export const UnknownAction = ({ label, opaque }: UnknownActionProps) => {
  return (
    <ActionWrapper opaque={opaque} title={label}>
      <Text smallTechnical>Unimplemented</Text>
    </ActionWrapper>
  );
};
