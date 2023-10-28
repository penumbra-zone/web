
import { MemoView } from '@buf/penumbra-zone_penumbra.bufbuild_es/penumbra/core/transaction/v1alpha1/transaction_pb';
import { AddressViewComponent } from './address-view';
import { ViewBox, ViewSection } from './viewbox';

const MemoViewComponent: React.FC<{ memo: MemoView }> = ({ memo }) => {
    if (memo.memoView?.case === 'visible') {
        const mv = memo.memoView?.value;
        const text = mv?.plaintext?.text;
        return (
            <ViewSection heading='Memo'>
                <ViewBox label='Memo Text' visibleContent={
                    /* Ensure that an empty memo string is rendered as a blank space, highlighting absence */
                    text ? (<div>{text}</div>) : (<div>&nbsp;</div>)
                } />
                <ViewBox label='Sender Return Address' visibleContent={
                    <AddressViewComponent address={mv?.plaintext?.sender!} />
                } />
            </ViewSection>
        );
    }
    if (memo.memoView?.case === 'opaque') {
        return (
            <ViewSection heading='Memo'>
                <ViewBox label='Memo Text' />
                <ViewBox label='Sender Return Address' />
            </ViewSection>
        );
    }
    return (<> <span>Invalid MemoView</span> </>);
}

export { MemoViewComponent };
