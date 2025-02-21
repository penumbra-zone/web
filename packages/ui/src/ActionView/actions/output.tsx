import { OutputView } from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { getNote } from '@penumbra-zone/getters/output-view';
import { getAddress } from '@penumbra-zone/getters/note-view';
import { Density } from '../../Density';
import { useDensity } from '../../utils/density';
import { ValueViewComponent } from '../../ValueView';
import { AddressViewComponent } from '../../AddressView';
import { ActionWrapper } from '../shared/wrapper';

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
            valueView={getNote(value).value}
          />
          <AddressViewComponent addressView={getAddress(getNote(value))} />
        </Density>
      )}
    </ActionWrapper>
  );
};
