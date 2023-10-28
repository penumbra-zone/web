import { SpendView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/component/shielded_pool/v1alpha1/shielded_pool_pb';
import { ViewBox } from './viewbox';
import { ValueViewComponent } from './value';
import { AddressViewComponent } from './address-view';

const SpendViewComponent: React.FC<{ value: SpendView }> = ({ value }) => {
    if (value.spendView?.case === 'visible') {
        let note = value.spendView?.value.note!;
        return (<ViewBox label='Spend' visibleContent={
            <div className="flex items-baseline justify-between">
                <ValueViewComponent view={note.value!} />
                <div className="flex gap-2 items-baseline">
                    <span className='italic text-sm text-foreground font-mono'>from</span>
                    <AddressViewComponent view={note.address!} />
                </div>
            </div>
        }
        />);
    }
    if (value.spendView?.case === 'opaque') {
        return (<ViewBox label='Spend' />);
    }
    return (<> <span>Invalid SpendView</span> </>);
}

export { SpendViewComponent };

