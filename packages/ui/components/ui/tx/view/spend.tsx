import { SpendView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';
import { ViewBox } from './viewbox';
import { ValueViewComponent } from './value';
import { AddressViewComponent } from './address-view';

export const SpendViewComponent = ({ value }: { value: SpendView }) => {
  if (value.spendView.case === 'visible') {
    const note = value.spendView.value.note!;
    return (
      <ViewBox
        label='Spend'
        visibleContent={
          <div className='flex flex-col justify-between gap-2 sm:flex-row sm:gap-0'>
            <ValueViewComponent view={note.value} />
            <div className='flex gap-2'>
              <span className='font-mono text-sm italic text-foreground'>from</span>
              <AddressViewComponent view={note.address} />
            </div>
          </div>
        }
      />
    );
  }

  if (value.spendView.case === 'opaque') {
    return <ViewBox label='Spend' />;
  }

  return <div>Invalid SpendView</div>;
};
