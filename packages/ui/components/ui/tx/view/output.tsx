import { OutputView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1/shielded_pool_pb';
import { ViewBox } from './viewbox';
import { ValueViewComponent } from './value';
import { AddressViewComponent } from './address-view';

export const OutputViewComponent = ({ value }: { value: OutputView }) => {
  if (value.outputView.case === 'visible') {
    const note = value.outputView.value.note!;
    return (
      <ViewBox
        label='Output'
        visibleContent={
          <div className='flex flex-col justify-between gap-2 sm:flex-row sm:gap-0'>
            <ValueViewComponent view={note.value} />
            <div className='flex gap-2'>
              <span className='font-mono text-sm italic text-foreground'>to</span>
              <AddressViewComponent view={note.address} />
            </div>
          </div>
        }
      />
    );
  }

  if (value.outputView.case === 'opaque') 
    return <ViewBox label='Output' />;
  

  return <div>Invalid OutputView</div>;
};
