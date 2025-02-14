import { ValidatorDefinition } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { UnknownAction } from './unknown';

export interface ValidatorDefinitionActionProps {
  value: ValidatorDefinition;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- unimplemented
export const ValidatorDefinitionAction = (_: ValidatorDefinitionActionProps) => {
  return <UnknownAction label='Validator Definition' opaque={false} />;
};
