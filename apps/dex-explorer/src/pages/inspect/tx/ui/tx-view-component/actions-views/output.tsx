import { OutputView } from '@penumbra-zone/protobuf/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { ViewBox } from '../viewbox';
import { ValueViewComponent } from '@penumbra-zone/ui/ValueView';
import { ValueWithAddress } from './value-with-address';
import { getNote } from '@penumbra-zone/getters/output-view';
import { getAddress } from '@penumbra-zone/getters/note-view';

export const OutputViewComponent = ({ value }: { value: OutputView }) => {
  if (value.outputView.case === 'visible') {
    const note = getNote(value);
    const address = getAddress(note);

    return (
      <ViewBox
        label='Output'
        visibleContent={
          <ValueWithAddress addressView={address} label='to'>
            <ValueViewComponent valueView={note.value} />
          </ValueWithAddress>
        }
      />
    );
  }

  if (value.outputView.case === 'opaque') {
    return <ViewBox label='Output' />;
  }

  return <div>Invalid OutputView</div>;
};
