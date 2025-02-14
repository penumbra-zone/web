import { SpendView } from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { Density } from '../../Density';
import { ActionWrapper } from './wrapper';

export interface SpendActionProps {
  value: SpendView;
}

export const SpendAction = ({ value }: SpendActionProps) => {
  return (
    <ActionWrapper title='Spend' opaque={value.spendView.case === 'opaque'}>
      {value.spendView.case === 'visible' && <Density slim>Actions</Density>}
    </ActionWrapper>
  );
};
