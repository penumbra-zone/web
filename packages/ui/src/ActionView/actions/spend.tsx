import { SpendView } from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { Density } from '../../Density';
import { ActionWrapper } from './wrapper';
import { ValueViewComponent } from '../../ValueView';
import { AddressViewComponent } from '../../AddressView';
import { useDensity } from '../../utils/density';

export interface SpendActionProps {
  value: SpendView;
}

export const SpendAction = ({ value }: SpendActionProps) => {
  const density = useDensity();

  return (
    <ActionWrapper title='Spend' opaque={value.spendView.case === 'opaque'}>
      {value.spendView.case === 'visible' && (
        <Density slim>
          <ValueViewComponent
            signed='negative'
            priority={density === 'sparse' ? 'primary' : 'tertiary'}
            valueView={value.spendView.value.note?.value}
          />
          <AddressViewComponent addressView={value.spendView.value.note?.address} />
        </Density>
      )}
    </ActionWrapper>
  );
};
