import { OutputView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';
import { ViewBox } from './viewbox';
import { ValueViewComponent } from './value';
import { AddressViewComponent } from './address-view';

const OutputViewComponent: React.FC<{ value: OutputView }> = ({ value }) => {
    if (value.outputView?.case === 'visible') {
        let note = value.outputView?.value.note!;
        return (<ViewBox label='Output' visibleContent={
            <div className="flex gap-2 items-baseline">
                <ValueViewComponent view={note.value!} />
                <span className='italic text-sm text-foreground font-mono'>to</span>
                <AddressViewComponent view={note.address!} />
            </div>
        }
        />);
    }
    if (value.outputView?.case === 'opaque') {
        return (<ViewBox label='Output' />);
    }
    return (<> <span>Invalid SpendView</span> </>);
}

export { OutputViewComponent };

