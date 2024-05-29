import { SpendView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { ViewBox } from './viewbox';
import { ValueViewComponent } from './value';
import { ValueWithAddress } from './value-with-address';
import { getNote } from '@penumbra-zone/getters/spend-view';
import { getAddress } from '@penumbra-zone/getters/note-view';
import { useCumulativeLayoutId } from '../../../contexts/cumulative-layout-id';

export const SpendViewComponent = ({ value }: { value: SpendView }) => {
  const layoutId = useCumulativeLayoutId('SpendViewComponent');

  if (value.spendView.case === 'visible') {
    const note = getNote(value);
    const address = getAddress(note);

    return (
      <ViewBox
        label='Spend'
        layoutId={layoutId}
        visibleContent={
          <ValueWithAddress addressView={address} label='from'>
            <ValueViewComponent view={note.value} />
          </ValueWithAddress>
        }
      />
    );
  }

  if (value.spendView.case === 'opaque') {
    return <ViewBox layoutId={layoutId} label='Spend' />;
  }

  return <div>Invalid SpendView</div>;
};
