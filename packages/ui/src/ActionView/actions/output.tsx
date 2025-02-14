import { OutputView } from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { Density } from '../../Density';
import { useDensity } from '../../utils/density';
import { ActionWrapper } from './wrapper';
import { ValueViewComponent } from '../../ValueView';
import { AddressViewComponent } from '../../AddressView';

export interface OutputActionProps {
  value: OutputView;
}

export const OutputAction = ({ value }: OutputActionProps) => {
  const density = useDensity();

  return (
    <ActionWrapper title='Output' opaque={value.outputView.case === 'opaque'}>
      {value.outputView.case === 'visible' && (
        <Density slim>
          <ValueViewComponent
            signed='positive'
            priority={density === 'sparse' ? 'primary' : 'tertiary'}
            valueView={value.outputView.value.note?.value}
          />
          <AddressViewComponent addressView={value.outputView.value.note?.address} />
        </Density>
      )}
    </ActionWrapper>
  );
};
