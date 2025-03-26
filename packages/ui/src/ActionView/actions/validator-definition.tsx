import { ValidatorDefinition } from '@penumbra-zone/protobuf/penumbra/core/component/stake/v1/stake_pb';
import { UnknownAction } from './unknown';

export interface ValidatorDefinitionActionProps {
  value: ValidatorDefinition;
}

export const ValidatorDefinitionAction = (_: ValidatorDefinitionActionProps) => {
  return <UnknownAction label='Validator Definition' opaque={false} />;
};
