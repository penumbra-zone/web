import { OutputView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { ViewBox } from './viewbox';
import { ValueViewComponent } from './value';
import { ValueWithAddress } from './value-with-address';
import { getNote } from '@penumbra-zone/getters/output-view';
import { getAddress } from '@penumbra-zone/getters/note-view';
import { useCumulativeLayoutId } from '../../../contexts/cumulative-layout-id';

export const OutputViewComponent = ({ value }: { value: OutputView }) => {
  const layoutId = useCumulativeLayoutId('OutputViewComponent');

  if (value.outputView.case === 'visible') {
    const note = getNote(value);
    const address = getAddress(note);

    return (
      <ViewBox
        label='Output'
        layoutId={layoutId}
        visibleContent={
          <ValueWithAddress addressView={address} label='to'>
            <ValueViewComponent view={note.value} />
          </ValueWithAddress>
        }
      />
    );
  }

  if (value.outputView.case === 'opaque') {
    return <ViewBox layoutId={layoutId} label='Output' />;
  }

  return <div>Invalid OutputView</div>;
};
