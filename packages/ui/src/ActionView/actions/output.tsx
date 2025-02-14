import { OutputView } from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { Density } from '../../Density';
import { ActionWrapper } from './wrapper';

export interface SpendActionProps {
  value: OutputView;
}

export const OutputAction = ({ value }: SpendActionProps) => {
  return (
    <ActionWrapper title='Spend' opaque={value.outputView.case === 'opaque'}>
      {value.outputView.case === 'visible' && <Density slim>Outputsss</Density>}
    </ActionWrapper>
  );
};
